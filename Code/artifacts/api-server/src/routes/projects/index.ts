import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { projectsTable, projectEmbeddingsTable, projectRelationsTable } from "@workspace/db";
import { eq, ilike, or, sql } from "drizzle-orm";
import {
  SubmitProjectBody,
  GetProjectsQueryParams,
  GetProjectParams,
  GetSimilarProjectsQueryParams,
  GetSimilarProjectsParams,
  GetRecommendationsParams,
} from "@workspace/api-zod";
import { computeSimilarity, textToSimpleEmbedding, extractKeywords } from "../../lib/similarity.js";
import { generateHybridSuggestions } from "../../lib/innovation.js";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const query = GetProjectsQueryParams.parse(req.query);
    let projects = await db.select().from(projectsTable).orderBy(sql`${projectsTable.createdAt} DESC`);

    if (query.domain) {
      projects = projects.filter((p) =>
        p.domain.toLowerCase().includes(query.domain!.toLowerCase())
      );
    }
    if (query.technology) {
      projects = projects.filter((p) =>
        p.technologies.toLowerCase().includes(query.technology!.toLowerCase())
      );
    }
    if (query.keyword) {
      const kw = query.keyword.toLowerCase();
      projects = projects.filter(
        (p) =>
          p.title.toLowerCase().includes(kw) ||
          p.description.toLowerCase().includes(kw) ||
          (p.keywords && p.keywords.toLowerCase().includes(kw))
      );
    }

    res.json(
      projects.map((p) => ({
        id: p.id,
        title: p.title,
        problemStatement: p.problemStatement,
        description: p.description,
        technologies: p.technologies,
        domain: p.domain,
        githubLink: p.githubLink ?? null,
        keywords: p.keywords ?? null,
        createdAt: p.createdAt.toISOString(),
      }))
    );
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const body = SubmitProjectBody.parse(req.body);
    const keywords = extractKeywords(body.description + " " + body.problemStatement);

    const [project] = await db
      .insert(projectsTable)
      .values({
        title: body.title,
        problemStatement: body.problemStatement,
        description: body.description,
        technologies: body.technologies,
        domain: body.domain,
        githubLink: body.githubLink ?? null,
        keywords: keywords.join(", "),
      })
      .returning();

    const embedding = textToSimpleEmbedding(
      `${body.title} ${body.description} ${body.problemStatement} ${body.technologies} ${body.domain}`
    );
    await db.insert(projectEmbeddingsTable).values({
      projectId: project.id,
      embedding: JSON.stringify(embedding),
    });

    const allEmbeddings = await db.select().from(projectEmbeddingsTable);
    for (const emb of allEmbeddings) {
      if (emb.projectId === project.id) continue;
      const otherEmb = JSON.parse(emb.embedding) as number[];
      const similarity = computeSimilarity(embedding, otherEmb);
      if (similarity > 0.2) {
        await db
          .insert(projectRelationsTable)
          .values({ projectId1: project.id, projectId2: emb.projectId, similarity })
          .onConflictDoNothing();
      }
    }

    res.status(201).json({
      id: project.id,
      title: project.title,
      problemStatement: project.problemStatement,
      description: project.description,
      technologies: project.technologies,
      domain: project.domain,
      githubLink: project.githubLink ?? null,
      keywords: project.keywords ?? null,
      createdAt: project.createdAt.toISOString(),
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = GetProjectParams.parse(req.params);
    const [project] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, id));

    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    res.json({
      id: project.id,
      title: project.title,
      problemStatement: project.problemStatement,
      description: project.description,
      technologies: project.technologies,
      domain: project.domain,
      githubLink: project.githubLink ?? null,
      keywords: project.keywords ?? null,
      createdAt: project.createdAt.toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id/similar", async (req, res) => {
  try {
    const params = GetSimilarProjectsParams.parse(req.params);
    const queryParams = GetSimilarProjectsQueryParams.parse(req.query);
    const limit = queryParams.limit ?? 5;
    const projectId = params.id;

    const [targetEmb] = await db
      .select()
      .from(projectEmbeddingsTable)
      .where(eq(projectEmbeddingsTable.projectId, projectId));

    if (!targetEmb) {
      res.json([]);
      return;
    }

    const targetVector = JSON.parse(targetEmb.embedding) as number[];
    const allEmbeddings = await db
      .select()
      .from(projectEmbeddingsTable);

    const similarities: { projectId: number; similarity: number }[] = [];
    for (const emb of allEmbeddings) {
      if (emb.projectId === projectId) continue;
      const vec = JSON.parse(emb.embedding) as number[];
      const similarity = computeSimilarity(targetVector, vec);
      similarities.push({ projectId: emb.projectId, similarity });
    }

    similarities.sort((a, b) => b.similarity - a.similarity);
    const top = similarities.slice(0, limit);

    const results = [];
    for (const sim of top) {
      const [proj] = await db
        .select()
        .from(projectsTable)
        .where(eq(projectsTable.id, sim.projectId));
      if (proj) {
        results.push({
          project: {
            id: proj.id,
            title: proj.title,
            problemStatement: proj.problemStatement,
            description: proj.description,
            technologies: proj.technologies,
            domain: proj.domain,
            githubLink: proj.githubLink ?? null,
            keywords: proj.keywords ?? null,
            createdAt: proj.createdAt.toISOString(),
          },
          similarity: sim.similarity,
        });
      }
    }

    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id/recommendations", async (req, res) => {
  try {
    const { id } = GetRecommendationsParams.parse(req.params);

    const [project] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, id));

    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    const [targetEmb] = await db
      .select()
      .from(projectEmbeddingsTable)
      .where(eq(projectEmbeddingsTable.projectId, id));

    let similarProjects: { project: any; similarity: number }[] = [];

    if (targetEmb) {
      const targetVector = JSON.parse(targetEmb.embedding) as number[];
      const allEmbeddings = await db.select().from(projectEmbeddingsTable);

      const similarities: { projectId: number; similarity: number }[] = [];
      for (const emb of allEmbeddings) {
        if (emb.projectId === id) continue;
        const vec = JSON.parse(emb.embedding) as number[];
        const similarity = computeSimilarity(targetVector, vec);
        similarities.push({ projectId: emb.projectId, similarity });
      }

      similarities.sort((a, b) => b.similarity - a.similarity);
      const top = similarities.slice(0, 5);

      for (const sim of top) {
        const [proj] = await db
          .select()
          .from(projectsTable)
          .where(eq(projectsTable.id, sim.projectId));
        if (proj) {
          similarProjects.push({
            project: {
              id: proj.id,
              title: proj.title,
              problemStatement: proj.problemStatement,
              description: proj.description,
              technologies: proj.technologies,
              domain: proj.domain,
              githubLink: proj.githubLink ?? null,
              keywords: proj.keywords ?? null,
              createdAt: proj.createdAt.toISOString(),
            },
            similarity: sim.similarity,
          });
        }
      }
    }

    const improvements = [
      `Consider integrating ${project.technologies.split(",")[0]?.trim()} with cloud services for scalability`,
      `Add real-time monitoring dashboard to track ${project.domain} metrics`,
      `Implement machine learning to improve ${project.title} predictions over time`,
      `Create a REST API to allow third-party integrations`,
    ];

    const hybridIdeas = generateHybridSuggestions(project, similarProjects.map((s) => s.project));

    res.json({
      project: {
        id: project.id,
        title: project.title,
        problemStatement: project.problemStatement,
        description: project.description,
        technologies: project.technologies,
        domain: project.domain,
        githubLink: project.githubLink ?? null,
        keywords: project.keywords ?? null,
        createdAt: project.createdAt.toISOString(),
      },
      similarProjects,
      improvements,
      hybridIdeas,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { projectsTable, projectEmbeddingsTable } from "@workspace/db";
import { GetIdeaGraphQueryParams } from "@workspace/api-zod";
import { computeSimilarity, textToSimpleEmbedding } from "../../lib/similarity.js";
import { detectInnovationGaps } from "../../lib/innovation.js";

const router: IRouter = Router();

router.get("/idea-graph", async (req, res) => {
  try {
    const params = GetIdeaGraphQueryParams.parse(req.query);
    const threshold = params.threshold ?? 0.4;

    const projects = await db.select().from(projectsTable);
    const embeddings = await db.select().from(projectEmbeddingsTable);

    const embMap: Record<number, number[]> = {};
    for (const emb of embeddings) {
      embMap[emb.projectId] = JSON.parse(emb.embedding) as number[];
    }

    const nodes = projects.map((p) => ({
      id: String(p.id),
      label: p.title,
      domain: p.domain,
      technologies: p.technologies,
    }));

    const edges: { source: string; target: string; weight: number }[] = [];

    for (let i = 0; i < projects.length; i++) {
      for (let j = i + 1; j < projects.length; j++) {
        const a = projects[i];
        const b = projects[j];
        const vecA = embMap[a.id];
        const vecB = embMap[b.id];

        if (vecA && vecB) {
          const similarity = computeSimilarity(vecA, vecB);
          if (similarity >= threshold) {
            edges.push({ source: String(a.id), target: String(b.id), weight: similarity });
          }
        }
      }
    }

    res.json({ nodes, edges });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/innovation-gaps", async (req, res) => {
  try {
    const projects = await db.select().from(projectsTable);
    const gaps = detectInnovationGaps(
      projects.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        technologies: p.technologies,
        domain: p.domain,
        problemStatement: p.problemStatement,
      }))
    );
    res.json(gaps);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

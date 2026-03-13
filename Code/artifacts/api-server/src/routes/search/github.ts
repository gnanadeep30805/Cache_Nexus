import { Router, type IRouter } from "express";
import { SearchGithubQueryParams, AnalyzeGithubRepoBody } from "@workspace/api-zod";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

router.get("/github", async (req, res) => {
  try {
    const params = SearchGithubQueryParams.parse(req.query);
    const page = params.page ?? 1;
    const perPage = 12;

    const githubResponse = await fetch(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(params.query)}&sort=stars&order=desc&per_page=${perPage}&page=${page}`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "AI-Student-Platform/1.0",
        },
      }
    );

    if (!githubResponse.ok) {
      throw new Error(`GitHub API error: ${githubResponse.status}`);
    }

    const data = (await githubResponse.json()) as any;

    const items = (data.items || []).map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description ?? null,
      url: repo.html_url,
      stars: repo.stargazers_count,
      language: repo.language ?? null,
      topics: repo.topics ?? [],
      updatedAt: repo.updated_at,
      owner: repo.owner.login,
      readme: null,
    }));

    res.json({
      items,
      totalCount: Math.min(data.total_count || 0, 1000),
      page,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/github/analyze", async (req, res) => {
  try {
    const body = AnalyzeGithubRepoBody.parse(req.body);

    let readmeContent = body.readme ?? "";
    if (!readmeContent && body.repoFullName) {
      try {
        const readmeRes = await fetch(
          `https://api.github.com/repos/${body.repoFullName}/readme`,
          {
            headers: {
              Accept: "application/vnd.github.v3.raw",
              "User-Agent": "AI-Student-Platform/1.0",
            },
          }
        );
        if (readmeRes.ok) {
          readmeContent = await readmeRes.text();
          readmeContent = readmeContent.slice(0, 3000);
        }
      } catch {}
    }

    const prompt = `You are an expert software project analyst. Analyze this GitHub repository and provide a structured analysis.

Repository: ${body.repoFullName}
URL: ${body.repoUrl}
Description: ${body.description ?? "Not provided"}
Language: ${body.language ?? "Unknown"}
Topics: ${(body.topics ?? []).join(", ") || "None"}
README (excerpt): ${readmeContent.slice(0, 2000) || "Not available"}

Provide analysis in this exact JSON format:
{
  "problemDescription": "A clear paragraph describing the problem this project solves",
  "solution": "A clear paragraph describing how this project solves the problem",
  "aiAnalysis": "A comprehensive AI analysis including architecture insights, potential improvements, scalability considerations, and innovation aspects",
  "keyTechnologies": ["tech1", "tech2", "tech3"],
  "innovationScore": 7,
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
}

innovationScore should be 1-10. Return only valid JSON.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.choices[0]?.message?.content ?? "{}";
    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch {
      analysis = {
        problemDescription: "Analysis unavailable",
        solution: "Analysis unavailable",
        aiAnalysis: content,
        keyTechnologies: [],
        innovationScore: 5,
        suggestions: [],
      };
    }

    res.json({
      problemDescription: analysis.problemDescription ?? "Not available",
      solution: analysis.solution ?? "Not available",
      aiAnalysis: analysis.aiAnalysis ?? "Not available",
      keyTechnologies: analysis.keyTechnologies ?? [],
      innovationScore: analysis.innovationScore ?? 5,
      suggestions: analysis.suggestions ?? [],
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

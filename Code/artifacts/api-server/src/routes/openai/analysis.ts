import { Router, type IRouter } from "express";
import { AnalyzeProjectBody, GenerateHybridIdeaBody } from "@workspace/api-zod";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

router.post("/analyze-project", async (req, res) => {
  try {
    const body = AnalyzeProjectBody.parse(req.body);

    const prompt = `You are an expert software project analyst helping students improve their project ideas. Analyze this student project:

Title: ${body.title}
Domain: ${body.domain}
Technologies: ${body.technologies}
Problem Statement: ${body.problemStatement}
Description: ${body.description}

Provide a comprehensive analysis in this exact JSON format:
{
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "improvements": ["improvement suggestion 1", "improvement suggestion 2", "improvement suggestion 3"],
  "innovationScore": 7,
  "summary": "A 2-3 sentence overall assessment of the project"
}

innovationScore is 1-10 based on novelty and impact. Return only valid JSON.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.choices[0]?.message?.content ?? "{}";
    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch {
      analysis = {
        keywords: [],
        strengths: ["Interesting concept"],
        weaknesses: ["Needs more detail"],
        improvements: ["Add more technical depth"],
        innovationScore: 5,
        summary: content.slice(0, 200),
      };
    }

    res.json({
      keywords: analysis.keywords ?? [],
      strengths: analysis.strengths ?? [],
      weaknesses: analysis.weaknesses ?? [],
      improvements: analysis.improvements ?? [],
      innovationScore: analysis.innovationScore ?? 5,
      summary: analysis.summary ?? "",
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/hybrid-idea", async (req, res) => {
  try {
    const body = GenerateHybridIdeaBody.parse(req.body);

    const prompt = `You are an innovative computer science professor helping students create groundbreaking projects by combining existing ideas. Generate a hybrid project idea by merging these two projects:

Project 1: "${body.project1Title}"
Description: ${body.project1Description}
Technologies: ${body.project1Technologies}

Project 2: "${body.project2Title}"
Description: ${body.project2Description}
Technologies: ${body.project2Technologies}

Create an innovative hybrid project that combines the best aspects of both. Return JSON:
{
  "title": "Hybrid Project Title",
  "description": "2-3 sentences describing the hybrid project",
  "technologies": "Tech1, Tech2, Tech3, Tech4",
  "problemItSolves": "What problem does this solve?",
  "implementation": "Brief implementation plan (2-3 steps)",
  "innovations": ["Innovation point 1", "Innovation point 2", "Innovation point 3"]
}

Return only valid JSON.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.choices[0]?.message?.content ?? "{}";
    let hybrid;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      hybrid = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch {
      hybrid = {
        title: `${body.project1Title} + ${body.project2Title}`,
        description: "A combined approach leveraging both projects",
        technologies: `${body.project1Technologies}, ${body.project2Technologies}`,
        problemItSolves: "Addresses multiple domain challenges",
        implementation: "Integrate both systems",
        innovations: ["Combined capabilities", "Cross-domain application"],
      };
    }

    res.json(hybrid);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

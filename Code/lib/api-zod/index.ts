import { z } from "zod";

// Health
export const HealthCheckResponse = z.object({
  status: z.string(),
});

// Error
export const ErrorResponse = z.object({
  error: z.string(),
});

// Project
export const Project = z.object({
  id: z.number(),
  title: z.string(),
  problemStatement: z.string(),
  description: z.string(),
  technologies: z.string(),
  domain: z.string(),
  githubLink: z.string().nullable(),
  keywords: z.string().nullable(),
  createdAt: z.string(),
});

export const SubmitProjectBody = z.object({
  title: z.string(),
  problemStatement: z.string(),
  description: z.string(),
  technologies: z.string(),
  domain: z.string(),
  githubLink: z.string().optional(),
});

export const GetProjectsQueryParams = z.object({
  domain: z.string().optional(),
  technology: z.string().optional(),
  keyword: z.string().optional(),
});

export const GetProjectParams = z.object({
  id: z.number(),
});

export const GetSimilarProjectsQueryParams = z.object({
  limit: z.number().optional(),
});

export const GetSimilarProjectsParams = z.object({
  id: z.number(),
});

export const GetRecommendationsParams = z.object({
  id: z.number(),
});

// Similar Project
export const SimilarProject = z.object({
  project: Project,
  similarity: z.number(),
});

// Recommendations
export const HybridSuggestion = z.object({
  title: z.string(),
  description: z.string(),
  technologies: z.string(),
  basedOn: z.array(z.string()),
});

export const Recommendations = z.object({
  project: Project,
  similarProjects: z.array(SimilarProject),
  improvements: z.array(z.string()),
  hybridIdeas: z.array(HybridSuggestion),
});

// Graph
export const GraphNode = z.object({
  id: z.string(),
  label: z.string(),
  domain: z.string(),
  technologies: z.string(),
});

export const GraphEdge = z.object({
  source: z.string(),
  target: z.string(),
  weight: z.number(),
});

export const IdeaGraph = z.object({
  nodes: z.array(GraphNode),
  edges: z.array(GraphEdge),
});

export const GetIdeaGraphQueryParams = z.object({
  threshold: z.number().optional(),
});

// Innovation Gap
export const InnovationGap = z.object({
  title: z.string(),
  description: z.string(),
  missingCombination: z.string(),
  suggestedTechnologies: z.string(),
  targetDomain: z.string(),
});

// GitHub
export const GithubRepo = z.object({
  id: z.number(),
  name: z.string(),
  fullName: z.string(),
  description: z.string().nullable(),
  url: z.string(),
  stars: z.number(),
  language: z.string().nullable(),
  topics: z.array(z.string()),
  updatedAt: z.string(),
  owner: z.string(),
  readme: z.string().nullable(),
});

export const GithubSearchResults = z.object({
  repos: z.array(GithubRepo),
  total: z.number(),
});

export const SearchGithubQueryParams = z.object({
  query: z.string(),
  page: z.number().optional(),
});

export const AnalyzeGithubBody = z.object({
  repoUrl: z.string(),
});

export const RepoAnalysis = z.object({
  summary: z.string(),
  technologies: z.array(z.string()),
  keyFeatures: z.array(z.string()),
  potentialImprovements: z.array(z.string()),
});

// Scholar
export const ScholarPaper = z.object({
  id: z.string(),
  title: z.string(),
  authors: z.array(z.string()),
  abstract: z.string().nullable(),
  url: z.string(),
  year: z.number().nullable(),
  citations: z.number(),
  journal: z.string().nullable(),
});

export const ScholarSearchResults = z.object({
  papers: z.array(ScholarPaper),
  total: z.number(),
});

export const SearchScholarQueryParams = z.object({
  query: z.string(),
  page: z.number().optional(),
});

export const AnalyzeScholarBody = z.object({
  paperUrl: z.string(),
});

// OpenAI
export const AnalyzeProjectBody = z.object({
  title: z.string(),
  problemStatement: z.string(),
  description: z.string(),
  technologies: z.string(),
  domain: z.string(),
});

export const ProjectAnalysis = z.object({
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  suggestions: z.array(z.string()),
  score: z.number(),
});

export const GenerateHybridIdeaBody = z.object({
  projectId1: z.number(),
  projectId2: z.number(),
});

export const HybridIdea = z.object({
  title: z.string(),
  description: z.string(),
  technologies: z.string(),
  domain: z.string(),
  rationale: z.string(),
});
// Re-export types from api-zod
export type {
  Project,
  SubmitProjectBody,
  GetProjectsQueryParams,
  SimilarProject,
  Recommendations,
  GraphNode,
  GraphEdge,
  IdeaGraph,
  InnovationGap,
  GithubRepo,
  GithubSearchResults,
  ScholarPaper,
  ScholarSearchResults,
  RepoAnalysis,
  ProjectAnalysis,
  HybridIdea,
} from "@workspace/api-zod";

// API base URL
const API_BASE = "/api";

// Helper function to make API calls
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  return response.json();
}

// React hooks using React Query
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Projects
export function useGetProjects(params?: GetProjectsQueryParams) {
  return useQuery({
    queryKey: ["projects", params],
    queryFn: () => apiCall<Project[]>("/projects", {
      method: "GET",
      body: params ? JSON.stringify(params) : undefined,
    }),
  });
}

export function useGetProject(id: number) {
  return useQuery({
    queryKey: ["project", id],
    queryFn: () => apiCall<Project>(`/projects/${id}`),
  });
}

export function useSubmitProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: SubmitProjectBody) =>
      apiCall<Project>("/projects", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useGetRecommendations(id: number) {
  return useQuery({
    queryKey: ["recommendations", id],
    queryFn: () => apiCall<Recommendations>(`/projects/${id}/recommendations`),
  });
}

export function useGenerateHybridIdea() {
  return useMutation({
    mutationFn: (body: { projectId1: number; projectId2: number }) =>
      apiCall<HybridIdea>("/openai/hybrid-idea", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  });
}

// Graph
export function useGetIdeaGraph(params?: { threshold?: number }) {
  return useQuery({
    queryKey: ["idea-graph", params],
    queryFn: () => apiCall<IdeaGraph>("/idea-graph", {
      method: "GET",
      body: params ? JSON.stringify(params) : undefined,
    }),
  });
}

export function useGetInnovationGaps() {
  return useQuery({
    queryKey: ["innovation-gaps"],
    queryFn: () => apiCall<InnovationGap[]>("/innovation-gaps"),
  });
}

// Search
export function useSearchGithub(params: { query: string; page?: number }) {
  return useQuery({
    queryKey: ["github-search", params],
    queryFn: () => apiCall<GithubSearchResults>("/search/github", {
      method: "GET",
      body: JSON.stringify(params),
    }),
  });
}

export function useAnalyzeGithubRepo() {
  return useMutation({
    mutationFn: (body: { repoUrl: string }) =>
      apiCall<RepoAnalysis>("/search/github/analyze", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  });
}

export function useSearchScholar(params: { query: string; page?: number }) {
  return useQuery({
    queryKey: ["scholar-search", params],
    queryFn: () => apiCall<ScholarSearchResults>("/search/scholar", {
      method: "GET",
      body: JSON.stringify(params),
    }),
  });
}

export function useAnalyzeScholarPaper() {
  return useMutation({
    mutationFn: (body: { paperUrl: string }) =>
      apiCall<RepoAnalysis>("/search/scholar/analyze", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  });
}

// OpenAI
export function useAnalyzeProject() {
  return useMutation({
    mutationFn: (body: {
      title: string;
      problemStatement: string;
      description: string;
      technologies: string;
      domain: string;
    }) =>
      apiCall<ProjectAnalysis>("/openai/analyze-project", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  });
}
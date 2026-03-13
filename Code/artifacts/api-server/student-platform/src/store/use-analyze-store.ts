import { create } from "zustand";
import type { GithubRepo, ScholarPaper } from "@workspace/api-client-react";

interface AnalyzeStore {
  selectedGithubRepo: GithubRepo | null;
  setSelectedGithubRepo: (repo: GithubRepo | null) => void;
  selectedScholarPaper: ScholarPaper | null;
  setSelectedScholarPaper: (paper: ScholarPaper | null) => void;
}

export const useAnalyzeStore = create<AnalyzeStore>((set) => ({
  selectedGithubRepo: null,
  setSelectedGithubRepo: (repo) => set({ selectedGithubRepo: repo }),
  selectedScholarPaper: null,
  setSelectedScholarPaper: (paper) => set({ selectedScholarPaper: paper }),
}));

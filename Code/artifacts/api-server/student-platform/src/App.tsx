import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";

import Home from "@/pages/home";
import SubmitProject from "@/pages/submit";
import ExploreProjects from "@/pages/explore";
import ProjectDetail from "@/pages/project-detail";
import IdeaGraph from "@/pages/idea-graph";
import InnovationGaps from "@/pages/innovation-gaps";
import GithubSearch from "@/pages/github-search";
import GithubRepoDetail from "@/pages/github-repo-detail";
import ScholarSearch from "@/pages/scholar-search";
import ScholarPaperDetail from "@/pages/scholar-paper-detail";
import NotFound from "@/pages/not-found";
import { ChintuChat } from "@/components/chintu-chat";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/submit" component={SubmitProject} />
        <Route path="/explore" component={ExploreProjects} />
        <Route path="/projects/:id" component={ProjectDetail} />
        <Route path="/idea-graph" component={IdeaGraph} />
        <Route path="/innovation-gaps" component={InnovationGaps} />
        <Route path="/search/github" component={GithubSearch} />
        <Route path="/explore/github/:owner/:repo" component={GithubRepoDetail} />
        <Route path="/search/scholar" component={ScholarSearch} />
        <Route path="/explore/scholar/:encodedTitle" component={ScholarPaperDetail} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <ChintuChat />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

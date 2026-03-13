import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAnalyzeStore } from "@/store/use-analyze-store";
import { useAnalyzeGithubRepo } from "@workspace/api-client-react";
import { Card, Badge, Button } from "@/components/ui";
import { ArrowLeft, Github, Loader2, Sparkles, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export default function GithubRepoDetail() {
  const [, setLocation] = useLocation();
  const repo = useAnalyzeStore(s => s.selectedGithubRepo);
  const analyzeMutation = useAnalyzeGithubRepo();

  useEffect(() => {
    if (!repo) {
      setLocation("/search/github");
      return;
    }

    // Run analysis if we have the repo and haven't run it yet
    if (!analyzeMutation.data && !analyzeMutation.isPending && !analyzeMutation.isError) {
      analyzeMutation.mutate({
        data: {
          repoFullName: repo.fullName,
          description: repo.description,
          readme: repo.readme,
          topics: repo.topics,
          language: repo.language,
          repoUrl: repo.url
        }
      });
    }
  }, [repo]);

  if (!repo) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Button variant="ghost" onClick={() => setLocation("/search/github")} className="-ml-4 text-muted-foreground hover:text-white">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Search
      </Button>

      <div className="glass-panel p-8 rounded-3xl border-primary/20 bg-gradient-to-b from-primary/10 to-transparent">
        <div className="flex items-center gap-4 mb-4">
          <Github className="w-8 h-8" />
          <h1 className="text-3xl font-bold font-display">{repo.fullName}</h1>
        </div>
        <p className="text-lg text-muted-foreground mb-6">{repo.description}</p>
        <div className="flex flex-wrap gap-2">
          {repo.topics?.map(t => <Badge key={t} variant="outline" className="bg-black/30">{t}</Badge>)}
        </div>
      </div>

      {analyzeMutation.isPending ? (
        <Card className="p-12 flex flex-col items-center justify-center text-center border-dashed border-white/20 bg-transparent">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-6" />
          <h3 className="text-xl font-bold mb-2">AI is reading the code & documentation...</h3>
          <p className="text-muted-foreground">Extracting the core problem and evaluating innovation potential.</p>
        </Card>
      ) : analyzeMutation.isError ? (
        <Card className="p-8 border-destructive/50 bg-destructive/10 text-center">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-bold text-destructive">Failed to analyze repository</h3>
          <Button className="mt-4" onClick={() => analyzeMutation.mutate({ data: { repoFullName: repo.fullName, repoUrl: repo.url } })}>
            Try Again
          </Button>
        </Card>
      ) : analyzeMutation.data ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Analysis Results</h2>
            <div className="ml-auto flex items-center">
              <span className="text-sm text-muted-foreground mr-3 uppercase tracking-wider">Innovation Score</span>
              <span className="text-3xl font-display font-bold text-primary">{analyzeMutation.data.innovationScore}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 bg-black/40">
              <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-3">Problem Addressed</h3>
              <p className="text-foreground leading-relaxed">{analyzeMutation.data.problemDescription}</p>
            </Card>
            <Card className="p-6 bg-black/40">
              <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-3">Proposed Solution</h3>
              <p className="text-foreground leading-relaxed">{analyzeMutation.data.solution}</p>
            </Card>
          </div>

          <Card className="p-8 border-primary/20 glow-shadow">
            <h3 className="text-lg font-bold mb-4">Detailed AI Evaluation</h3>
            <p className="text-foreground/90 leading-relaxed mb-6">{analyzeMutation.data.aiAnalysis}</p>
            
            <div className="border-t border-white/10 pt-6">
              <h4 className="text-sm uppercase tracking-widest text-accent mb-4">Innovation Suggestions</h4>
              <ul className="space-y-3">
                {analyzeMutation.data.suggestions.map((s, i) => (
                  <li key={i} className="flex gap-3 bg-white/5 p-4 rounded-xl">
                    <div className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center shrink-0 text-xs font-bold">{i+1}</div>
                    <span className="text-sm">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </motion.div>
      ) : null}
    </div>
  );
}

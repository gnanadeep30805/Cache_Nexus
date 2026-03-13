import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAnalyzeStore } from "@/store/use-analyze-store";
import { useAnalyzeScholarPaper } from "@workspace/api-client-react";
import { Card, Badge, Button } from "@/components/ui";
import { ArrowLeft, GraduationCap, Loader2, Sparkles, AlertTriangle, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

export default function ScholarPaperDetail() {
  const [, setLocation] = useLocation();
  const paper = useAnalyzeStore(s => s.selectedScholarPaper);
  const analyzeMutation = useAnalyzeScholarPaper();

  useEffect(() => {
    if (!paper) {
      setLocation("/search/scholar");
      return;
    }

    if (!analyzeMutation.data && !analyzeMutation.isPending && !analyzeMutation.isError) {
      analyzeMutation.mutate({
        data: {
          title: paper.title,
          abstract: paper.abstract,
          authors: paper.authors,
          journal: paper.journal,
          year: paper.year,
          url: paper.url
        }
      });
    }
  }, [paper]);

  if (!paper) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Button variant="ghost" onClick={() => setLocation("/search/scholar")} className="-ml-4 text-muted-foreground hover:text-white">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Search
      </Button>

      <div className="glass-panel p-8 md:p-10 rounded-3xl border-blue-500/20 bg-gradient-to-br from-blue-900/20 to-transparent">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-blue-500/20 rounded-xl">
            <GraduationCap className="w-6 h-6 text-blue-400" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-display leading-tight">{paper.title}</h1>
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {paper.authors.map(a => <Badge key={a} variant="outline" className="bg-black/30 border-blue-500/30">{a}</Badge>)}
        </div>
        <p className="text-muted-foreground bg-black/30 p-4 rounded-xl italic text-sm leading-relaxed border border-white/5">
          "{paper.abstract || "No abstract available. AI will attempt to infer from title and metadata."}"
        </p>
      </div>

      {analyzeMutation.isPending ? (
        <Card className="p-12 flex flex-col items-center justify-center text-center border-dashed border-blue-500/20 bg-transparent">
          <Loader2 className="w-12 h-12 animate-spin text-blue-400 mb-6" />
          <h3 className="text-xl font-bold mb-2">Distilling Academic Research...</h3>
          <p className="text-muted-foreground">Translating complex academic language into actionable project ideas.</p>
        </Card>
      ) : analyzeMutation.isError ? (
        <Card className="p-8 border-destructive/50 bg-destructive/10 text-center">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-bold text-destructive">Failed to analyze paper</h3>
          <Button className="mt-4 bg-destructive text-white hover:bg-destructive/90" onClick={() => analyzeMutation.mutate({ data: { title: paper.title, url: paper.url } })}>
            Try Again
          </Button>
        </Card>
      ) : analyzeMutation.data ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-8 border-t-4 border-t-primary bg-black/40">
              <h3 className="text-sm uppercase tracking-widest text-primary mb-4 flex items-center">
                <Sparkles className="w-4 h-4 mr-2" /> Core Problem
              </h3>
              <p className="text-foreground leading-relaxed text-lg">{analyzeMutation.data.problemDescription}</p>
            </Card>
            
            <Card className="p-8 border-t-4 border-t-accent bg-black/40">
              <h3 className="text-sm uppercase tracking-widest text-accent mb-4 flex items-center">
                <Lightbulb className="w-4 h-4 mr-2" /> Research Solution
              </h3>
              <p className="text-foreground leading-relaxed text-lg">{analyzeMutation.data.solution}</p>
            </Card>
          </div>

          <Card className="p-8 glow-shadow">
            <h3 className="text-xl font-bold mb-4">Application to Student Projects</h3>
            <p className="text-foreground/90 leading-relaxed mb-8 text-lg">{analyzeMutation.data.aiAnalysis}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-sm uppercase tracking-widest text-muted-foreground mb-4">Key Technologies Mentioned</h4>
                <div className="flex flex-wrap gap-2">
                  {analyzeMutation.data.keyTechnologies.map(t => (
                    <Badge key={t} variant="secondary" className="px-3 py-1 text-sm bg-white/10">{t}</Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm uppercase tracking-widest text-muted-foreground mb-4">Actionable Project Ideas</h4>
                <ul className="space-y-3">
                  {analyzeMutation.data.suggestions.map((s, i) => (
                    <li key={i} className="flex gap-3 items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                      <span className="text-sm text-white/90">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>
      ) : null}
    </div>
  );
}

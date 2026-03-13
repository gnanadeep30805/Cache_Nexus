import { useRoute } from "wouter";
import { useGetProject, useGetRecommendations, useGenerateHybridIdea } from "@workspace/api-client-react";
import { Badge, Button, Card } from "@/components/ui";
import { Loader2, ArrowLeft, GitMerge, Lightbulb, Link as LinkIcon, Cpu } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProjectDetail() {
  const [, params] = useRoute("/projects/:id");
  const id = params?.id ? parseInt(params.id, 10) : 0;

  const { data: project, isLoading: isProjectLoading } = useGetProject(id);
  const { data: recs, isLoading: isRecsLoading } = useGetRecommendations(id);
  const generateHybrid = useGenerateHybridIdea();

  const [hybridResult, setHybridResult] = useState<any>(null);

  const handleGenerateHybrid = async (similarProject: any) => {
    if (!project) return;
    try {
      const result = await generateHybrid.mutateAsync({
        data: {
          project1Id: project.id,
          project2Id: similarProject.id,
          project1Title: project.title,
          project2Title: similarProject.title,
          project1Description: project.description,
          project2Description: similarProject.description,
          project1Technologies: project.technologies,
          project2Technologies: similarProject.technologies,
        }
      });
      setHybridResult(result);
    } catch (err) {
      console.error(err);
    }
  };

  if (isProjectLoading || isRecsLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) return <div>Project not found</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <Link href="/explore" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Explore
      </Link>

      {/* Header */}
      <div className="glass-panel p-8 md:p-12 rounded-[2.5rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10">
          <Badge className="mb-6 px-4 py-1.5 text-sm">{project.domain}</Badge>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">{project.title}</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div>
              <h3 className="text-sm uppercase tracking-wider text-muted-foreground mb-2">Problem</h3>
              <p className="text-lg leading-relaxed">{project.problemStatement}</p>
            </div>
            <div>
              <h3 className="text-sm uppercase tracking-wider text-muted-foreground mb-2">Technologies</h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies.split(',').map(t => (
                  <Badge key={t} variant="outline" className="bg-black/30 border-white/10">{t.trim()}</Badge>
                ))}
              </div>
              {project.githubLink && (
                <div className="mt-6">
                  <a href={project.githubLink} target="_blank" rel="noreferrer" className="inline-flex items-center text-primary hover:underline">
                    <LinkIcon className="w-4 h-4 mr-2" /> View Repository
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Description & Improvements */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-4 border-b border-white/10 pb-4">Description</h2>
            <div className="prose prose-invert max-w-none text-foreground/80 leading-loose">
              {project.description}
            </div>
          </Card>

          {recs && recs.improvements.length > 0 && (
            <Card className="p-8 border-accent/20 bg-accent/5">
              <h2 className="text-2xl font-bold mb-4 flex items-center text-accent">
                <Lightbulb className="w-6 h-6 mr-2" /> AI Suggested Improvements
              </h2>
              <ul className="space-y-3">
                {recs.improvements.map((imp, i) => (
                  <li key={i} className="flex items-start gap-3 bg-black/20 p-4 rounded-xl">
                    <div className="mt-1 w-2 h-2 rounded-full bg-accent shrink-0" />
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        {/* Right Column: Similar Projects & Hybrid Generator */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold px-2">Similar Projects</h2>
          
          {recs?.similarProjects.map((sim) => (
            <Card key={sim.project.id} className="p-5 flex flex-col gap-4 bg-black/40 border-white/5">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <Link href={`/projects/${sim.project.id}`}>
                    <h4 className="font-bold hover:text-primary cursor-pointer leading-tight">{sim.project.title}</h4>
                  </Link>
                  <Badge variant="accent" className="shrink-0 ml-2 py-0 text-[10px]">
                    {(sim.similarity * 100).toFixed(0)}% Match
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{sim.project.problemStatement}</p>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs font-semibold hover:border-primary hover:text-primary"
                onClick={() => handleGenerateHybrid(sim.project)}
                isLoading={generateHybrid.isPending}
              >
                <GitMerge className="w-4 h-4 mr-2" /> Generate Hybrid Idea
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Hybrid Idea Modal/Result */}
      <AnimatePresence>
        {hybridResult && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          >
            <Card className="max-w-3xl w-full p-8 max-h-[90vh] overflow-y-auto glow-shadow border-primary/50 relative">
              <Button 
                variant="ghost" 
                className="absolute top-4 right-4" 
                onClick={() => setHybridResult(null)}
              >
                Close
              </Button>
              
              <div className="flex items-center mb-6 text-primary">
                <Cpu className="w-8 h-8 mr-3" />
                <h2 className="text-3xl font-display font-bold">New Hybrid Concept</h2>
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-4">{hybridResult.title}</h3>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">{hybridResult.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white/5 p-5 rounded-xl border border-white/10">
                  <h4 className="font-semibold text-sm uppercase text-accent mb-2">Problem it Solves</h4>
                  <p className="text-sm">{hybridResult.problemItSolves}</p>
                </div>
                <div className="bg-white/5 p-5 rounded-xl border border-white/10">
                  <h4 className="font-semibold text-sm uppercase text-primary mb-2">Implementation</h4>
                  <p className="text-sm">{hybridResult.implementation}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Key Innovations:</h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {hybridResult.innovations.map((inv: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-sm bg-black/30 p-3 rounded-lg">
                      <Zap className="w-4 h-4 text-yellow-400 shrink-0" />
                      {inv}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Zap(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round" {...props}><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>;
}

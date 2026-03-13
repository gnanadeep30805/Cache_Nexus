import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSubmitProject, useAnalyzeProject } from "@workspace/api-client-react";
import { Button, Input, Textarea, Card, Badge } from "@/components/ui";
import { Sparkles, CheckCircle2, BrainCircuit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  problemStatement: z.string().min(10, "Problem statement too short"),
  description: z.string().min(20, "Description must be detailed"),
  technologies: z.string().min(2, "List at least one technology"),
  domain: z.string().min(2, "Domain is required"),
  githubLink: z.string().url().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

export default function SubmitProject() {
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  
  const submitMutation = useSubmitProject();
  const analyzeMutation = useAnalyzeProject();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const project = await submitMutation.mutateAsync({ data });
      const analysis = await analyzeMutation.mutateAsync({
        data: {
          projectId: project.id,
          ...data,
        }
      });
      setAnalysisResult(analysis);
    } catch (error) {
      console.error(error);
    }
  };

  const isPending = submitMutation.isPending || analyzeMutation.isPending;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-4">Submit & <span className="text-gradient">Analyze</span></h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Share your idea with the platform. Our AI engine will analyze it instantly, generate keywords, score its innovation, and suggest improvements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Project Title</label>
              <Input placeholder="e.g. Smart Crop Analyzer" {...register("title")} />
              {errors.title && <p className="text-destructive text-sm">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Domain</label>
                <Input placeholder="e.g. Agriculture, Healthcare" {...register("domain")} />
                {errors.domain && <p className="text-destructive text-sm">{errors.domain.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Technologies</label>
                <Input placeholder="e.g. React, Python, IoT" {...register("technologies")} />
                {errors.technologies && <p className="text-destructive text-sm">{errors.technologies.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Problem Statement</label>
              <Textarea placeholder="What specific problem are you solving?" className="min-h-[80px]" {...register("problemStatement")} />
              {errors.problemStatement && <p className="text-destructive text-sm">{errors.problemStatement.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Description</label>
              <Textarea placeholder="Detailed description of your solution..." {...register("description")} />
              {errors.description && <p className="text-destructive text-sm">{errors.description.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">GitHub Link (Optional)</label>
              <Input placeholder="https://github.com/..." {...register("githubLink")} />
              {errors.githubLink && <p className="text-destructive text-sm">{errors.githubLink.message}</p>}
            </div>

            <Button type="submit" className="w-full" size="lg" isLoading={isPending}>
              <Sparkles className="mr-2 w-5 h-5" />
              {isPending ? "Analyzing..." : "Submit & Analyze"}
            </Button>
          </form>
        </Card>

        <div className="relative">
          <AnimatePresence mode="wait">
            {!analysisResult ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-8 text-center text-muted-foreground"
              >
                <BrainCircuit className="w-16 h-16 mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">Awaiting Input</h3>
                <p>Submit your project to see the AI breakdown, strengths, weaknesses, and innovation score here.</p>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <Card className="p-8 border-primary/30 glow-shadow">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold flex items-center">
                      <Sparkles className="w-6 h-6 text-primary mr-2" /> AI Analysis
                    </h2>
                    <div className="text-right">
                      <div className="text-3xl font-display font-bold text-primary">{analysisResult.innovationScore}/100</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">Innovation Score</div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-sm font-semibold mb-2 text-muted-foreground uppercase">Summary</h4>
                    <p className="text-lg leading-relaxed">{analysisResult.summary}</p>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase">Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.keywords?.map((kw: string) => (
                        <Badge key={kw} variant="accent">{kw}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-semibold mb-3 text-green-400 uppercase flex items-center">
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Strengths
                      </h4>
                      <ul className="space-y-2">
                        {analysisResult.strengths?.map((s: string, i: number) => (
                          <li key={i} className="text-sm bg-white/5 p-3 rounded-lg border border-white/5">{s}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-3 text-destructive uppercase flex items-center">
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Weaknesses
                      </h4>
                      <ul className="space-y-2">
                        {analysisResult.weaknesses?.map((w: string, i: number) => (
                          <li key={i} className="text-sm bg-white/5 p-3 rounded-lg border border-white/5">{w}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/10">
                    <h4 className="text-sm font-semibold mb-3 text-accent uppercase">Suggested Improvements</h4>
                    <ul className="space-y-2">
                      {analysisResult.improvements?.map((imp: string, i: number) => (
                        <li key={i} className="text-sm bg-accent/10 text-accent-foreground p-3 rounded-lg border border-accent/20">
                          {imp}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

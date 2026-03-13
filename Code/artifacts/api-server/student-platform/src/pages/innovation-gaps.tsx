import { useGetInnovationGaps } from "@workspace/api-client-react";
import { Card, Badge, Button } from "@/components/ui";
import { Loader2, Lightbulb, TrendingUp, Search } from "lucide-react";
import { Link } from "wouter";

export default function InnovationGaps() {
  const { data: gaps, isLoading } = useGetInnovationGaps();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold font-display flex items-center">
          <TrendingUp className="w-8 h-8 mr-3 text-accent" /> Innovation Gaps
        </h1>
        <p className="text-muted-foreground mt-2 max-w-3xl text-lg">
          Our AI analyzes clusters of similar projects to detect missing combinations of technologies and domains, suggesting completely new white-space opportunities.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      ) : gaps?.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-3xl">
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold">No gaps detected yet</h3>
          <p className="text-muted-foreground">Submit more projects to help the AI find missing links.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {gaps?.map((gap, i) => (
            <Card key={i} className="p-6 md:p-8 flex flex-col h-full border-accent/20 bg-gradient-to-br from-black/40 to-accent/5 hover:border-accent/50 transition-colors">
              <div className="mb-4">
                <Badge variant="accent" className="mb-4">Target: {gap.targetDomain}</Badge>
                <h3 className="text-2xl font-bold text-foreground mb-3">{gap.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{gap.description}</p>
              </div>

              <div className="mt-auto space-y-4">
                <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                  <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Missing Combination Identified</h4>
                  <p className="font-medium text-white">{gap.missingCombination}</p>
                </div>
                
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Suggested Tech Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    {gap.suggestedTechnologies.split(',').map(t => (
                      <Badge key={t} variant="outline" className="border-accent/30 text-accent-foreground">{t.trim()}</Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <Link href={`/submit?title=${encodeURIComponent(gap.title)}&domain=${encodeURIComponent(gap.targetDomain)}`}>
                    <Button className="w-full" variant="outline">Claim this Idea</Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

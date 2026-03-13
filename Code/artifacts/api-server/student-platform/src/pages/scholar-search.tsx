import { useState } from "react";
import { useLocation } from "wouter";
import { useSearchScholar } from "@workspace/api-client-react";
import { useAnalyzeStore } from "@/store/use-analyze-store";
import { Card, Input, Button, Badge } from "@/components/ui";
import { GraduationCap, Search, FileText, ArrowRight, Calendar } from "lucide-react";

export default function ScholarSearch() {
  const [query, setQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [, setLocation] = useLocation();
  const setStorePaper = useAnalyzeStore(s => s.setSelectedScholarPaper);

  const { data: results, isLoading, isFetching } = useSearchScholar(
    { query: activeSearch, page: 1 },
    { query: { enabled: !!activeSearch } }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) setActiveSearch(query);
  };

  const handleAnalyze = (paper: any) => {
    setStorePaper(paper);
    setLocation(`/explore/scholar/${encodeURIComponent(paper.title.substring(0, 50))}`);
  };

  return (
    <div className="space-y-8">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold font-display mb-4">Scholar Search</h1>
        <p className="text-muted-foreground text-lg">
          Search academic papers and let AI break down complex research into clear problem statements, methodologies, and innovation ideas.
        </p>
      </div>

      <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-3">
        <Input 
          className="h-14 text-lg bg-black/40 border-white/10" 
          placeholder="Search research papers..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button size="lg" type="submit" isLoading={isFetching} className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white">
          <Search className="w-5 h-5 mr-2" /> Search
        </Button>
      </form>

      {results && (
        <div className="mt-12">
          <p className="text-muted-foreground mb-6 font-medium">
            Found results for "{activeSearch}"
          </p>
          <div className="grid grid-cols-1 gap-6">
            {results.items.map((paper, i) => (
              <Card key={i} className="p-6 md:p-8 flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <a href={paper.url} target="_blank" rel="noreferrer" className="text-xl md:text-2xl font-bold hover:text-blue-400 transition-colors mb-2 block">
                    {paper.title}
                  </a>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 text-sm text-muted-foreground">
                    <span className="text-white/80">{paper.authors.join(", ")}</span>
                    {paper.year && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {paper.year}
                      </span>
                    )}
                    {paper.journal && <span>• {paper.journal}</span>}
                    {paper.citations && <Badge variant="outline" className="bg-black/30">Citations: {paper.citations}</Badge>}
                  </div>

                  {paper.abstract && (
                    <p className="text-muted-foreground text-sm line-clamp-3 mb-6 bg-black/20 p-4 rounded-xl border border-white/5">
                      <span className="font-semibold text-white mr-2">Abstract:</span>
                      {paper.abstract}
                    </p>
                  )}
                </div>

                <div className="flex flex-col justify-center shrink-0 w-full md:w-48">
                  <Button 
                    className="w-full h-12 bg-white/10 hover:bg-white/20 border-0" 
                    onClick={() => handleAnalyze(paper)}
                  >
                    Analyze <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

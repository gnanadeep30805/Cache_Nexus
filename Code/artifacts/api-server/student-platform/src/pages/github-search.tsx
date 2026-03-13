import { useState } from "react";
import { useLocation } from "wouter";
import { useSearchGithub } from "@workspace/api-client-react";
import { useAnalyzeStore } from "@/store/use-analyze-store";
import { Card, Input, Button, Badge } from "@/components/ui";
import { Github, Search, Star, Code, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function GithubSearch() {
  const [query, setQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [, setLocation] = useLocation();
  const setStoreRepo = useAnalyzeStore(s => s.setSelectedGithubRepo);

  const { data: results, isLoading, isFetching } = useSearchGithub(
    { query: activeSearch, page: 1 },
    { query: { enabled: !!activeSearch } }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) setActiveSearch(query);
  };

  const handleAnalyze = (repo: any) => {
    setStoreRepo(repo);
    setLocation(`/explore/github/${repo.fullName}`);
  };

  return (
    <div className="space-y-8">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Github className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold font-display mb-4">Search GitHub</h1>
        <p className="text-muted-foreground text-lg">
          Find open source projects and analyze them with AI to extract the core problem, solution, and innovation potential.
        </p>
      </div>

      <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-3">
        <Input 
          className="h-14 text-lg bg-black/40 border-white/10" 
          placeholder="e.g. machine learning healthcare..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button size="lg" type="submit" isLoading={isFetching} className="h-14 px-8">
          <Search className="w-5 h-5 mr-2" /> Search
        </Button>
      </form>

      {results && (
        <div className="mt-12">
          <p className="text-muted-foreground mb-6 font-medium">
            Found {results.totalCount} results for "{activeSearch}"
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {results.items.map((repo) => (
              <Card key={repo.id} className="p-6 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <a href={repo.url} target="_blank" rel="noreferrer" className="text-xl font-bold hover:text-primary transition-colors flex items-center gap-2 line-clamp-1">
                    {repo.name}
                  </a>
                  <Badge variant="outline" className="shrink-0 flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400" fill="currentColor" /> {repo.stars}
                  </Badge>
                </div>
                
                <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-1">
                  {repo.description || "No description provided."}
                </p>

                <div className="mt-auto space-y-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      {repo.language && (
                        <span className="flex items-center gap-1">
                          <Code className="w-3 h-3" /> {repo.language}
                        </span>
                      )}
                      <span>Updated {formatDate(repo.updatedAt)}</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    variant="glass"
                    onClick={() => handleAnalyze(repo)}
                  >
                    Analyze Repository with AI <ArrowRight className="w-4 h-4 ml-2" />
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

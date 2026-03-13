import { useState } from "react";
import { Link } from "wouter";
import { useGetProjects } from "@workspace/api-client-react";
import { Input, Card, Badge } from "@/components/ui";
import { Search, Filter, Loader2, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function ExploreProjects() {
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("");
  
  const { data: projects, isLoading } = useGetProjects({
    keyword: search || undefined,
    domain: domain || undefined,
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display">Explore Projects</h1>
          <p className="text-muted-foreground mt-1">Discover ideas submitted by other students.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search keywords..." 
              className="pl-10 bg-black/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative w-full sm:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Filter by Domain" 
              className="pl-10 bg-black/20"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : projects?.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-3xl">
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold">No projects found</h3>
          <p className="text-muted-foreground">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects?.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="h-full flex flex-col p-6 hover:shadow-primary/20 group cursor-pointer border-white/5 hover:border-primary/50">
                <div className="mb-4">
                  <Badge className="mb-3">{project.domain}</Badge>
                  <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2">
                    {project.title}
                  </h3>
                </div>
                
                <p className="text-muted-foreground text-sm flex-1 line-clamp-3 mb-6">
                  {project.problemStatement}
                </p>

                <div className="mt-auto">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.split(',').slice(0, 3).map((tech) => (
                      <Badge key={tech} variant="outline" className="text-[10px] py-0 px-2 bg-black/20">
                        {tech.trim()}
                      </Badge>
                    ))}
                    {project.technologies.split(',').length > 3 && (
                      <Badge variant="outline" className="text-[10px] py-0 px-2 bg-black/20">
                        +{project.technologies.split(',').length - 3}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-white/10 pt-4">
                    <span>{formatDate(project.createdAt)}</span>
                    <span className="flex items-center text-primary font-semibold group-hover:translate-x-1 transition-transform">
                      View Details <ArrowRight className="ml-1 w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

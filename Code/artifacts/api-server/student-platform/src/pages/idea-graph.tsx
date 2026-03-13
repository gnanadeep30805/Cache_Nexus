import { useState } from "react";
import { useLocation } from "wouter";
import CytoscapeComponent from "react-cytoscapejs";
import { useGetIdeaGraph } from "@workspace/api-client-react";
import { Card, Badge, Button } from "@/components/ui";
import { Loader2, Maximize2 } from "lucide-react";

export default function IdeaGraph() {
  const [, setLocation] = useLocation();
  const [threshold, setThreshold] = useState(0.4);
  const { data: graph, isLoading } = useGetIdeaGraph({ threshold });

  const elements = graph ? [
    ...graph.nodes.map(n => ({
      data: { id: n.id, label: n.label, domain: n.domain, tech: n.technologies },
      classes: n.domain.toLowerCase().replace(/\s+/g, '-')
    })),
    ...graph.edges.map(e => ({
      data: { source: e.source, target: e.target, weight: e.weight }
    }))
  ] : [];

  const handleNodeClick = (event: any) => {
    const id = event.target.id();
    setLocation(`/projects/${id}`);
  };

  const cyStylesheet = [
    {
      selector: 'node',
      style: {
        'label': 'data(label)',
        'background-color': '#6B46C1', // Primary
        'color': '#fff',
        'font-family': 'Outfit',
        'font-size': '12px',
        'text-valign': 'bottom' as const,
        'text-halign': 'center' as const,
        'text-margin-y': 6,
        'width': 24,
        'height': 24,
        'border-width': 2,
        'border-color': '#060913',
      }
    },
    {
      selector: 'edge',
      style: {
        'width': 'data(weight)',
        'line-color': 'rgba(255,255,255,0.1)',
        'target-arrow-shape': 'none' as const,
        'curve-style': 'bezier' as const,
      }
    },
    {
      selector: '.healthcare',
      style: { 'background-color': '#10B981' }
    },
    {
      selector: '.agriculture',
      style: { 'background-color': '#F59E0B' }
    },
    {
      selector: '.education',
      style: { 'background-color': '#3B82F6' }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display">Idea Network</h1>
          <p className="text-muted-foreground mt-1">Interactive visualization of semantic similarities.</p>
        </div>
        <div className="flex items-center gap-4 bg-card p-2 rounded-xl border border-white/5">
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap px-2">Similarity Threshold:</span>
          {[0.3, 0.4, 0.5, 0.6].map(t => (
            <Button 
              key={t}
              size="sm" 
              variant={threshold === t ? "default" : "ghost"}
              onClick={() => setThreshold(t)}
              className="h-8"
            >
              {t}
            </Button>
          ))}
        </div>
      </div>

      <Card className="p-1 h-[70vh] relative border-white/10 glow-shadow bg-black/40 overflow-hidden">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 z-10 backdrop-blur-sm">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="font-medium animate-pulse">Calculating embeddings & rendering graph...</p>
          </div>
        ) : (
          <>
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
              <Badge variant="outline" className="bg-black/50 backdrop-blur-md">
                Nodes: {graph?.nodes.length || 0}
              </Badge>
              <Badge variant="outline" className="bg-black/50 backdrop-blur-md">
                Edges: {graph?.edges.length || 0}
              </Badge>
            </div>
            
            <CytoscapeComponent
              elements={elements}
              stylesheet={cyStylesheet}
              style={{ width: '100%', height: '100%' }}
              layout={{ name: 'cose', padding: 50, animate: true, animationDuration: 500 }}
              cy={(cy) => {
                cy.on('tap', 'node', handleNodeClick);
                cy.on('mouseover', 'node', (e) => {
                  e.target.style('width', 32);
                  e.target.style('height', 32);
                  document.body.style.cursor = 'pointer';
                });
                cy.on('mouseout', 'node', (e) => {
                  e.target.style('width', 24);
                  e.target.style('height', 24);
                  document.body.style.cursor = 'default';
                });
              }}
            />
          </>
        )}
      </Card>
    </div>
  );
}

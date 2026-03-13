import React from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { BrainCircuit, Compass, Network, Lightbulb, Github, GraduationCap } from "lucide-react";

const NAV_LINKS = [
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/submit", label: "Submit Idea", icon: BrainCircuit },
  { href: "/idea-graph", label: "Idea Graph", icon: Network },
  { href: "/innovation-gaps", label: "Gaps", icon: Lightbulb },
  { href: "/search/github", label: "GitHub", icon: Github },
  { href: "/search/scholar", label: "Scholar", icon: GraduationCap },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/30 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/30 blur-[120px]" />
      </div>

      <header className="sticky top-0 z-50 w-full border-b border-white/5 glass-panel rounded-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <img src={`${import.meta.env.BASE_URL}images/logo-icon.png`} alt="Logo" className="w-10 h-10 group-hover:scale-110 transition-transform duration-300" />
            <span className="font-display font-bold text-xl tracking-tight hidden sm:block">
              Evo<span className="text-primary">Project</span>
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-1 bg-black/20 p-1.5 rounded-2xl border border-white/5">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = location === link.href;
              return (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300",
                    isActive ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="flex-1 relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
        >
          {children}
        </motion.div>
      </main>

      <footer className="border-t border-white/10 glass-panel mt-auto rounded-none z-10 relative">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} AI-Powered Student Project Evolution Platform.</p>
        </div>
      </footer>
    </div>
  );
}

import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui";
import { ArrowRight, BrainCircuit, Network, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col gap-24 py-12">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0 z-[-1] overflow-hidden rounded-[3rem]"
        >
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
            alt="Abstract AI gradient" 
            className="w-full h-full object-cover opacity-60 mix-blend-screen"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background" />
        </motion.div>

        <div className="max-w-4xl mx-auto pt-20 pb-16 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">
              Evolve Your Ideas with <br/>
              <span className="text-gradient glow-shadow inline-block">AI Intelligence</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Submit your project ideas, discover global similarities, uncover innovation gaps, and generate AI-powered hybrid concepts to stand out.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/submit">
                <Button size="lg" className="w-full sm:w-auto font-bold text-lg group">
                  Submit Idea
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/explore">
                <Button variant="glass" size="lg" className="w-full sm:w-auto font-bold text-lg">
                  Explore Projects
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            icon: BrainCircuit,
            title: "AI Project Analysis",
            desc: "Get instant feedback on your project's strengths, weaknesses, and a calculated innovation score.",
          },
          {
            icon: Network,
            title: "Idea Evolution Graph",
            desc: "Visualize how projects relate to each other through our advanced semantic similarity engine.",
          },
          {
            icon: Zap,
            title: "Hybrid Generation",
            desc: "Combine concepts from Github, Scholar, and peer projects to invent completely new solutions.",
          }
        ].map((feature, i) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="glass-panel p-8 rounded-3xl group hover:-translate-y-2 transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/30 transition-all">
                <Icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
            </motion.div>
          );
        })}
      </section>
    </div>
  );
}

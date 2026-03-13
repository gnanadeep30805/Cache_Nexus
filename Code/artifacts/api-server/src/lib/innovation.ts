type Project = {
  id: number;
  title: string;
  description: string;
  technologies: string;
  domain: string;
  problemStatement: string;
};

type HybridSuggestion = {
  title: string;
  description: string;
  technologies: string;
  basedOn: string[];
};

type InnovationGap = {
  title: string;
  description: string;
  missingCombination: string;
  suggestedTechnologies: string;
  targetDomain: string;
};

export function generateHybridSuggestions(
  baseProject: Project,
  similarProjects: Project[]
): HybridSuggestion[] {
  const suggestions: HybridSuggestion[] = [];

  for (const other of similarProjects.slice(0, 3)) {
    const baseTechs = baseProject.technologies
      .split(",")
      .map((t) => t.trim())
      .slice(0, 2);
    const otherTechs = other.technologies
      .split(",")
      .map((t) => t.trim())
      .slice(0, 2);

    const mergedTechs = [...new Set([...baseTechs, ...otherTechs])].join(", ");

    suggestions.push({
      title: `${baseProject.title} + ${other.title} Fusion`,
      description: `A hybrid system combining ${baseProject.domain} capabilities of "${baseProject.title}" with the ${other.domain} features of "${other.title}". This creates a more comprehensive solution addressing both ${baseProject.problemStatement.slice(0, 60)}... and ${other.problemStatement.slice(0, 60)}...`,
      technologies: mergedTechs,
      basedOn: [baseProject.title, other.title],
    });
  }

  return suggestions;
}

export function detectInnovationGaps(projects: Project[]): InnovationGap[] {
  const domains = [...new Set(projects.map((p) => p.domain))];
  const techSets = projects.map((p) =>
    p.technologies
      .split(",")
      .map((t) => t.trim().toLowerCase())
  );

  const gaps: InnovationGap[] = [];

  const domainTechMap: Record<string, string[]> = {};
  for (const p of projects) {
    if (!domainTechMap[p.domain]) domainTechMap[p.domain] = [];
    const techs = p.technologies.split(",").map((t) => t.trim());
    domainTechMap[p.domain].push(...techs);
  }

  const aiDomains = ["Healthcare", "Agriculture", "Education", "Finance", "Environment"];
  const iotDomains = ["Manufacturing", "Smart City", "Agriculture", "Healthcare"];
  const blockchainDomains = ["Finance", "Supply Chain", "Healthcare", "Education"];

  if (!projects.some((p) => p.technologies.toLowerCase().includes("blockchain") && p.domain === "Healthcare")) {
    gaps.push({
      title: "Blockchain-Based Healthcare Records",
      description: "No project currently combines blockchain security with healthcare data management. This gap represents a significant opportunity for secure, immutable patient records.",
      missingCombination: "Blockchain + Healthcare",
      suggestedTechnologies: "Blockchain, Smart Contracts, IPFS, React, Node.js",
      targetDomain: "Healthcare",
    });
  }

  if (!projects.some((p) => p.technologies.toLowerCase().includes("iot") && p.domain.toLowerCase().includes("educat"))) {
    gaps.push({
      title: "IoT-Enhanced Smart Classroom",
      description: "Combining IoT sensors with education technology can create adaptive learning environments that respond to student engagement and environmental factors.",
      missingCombination: "IoT + Education Technology",
      suggestedTechnologies: "IoT Sensors, Edge Computing, Machine Learning, React Native",
      targetDomain: "Education",
    });
  }

  if (!projects.some((p) =>
    p.technologies.toLowerCase().includes("ai") &&
    p.technologies.toLowerCase().includes("drone")
  )) {
    gaps.push({
      title: "AI-Powered Autonomous Drone Monitoring",
      description: "AI-driven drones for environmental monitoring and disaster response remain unexplored in the current project landscape.",
      missingCombination: "AI + Drone + Environmental Monitoring",
      suggestedTechnologies: "Computer Vision, ROS, Python, Deep Learning, GPS",
      targetDomain: "Environment & Safety",
    });
  }

  if (!projects.some((p) =>
    p.technologies.toLowerCase().includes("nlp") &&
    p.domain.toLowerCase().includes("agri")
  )) {
    gaps.push({
      title: "NLP-Based Agricultural Advisory System",
      description: "Farmers lack access to AI-powered language interfaces for agricultural guidance in regional languages. Combining NLP with agricultural data creates high impact.",
      missingCombination: "NLP + Agriculture",
      suggestedTechnologies: "NLP, Transformers, Python, FastAPI, React",
      targetDomain: "Agriculture",
    });
  }

  if (gaps.length < 3) {
    gaps.push({
      title: "Federated Learning for Privacy-Preserving Analytics",
      description: "Decentralized ML training across devices without sharing raw data is an emerging research gap across multiple domains.",
      missingCombination: "Federated Learning + Data Privacy",
      suggestedTechnologies: "TensorFlow Federated, Python, Differential Privacy, Kubernetes",
      targetDomain: "Data Science & Privacy",
    });
  }

  return gaps.slice(0, 6);
}

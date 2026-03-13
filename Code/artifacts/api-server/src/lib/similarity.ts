export function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "can", "this", "that", "these", "those",
    "it", "its", "we", "our", "us", "their", "they", "using", "use",
    "system", "based", "project", "data"
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stopWords.has(w));

  const freq: Record<string, number> = {};
  for (const word of words) {
    freq[word] = (freq[word] ?? 0) + 1;
  }

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([word]) => word);
}

export function textToSimpleEmbedding(text: string): number[] {
  const keywords = [
    "machine learning", "ai", "artificial intelligence", "deep learning", "neural network",
    "iot", "internet of things", "sensor", "embedded", "hardware",
    "web", "frontend", "backend", "api", "database", "sql", "nosql",
    "mobile", "android", "ios", "app", "flutter", "react native",
    "blockchain", "decentralized", "smart contract", "crypto",
    "cloud", "aws", "azure", "gcp", "microservices", "docker", "kubernetes",
    "nlp", "natural language", "text", "language model",
    "computer vision", "image", "detection", "recognition", "opencv",
    "healthcare", "medical", "health", "patient",
    "agriculture", "farming", "crop", "soil",
    "education", "learning", "student", "teaching",
    "finance", "payment", "trading", "prediction",
    "security", "encryption", "authentication", "privacy",
    "automation", "robot", "autonomous", "drone",
    "environment", "pollution", "climate", "energy", "solar",
    "python", "javascript", "typescript", "java", "go", "rust", "cpp",
    "tensorflow", "pytorch", "scikit", "pandas", "numpy",
    "recommendation", "collaborative", "filtering",
    "real time", "streaming", "kafka", "redis",
    "analytics", "visualization", "dashboard", "monitoring",
    "social", "network", "graph", "community",
  ];

  const normalized = text.toLowerCase();
  const vec = keywords.map((kw) => {
    const count = (normalized.match(new RegExp(kw, "g")) || []).length;
    return count > 0 ? 1 + Math.log(count) : 0;
  });

  const words = normalized.split(/\s+/);
  const wordFreq: Record<string, number> = {};
  for (const w of words) {
    if (w.length > 4) wordFreq[w] = (wordFreq[w] ?? 0) + 1;
  }

  const allUniqueWords = Object.keys(wordFreq).slice(0, 50);
  const wordVec = allUniqueWords.map((w) => wordFreq[w] ?? 0);

  return [...vec, ...wordVec];
}

export function computeSimilarity(a: number[], b: number[]): number {
  const maxLen = Math.max(a.length, b.length);
  const av = [...a, ...new Array(maxLen - a.length).fill(0)];
  const bv = [...b, ...new Array(maxLen - b.length).fill(0)];

  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < maxLen; i++) {
    dot += av[i] * bv[i];
    magA += av[i] * av[i];
    magB += bv[i] * bv[i];
  }

  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  if (denom === 0) return 0;
  return Math.min(1, dot / denom);
}

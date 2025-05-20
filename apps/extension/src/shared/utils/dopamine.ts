type SiteWeights = Record<string, number>;

const defaultSiteWeights: SiteWeights = {
  "youtube.com": 0.95,
  "twitter.com": 0.9,
  "reddit.com": 0.85,
  "netflix.com": 0.9,
  "wikipedia.org": 0.2,
  "chat.openai.com": 0.4,
  "docs.google.com": 0.3,
  "github.com": 0.3,
  "stackoverflow.com": 0.3,
};

export function getDopamineWeight(domain: string): number {
  return defaultSiteWeights[domain] ?? 0.5;
}

export function updateCurrentDopamine(spike: number) {
  chrome.storage.local.get("currentDopamineLevel", (data) => {
    const current = data.currentDopamineLevel ?? 0;
    const updated = current + spike;
    chrome.storage.local.set({ currentDopamineLevel: updated });
  });
}

export function computeDopamineScore(
  domain: string,
  durationMs: number
): number {
  const minutes = durationMs / 60000;
  const weight = getDopamineWeight(domain);
  // Example formula: dopamine ∝ weight × sqrt(time)
  return parseFloat((weight * Math.sqrt(minutes)).toFixed(2));
}

export function isHighDopamine(score: number): boolean {
  return score >= 2.5; // Threshold — adjust based on data
}

export function applyDecay(score: number, hoursAgo: number): number {
  const decayRate = 0.05;
  return score * Math.exp(-decayRate * hoursAgo);
}

export function getColorForLevel(level: number): string {
  if (level < 50) return "#2ECC71";
  if (level < 150) return "#F1C40F";
  return "#E74C3C";
}

export function getLiveDopamineState(level: number): "low" | "medium" | "high" {
  if (level < 50) return "low";
  if (level < 150) return "medium";
  return "high";
}
export function calculateDopamineSpike(domain: string): number {
  const HIGH = ["instagram.com", "youtube.com", "reddit.com"];
  const MEDIUM = ["twitter.com", "tiktok.com"];
  const LOW = ["wikipedia.org", "github.com"];

  if (HIGH.includes(domain)) return 30;
  if (MEDIUM.includes(domain)) return 15;
  if (LOW.includes(domain)) return 5;
  return 10;
}

export function getDopamineState(level: number): "low" | "medium" | "high" {
  if (level < 60) return "low";
  if (level < 140) return "medium";
  return "high";
}

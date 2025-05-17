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

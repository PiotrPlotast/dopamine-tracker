import { getDomainFromUrl } from "./tabHelpers";
import dopamineScoreMap from "./domains.json";

interface Activity {
  domain: string;
  duration: number;
  clicks: number;
  scrolls: number;
  hour_of_day: number;
  date: Date;
}

interface Supabase_Log {
  id: string;
  user_id: string;
  domain: string;
  duration: number;
  clicks: number;
  scroll_depth: number;
  hour_of_day: number;
  date: Date;
  timestamp: Date;
  dopamine_label: string;
}

// In-memory open count tracker
let siteOpenCounts: Record<string, number> = {};

// Load open counts from chrome.storage.local (persist across sessions)
chrome.storage &&
  chrome.storage.local.get("siteOpenCounts", (result) => {
    if (result && result.siteOpenCounts) {
      siteOpenCounts = result.siteOpenCounts;
    }
  });

// Call this when a site is actually opened (not every activity report)
export function incrementSiteOpenCount(domain: string) {
  if (!siteOpenCounts[domain]) siteOpenCounts[domain] = 0;
  siteOpenCounts[domain] += 1;
  chrome.storage && chrome.storage.local.set({ siteOpenCounts });
}

export function classifyDopamineActivity(
  activity: Activity
): "low" | "medium" | "high" {
  const domain = getDomainFromUrl(activity.domain);
  const score =
    domain in dopamineScoreMap
      ? dopamineScoreMap[domain as keyof typeof dopamineScoreMap]
      : 3;
  const durationMinutes = activity.duration / 60;
  const scrollRate = activity.scrolls / durationMinutes;
  const clickRate = activity.clicks / durationMinutes;

  // Only read open count, do not increment here
  const openCount = siteOpenCounts[domain] || 0;

  let dopamineLevel = score;

  // Frequency multiplier: more opens = higher multiplier
  if (openCount > 10) dopamineLevel *= 3;
  else if (openCount > 5) dopamineLevel *= 1.5;
  else if (openCount > 2) dopamineLevel *= 1.3;

  // Duration multiplier: longer = higher multiplier
  if (durationMinutes >= 30) dopamineLevel *= 1.5;
  else if (durationMinutes >= 10) dopamineLevel *= 1.2;
  else if (durationMinutes >= 5) dopamineLevel *= 1.1;

  if (scrollRate > 10) dopamineLevel += 2;
  if (scrollRate > 100) dopamineLevel += 5;
  if (clickRate > 5) dopamineLevel += 1;
  if (durationMinutes >= 5) dopamineLevel += 0.5;
  if (durationMinutes >= 10) dopamineLevel += 1.5;

  console.log(
    "[Dopamine] domain:",
    domain,
    "score:",
    score,
    "durationMinutes:",
    durationMinutes,
    "scrolls:",
    activity.scrolls,
    "clicks:",
    activity.clicks,
    "scrollRate:",
    scrollRate,
    "clickRate:",
    clickRate,
    "dopamineLevel:",
    dopamineLevel,
    "openCount:",
    openCount
  );

  if (dopamineLevel >= 6) return "high";
  if (dopamineLevel >= 4) return "medium";
  return "low";
}

export function applyDecay(rawScore: number, hoursAgo: number): number {
  const decayRate = 0.5; // adjust as needed
  return rawScore * Math.exp(-decayRate * hoursAgo);
}

export function getColorForLevel(level: number): string {
  if (level > 20) return "#ff4d4f"; // red
  if (level > 10) return "#faad14"; // orange
  return "#52c41a"; // green
}

// Classify a domain's dopamine score as good/neutral/bad
export function getDopamineQuality(score: number): "good" | "neutral" | "bad" {
  if (score <= 4) return "good";
  if (score <= 6) return "neutral";
  return "bad";
}

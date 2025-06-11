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

  let dopamineLevel = score;

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
    dopamineLevel
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
  if (score <= 7) return "neutral";
  return "bad";
}

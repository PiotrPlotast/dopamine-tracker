import { classifyDopamineActivity } from "./shared/utils/dopamine";
import { getDomainFromUrl } from "./shared/utils/tabHelpers";

type ScoreEntry = { score: number; timestamp: Date };

const domainScores: Record<
  string,
  { lastScore: ScoreEntry; scoreHistory: ScoreEntry[] }
> = {};
let globalScoreHistory: ScoreEntry[] = [];
let globalLastScore: ScoreEntry | null = null;

// Store & prune history
function updateDomainScore(domain: string, entry: ScoreEntry) {
  if (!domainScores[domain]) {
    domainScores[domain] = { lastScore: entry, scoreHistory: [entry] };
  } else {
    domainScores[domain].lastScore = entry;
    domainScores[domain].scoreHistory.push(entry);
    if (domainScores[domain].scoreHistory.length > 100) {
      domainScores[domain].scoreHistory.shift();
    }
  }

  chrome.storage.local.set({
    [`domainScores_${domain}`]: domainScores[domain],
  });
}

function updateGlobalScore(entry: ScoreEntry) {
  globalLastScore = entry;
  globalScoreHistory.push(entry);
  if (globalScoreHistory.length > 100) {
    globalScoreHistory.shift();
  }

  chrome.storage.local.set({
    globalLastScore,
    globalScoreHistory,
  });
}

// 🛰️ Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "ACTIVITY_DATA" && message.activity) {
    const activity = message.activity;
    const domain = getDomainFromUrl(activity.url);

    // 🎯 Classify dopamine level
    const dopamineLevel = classifyDopamineActivity(activity); // "low" | "medium" | "high"
    let score = 3;
    if (dopamineLevel === "medium") score = 6;
    if (dopamineLevel === "high") score = 9;

    const entry: ScoreEntry = {
      score,
      timestamp: new Date(activity.timestamp),
    };

    updateDomainScore(domain, entry);
    updateGlobalScore(entry);

    // 📡 Broadcast update to popup (if open)
    chrome.runtime
      .sendMessage({
        type: "LIVE_SCORE_UPDATE",
        domain,
        entry,
        domainScores: domainScores[domain],
        global: {
          lastScore: globalLastScore,
          scoreHistory: globalScoreHistory,
        },
      })
      .catch((err) => {
        console.warn("[Dopamine] No popup open to receive message.");
      });

    sendResponse?.({ status: "ok" });
  }

  return true; // Keeps service worker alive for async work
});

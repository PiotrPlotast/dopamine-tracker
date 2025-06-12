import {
  classifyDopamineActivity,
  incrementSiteOpenCount,
} from "./shared/utils/dopamine";
import { getDomainFromUrl } from "./shared/utils/tabHelpers";

let activeTab: string | null = null;
let oldTab: string | null = null;
console.log("Background script loaded");
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab && tab.url) {
      console.log("Active tab URL:", tab.url);
      activeTab = tab.url;
      // Increment open count for this domain
      const domain = getDomainFromUrl(tab.url);
      incrementSiteOpenCount(domain);
    }
  } catch (error) {
    console.error("Error getting active tab:", error);
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.active && changeInfo.url) {
    console.log("Active tab updated URL:", changeInfo.url);
    oldTab = activeTab;
    activeTab = changeInfo.url;
    // Increment open count for this domain
    const domain = getDomainFromUrl(changeInfo.url);
    incrementSiteOpenCount(domain);
  }
});

// In-memory cache for quick access (persisted in chrome.storage.local)
let domainScores: Record<string, { lastScore: any; scoreHistory: any[] }> = {};
let globalScoreHistory: any[] = [];
let globalLastScore: any = null;

function updateGlobalScore(entry: any) {
  globalLastScore = entry;
  globalScoreHistory.push(entry);
  if (globalScoreHistory.length > 100) globalScoreHistory.shift();
  chrome.storage.local.set({ globalLastScore, globalScoreHistory });
}

function updateDomainScore(domain: string, entry: any) {
  if (!domainScores[domain])
    domainScores[domain] = { lastScore: null, scoreHistory: [] };
  domainScores[domain].lastScore = entry;
  domainScores[domain].scoreHistory.push(entry);
  if (domainScores[domain].scoreHistory.length > 100)
    domainScores[domain].scoreHistory.shift();
  chrome.storage.local.set({
    [`domainScores_${domain}`]: domainScores[domain],
  });
}

// Listen for activity data from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[Background] Received message:", message);
  if (message.type === "ACTIVITY_DATA" && message.activity) {
    const activity = message.activity;
    // Only process if this is the active tab
    if (!activeTab || activity.url !== activeTab) {
      sendResponse({ status: "ignored" });
      return true;
    }
    // Calculate dopamine score using classifyDopamineActivity
    const dopamineLabel = classifyDopamineActivity(activity);
    // For charting, let's use a numeric value: low=2, medium=5, high=8
    let score = 2;
    if (dopamineLabel === "medium") score = 5;
    if (dopamineLabel === "high") score = 8;
    const entry = { score, timestamp: activity.timestamp };
    const domain = getDomainFromUrl(activity.url);
    updateDomainScore(domain, entry);
    updateGlobalScore(entry);
    // Broadcast both domain and global scores
    chrome.runtime.sendMessage({
      type: "LIVE_SCORE_UPDATE",
      entry,
      domain,
      domainScores: domainScores[domain],
      global: { lastScore: globalLastScore, scoreHistory: globalScoreHistory },
    });
    sendResponse({ status: "ok" }); // Respond to keep service worker alive
  }
  return true; // Indicate async response
});

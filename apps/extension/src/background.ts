import { getDomainFromUrl } from "./shared/utils/tabHelpers";

let activeTabId: number | null = null;
let activeStartTime = Date.now();
let activeDomain = "";

console.log("[background] Loaded service worker");

chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log("[background] Tab activated:", activeInfo);
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await handleTabSwitch(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId === activeTabId && changeInfo.url) {
    activeDomain = getDomainFromUrl(changeInfo.url);
  }
});

async function handleTabSwitch(newTabId: number) {
  const now = Date.now();

  if (activeDomain) {
    const duration = now - activeStartTime;

    await chrome.storage.local.set({
      currentSession: {
        domain: activeDomain,
        duration: duration,
        updatedAt: now,
      },
    });
  }

  activeStartTime = now;
  activeTabId = newTabId;

  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const newTab = tabs[0];
  activeDomain = newTab.url ? getDomainFromUrl(newTab.url) : "";
}

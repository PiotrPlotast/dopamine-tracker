let activeTab: string | null = null;
let oldTab: string | null = null;

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab && tab.url) {
      console.log("Active tab URL:", tab.url);
      activeTab = tab.url;
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
  }
});

function generateRandomScore() {
  return Math.floor(Math.random() * 101);
}

setInterval(() => {
  const score = generateRandomScore();
  const timestamp = Date.now();

  chrome.storage.local.get('scoreHistory', (result) => {
    let history = result.scoreHistory || [];
    history.push({ score, timestamp });

    if (history.length > 20) {
      history.shift();
    }

    chrome.storage.local.set({
      lastScore: { score, timestamp },
      scoreHistory: history
    });

    console.log(`Saved score: ${score} at ${new Date(timestamp).toLocaleTimeString()}`);
  });
}, 3000);

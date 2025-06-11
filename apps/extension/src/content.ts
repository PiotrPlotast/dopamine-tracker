console.log("Dopamine Tracker content script injected!");

let lastSent = Date.now();
let scrolls = 0;
let clicks = 0;
let duration = 0;

window.addEventListener("scroll", () => {
  scrolls++;
});

window.addEventListener("click", () => {
  clicks++;
});

setInterval(() => {
  duration++;
}, 1000);

function sendActivityData() {
  const activity = {
    domain: window.location.href,
    url: window.location.href,
    timestamp: Date.now(),
    scrolls,
    clicks,
    duration,
    hour_of_day: new Date().getHours(),
    date: new Date(),
  };
  console.log("[Content] Sending activity data", activity);
  chrome.runtime.sendMessage({ type: "ACTIVITY_DATA", activity }, () => {
    // Optionally handle response or errors here
  });
  // Reset counters after sending
  scrolls = 0;
  clicks = 0;
}

setInterval(sendActivityData, 2000);

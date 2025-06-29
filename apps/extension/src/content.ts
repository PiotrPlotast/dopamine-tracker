console.log("[Dopamine] Content script loaded");

if (!(window as any).__dopamine_tracker_initialized) {
  (window as any).__dopamine_tracker_initialized = true;

  let clickCount = 0;
  let maxScrollPercent = 0;
  let sessionStart = Date.now();
  const url = window.location.href;

  // 🖱 Track clicks
  document.addEventListener("click", () => {
    clickCount += 1;
  });

  // 🖱 Track scroll depth (% of page)
  let scrollTimeout: number | null = null;

  window.addEventListener("scroll", () => {
    if (scrollTimeout) clearTimeout(scrollTimeout);

    scrollTimeout = window.setTimeout(() => {
      const scrolled = window.scrollY + window.innerHeight;
      const fullHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      );
      const scrollPercent = (scrolled / fullHeight) * 100;
      maxScrollPercent = Math.min(
        100,
        Math.max(maxScrollPercent, scrollPercent)
      );
    }, 100); // adjust to 50–200ms if needed
  });

  // 🚀 Send activity to background
  function sendActivity() {
    const now = Date.now();
    const rawSeconds = (Date.now() - sessionStart) / 1000;
    const fixedSeconds = Math.round(rawSeconds / 30) * 30;
    const duration = fixedSeconds < 30 ? 30 : fixedSeconds;
    const activity = {
      url,
      duration,
      clicks: clickCount,
      scrolls: Math.round(maxScrollPercent),
      hour_of_day: new Date().getHours(),
      date: new Date(),
      timestamp: new Date(),
    };

    console.log("[Dopamine] Sending activity:", activity);

    chrome.runtime
      .sendMessage({ type: "ACTIVITY_DATA", activity })
      .catch((err) => {
        console.warn("[Dopamine] Failed to send activity:", err);
      });

    // Reset session metrics
    sessionStart = Date.now();
    clickCount = 0;
    maxScrollPercent = 0;
  }

  // ⏱ Send every 30s if tab is visible
  setInterval(() => {
    if (document.visibilityState === "visible") {
      sendActivity();
    }
  }, 30_000);

  // 🚪 Send on tab blur
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      sendActivity();
    }
  });

  // ❌ Send on tab close
  window.addEventListener("beforeunload", () => {
    sendActivity();
  });
}

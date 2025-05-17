import ReactDOM from "react-dom/client";
import { getDomainFromUrl } from "../shared/utils/tabHelpers";
import { computeDopamineScore } from "../shared/utils/dopamine";

function Popup() {
  // chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  //   const tab = tabs[0];
  //   const tabstest = tabs;
  //   if (tab?.url) {
  //     const domain = getDomainFromUrl(tab.url);
  //     const score = computeDopamineScore(domain, 5 * 60 * 1000);
  //     document.getElementById("score")!.textContent = `Dopamine: ${score}`;
  //     document.getElementById("domain")!.textContent = `Domain: ${domain}`;
  //   }
  // });
  chrome.storage.local.get("currentSession", (result) => {
    const session = result.currentSession;

    if (session?.domain && session?.duration) {
      const domain = session.domain;
      const duration = session.duration;
      const score = computeDopamineScore(domain, duration);
      document.getElementById("score")!.textContent = `Dopamine: ${score}`;
      document.getElementById("domain")!.textContent = `Domain: ${domain}`;
    } else {
      document.getElementById("domain")!.textContent =
        "No active session found.";
      document.getElementById("score")!.textContent = "No score available.";
    }
  });
  return (
    <div style={{ padding: 20 }}>
      <h1>Dopamine Tracker</h1>
      <p id="domain">Loading...</p>
      <p id="score">Loading...</p>
      <p>Track your dopamine levels while browsing!</p>
    </div>
  );
}

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<Popup />);
}

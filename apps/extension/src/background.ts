import { applyDecay, getColorForLevel } from "./shared/utils/dopamine";

type SessionEntry = {
  domain: string;
  timestamp: number;
  rawScore: number;
};

async function updateDopamineLevel() {
  const now = Date.now();
  const { dopamineSessions = [] }: { dopamineSessions: SessionEntry[] } =
    await chrome.storage.local.get("dopamineSessions");

  const total = dopamineSessions.reduce((sum, session) => {
    const hoursAgo = (now - session.timestamp) / 3600000;
    return sum + applyDecay(session.rawScore, hoursAgo);
  }, 0);

  await chrome.storage.local.set({ currentDopamineLevel: total });

  chrome.action.setBadgeText({ text: Math.round(total).toString() });
  chrome.action.setBadgeBackgroundColor({ color: getColorForLevel(total) });
}

// Set interval on load
updateDopamineLevel();
setInterval(updateDopamineLevel, 1 * 60 * 1000);

import React, { useEffect, useState } from "react";
import { getLiveDopamineState } from "../shared/utils/dopamine";

const PopupApp: React.FC = () => {
  const [level, setLevel] = useState(0);
  const [state, setState] = useState<"low" | "medium" | "high">("low");

  useEffect(() => {
    chrome.storage.local.get("currentDopamineLevel", (data) => {
      const lvl = data.currentDopamineLevel ?? 0;
      setLevel(Math.round(lvl));
      setState(getLiveDopamineState(lvl));
      document.body.classList.add(getLiveDopamineState(lvl));
    });
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "16px", fontSize: "24px" }}>
      <h1>DopaMind</h1>
      <div>🧠 Dopamine Level:</div>
      <strong>{level}</strong>
      <div style={{ fontSize: "14px", marginTop: "8px" }}>
        State: <em>{state}</em>
      </div>
    </div>
  );
};

export default PopupApp;

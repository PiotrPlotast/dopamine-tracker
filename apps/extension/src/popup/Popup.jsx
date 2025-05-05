// src/popup/Popup.tsx
import React from "react";
import ReactDOM from "react-dom/client";

function Popup() {
  return <div style={{ padding: 20 }}>Dopamine Tracker Popup 🚀</div>;
}

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<Popup />);
}

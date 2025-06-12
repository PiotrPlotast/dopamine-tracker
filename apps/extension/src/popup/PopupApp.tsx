import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { getDomainFromUrl } from "../shared/utils/tabHelpers";
import { getDopamineQuality } from "../shared/utils/dopamine";
import dopamineScoreMap from "../shared/utils/domains.json";

function App() {
  const [score, setScore] = useState<number | null>(null);
  const [globalScore, setGlobalScore] = useState<number | null>(null);
  const [domain, setDomain] = useState<string>("");
  const [domainHistory, setDomainHistory] = useState<any[]>([]);
  const [globalHistory, setGlobalHistory] = useState<any[]>([]);
  const [forceUpdate, setForceUpdate] = useState(0); // force re-render
  const [quality, setQuality] = useState<string>("");
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);
  const lastTimestamp = useRef(null);
  const dataPoints = useRef<number[]>([]);

  useEffect(() => {
    // Get current tab's URL
    chrome.tabs &&
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = tabs[0]?.url || "";
        const d = getDomainFromUrl(url);
        setDomain(d);
        // Determine dopamine quality for this domain
        const domainScore = dopamineScoreMap[d] ?? 3;
        setQuality(getDopamineQuality(domainScore));
        // Load domain-specific history
        chrome.storage.local.get([`domainScores_${d}`], (result) => {
          const domainData = result[`domainScores_${d}`] || {
            lastScore: null,
            scoreHistory: [],
          };
          setDomainHistory(domainData.scoreHistory || []);
          setScore(domainData.lastScore?.score ?? null);
        });
        // Load global history
        chrome.storage.local.get(
          ["globalLastScore", "globalScoreHistory"],
          (result) => {
            setGlobalScore(result.globalLastScore?.score ?? null);
            setGlobalHistory(result.globalScoreHistory || []);
          }
        );
      });

    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "Dopamine Score",
            data: [],
            borderColor: "rgba(75,192,192,1)",
            fill: false,
            tension: 0.1,
          },
          {
            label: "Moving Average (5)",
            data: [],
            borderColor: "rgba(255,99,132,1)",
            fill: false,
            tension: 0.1,
          },
          {
            label: "Baseline (50)",
            data: [],
            borderColor: "rgba(0,0,0,0.5)",
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0,
          },
        ],
      },
      options: {
        scales: {
          x: { display: false },
          y: { min: 0, max: 100 },
        },
        animation: false,
      },
    });

    // ⏩ Load existing history at start
    chrome.storage.local.get("scoreHistory", (result) => {
      const history = result.scoreHistory || [];
      const chart = chartInstance.current;
      if (!chart) return;
      interface ScoreHistoryEntry {
        score: number;
        timestamp: number;
      }

      (history as ScoreHistoryEntry[]).forEach((entry: ScoreHistoryEntry) => {
        const label: string = new Date(entry.timestamp).toLocaleTimeString();
        dataPoints.current.push(entry.score);

        (chart.data.labels ??= []).push(label);
        chart.data.datasets[0].data.push(entry.score);
        chart.data.datasets[1].data.push(
          Number(calculateMovingAverage(dataPoints.current, 5))
        );
        chart.data.datasets[2].data.push(50);
      });

      chart.update();
    });

    // On popup open, load the latest score and update chart
    chrome.storage.local.get("lastScore", (result) => {
      if (result.lastScore) {
        const { score: newScore, timestamp } = result.lastScore;
        lastTimestamp.current = timestamp;
        updateChart(newScore, timestamp);
      }
    });

    // Listen for live score updates from background
    function handleLiveScoreUpdate(message: any) {
      if (message.type === "LIVE_SCORE_UPDATE") {
        if (message.domain === domain) {
          setScore(message.entry.score);
          setDomainHistory(message.domainScores?.scoreHistory || []);
        }
        setGlobalScore(message.global?.lastScore?.score ?? null);
        setGlobalHistory(message.global?.scoreHistory || []);
        setForceUpdate((f) => f + 1);
      }
    }
    chrome.runtime.onMessage.addListener(handleLiveScoreUpdate);

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      chrome.runtime.onMessage.removeListener(handleLiveScoreUpdate);
    };
  }, [domain]);

  useEffect(() => {
    // Render domain chart
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d");
      if (ctx) {
        if (chartInstance.current) chartInstance.current.destroy();
        chartInstance.current = new Chart(ctx, {
          type: "line",
          data: {
            labels: domainHistory.map((e) =>
              new Date(e.timestamp).toLocaleTimeString()
            ),
            datasets: [
              {
                label: "Site Dopamine Score",
                data: domainHistory.map((e) => e.score),
                borderColor: "rgba(75,192,192,1)",
                fill: false,
                tension: 0.1,
              },
            ],
          },
          options: {
            scales: { x: { display: false }, y: { min: 0, max: 10 } },
            animation: false,
          },
        });
      }
    }
    // Render global chart
    const globalCanvas = document.getElementById(
      "globalChart"
    ) as HTMLCanvasElement;
    if (globalCanvas) {
      const ctx = globalCanvas.getContext("2d");
      if (ctx) {
        if ((globalCanvas as any)._chart)
          (globalCanvas as any)._chart.destroy();
        (globalCanvas as any)._chart = new Chart(ctx, {
          type: "line",
          data: {
            labels: globalHistory.map((e) =>
              new Date(e.timestamp).toLocaleTimeString()
            ),
            datasets: [
              {
                label: "Global Dopamine Score",
                data: globalHistory.map((e) => e.score),
                borderColor: "rgba(255,99,132,1)",
                fill: false,
                tension: 0.1,
              },
            ],
          },
          options: {
            scales: { x: { display: false }, y: { min: 0, max: 10 } },
            animation: false,
          },
        });
      }
    }
  }, [domainHistory, globalHistory]);

  interface UpdateChartParams {
    newScore: number;
    time: number;
  }

  function updateChart(newScore: number, time: number): void {
    setScore(newScore);

    const chart = chartInstance.current;
    const label: string = new Date(time).toLocaleTimeString();

    dataPoints.current.push(newScore);
    if (dataPoints.current.length > 20) {
      dataPoints.current.shift();
    }

    const ma: string = calculateMovingAverage(dataPoints.current, 5);

    if (chart && chart.data.labels && Array.isArray(chart.data.labels)) {
      (chart.data.labels as string[]).push(label);
      (chart.data.datasets[0].data as number[]).push(newScore);
      (chart.data.datasets[1].data as number[]).push(Number(ma));
      (chart.data.datasets[2].data as number[]).push(50); // baseline

      if (chart.data.labels.length > 20) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
        chart.data.datasets[1].data.shift();
        chart.data.datasets[2].data.shift();
      }

      chart.update();
    }
  }

  interface CalculateMovingAverageParams {
    data: number[];
    windowSize: number;
  }

  function calculateMovingAverage(data: number[], windowSize: number): string {
    const slice: number[] = data.slice(-windowSize);
    const sum: number = slice.reduce((a: number, b: number) => a + b, 0);
    return (sum / slice.length).toFixed(2);
  }

  // Helper: get accent color by dopamine quality
  function getAccentColor(quality: string) {
    if (quality === "good") return "#1e90ff"; // deep blue
    if (quality === "neutral") return "#faad14"; // amber
    if (quality === "bad") return "#ff4d4f"; // red
    return "#bfbfbf";
  }

  // Helper: get background morph color by dopamine quality
  function getMorphColor(quality: string) {
    if (quality === "good") return "#e6f7ff";
    if (quality === "neutral") return "#fffbe6";
    if (quality === "bad") return "#fff1f0";
    return "#f5f5f5";
  }

  // Progress bar for daily streak (placeholder logic)
  const streak = Math.min(domainHistory.length, 10);
  const streakPercent = (streak / 10) * 100;

  return (
    <div
      style={{
        width: "320px",
        padding: "20px 16px 16px 16px",
        fontFamily: "'Inter', sans-serif",
        background: getMorphColor(quality),
        borderRadius: 18,
        boxShadow: "0 2px 16px 0 rgba(0,0,0,0.07)",
        position: "relative",
        overflow: "hidden",
        minHeight: 420,
      }}
    >
      {/* Morphing SVG background */}
      <svg
        width="340"
        height="180"
        style={{
          position: "absolute",
          top: -30,
          left: -30,
          zIndex: 0,
          opacity: 0.18,
          pointerEvents: "none",
        }}
      >
        <path
          d="M60,80 Q120,10 180,80 T300,80"
          fill="none"
          stroke={getAccentColor(quality)}
          strokeWidth="6"
        >
          <animate
            attributeName="d"
            values="M60,80 Q120,10 180,80 T300,80;M60,80 Q120,40 180,80 T300,80;M60,80 Q120,10 180,80 T300,80"
            dur="4s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
      <h2
        style={{
          fontWeight: 700,
          letterSpacing: 0.5,
          zIndex: 1,
          position: "relative",
        }}
      >
        Dopamine Tracker
      </h2>
      <div style={{ marginBottom: 18, zIndex: 1, position: "relative" }}>
        <b>Current Site:</b> {domain || "Unknown"}
        <br />
        <span
          style={{
            fontSize: 20,
            color: getAccentColor(quality),
            fontWeight: 600,
          }}
        >
          {score !== null ? `Score: ${score}` : "No data"}
        </span>
        {quality && (
          <span
            style={{
              marginLeft: 12,
              fontWeight: 700,
              color: getAccentColor(quality),
              fontSize: 16,
              verticalAlign: "middle",
              animation: "dopaminePulse 1.5s infinite alternate",
              transition: "color 0.4s",
            }}
          >
            {quality.charAt(0).toUpperCase() + quality.slice(1)} Dopamine
          </span>
        )}
      </div>
      {/* Daily streak progress ring */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: 18,
          zIndex: 1,
          position: "relative",
        }}
      >
        <svg width="38" height="38" style={{ marginRight: 10 }}>
          <circle
            cx="19"
            cy="19"
            r="16"
            fill="#fff"
            stroke="#e0e0e0"
            strokeWidth="3"
          />
          <circle
            cx="19"
            cy="19"
            r="16"
            fill="none"
            stroke={getAccentColor(quality)}
            strokeWidth="3"
            strokeDasharray={2 * Math.PI * 16}
            strokeDashoffset={2 * Math.PI * 16 * (1 - streakPercent / 100)}
            style={{ transition: "stroke-dashoffset 0.7s" }}
          />
        </svg>
        <span style={{ fontSize: 15, color: "#888" }}>
          Streak: <b style={{ color: getAccentColor(quality) }}>{streak}</b>/10
        </span>
      </div>
      <canvas
        ref={chartRef}
        width="300"
        height="120"
        style={{
          zIndex: 1,
          position: "relative",
          background: "rgba(255,255,255,0.7)",
          borderRadius: 10,
        }}
      ></canvas>
      <div style={{ marginTop: 22, zIndex: 1, position: "relative" }}>
        <b>Global Dopamine</b>
        <br />
        <span
          style={{
            fontSize: 18,
            color: getAccentColor(quality),
            fontWeight: 600,
          }}
        >
          {globalScore !== null ? `Score: ${globalScore}` : "No data"}
        </span>
        <div style={{ height: 8 }} />
        <canvas
          id="globalChart"
          width="300"
          height="60"
          style={{ background: "rgba(255,255,255,0.7)", borderRadius: 10 }}
        ></canvas>
      </div>
      {/* Pulse animation keyframes */}
      <style>{`
        @keyframes dopaminePulse {
          0% { text-shadow: 0 0 0 ${getAccentColor(quality)}; }
          100% { text-shadow: 0 0 8px ${getAccentColor(quality)}44; }
        }
      `}</style>
    </div>
  );
}

export default App;

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

  return (
    <div style={{ width: "320px", padding: "10px", fontFamily: "sans-serif" }}>
      <h2>Dopamine Tracker</h2>
      <div style={{ marginBottom: 12 }}>
        <b>Current Site:</b> {domain || "Unknown"}
        <br />
        <span style={{ fontSize: 20, color: "#4CAF50" }}>
          {score !== null ? `Score: ${score}` : "No data"}
        </span>
        {quality && (
          <span
            style={{
              marginLeft: 10,
              fontWeight: 600,
              color:
                quality === "good"
                  ? "green"
                  : quality === "neutral"
                  ? "orange"
                  : "red",
            }}
          >
            {quality.charAt(0).toUpperCase() + quality.slice(1)} Dopamine
          </span>
        )}
      </div>
      <canvas ref={chartRef} width="300" height="120"></canvas>
      <div style={{ marginTop: 18 }}>
        <b>Global Dopamine</b>
        <br />
        <span style={{ fontSize: 18, color: "#faad14" }}>
          {globalScore !== null ? `Score: ${globalScore}` : "No data"}
        </span>
        <div style={{ height: 8 }} />
        <canvas id="globalChart" width="300" height="60"></canvas>
      </div>
    </div>
  );
}

export default App;

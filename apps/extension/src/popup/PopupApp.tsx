import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";

function App() {
  const [score, setScore] = useState<number | null>(null);
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);
  const lastTimestamp = useRef(null);
  const dataPoints = useRef<number[]>([]);

  useEffect(() => {
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

    const interval = setInterval(() => {
      chrome.storage.local.get("lastScore", (result) => {
        if (result.lastScore) {
          const { score: newScore, timestamp } = result.lastScore;

          if (lastTimestamp.current !== timestamp) {
            lastTimestamp.current = timestamp;
            updateChart(newScore, timestamp);
          }
        }
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

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
    <div style={{ width: "300px", padding: "10px", fontFamily: "sans-serif" }}>
      <h2>Live Dopamine Score</h2>
      <div style={{ fontSize: "24px", color: "#4CAF50", marginBottom: "10px" }}>
        {score !== null ? `Score: ${score}` : "Waiting for data..."}
      </div>
      <canvas ref={chartRef} width="300" height="150"></canvas>
    </div>
  );
}

export default App;

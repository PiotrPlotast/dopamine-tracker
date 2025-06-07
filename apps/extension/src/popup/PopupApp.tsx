import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";

function App() {
  const [score, setScore] = useState(null);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const lastTimestamp = useRef(null);
  const dataPoints = useRef([]);

  useEffect(() => {
    const ctx = chartRef.current.getContext("2d");

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

      history.forEach((entry) => {
        const label = new Date(entry.timestamp).toLocaleTimeString();
        dataPoints.current.push(entry.score);

        chart.data.labels.push(label);
        chart.data.datasets[0].data.push(entry.score);
        chart.data.datasets[1].data.push(
          calculateMovingAverage(dataPoints.current, 5)
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
      chartInstance.current.destroy();
    };
  }, []);

  function updateChart(newScore, time) {
    setScore(newScore);

    const chart = chartInstance.current;
    const label = new Date(time).toLocaleTimeString();

    dataPoints.current.push(newScore);
    if (dataPoints.current.length > 20) {
      dataPoints.current.shift();
    }

    const ma = calculateMovingAverage(dataPoints.current, 5);

    chart.data.labels.push(label);
    chart.data.datasets[0].data.push(newScore);
    chart.data.datasets[1].data.push(ma);
    chart.data.datasets[2].data.push(50); // baseline

    if (chart.data.labels.length > 20) {
      chart.data.labels.shift();
      chart.data.datasets[0].data.shift();
      chart.data.datasets[1].data.shift();
      chart.data.datasets[2].data.shift();
    }

    chart.update();
  }

  function calculateMovingAverage(data, windowSize) {
    const slice = data.slice(-windowSize);
    const sum = slice.reduce((a, b) => a + b, 0);
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

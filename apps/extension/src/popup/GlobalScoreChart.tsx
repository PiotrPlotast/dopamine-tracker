import React, { useEffect } from "react";
import Chart from "chart.js/auto";

interface Props {
  globalHistory: { score: number; timestamp: number }[];
}

export default function GlobalScoreChart({ globalHistory }: Props) {
  useEffect(() => {
    const canvas = document.getElementById("globalChart") as HTMLCanvasElement;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        if ((canvas as any)._chart) (canvas as any)._chart.destroy();
        (canvas as any)._chart = new Chart(ctx, {
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
  }, [globalHistory]);

  return <canvas id="globalChart" width="300" height="60" />;
}

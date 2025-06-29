import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

interface Props {
  domainHistory: { score: number; timestamp: number }[];
}

export default function DomainScoreChart({ domainHistory }: Props) {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
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
  }, [domainHistory]);

  return <canvas ref={chartRef} width="300" height="120" />;
}

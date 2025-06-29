import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DopamineStatsCard({ data }) {
  return (
    <div className="dashboard-grid-c bg-white border-dopamind-border border-2 p-6 rounded-2xl shadow-xl">
      <h3 className="text-lg font-semibold mb-2">🧠 Dopamine Summary</h3>
      <div className="flex justify-between text-sm">
        <span>Today's Dopamine:</span>
        <span className="text-yellow-500 font-medium">Moderate</span>
      </div>
      <div className="flex justify-between text-sm mt-1">
        <span>Weekly Dopamine:</span>
        <span className="text-red-500 font-medium">High</span>
      </div>
      <div className="mt-4">
        <h4 className="text-sm font-semibold mb-2">7-Day Dopamine Trend</h4>
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={data}>
            <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
            <YAxis domain={[0, 100]} hide />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

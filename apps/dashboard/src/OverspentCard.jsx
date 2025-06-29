export default function OverspentCard() {
  return (
    <div className="dashboard-grid-e bg-white border-dopamind-border border-2 p-6 rounded-2xl shadow-xl text-sm text-red-500 font-medium">
      <p>
        ⚠️ You spent <span className="font-bold">32 more minutes</span> on
        TikTok today than average.
      </p>
    </div>
  );
}

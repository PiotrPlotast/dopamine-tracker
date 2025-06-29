export default function GreetingCard() {
  return (
    <div className="dashboard-grid-a flex flex-col gap-4 text-lg bg-dopamind-surface border-dopamind-border border-2 p-6 rounded-2xl shadow-xl">
      <h1 className="font-bold text-5xl">
        Good Morning, User <span className="animate-wave">👋</span>
      </h1>
      <h2 className="text-gray-600 text-lg">
        Small habits make a big difference. Choose wisely today!
      </h2>
    </div>
  );
}

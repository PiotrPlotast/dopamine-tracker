import { motion } from "framer-motion";

export default function GreetingCard() {
  return (
    <motion.div
      className="dashboard-grid-a flex flex-col gap-4 text-lg bg-dopamind-surface border-dopamind-border border-2 p-6 rounded-2xl shadow-xl"
      whileHover={{ scale: 1.01 }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="font-bold text-5xl">
        Good Morning, User <span className="animate-wave">👋</span>
      </h1>
      <h2 className="text-gray-600 text-lg">
        Small habits make a big difference. Choose wisely today!
      </h2>
    </motion.div>
  );
}

import { motion } from "framer-motion";

export default function OverspentCard() {
  return (
    <motion.div
      className="dashboard-grid-e bg-white border-dopamind-border border-2 p-6 rounded-2xl shadow-xl text-sm text-red-500 font-medium"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      <p>
        ⚠️ You spent <span className="font-bold">32 more minutes</span> on
        TikTok today than average.
      </p>
    </motion.div>
  );
}

import { motion } from "framer-motion";

export default function TriggersCard() {
  return (
    <motion.div
      className="dashboard-grid-d bg-white border-dopamind-border border-2 p-6 rounded-2xl shadow-xl"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      <h3 className="text-md font-semibold mb-2 text-red-500">
        🚫 Bad Dopamine Websites
      </h3>
      <ul className="list-disc ml-4 text-sm text-gray-700">
        <li>Tiktok</li>
        <li>Reddit</li>
        <li>Instagram</li>
      </ul>
      <h3 className="text-md font-semibold mt-4 mb-2 text-green-500">
        ✅ Good Dopamine Websites
      </h3>
      <ul className="list-disc ml-4 text-sm text-gray-700">
        <li>Coursera</li>
        <li>Udemy</li>
        <li>Medium</li>
      </ul>
    </motion.div>
  );
}

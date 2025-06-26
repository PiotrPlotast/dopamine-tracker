import { motion } from "framer-motion";

export default function ProfileCard() {
  return (
    <motion.div
      className="dashboard-grid-b bg-white border-dopamind-border border-2 p-6 rounded-2xl shadow-xl flex flex-col items-center text-center"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      <img
        src="https://i.pravatar.cc/80"
        alt="Avatar"
        className="rounded-full w-24 h-24 mb-4"
      />
      <h3 className="text-xl font-semibold">Nickname: FocusSeeker</h3>
      <p className="text-sm text-gray-500">Level: Dopamine Monk 🧘</p>
      <p className="mt-2 font-medium text-red-500">Current Dopamine: High</p>
      <p className="text-sm">
        Low Dopamine Streak:{" "}
        <span className="text-orange-400 font-semibold">0 days</span>
      </p>
      <div className="mt-4 w-full">
        <div className="text-left text-sm font-semibold mb-1">
          Today's Focus Goal
        </div>
        <p className="text-sm bg-indigo-50 p-2 rounded-xl">
          Max 30 min of social media
        </p>
      </div>
      <div className="mt-4 w-full">
        <div className="text-left text-sm font-semibold mb-1">
          Points & Rewards
        </div>
        <p className="text-sm">
          🎯 Points: <span className="font-bold">1240</span> / 1500
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1 overflow-hidden">
          <motion.div
            className="bg-indigo-500 h-2.5 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: "82%" }}
            transition={{ duration: 1, delay: 0.3 }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">Level 3: Dopamine Monk</p>
      </div>
      <p className="mt-4 italic text-sm text-gray-400">
        “Discipline {">"} Dopamine”
      </p>
    </motion.div>
  );
}

import { motion } from "framer-motion";
import GreetingCard from "./GreetingCard";
import ProfileCard from "./ProfileCard";
import DopamineStatsCard from "./DopamineStatsCard";
import TriggersCard from "./TriggersCard";
import OverspentCard from "./OverspentCard";

const dopamineData = [
  { day: "Mon", value: 65 },
  { day: "Tue", value: 80 },
  { day: "Wed", value: 75 },
  { day: "Thu", value: 50 },
  { day: "Fri", value: 90 },
  { day: "Sat", value: 40 },
  { day: "Sun", value: 60 },
];

export default function Dashboard() {
  return (
    <motion.div
      className="dashboard-grid"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <GreetingCard />
      <ProfileCard />
      <DopamineStatsCard data={dopamineData} />
      <TriggersCard />
      <OverspentCard />
    </motion.div>
  );
}

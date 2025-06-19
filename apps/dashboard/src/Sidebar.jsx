import HomeIcon from "@mui/icons-material/Home";
import SettingsIcon from "@mui/icons-material/Settings";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import PeopleIcon from "@mui/icons-material/People";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import LoginIcon from "@mui/icons-material/Login";
export default function Sidebar() {
  return (
    <aside className="h-full flex flex-col justify-between">
      <ul className="flex flex-col p-8 justify-between h-full">
        <li>
          <a href="#" className="text-4xl font-bold">
            Dopamind
          </a>
        </li>
        <li className="flex flex-col gap-6">
          <a href="#" className="flex items-center gap-2">
            <HomeIcon />
            Home
          </a>
          <a href="#" className="flex items-center gap-2">
            <ShowChartIcon />
            Statistics
          </a>
          <a href="#" className="flex items-center gap-2">
            <PeopleIcon />
            Friends
          </a>
          <a href="#" className="flex items-center gap-2">
            <LeaderboardIcon />
            Compete
          </a>
          <a href="#" className="flex items-center gap-2">
            <SettingsIcon />
            Settings
          </a>
        </li>
        <li className="flex flex-col gap-2 text-center  items-center">
          <h2 className="font-bold">Upgrade to Pro</h2>
          <p>
            Get 1 week free <br /> and unlock
          </p>
          <a
            href="#"
            className="font-bold bg-dopamind-primary text-dopamind-surface rounded-4xl py-3 px-7 hover:opacity-90 transition-all"
          >
            Upgrade
          </a>
        </li>
        <li className="flex flex-col gap-6">
          <a href="#" className="flex items-center gap-2">
            <QuestionMarkIcon />
            Help and Information
          </a>
          <a href="#" className="flex items-center gap-2">
            <LoginIcon />
            Logout
          </a>
        </li>
      </ul>
    </aside>
  );
}

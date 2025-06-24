import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
export default function App() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-dopamind-background text-dopamind-text-primary">
      <Sidebar />
      <Dashboard />
    </div>
  );
}

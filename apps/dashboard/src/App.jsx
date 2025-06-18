import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
export default function App() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
      <Sidebar />
      <Dashboard />
    </div>
  );
}

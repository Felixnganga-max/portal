import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar";
import TopBar from "./TopBar";
import { navConfig } from "../../lib/navConfig";
import { useAuth } from "../../context/AuthContext";

const DashboardShell = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const items = navConfig[user.role] || [];

  return (
    <div className="min-h-screen bg-canvas font-sans text-ink">
      <Sidebar items={items} open={open} onClose={() => setOpen(false)} />
      <div className="lg:pl-sidebar">
        <TopBar onMenu={() => setOpen(true)} />
        <main className="p-4 sm:p-6 max-w-[1400px]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardShell;

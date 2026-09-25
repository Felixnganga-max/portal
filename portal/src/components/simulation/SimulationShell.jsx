import { useState } from "react";
import { Outlet } from "react-router-dom";
import SimulationSidebar from "./SimulationSidebar";
import SimulationTopBar from "./SimulationTopBar";
import { simNavConfig } from "../../lib/simNavConfig";
import { useSimAuth } from "../../context/SimulationAuthContext";

// Fork of the real DashboardShell: identical layout, plus a persistent
// banner so it's never mistaken for the real logged-in app.
const SimulationShell = () => {
  const { user } = useSimAuth();
  const [open, setOpen] = useState(false);
  const items = simNavConfig[user.role] || [];

  return (
    <div className="min-h-screen bg-canvas font-sans text-ink">
      <div className="bg-[#111184] text-white text-center text-[11px] font-semibold tracking-wide py-1.5 px-4">
        You're viewing a live demo with sample data — nothing here is saved or
        connected to a real account.
      </div>
      <SimulationSidebar
        items={items}
        open={open}
        onClose={() => setOpen(false)}
      />
      <div className="lg:pl-sidebar">
        <SimulationTopBar onMenu={() => setOpen(true)} />
        <main className="p-4 sm:p-6 max-w-[1400px]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SimulationShell;

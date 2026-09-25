import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, HelpCircle, LogOut } from "lucide-react";
import { useSimAuth } from "../../context/SimulationAuthContext";

const linkBase =
  "flex items-center gap-3 px-3 py-2.5 rounded text-[13px] transition-colors";

// Fork of the real Sidebar: identical markup/classes, but reads the fake
// demo user and "logs out" by leaving the /simulation tree instead of
// clearing a real session.
const SimulationSidebar = ({ items, open, onClose }) => {
  const { user } = useSimAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [expanded, setExpanded] = useState({});

  const isOpen = (item) =>
    expanded[item.key] ??
    item.children?.some((c) => pathname.startsWith(c.path));

  let lastSection = null;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed top-0 left-0 z-30 h-screen w-sidebar bg-tenant text-white flex flex-col transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 px-5 flex items-center gap-3 border-b border-white/15">
          <div className="w-8 h-8 rounded bg-white text-tenant font-bold flex items-center justify-center">
            {(user?.institution?.name || "C")[0]}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm leading-tight truncate">
              {user?.institution?.name || "College Portal"}
            </p>
            {user?.department?.name && (
              <p className="text-[11px] text-white/70 truncate">
                {user.department.name}
              </p>
            )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-0.5">
          {items.map((item) => {
            const Icon = item.icon;
            const showSection = item.section && item.section !== lastSection;
            lastSection = item.section || lastSection;
            const label = showSection && (
              <p className="px-3 pt-4 pb-1.5 text-[10px] tracking-wider text-white/60 font-semibold uppercase">
                {item.section}
              </p>
            );

            if (!item.children) {
              return (
                <div key={item.key}>
                  {label}
                  <NavLink
                    to={item.path}
                    end={item.path.split("/").length <= 3}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `${linkBase} ${
                        isActive
                          ? "bg-white text-tenant font-semibold"
                          : "text-white/85 hover:bg-white/10"
                      }`
                    }
                  >
                    {Icon && <Icon size={16} />}
                    {item.label}
                  </NavLink>
                </div>
              );
            }

            const groupActive = item.children.some((c) =>
              pathname.startsWith(c.path),
            );
            return (
              <div key={item.key}>
                {label}
                <button
                  onClick={() =>
                    setExpanded({ ...expanded, [item.key]: !isOpen(item) })
                  }
                  className={`${linkBase} w-full ${
                    groupActive
                      ? "bg-white/15 font-semibold"
                      : "text-white/85 hover:bg-white/10"
                  }`}
                >
                  {Icon && <Icon size={16} />}
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${isOpen(item) ? "rotate-180" : ""}`}
                  />
                </button>
                {isOpen(item) && (
                  <div className="ml-[22px] pl-4 border-l border-white/25 mt-1 mb-1 flex flex-col gap-0.5">
                    {item.children.map((c) => (
                      <NavLink
                        key={c.path}
                        to={c.path}
                        end
                        onClick={onClose}
                        className={({ isActive }) =>
                          `px-3 py-2 rounded text-[13px] ${
                            isActive
                              ? "bg-white text-tenant font-semibold"
                              : "text-white/80 hover:bg-white/10"
                          }`
                        }
                      >
                        {c.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="px-3 py-3 border-t border-white/15 flex flex-col gap-0.5">
          <button className={`${linkBase} text-white/85 hover:bg-white/10`}>
            <HelpCircle size={16} /> Help &amp; Support
          </button>
          <button
            onClick={() => navigate("/simulation")}
            className={`${linkBase} text-white/85 hover:bg-white/10`}
          >
            <LogOut size={16} /> Exit demo
          </button>
        </div>
      </aside>
    </>
  );
};

export default SimulationSidebar;

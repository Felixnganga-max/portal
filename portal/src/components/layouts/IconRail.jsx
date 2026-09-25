import { LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

/**
 * Styled after eTIMS's icon-only rail: solid brand-color background,
 * white icons, and the active item gets a solid white pill behind it
 * (matching the white rounded "Home" state in the KRA reference).
 */
const IconRail = ({ items, activeKey, onSelect }) => {
  const { logout } = useAuth();

  return (
    <div className="fixed left-0 top-0 h-screen w-rail bg-tenant flex flex-col items-center py-4 z-20">
      <div className="w-9 h-9 mb-6 bg-white/15 flex items-center justify-center text-white font-bold text-sm">
        CP
      </div>

      <nav className="flex-1 flex flex-col gap-2 w-full px-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeKey === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onSelect(item)}
              title={item.label}
              className={`flex items-center justify-center py-3 w-full transition-colors
                ${isActive ? "bg-white text-tenant" : "text-white/85 hover:bg-white/15"}`}
            >
              <Icon size={20} strokeWidth={1.75} />
            </button>
          );
        })}
      </nav>

      <button
        onClick={logout}
        title="Log out"
        className="flex items-center justify-center py-3 w-full mx-2 text-white/70 hover:bg-white/15"
      >
        <LogOut size={18} strokeWidth={1.75} />
      </button>
    </div>
  );
};

export default IconRail;

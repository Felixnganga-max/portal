import { Bell, MessageSquare, ChevronDown, Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Badge = ({ count }) =>
  count ? (
    <span className="absolute -top-1.5 -right-1.5 bg-badge text-white text-[10px] leading-none min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-semibold">
      {count}
    </span>
  ) : null;

const TopBar = ({ notificationCount = 0, messageCount = 0, onMenu }) => {
  const { user } = useAuth();
  const initials = user?.fullName
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="h-16 border-b border-line bg-surface flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenu}
          className="lg:hidden text-ink"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        {user?.role === "admin" && (
          <div className="border border-line rounded px-3 py-1.5 text-xs font-medium capitalize flex items-center gap-2">
            {user.role} <ChevronDown size={13} className="text-subtle" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 sm:gap-5">
        <button
          className="relative text-subtle hover:text-ink"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <Badge count={notificationCount} />
        </button>
        <button
          className="relative text-subtle hover:text-ink"
          aria-label="Messages"
        >
          <MessageSquare size={18} />
          <Badge count={messageCount} />
        </button>
        <div className="w-px h-6 bg-line" />
        <button className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-tenant text-white flex items-center justify-center text-xs font-semibold">
            {initials}
          </div>
          <span className="hidden sm:block text-[13px] font-medium">
            {user?.fullName}
          </span>
          <ChevronDown size={14} className="text-subtle" />
        </button>
      </div>
    </header>
  );
};

export default TopBar;

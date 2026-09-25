import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";

/**
 * Styled after eTIMS's expanded "Sales" panel: white background, bold
 * section title at top, each destination rendered as a row with a
 * chevron (decorative, matching the reference's accordion look) —
 * clicking the row navigates directly since these are leaf destinations,
 * not nested categories.
 */
const SecondaryPanel = ({ section }) => {
  const location = useLocation();
  if (!section) return null;

  return (
    <div className="fixed left-rail top-0 h-screen w-panel bg-surface border-r border-line z-10 flex flex-col">
      <div className="px-5 py-4 border-b border-line">
        <span className="text-base font-bold text-ink">{section.label}</span>
      </div>

      <nav className="flex-1 overflow-y-auto">
        {section.children.map((child) => {
          const isActive = location.pathname.startsWith(child.path);
          return (
            <NavLink
              key={child.path}
              to={child.path}
              className={`flex items-center justify-between px-5 py-3.5 text-sm border-b border-line
                ${isActive ? "font-semibold text-tenant bg-canvas" : "text-ink hover:bg-canvas"}`}
            >
              {child.label}
              <ChevronDown
                size={15}
                className={isActive ? "text-tenant" : "text-subtle"}
              />
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default SecondaryPanel;

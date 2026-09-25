import { Link } from "react-router-dom";
import { Search, Inbox } from "lucide-react";

/* ------------------------------------------------------------------ *
 * Design tokens used (all already in your Tailwind theme):
 * tenant, tenant-soft, canvas, surface, line, ink, subtle, good, badge, link
 * Everything is soft: 12-20px radii, hairline borders, diffuse shadows,
 * one accent colour (tenant) and pastel icon chips for variety.
 * ------------------------------------------------------------------ */

export const inputCls =
  "w-full border border-line bg-surface rounded-xl px-3.5 py-2.5 text-[13px] text-ink placeholder:text-subtle/70 focus:outline-none focus:border-tenant focus:ring-4 focus:ring-tenant-soft disabled:bg-canvas disabled:text-subtle transition";

// Floating-row tables: <table className={tableCls}> and <tr className={rowCls}>
export const tableCls = "w-full text-[13px] border-separate border-spacing-y-2";
export const thCls = "px-4 py-2 font-medium";
export const rowCls =
  "[&>td]:bg-surface [&>td]:border-y [&>td]:border-line/70 [&>td:first-child]:border-l [&>td:first-child]:rounded-l-xl [&>td:last-child]:border-r [&>td:last-child]:rounded-r-xl hover:[&>td]:bg-canvas transition-colors";

const TONES = {
  tenant: "bg-tenant-soft text-tenant",
  green: "bg-emerald-50 text-emerald-600",
  blue: "bg-sky-50 text-sky-600",
  violet: "bg-violet-50 text-violet-600",
  amber: "bg-amber-50 text-amber-600",
  pink: "bg-rose-50 text-rose-500",
};

export const IconChip = ({ icon: Icon, tone = "tenant", size = 40 }) => (
  <span
    style={{ width: size, height: size }}
    className={`shrink-0 rounded-full flex items-center justify-center ${
      TONES[tone] || TONES.tenant
    }`}
  >
    <Icon size={Math.round(size * 0.45)} />
  </span>
);

export const Avatar = ({ name = "", size = 34 }) => (
  <span
    style={{ width: size, height: size }}
    className="shrink-0 rounded-full bg-tenant-soft text-tenant text-xs font-bold flex items-center justify-center"
  >
    {name?.[0]?.toUpperCase()}
  </span>
);

/* ------------------------------ Panel ------------------------------ */

const Panel = ({
  title,
  description,
  action,
  flush,
  className = "",
  children,
}) => {
  const hasHeader = title || description || action;
  return (
    <section
      className={`bg-surface rounded-2xl border border-line/60 shadow-[0_8px_30px_rgba(24,24,60,0.05)] ${
        flush ? "overflow-hidden" : ""
      } ${className}`}
    >
      {hasHeader && (
        <header className="flex items-start justify-between gap-3 px-5 pt-5 pb-4">
          <div className="min-w-0">
            {title && (
              <h2 className="text-[15px] font-bold text-ink leading-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-xs text-subtle mt-1">{description}</p>
            )}
          </div>
          {action &&
            (action.to ? (
              <Link
                to={action.to}
                className="text-xs font-semibold text-tenant hover:underline shrink-0"
              >
                {action.label}
              </Link>
            ) : (
              <button
                onClick={action.onClick}
                className="text-xs font-semibold text-tenant hover:underline shrink-0"
              >
                {action.label}
              </button>
            ))}
        </header>
      )}
      <div className={flush ? "" : `px-5 pb-5 ${hasHeader ? "" : "pt-5"}`}>
        {children}
      </div>
    </section>
  );
};

export default Panel;

/* ---------------------------- Page header --------------------------- */

export const PageHeader = ({ title, subtitle, actions }) => (
  <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
    <div>
      <h1 className="text-[22px] font-bold text-ink tracking-tight">{title}</h1>
      {subtitle && (
        <p className="text-[13px] text-subtle mt-1 max-w-2xl">{subtitle}</p>
      )}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);

/* ------------------------------ Buttons ----------------------------- */

export const DarkButton = ({ className = "", children, ...props }) => (
  <button
    type="button"
    {...props}
    className={`inline-flex items-center justify-center gap-1.5 rounded-xl bg-tenant text-white text-xs font-semibold px-4 py-2 shadow-[0_8px_18px_-6px_rgba(0,0,0,0.35)] hover:brightness-110 active:scale-[0.98] transition disabled:opacity-40 disabled:pointer-events-none ${className}`}
  >
    {children}
  </button>
);

export const OutlineButton = ({ className = "", children, ...props }) => (
  <button
    type="button"
    {...props}
    className={`inline-flex items-center justify-center gap-1.5 rounded-xl border border-line bg-surface text-ink text-xs font-semibold px-3.5 py-1.5 hover:border-tenant hover:text-tenant active:scale-[0.98] transition disabled:opacity-40 disabled:pointer-events-none ${className}`}
  >
    {children}
  </button>
);

/* ------------------------------- Field ------------------------------ */

export const Field = ({ label, children }) => (
  <div>
    <span className="block text-[11px] font-semibold text-subtle uppercase tracking-wide mb-1.5">
      {label}
    </span>
    {children}
  </div>
);

/* ---------------------------- Status pill --------------------------- */

const PILL = {
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-rose-50 text-rose-600",
  blue: "bg-sky-50 text-sky-700",
  grey: "bg-canvas text-subtle",
};
const STATUS_TONE = {
  active: "green",
  approved: "green",
  completed: "green",
  published: "green",
  released: "green",
  admitted: "green",
  graduated: "blue",
  submitted: "amber",
  pending: "amber",
  reviewing: "amber",
  draft: "grey",
  new: "blue",
  suspended: "red",
  rejected: "red",
  withdrawn: "red",
};

export const StatusPill = ({ status }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
      PILL[STATUS_TONE[status] || "grey"]
    }`}
  >
    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
    {String(status || "—").replace(/-/g, " ")}
  </span>
);

/* ------------------------- List rows & cards ------------------------ */

// Divider-style row (use inside <Panel flush>). Same API as before.
export const ListRow = ({
  icon: Icon,
  tone = "tenant",
  title,
  meta,
  trailing,
}) => (
  <div className="flex items-center gap-4 px-5 py-3.5 border-t border-line/70 hover:bg-canvas/70 transition-colors">
    {Icon && <IconChip icon={Icon} tone={tone} />}
    <div className="flex-1 min-w-0">
      <p className="text-[13px] font-semibold text-ink truncate">{title}</p>
      {meta && <div className="text-xs text-subtle mt-0.5">{meta}</div>}
    </div>
    {trailing}
  </div>
);

// Floating row-card (the Estudy table-row look) for list layouts.
export const RowCard = ({
  icon,
  tone = "tenant",
  avatar,
  title,
  meta,
  trailing,
  onClick,
}) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-4 rounded-xl border border-line/70 bg-surface px-4 py-3 shadow-[0_2px_10px_rgba(24,24,60,0.03)] hover:shadow-[0_6px_18px_rgba(24,24,60,0.07)] transition-shadow ${
      onClick ? "cursor-pointer" : ""
    }`}
  >
    {icon ? (
      <IconChip icon={icon} tone={tone} />
    ) : (
      avatar && <Avatar name={avatar} size={40} />
    )}
    <div className="flex-1 min-w-0">
      <p className="text-[13px] font-semibold text-ink truncate">{title}</p>
      {meta && <div className="text-xs text-subtle mt-0.5">{meta}</div>}
    </div>
    {trailing}
  </div>
);

/* ------------------------------ Widgets ----------------------------- */

export const StatCard = ({ icon, tone = "tenant", label, value, sub }) => (
  <div className="bg-surface rounded-2xl border border-line/60 shadow-[0_8px_30px_rgba(24,24,60,0.05)] p-4 flex items-center gap-3.5">
    <IconChip icon={icon} tone={tone} size={46} />
    <div className="min-w-0">
      <p className="text-[22px] font-bold text-ink leading-none">{value}</p>
      <p className="text-xs text-subtle mt-1.5 truncate">{label}</p>
      {sub && <p className="text-[11px] text-subtle/80 truncate">{sub}</p>}
    </div>
  </div>
);

export const HeroBanner = ({
  icon: Icon,
  title,
  text,
  actionLabel,
  onAction,
}) => (
  <div className="relative overflow-hidden rounded-2xl bg-tenant text-white px-6 py-5 flex items-center gap-5 shadow-[0_18px_36px_-16px_rgba(0,0,0,0.45)]">
    <span className="absolute -right-10 -top-16 w-56 h-56 rounded-full bg-white/10" />
    <span className="absolute right-28 -bottom-24 w-48 h-48 rounded-full bg-white/10" />
    {Icon && (
      <span className="relative w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
        <Icon size={26} />
      </span>
    )}
    <div className="relative flex-1 min-w-0">
      <p className="text-lg font-bold leading-snug">{title}</p>
      {text && <p className="text-[13px] text-white/80 mt-1">{text}</p>}
      {actionLabel && (
        <button
          onClick={onAction}
          className="mt-3 bg-white text-tenant text-xs font-bold rounded-xl px-5 py-2 hover:bg-white/90 active:scale-[0.98] transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  </div>
);

export const Tabs = ({ tabs, value, onChange }) => (
  <div className="inline-flex gap-1 bg-surface border border-line/70 rounded-xl p-1 mb-5 shadow-sm">
    {tabs.map(([k, l]) => (
      <button
        key={k}
        onClick={() => onChange(k)}
        className={`px-5 py-1.5 text-xs rounded-lg transition ${
          value === k
            ? "bg-tenant text-white font-semibold shadow"
            : "text-subtle hover:text-ink"
        }`}
      >
        {l}
      </button>
    ))}
  </div>
);

export const SearchBox = ({
  value,
  onChange,
  placeholder = "Search",
  width = "w-64",
}) => (
  <div className={`relative ${width}`}>
    <Search
      size={14}
      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle"
    />
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-line bg-surface rounded-xl pl-9 pr-3 py-2 text-[13px] focus:outline-none focus:border-tenant focus:ring-4 focus:ring-tenant-soft transition"
    />
  </div>
);

export const ProgressBar = ({ value = 0, tone = "tenant", className = "" }) => {
  const bg = { tenant: "bg-tenant", good: "bg-good", badge: "bg-badge" }[tone];
  return (
    <div
      className={`h-1.5 bg-canvas rounded-full overflow-hidden ${className}`}
    >
      <div
        className={`h-full rounded-full transition-all ${bg}`}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
};

export const EmptyState = ({ title, text }) => (
  <div className="py-12 px-6 text-center">
    <span className="mx-auto mb-3 w-12 h-12 rounded-full bg-canvas text-subtle flex items-center justify-center">
      <Inbox size={20} />
    </span>
    <p className="text-[13px] font-semibold text-ink">{title}</p>
    {text && <p className="text-xs text-subtle mt-1">{text}</p>}
  </div>
);

export const Notice = ({ children, onDismiss, tone = "green" }) => (
  <div
    role="status"
    className={`mb-5 px-4 py-3 rounded-xl text-[13px] flex items-center justify-between gap-3 border ${
      tone === "green"
        ? "bg-emerald-50 border-emerald-100 text-emerald-700"
        : "bg-rose-50 border-rose-100 text-rose-600"
    }`}
  >
    <span>{children}</span>
    {onDismiss && (
      <button onClick={onDismiss} className="text-xs font-semibold underline">
        Dismiss
      </button>
    )}
  </div>
);

export const Step = ({ n, title, hint }) => (
  <div className="flex items-center gap-3 mb-3">
    <span className="w-6 h-6 rounded-full bg-tenant text-white text-[11px] font-bold flex items-center justify-center">
      {n}
    </span>
    <div>
      <h3 className="text-[13px] font-bold text-ink leading-none">{title}</h3>
      {hint && <p className="text-[11px] text-subtle mt-1">{hint}</p>}
    </div>
  </div>
);

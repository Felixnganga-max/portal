// Unit / stat card. API unchanged: category, title, progress, children.
const Card = ({ category, title, progress, children }) => (
  <div className="bg-surface border border-line rounded-md shadow p-4 flex flex-col gap-2.5">
    {category && (
      <span className="self-start bg-tenant-soft text-tenant text-[11px] font-semibold px-2 py-0.5 rounded-full">
        {category}
      </span>
    )}
    <h3 className="text-sm font-bold leading-snug">{title}</h3>
    {children}
    {typeof progress === "number" && (
      <div className="flex items-center gap-3 mt-1">
        <div className="flex-1 h-1.5 bg-canvas rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${progress >= 75 ? "bg-good" : "bg-tenant"}`}
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
        <span className="text-xs font-semibold">{progress}%</span>
      </div>
    )}
  </div>
);

export default Card;

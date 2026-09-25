import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { students } from "../../lib/mockData";
import { catalogUnit, useRegistrations } from "../../lib/registrationStore";
import { addDuration, durationLabel } from "../../lib/duration";

const me = students[0]; // TODO(api): the logged-in student

// Same two accent colours as the other student pages. Change them here to re-theme.
const MINT = "#A6F4A3";
const VIOLET = "#A48CFA";

const kes = (n) => (n > 0 ? `KES ${Number(n).toLocaleString()}` : "No fee");
const day = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

const statusPill = {
  registered: { label: "Active", cls: "bg-violet-100 text-violet-800" },
  pending: { label: "Awaiting approval", cls: "bg-amber-100 text-amber-800" },
};

// Duration can be a label string or { value, unit } depending on the catalogue entry.
const durationOf = (u) =>
  !u?.duration
    ? null
    : typeof u.duration === "string"
      ? u.duration
      : durationLabel(u.duration);

// Short courses show how far along they are, when a duration object is available.
const progressOf = (r, u) => {
  if (
    r.type !== "short" ||
    r.status !== "registered" ||
    !r.registeredAt ||
    typeof u?.duration !== "object"
  )
    return null;
  const start = r.registeredAt.slice(0, 10);
  const end = addDuration(start, u.duration.value, u.duration.unit);
  if (!end) return null;
  const a = new Date(`${start}T00:00:00`).getTime();
  const b = new Date(`${end}T23:59:59`).getTime();
  const pct = Math.max(
    0,
    Math.min(100, Math.round(((Date.now() - a) / (b - a)) * 100)),
  );
  return { end, pct };
};

// Hatched progress bar, same as the home page.
const HatchBar = ({ value }) => (
  <div
    className="h-3 rounded-full border border-line overflow-hidden bg-white"
    role="progressbar"
    aria-valuenow={value}
    aria-valuemin={0}
    aria-valuemax={100}
  >
    <div
      className="h-full rounded-full transition-[width] duration-500"
      style={{
        width: `${value}%`,
        backgroundColor: MINT,
        backgroundImage:
          "repeating-linear-gradient(135deg, rgba(0,0,0,.22) 0 1.5px, transparent 1.5px 5px)",
      }}
    />
  </div>
);

const Item = ({ r, surface }) => {
  const u = catalogUnit(r.unitId);
  const prog = progressOf(r, u);
  const meta = [
    r.type === "short" ? "Short course" : "Programme unit",
    durationOf(u),
    kes(r.fee),
    r.status === "pending"
      ? `requested ${day(r.requestedAt)}`
      : `started ${day(r.registeredAt)}`,
    prog && `ends ${day(prog.end)}`,
  ]
    .filter(Boolean)
    .join(" · ");
  const pill = statusPill[r.status] || {
    label: r.status,
    cls: "bg-black/5 text-ink",
  };

  return (
    <li className={`${surface} rounded-3xl px-5 py-4`}>
      <div className="flex items-start gap-4">
        <span
          className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-ink"
          style={{ backgroundColor: MINT }}
        >
          <BookOpen size={18} />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[16px] leading-snug">
            {`${u?.code ?? ""} ${u?.name ?? r.unitId}`.trim()}
          </p>
          <p className="text-[13px] text-subtle mt-1">{meta}</p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${pill.cls}`}
        >
          {pill.label}
        </span>
      </div>
      {prog && (
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1">
            <HatchBar value={prog.pct} />
          </div>
          <span className="text-xs font-semibold w-10 text-right">
            {prog.pct}%
          </span>
        </div>
      )}
    </li>
  );
};

// Units the student is registered for now, plus requests still waiting for approval.
const RegisteredUnits = () => {
  const mine = useRegistrations().filter((r) => r.studentId === me._id);
  const pending = mine
    .filter((r) => r.status === "pending")
    .sort((a, b) => (a.requestedAt || "").localeCompare(b.requestedAt || ""));
  const active = mine
    .filter((r) => r.status === "registered")
    .sort((a, b) => (b.registeredAt || "").localeCompare(a.registeredAt || ""));

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Registered units
          </h1>
          <p className="text-sm text-subtle mt-1">
            Units you are taking now, and requests waiting for approval
          </p>
        </div>
        <Link
          to="/student/units/register"
          className="rounded-full bg-ink text-white px-5 py-2.5 text-[13px] font-semibold hover:bg-ink/90"
        >
          Register units
        </Link>
      </div>

      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">
          <div
            className="rounded-[26px] p-5 flex flex-col min-h-[140px] text-ink"
            style={{ backgroundColor: MINT }}
          >
            <p className="text-[15px] font-medium">Registered</p>
            <p className="text-4xl font-semibold tracking-tight mt-auto">
              {active.length}
            </p>
          </div>
          <div
            className="rounded-[26px] p-5 flex flex-col min-h-[140px] text-white"
            style={{ backgroundColor: VIOLET }}
          >
            <p className="text-[15px] font-medium">Awaiting approval</p>
            <p className="text-4xl font-semibold tracking-tight mt-auto">
              {pending.length}
            </p>
          </div>
        </div>

        <section className="bg-white rounded-[28px] p-6">
          <h2 className="text-2xl font-semibold tracking-tight mb-5">
            Registered ({active.length})
          </h2>
          {active.length === 0 ? (
            <p className="text-[14px] text-subtle py-4">
              You have no active units. Register from the Register units page.
            </p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {active.map((r) => (
                <Item key={r.id} r={r} surface="bg-black/[0.04]" />
              ))}
            </ul>
          )}
        </section>

        {pending.length > 0 && (
          <section className="bg-black/[0.04] rounded-[28px] p-6">
            <h2 className="text-2xl font-semibold tracking-tight">
              Awaiting approval ({pending.length})
            </h2>
            <p className="text-[13px] text-subtle mt-1 mb-5">
              The admin approves units from other years or schools
            </p>
            <ul className="flex flex-col gap-2.5">
              {pending.map((r) => (
                <Item key={r.id} r={r} surface="bg-white" />
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
};

export default RegisteredUnits;

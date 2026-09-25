import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Landmark, Plus } from "lucide-react";
import api from "../../lib/api";
import {
  students,
  units,
  myUnitIds,
  gradeFor,
  transcriptHistory,
} from "../../lib/mockData";
import { catalogUnit, useRegistrations } from "../../lib/registrationStore";
import { useTeaching, computeResult } from "../../lib/teachingStore";

const me = students[0]; // TODO(api): the logged-in student
const currentYear = new Date().getFullYear().toString();

// ---- Palette -------------------------------------------------------------
// Accent colours for the colour-block cards and progress bar. Change these
// two values to re-theme the page. Everything else uses your existing tokens.
const MINT = "#A6F4A3";
const VIOLET = "#A48CFA";

// ---- Helpers -------------------------------------------------------------
const kes = (n) => `KES ${Number(n || 0).toLocaleString()}`;
const day = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

const initials = (name = "") =>
  name
    .replace(/^(mr|mrs|ms|dr|prof)\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("") || "?";

// Durations can be "3 weeks" or { value, unit } depending on the catalogue entry.
const daysOf = (duration) => {
  let n;
  let unit;
  if (typeof duration === "string") {
    const m = /(\d+)\s*(week|month|year)/i.exec(duration);
    if (!m) return null;
    n = Number(m[1]);
    unit = m[2];
  } else if (duration && typeof duration === "object") {
    n = Number(duration.value);
    unit = String(duration.unit || "");
  } else return null;
  const key = ["week", "month", "year"].find((k) =>
    unit.toLowerCase().startsWith(k),
  );
  return key && n ? n * { week: 7, month: 30, year: 365 }[key] : null;
};

const progressFor = (reg, unit) => {
  const total = daysOf(unit.duration);
  if (reg.status !== "registered" || !reg.registeredAt || !total) return 0;
  const elapsed =
    (Date.now() - new Date(reg.registeredAt).getTime()) / 86400000;
  return Math.max(0, Math.min(100, Math.round((elapsed / total) * 100)));
};

const clamp = (n) => Math.max(0, Math.min(100, Number(n) || 0));

const gradeTone = {
  A: "bg-green-100 text-green-800",
  B: "bg-green-100 text-green-800",
  C: "bg-blue-100 text-blue-800",
  D: "bg-amber-100 text-amber-800",
  E: "bg-red-100 text-red-800",
};

const helbLabel = {
  "not-applied": "Not applied",
  pending: "Pending",
  approved: "Approved",
  disbursed: "Disbursed",
  rejected: "Rejected",
};

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};

// ---- Small pieces --------------------------------------------------------
const Pill = ({ className = "", children }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${className}`}
  >
    {children}
  </span>
);

const statusPill = {
  registered: { label: "Active", cls: "bg-violet-100 text-violet-800" },
  pending: { label: "Awaiting approval", cls: "bg-amber-100 text-amber-800" },
};

// Hatched progress bar: filled part is coloured, the rest is grey stripes.
const HatchBar = ({ value }) => {
  const pct = clamp(value);
  return (
    <div
      className="h-3 rounded-full border border-line overflow-hidden bg-white"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full transition-[width] duration-500"
        style={{
          width: `${pct}%`,
          backgroundColor: MINT,
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(0,0,0,.22) 0 1.5px, transparent 1.5px 5px)",
        }}
      />
    </div>
  );
};

const Avatar = ({ name }) => (
  <span className="w-9 h-9 rounded-full bg-ink text-white text-[11px] font-semibold flex items-center justify-center shrink-0">
    {initials(name)}
  </span>
);

const RoundBtn = ({ className = "", ...props }) => (
  <button
    type="button"
    className={`w-11 h-11 rounded-2xl border border-line bg-white flex items-center justify-center hover:bg-black/[0.03] transition-colors ${className}`}
    {...props}
  />
);

const Chip = ({ active, children, ...props }) => (
  <button
    type="button"
    className={`px-4 py-2 rounded-full text-[13px] border transition-colors ${
      active
        ? "bg-ink text-white border-ink"
        : "bg-white text-ink border-line hover:bg-black/[0.03]"
    }`}
    {...props}
  >
    {children}
  </button>
);

// ---- Page ----------------------------------------------------------------
const StudentHome = () => {
  const navigate = useNavigate();
  const [apiRegs, setApiRegs] = useState(null);
  const [account, setAccount] = useState(null);
  const [hidden, setHidden] = useState(false);
  const [filter, setFilter] = useState("all");
  const localRegs = useRegistrations();
  const st = useTeaching();

  useEffect(() => {
    api
      .get("/units/registrations/mine")
      .then(({ data }) => setApiRegs(data))
      .catch(() => setApiRegs([]));
    api
      .get("/finance/my-account", { params: { academicYear: currentYear } })
      .then(({ data }) => setAccount(data))
      .catch(() => setAccount({}));
  }, []);

  // ---- Registered units (API + local store, no duplicates) ----
  const items = (() => {
    if (!apiRegs) return null;
    const fromApi = apiRegs
      .filter((r) => r.unit)
      .map((r) => ({
        id: r._id,
        code: r.unit.code,
        name: r.unit.name,
        status: "registered",
        instructor: r.instructor?.fullName || null,
        progress: r.attendancePercent || 0,
        detail: r.unit.creditHours ? `${r.unit.creditHours} credit hours` : "",
        footnote: "Attendance",
      }));

    const fromStore = localRegs
      .filter(
        (r) =>
          r.studentId === me._id &&
          ["registered", "pending"].includes(r.status),
      )
      .map((r) => ({ reg: r, unit: catalogUnit(r.unitId) }))
      .filter(({ unit }) => unit)
      .filter(({ unit }) => !apiRegs.some((a) => a.unit?.code === unit.code))
      .map(({ reg, unit }) => ({
        id: reg.id,
        code: unit.code,
        name: unit.name,
        status: reg.status,
        instructor: unit.instructor || null,
        progress: progressFor(reg, unit),
        detail:
          unit.type === "short"
            ? typeof unit.duration === "string"
              ? `Short course · ${unit.duration}`
              : "Short course"
            : unit.creditHours
              ? `${unit.creditHours} credit hours`
              : "",
        footnote:
          reg.status === "pending"
            ? `Requested ${day(reg.requestedAt)}`
            : `Started ${day(reg.registeredAt)}`,
      }));

    return [...fromApi, ...fromStore].sort(
      (a, b) => (a.status === "pending") - (b.status === "pending"),
    );
  })();

  const pendingCount = items?.filter((i) => i.status === "pending").length || 0;
  const activeCount =
    items?.filter((i) => i.status === "registered").length || 0;
  const visible =
    items?.filter((i) =>
      filter === "all"
        ? true
        : filter === "active"
          ? i.status === "registered"
          : i.status === "pending",
    ) || [];

  // ---- Results (same source as the Transcript page) ----
  const released = units
    .filter((u) => myUnitIds.includes(u._id) && st.published[u._id])
    .map((u) => ({
      code: u.code,
      name: u.name,
      instructor: typeof u.instructor === "string" ? u.instructor : null,
      total: computeResult(st, u._id, me._id).total,
    }))
    .filter((r) => r.total !== null);

  const allTotals = [
    ...transcriptHistory.flatMap((p) => p.rows.map((r) => r.total)),
    ...released.map((r) => r.total),
  ];
  const mean = allTotals.length
    ? Math.round(allTotals.reduce((s, n) => s + n, 0) / allTotals.length)
    : null;

  // ---- Finance ----
  const cleared = clamp(account?.percentPaid);

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {greeting()}, {me.fullName?.split(" ")[0]}
          </h1>
          <p className="text-sm text-subtle mt-1">
            {new Date().toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
            {items &&
              ` · ${activeCount} active unit${activeCount === 1 ? "" : "s"}`}
            {pendingCount > 0 && ` · ${pendingCount} awaiting approval`}
          </p>
        </div>
      </div>

      {/* Register banner */}
      {items?.length === 0 && (
        <div className="rounded-[28px] bg-ink text-white p-7 mb-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-semibold">Register your units</h2>
            <p className="text-sm text-white/70 mt-1">
              Pick this semester's units before registration closes.
            </p>
          </div>
          <button
            onClick={() => navigate("/student/units/register")}
            className="rounded-full px-5 py-2.5 text-[13px] font-semibold text-ink"
            style={{ backgroundColor: MINT }}
          >
            Register units
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] gap-5 items-start">
        {/* ---------------- My units ---------------- */}
        <section className="bg-white rounded-[28px] p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-semibold tracking-tight">My units</h2>
            <RoundBtn
              aria-label="Register units"
              onClick={() => navigate("/student/units/register")}
            >
              <Plus size={18} />
            </RoundBtn>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <Chip active={filter === "all"} onClick={() => setFilter("all")}>
              All units
            </Chip>
            <Chip
              active={filter === "active"}
              onClick={() => setFilter("active")}
            >
              Active
            </Chip>
            <Chip
              active={filter === "pending"}
              onClick={() => setFilter("pending")}
            >
              Awaiting approval
            </Chip>
          </div>

          {!items && <p className="text-sm text-subtle">Loading…</p>}

          {items && visible.length === 0 && (
            <p className="text-sm text-subtle py-6">
              {items.length === 0
                ? "No units registered this semester yet. Use the + button to add some."
                : "No units in this view."}
            </p>
          )}

          <ul className="flex flex-col gap-6">
            {visible.slice(0, 5).map((u) => {
              const pill = statusPill[u.status];
              return (
                <li key={u.id}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[17px] leading-snug">{u.name}</p>
                    <Pill className={pill.cls}>{pill.label}</Pill>
                  </div>
                  <p className="text-[13px] text-subtle mt-1">
                    {u.code}
                    {u.detail && ` · ${u.detail}`}
                  </p>
                  <div className="flex items-center justify-between text-[13px] text-subtle mt-1 mb-2.5">
                    <span>{u.instructor || "Instructor to be assigned"}</span>
                    <span>{u.footnote}</span>
                  </div>
                  {u.status === "registered" && (
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <HatchBar value={u.progress} />
                      </div>
                      <span className="text-xs font-semibold w-10 text-right">
                        {clamp(u.progress)}%
                      </span>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          <Link
            to="/student/units"
            className="mt-7 flex items-center justify-center rounded-2xl border border-line py-3 text-[13px] font-medium hover:bg-black/[0.03] transition-colors"
          >
            View all units
          </Link>
        </section>

        {/* ---------------- Right column ---------------- */}
        <div className="flex flex-col gap-5">
          {/* Fees + results as colour-block cards */}
          <section className="bg-white rounded-[28px] p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-semibold tracking-tight">
                Fees &amp; results
              </h2>
              <Link
                to="/student/finance"
                className="rounded-2xl border border-line px-4 py-2.5 text-[13px] font-medium hover:bg-black/[0.03] transition-colors"
              >
                Open finance
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Fees (mint) */}
              <div
                className="rounded-[26px] p-5 flex flex-col min-h-[280px] text-ink"
                style={{ backgroundColor: MINT }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[17px] font-medium">Fee balance</p>
                  <button
                    type="button"
                    onClick={() => setHidden(!hidden)}
                    aria-label="Toggle amount"
                    className="w-9 h-9 rounded-xl bg-black/10 flex items-center justify-center hover:bg-black/15"
                  >
                    {hidden ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {account ? (
                  <>
                    <p className="text-3xl font-semibold tracking-tight mt-5">
                      {hidden ? "KES ••••••" : kes(account.balance)}
                    </p>
                    <p className="text-[13px] text-ink/70 mt-1">
                      Academic year {currentYear}
                    </p>
                    <div className="mt-5">
                      <div className="flex justify-between text-[13px] mb-1.5">
                        <span className="text-ink/70">Fees cleared</span>
                        <b>{cleared}%</b>
                      </div>
                      <div className="h-2.5 rounded-full bg-black/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-ink"
                          style={{ width: `${cleared}%` }}
                        />
                      </div>
                    </div>
                    <div className="mt-auto pt-5">
                      <button
                        onClick={() => navigate("/student/finance")}
                        className="rounded-full bg-ink text-white px-5 py-2.5 text-[13px] font-semibold hover:bg-ink/90"
                      >
                        Pay fees
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-ink/70 mt-5">Loading…</p>
                )}
              </div>

              {/* Results (violet) */}
              <div
                className="rounded-[26px] p-5 flex flex-col min-h-[280px] text-white"
                style={{ backgroundColor: VIOLET }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[17px] font-medium">Overall mean</p>
                  {mean !== null && (
                    <Pill className="bg-white/25 text-white">
                      Grade {gradeFor(mean)}
                    </Pill>
                  )}
                </div>
                <p className="text-3xl font-semibold tracking-tight mt-5">
                  {mean !== null ? `${mean}%` : "—"}
                </p>
                <p className="text-[13px] text-white/85 mt-1">
                  {released.length > 0
                    ? `${released.length} result${released.length === 1 ? "" : "s"} released this year`
                    : "Results appear once your instructors release them."}
                </p>

                <div className="mt-5 flex items-center gap-3 rounded-2xl bg-white/20 px-3.5 py-3">
                  <span className="w-8 h-8 rounded-xl bg-white/30 flex items-center justify-center">
                    <Landmark size={15} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold leading-tight">
                      HELB · {helbLabel[account?.helbStatus] || "Not applied"}
                    </p>
                    {account?.helbAmount ? (
                      <p className="text-xs text-white/85">
                        {kes(account.helbAmount)}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="mt-auto pt-5">
                  <Link
                    to="/student/grades"
                    className="inline-block rounded-full bg-white text-ink px-5 py-2.5 text-[13px] font-semibold hover:bg-white/90"
                  >
                    View transcript
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Latest results: grey card, white pill rows */}
          <section className="bg-black/[0.04] rounded-[28px] p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-semibold tracking-tight">
                Latest results
              </h2>
            </div>

            {released.length === 0 ? (
              <p className="text-sm text-subtle py-4">
                Nothing released yet. Your results show up here as soon as an
                instructor publishes them.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[440px]">
                  <div className="grid grid-cols-[1.6fr_1.2fr_.6fr_.6fr] gap-3 px-4 pb-2 text-[13px] text-subtle">
                    <span>Unit</span>
                    <span>Instructor</span>
                    <span className="text-right">Marks</span>
                    <span className="text-right">Grade</span>
                  </div>
                  <ul className="flex flex-col gap-2.5">
                    {released.slice(0, 5).map((r) => (
                      <li
                        key={r.code}
                        className="grid grid-cols-[1.6fr_1.2fr_.6fr_.6fr] gap-3 items-center bg-white rounded-3xl px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="text-[15px] truncate">{r.name}</p>
                          <p className="text-xs text-subtle">{r.code}</p>
                        </div>
                        <div className="flex items-center gap-2.5 min-w-0">
                          {r.instructor ? (
                            <>
                              <Avatar name={r.instructor} />
                              <span className="text-[14px] truncate">
                                {r.instructor}
                              </span>
                            </>
                          ) : (
                            <span className="text-[13px] text-subtle">—</span>
                          )}
                        </div>
                        <span className="text-right text-[15px] font-semibold">
                          {r.total}%
                        </span>
                        <span className="text-right">
                          <Pill className={gradeTone[gradeFor(r.total)]}>
                            {gradeFor(r.total)}
                          </Pill>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default StudentHome;

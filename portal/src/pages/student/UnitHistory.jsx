import { useState } from "react";
import { students, gradeFor, transcriptHistory } from "../../lib/mockData";
import { catalogUnit, useRegistrations } from "../../lib/registrationStore";
import { useTeaching, computeResult } from "../../lib/teachingStore";

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
const closedAt = (r) =>
  r.completedAt ||
  r.droppedAt ||
  r.decidedAt ||
  r.rejectedAt ||
  r.registeredAt ||
  r.requestedAt ||
  "";
const filters = ["all", "completed", "rejected", "dropped"];

const tone = {
  A: "bg-green-100 text-green-800",
  B: "bg-green-100 text-green-800",
  C: "bg-blue-100 text-blue-800",
  D: "bg-amber-100 text-amber-800",
  E: "bg-red-100 text-red-800",
};
const outcome = {
  completed: { label: "Completed", cls: "bg-green-100 text-green-800" },
  rejected: { label: "Rejected", cls: "bg-red-100 text-red-800" },
  dropped: { label: "Dropped", cls: "bg-amber-100 text-amber-800" },
};

const Pill = ({ className = "", children }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${className}`}
  >
    {children}
  </span>
);

const Chip = ({ active, children, ...props }) => (
  <button
    type="button"
    className={`px-4 py-2 rounded-full text-[13px] border capitalize transition-colors ${
      active
        ? "bg-ink text-white border-ink"
        : "bg-white text-ink border-line hover:bg-black/[0.03]"
    }`}
    {...props}
  >
    {children}
  </button>
);

const HIST_ROW =
  "grid grid-cols-[2fr_1fr_1.4fr_.8fr_.7fr_.7fr] gap-3 items-center";
const SHORT_ROW =
  "grid grid-cols-[2fr_1.4fr_1.6fr_.9fr_1fr_1fr] gap-3 items-center";

// Everything the student has finished or that did not go ahead:
// earlier years from the transcript, plus short courses and requests from the registration flow.
const UnitHistory = () => {
  const st = useTeaching();
  const [filter, setFilter] = useState("all");

  const closed = useRegistrations()
    .filter(
      (r) =>
        r.studentId === me._id &&
        ["completed", "rejected", "dropped"].includes(r.status),
    )
    .map((r) => ({ reg: r, unit: catalogUnit(r.unitId) }))
    .filter(({ unit }) => unit)
    .sort((a, b) => closedAt(b.reg).localeCompare(closedAt(a.reg)));
  const rows = closed.filter(
    ({ reg }) => filter === "all" || reg.status === filter,
  );

  // Marks appear only once the instructor has released results for that unit.
  const resultOf = (reg) => {
    if (reg.status !== "completed" || !st.published[reg.unitId]) return null;
    return computeResult(st, reg.unitId, reg.studentId).total;
  };

  const passed = transcriptHistory.reduce(
    (n, p) => n + p.rows.filter((r) => r.total >= 40).length,
    0,
  );
  const credits = transcriptHistory.reduce(
    (n, p) => n + p.rows.reduce((s, r) => s + (r.creditHours || 0), 0),
    0,
  );
  const otherDone = closed.filter(
    ({ reg }) => reg.status === "completed",
  ).length;

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Unit history</h1>
        <p className="text-sm text-subtle mt-1">
          Everything you have finished, from earlier years and short courses
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {/* Summary colour blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            className="rounded-[26px] p-5 flex flex-col min-h-[150px] text-ink"
            style={{ backgroundColor: MINT }}
          >
            <p className="text-[15px] font-medium">Units passed</p>
            <p className="text-4xl font-semibold tracking-tight mt-auto">
              {passed}
            </p>
          </div>
          <div
            className="rounded-[26px] p-5 flex flex-col min-h-[150px] text-white"
            style={{ backgroundColor: VIOLET }}
          >
            <p className="text-[15px] font-medium">Credit hours earned</p>
            <p className="text-4xl font-semibold tracking-tight mt-auto">
              {credits}
            </p>
            <p className="text-[13px] text-white/85 mt-1">From earlier years</p>
          </div>
          <div className="rounded-[26px] p-5 flex flex-col min-h-[150px] bg-white">
            <p className="text-[15px] font-medium">Other units completed</p>
            <p className="text-4xl font-semibold tracking-tight mt-auto">
              {otherDone}
            </p>
            <p className="text-[13px] text-subtle mt-1">
              Short courses and more
            </p>
          </div>
        </div>

        {/* Earlier years */}
        {[...transcriptHistory].reverse().map((p) => (
          <section key={p.title} className="bg-black/[0.04] rounded-[28px] p-6">
            <h2 className="text-2xl font-semibold tracking-tight">{p.title}</h2>
            <p className="text-[13px] text-subtle mt-1 mb-5">
              Results are in your Transcript
            </p>
            <div className="overflow-x-auto">
              <div className="min-w-[720px]">
                <div
                  className={`${HIST_ROW} px-5 pb-2 text-[13px] text-subtle`}
                >
                  <span>Unit</span>
                  <span>Taken</span>
                  <span>Instructor</span>
                  <span className="text-right">Credit hours</span>
                  <span className="text-right">Marks</span>
                  <span>Grade</span>
                </div>
                <ul className="flex flex-col gap-2.5">
                  {p.rows.map((r) => (
                    <li
                      key={r.code}
                      className={`${HIST_ROW} bg-white rounded-3xl px-5 py-3.5`}
                    >
                      <div className="min-w-0">
                        <p className="text-[15px] font-medium truncate">
                          {r.name}
                        </p>
                        <p className="text-[13px] text-subtle">{r.code}</p>
                      </div>
                      <span className="text-[13px]">{r.taken}</span>
                      <span className="text-[13px] truncate">
                        {r.instructor}
                      </span>
                      <span className="text-right text-[14px]">
                        {r.creditHours}
                      </span>
                      <span className="text-right text-[15px] font-semibold">
                        {r.total}%
                      </span>
                      <span>
                        <Pill className={tone[gradeFor(r.total)]}>
                          {gradeFor(r.total)}
                        </Pill>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ))}

        {/* Short courses and other registrations */}
        <section className="bg-white rounded-[28px] p-6">
          <h2 className="text-2xl font-semibold tracking-tight">
            Short courses and other registrations
          </h2>
          <p className="text-[13px] text-subtle mt-1 mb-5">
            Finished, declined or dropped
          </p>

          <div className="flex flex-wrap gap-2 mb-5">
            {filters.map((f) => (
              <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
                {f}
              </Chip>
            ))}
          </div>

          <div className="bg-black/[0.04] rounded-[26px] p-3">
            {rows.length === 0 ? (
              <p className="text-[14px] text-subtle py-8 text-center">
                Nothing here yet. Finished short courses and declined requests
                will appear in this list.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[760px]">
                  <div
                    className={`${SHORT_ROW} px-5 pt-2 pb-2 text-[13px] text-subtle`}
                  >
                    <span>Unit</span>
                    <span>Type</span>
                    <span>Period</span>
                    <span>Fee</span>
                    <span>Outcome</span>
                    <span className="text-right">Result</span>
                  </div>
                  <ul className="flex flex-col gap-2.5">
                    {rows.map(({ reg, unit }) => {
                      const total = resultOf(reg);
                      const o = outcome[reg.status] || {
                        label: reg.status,
                        cls: "bg-black/5 text-ink",
                      };
                      return (
                        <li
                          key={reg.id}
                          className={`${SHORT_ROW} bg-white rounded-3xl px-5 py-3.5`}
                        >
                          <div className="min-w-0">
                            <p className="text-[15px] font-medium truncate">
                              {unit.name}
                            </p>
                            <p className="text-[13px] text-subtle">
                              {unit.code}
                            </p>
                          </div>
                          <span className="text-[13px]">
                            {unit.type === "short"
                              ? `Short course${unit.duration ? ` · ${unit.duration}` : ""}`
                              : "Programme unit"}
                          </span>
                          <span className="text-[13px]">
                            {day(reg.registeredAt || reg.requestedAt)} –{" "}
                            {day(closedAt(reg))}
                          </span>
                          <span className="text-[14px]">{kes(reg.fee)}</span>
                          <span>
                            <Pill className={o.cls}>{o.label}</Pill>
                          </span>
                          <span className="text-right text-[14px] font-semibold">
                            {total !== null && total !== undefined ? (
                              `${total}% (${gradeFor(total)})`
                            ) : (
                              <span className="text-subtle font-normal">—</span>
                            )}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default UnitHistory;

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Clock,
  Users,
  AlertCircle,
  CheckCircle2,
  Wallet,
  X,
  GraduationCap,
} from "lucide-react";
import { students, departments } from "../../lib/mockData";
import {
  useCatalog,
  useRegistrations,
  useRegistrationWindow,
  useCharges,
  registerUnits,
  dropRegistration,
  evaluateUnit,
  windowState,
  creditsOf,
  seatsLeft,
  clash,
  catalogUnit,
} from "../../lib/registrationStore";

const me = students[0]; // TODO(api): the logged-in student

// Same two accent colours as the other student pages. Change them here to re-theme.
const MINT = "#A6F4A3";
const VIOLET = "#A48CFA";

const kes = (n) => `KES ${Number(n).toLocaleString()}`;
const day = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";
const slotText = (u) =>
  u.slots?.length
    ? u.slots.map((s) => `${s.day} ${s.start}–${s.end}`).join(", ")
    : "Time to be announced";
const deptName = (code) =>
  departments.find((d) => d.code === code)?.name || code;

// ---------- shared pieces ----------

const inputCls =
  "w-full rounded-2xl border border-line bg-white px-4 py-3 text-[14px] focus:outline-none focus:border-ink";

const tones = {
  green: "bg-green-100 text-green-800",
  blue: "bg-blue-100 text-blue-800",
  amber: "bg-amber-100 text-amber-800",
  red: "bg-red-100 text-red-800",
  grey: "bg-black/[0.06] text-ink",
};
const Pill = ({ tone = "grey", children }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${tones[tone]}`}
  >
    {children}
  </span>
);

const DarkBtn = ({ className = "", ...props }) => (
  <button
    className={`inline-flex items-center justify-center gap-1.5 rounded-full bg-ink text-white px-5 py-2.5 text-[13px] font-semibold hover:bg-ink/90 disabled:opacity-40 ${className}`}
    {...props}
  />
);

const OutlineBtn = ({ className = "", ...props }) => (
  <button
    className={`inline-flex items-center justify-center gap-1.5 rounded-full border border-line bg-white px-4 py-2 text-[13px] font-medium hover:bg-black/[0.03] ${className}`}
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

// ---------- registration window + credit meter ----------

const WINDOW_TEXT = {
  open: (w) => ({
    tone: "green",
    text: `Registration is open until ${day(w.closes)}`,
  }),
  late: (w) => ({
    tone: "amber",
    text: `Late registration until ${day(w.lateUntil)} · ${kes(w.lateFee)} late fee applies`,
  }),
  upcoming: (w) => ({
    tone: "grey",
    text: `Registration opens on ${day(w.opens)}`,
  }),
  closed: () => ({
    tone: "red",
    text: "Registration has closed. Contact the admin for late requests",
  }),
};

const CreditMeter = ({ credits, add = 0, min, max }) => {
  const total = credits + add;
  const pct = (n) => Math.min(100, (n / max) * 100);
  const color = total > max ? "#EF4444" : total >= min ? MINT : VIOLET;
  return (
    <div>
      <div className="flex items-baseline justify-between text-[13px] mb-2">
        <span className="text-subtle">Credit hours this semester</span>
        <span>
          <b className="text-base">{total}</b>{" "}
          <span className="text-subtle">/ {max} max</span>
        </span>
      </div>
      <div className="relative h-3 rounded-full border border-line bg-white overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full opacity-45"
          style={{ width: `${pct(total)}%`, backgroundColor: color }}
        />
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${pct(credits)}%`,
            backgroundColor: color,
            backgroundImage:
              "repeating-linear-gradient(135deg, rgba(0,0,0,.22) 0 1.5px, transparent 1.5px 5px)",
          }}
        />
        <div
          className="absolute inset-y-0 w-px bg-ink/50"
          style={{ left: `${pct(min)}%` }}
          title={`Minimum ${min}`}
        />
      </div>
      <p className="text-[12px] text-subtle mt-2">
        {total < min
          ? `${min - total} more credit hours needed to reach the ${min} minimum`
          : total > max
            ? `Over the limit by ${total - max}`
            : `Within the ${min}–${max} range`}
      </p>
    </div>
  );
};

// ---------- one programme unit ----------

const UnitRow = ({ unit, ev, checked, onToggle }) => {
  const selectable = ev.state === "available";
  const seats = seatsLeft(unit);
  return (
    <div
      className="rounded-3xl px-5 py-4 flex items-start gap-4 bg-white"
      style={checked ? { backgroundColor: `${MINT}66` } : undefined}
    >
      <input
        type="checkbox"
        className="mt-1.5 h-4 w-4 accent-[var(--tenant-color,#C0272D)]"
        disabled={!selectable}
        checked={checked}
        onChange={() => onToggle(unit._id)}
        aria-label={`Select ${unit.code}`}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[15px] font-medium">
            {unit.code} · {unit.name}
          </p>
          <Pill tone={unit.type === "core" ? "blue" : "grey"}>
            {unit.type === "core" ? "Core" : "Elective"}
          </Pill>
          {ev.needsApproval && (
            <Pill tone="amber">
              {unit.dept !== me.dept
                ? "Other school: needs approval"
                : "Other year: needs approval"}
            </Pill>
          )}
        </div>
        <p className="text-[13px] text-subtle mt-1.5 flex items-center gap-x-4 gap-y-1 flex-wrap">
          <span>{unit.creditHours} credit hours</span>
          <span>
            Year {unit.year} · Semester {unit.term}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock size={12} /> {slotText(unit)}
          </span>
          <span>{unit.instructor}</span>
          <span className="inline-flex items-center gap-1">
            <Users size={12} />{" "}
            {seats > 0 ? `${seats} seat${seats === 1 ? "" : "s"} left` : "Full"}
          </span>
        </p>
        {unit.dept !== me.dept && (
          <p className="text-[13px] text-subtle mt-0.5">
            {deptName(unit.dept)}
          </p>
        )}
        {unit.prerequisites?.length > 0 && (
          <p className="text-[13px] text-subtle mt-0.5">
            Prerequisite: {unit.prerequisites.join(", ")}
          </p>
        )}
        {ev.state === "blocked" && (
          <ul className="mt-2 flex flex-col gap-0.5">
            {ev.reasons.map((r) => (
              <li
                key={r}
                className="text-[13px] text-red-600 flex items-center gap-1.5"
              >
                <AlertCircle size={13} /> {r}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="shrink-0">
        {ev.state === "registered" && <Pill tone="green">Registered</Pill>}
        {ev.state === "pending" && <Pill tone="amber">Awaiting approval</Pill>}
        {ev.state === "completed" && <Pill tone="blue">Completed</Pill>}
        {ev.state === "available" && <Pill tone="green">Available</Pill>}
        {ev.state === "blocked" && <Pill>Not available</Pill>}
      </div>
    </div>
  );
};

// ---------- one short course ----------

const ShortCard = ({ unit, ev, onEnrol }) => {
  const seats = seatsLeft(unit);
  const facts = [
    ["Duration", unit.duration],
    ["Fee", kes(unit.fee)],
    ["Starts", day(unit.startDate)],
    ["Seats", seats > 0 ? `${seats} left` : "Full"],
  ];
  return (
    <div className="bg-white rounded-[26px] p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <span className="bg-violet-100 text-violet-800 text-[11px] font-semibold px-2.5 py-1 rounded-full">
          {unit.code} · Short course
        </span>
        {ev.state === "registered" && <Pill tone="green">Enrolled</Pill>}
        {ev.state === "completed" && <Pill tone="blue">Completed</Pill>}
      </div>
      <h3 className="text-[17px] leading-snug">{unit.name}</h3>
      <p className="text-[13px] text-subtle">{unit.description}</p>
      <div className="grid grid-cols-2 gap-2">
        {facts.map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl bg-black/[0.04] px-3.5 py-2.5"
          >
            <p className="text-[12px] text-subtle">{label}</p>
            <p className="text-[14px] font-semibold">{value}</p>
          </div>
        ))}
      </div>
      <p className="text-[13px] text-subtle">{unit.instructor}</p>
      {ev.state === "blocked" && (
        <ul className="flex flex-col gap-0.5">
          {ev.reasons.map((r) => (
            <li
              key={r}
              className="text-[13px] text-red-600 flex items-center gap-1.5"
            >
              <AlertCircle size={13} /> {r}
            </li>
          ))}
        </ul>
      )}
      {ev.state === "available" && (
        <DarkBtn onClick={() => onEnrol(unit)} className="mt-1 py-3">
          Enrol · {kes(unit.fee)}
        </DarkBtn>
      )}
    </div>
  );
};

// ---------- dialog ----------

const Modal = ({ title, onClose, children }) => (
  <div
    className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4"
    role="dialog"
    aria-modal="true"
    onClick={onClose}
  >
    <div
      className="bg-white rounded-[28px] shadow-xl w-full max-w-md max-h-[85vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full border border-line flex items-center justify-center hover:bg-black/[0.03]"
          aria-label="Close"
        >
          <X size={15} />
        </button>
      </div>
      <div className="p-6 pt-3">{children}</div>
    </div>
  </div>
);

// ---------- page ----------

const tabsDef = [
  { key: "mine", label: "My year's units" },
  { key: "other", label: "Other years & schools" },
  { key: "short", label: "Short courses" },
];

const RegisterUnits = () => {
  const catalog = useCatalog();
  const regs = useRegistrations().filter((r) => r.studentId === me._id);
  const w = useRegistrationWindow();
  const charges = useCharges(me._id);
  const ws = windowState(w);
  const banner = WINDOW_TEXT[ws](w);

  const [tab, setTab] = useState("mine");
  const [query, setQuery] = useState("");
  const [term, setTerm] = useState("all");
  const [selected, setSelected] = useState([]);
  const [confirm, setConfirm] = useState(false);
  const [shortUnit, setShortUnit] = useState(null);
  const [notice, setNotice] = useState(null);

  const matches = (u) =>
    `${u.code} ${u.name} ${u.instructor}`
      .toLowerCase()
      .includes(query.toLowerCase());
  const programme = catalog.filter((u) => u.type !== "short" && matches(u));
  const mine = programme
    .filter(
      (u) =>
        u.dept === me.dept &&
        u.year === me.year &&
        (term === "all" || String(u.term) === term),
    )
    .sort(
      (a, b) =>
        a.term - b.term ||
        (a.type === "core" ? -1 : 1) - (b.type === "core" ? -1 : 1) ||
        a.code.localeCompare(b.code),
    );
  const other = programme
    .filter((u) => !(u.dept === me.dept && u.year === me.year))
    .sort((a, b) => b.year - a.year || a.code.localeCompare(b.code));
  const shorts = catalog.filter((u) => u.type === "short" && matches(u));

  const list = tab === "mine" ? mine : other;
  const credits = creditsOf(regs);
  const chosen = selected.map(catalogUnit).filter(Boolean);
  const addCredits = chosen.reduce((s, u) => s + u.creditHours, 0);

  // Problems that only appear when units are combined.
  const problems = [];
  chosen.forEach((a, i) =>
    chosen
      .slice(i + 1)
      .forEach(
        (b) => clash(a, b) && problems.push(`${a.code} clashes with ${b.code}`),
      ),
  );
  if (credits + addCredits > w.maxCredits)
    problems.push(
      `Selection takes you to ${credits + addCredits} credit hours, over the ${w.maxCredits} limit`,
    );
  const needApproval = chosen.filter((u) => evaluateUnit(me, u).needsApproval);
  const lateFee =
    ws === "late" &&
    chosen.length > 0 &&
    !charges.some((c) => c.kind === "late" && c.term === w.term);

  const toggle = (id) => {
    setNotice(null);
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );
  };

  const selectCore = () => {
    const picks = [];
    mine
      .filter((u) => u.type === "core" && u.term === w.term)
      .forEach((u) => {
        const ev = evaluateUnit(me, u);
        if (
          ev.state === "available" &&
          !ev.needsApproval &&
          !picks.some((p) => clash(p, u))
        )
          picks.push(u);
      });
    setNotice(
      picks.length
        ? null
        : {
            ok: true,
            text: "All your core units for this semester are already registered.",
          },
    );
    setSelected(picks.map((u) => u._id));
  };

  const submit = () => {
    const results = registerUnits(me, selected);
    const okRows = results.filter((r) => r.ok);
    const bad = results.filter((r) => !r.ok);
    const reg = okRows.filter((r) => r.status === "registered").length;
    const pend = okRows.filter((r) => r.status === "pending").length;
    const parts = [
      reg && `${reg} unit${reg === 1 ? "" : "s"} registered`,
      pend && `${pend} request${pend === 1 ? "" : "s"} sent for approval`,
    ].filter(Boolean);
    setNotice({
      ok: !bad.length,
      text: [
        parts.join(", "),
        ...bad.map((b) => `${catalogUnit(b.unitId)?.code}: ${b.reason}`),
      ]
        .filter(Boolean)
        .join(" · "),
    });
    setSelected([]);
    setConfirm(false);
  };

  const enrolShort = () => {
    const [res] = registerUnits(me, [shortUnit._id]);
    setNotice(
      res.ok
        ? {
            ok: true,
            text: `You are enrolled in ${shortUnit.name}. ${kes(shortUnit.fee)} was added to your fees.`,
          }
        : { ok: false, text: res.reason },
    );
    setShortUnit(null);
  };

  const drop = (r) => {
    const res = dropRegistration(r.id);
    setNotice(
      res.ok
        ? { ok: true, text: `${catalogUnit(r.unitId)?.code} dropped.` }
        : { ok: false, text: res.reason },
    );
  };

  const current = regs.filter((r) =>
    ["registered", "pending"].includes(r.status),
  );
  const currentProgramme = current.filter((r) => r.type !== "short");
  const currentShort = current.filter((r) => r.type === "short");

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Register units
          </h1>
          <p className="text-sm text-subtle mt-1">
            {w.termName}, {w.academicYear} · Year {me.year}
          </p>
        </div>
        <Link
          to="/student/units"
          className="rounded-full border border-line bg-white px-5 py-2.5 text-[13px] font-medium hover:bg-black/[0.03]"
        >
          View registered units
        </Link>
      </div>

      {notice && (
        <div
          role="status"
          className={`mb-5 px-5 py-3.5 rounded-3xl text-[14px] flex items-center justify-between gap-3 ${notice.ok ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
        >
          <span className="flex items-center gap-2">
            {notice.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}{" "}
            {notice.text}
          </span>
          <button
            onClick={() => setNotice(null)}
            className="text-[13px] font-semibold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-5 items-start">
        {/* left: catalogue */}
        <section className="bg-white rounded-[28px] p-6 flex flex-col gap-4 min-w-0">
          <div className="flex flex-wrap gap-2">
            {tabsDef.map((t) => (
              <Chip
                key={t.key}
                active={tab === t.key}
                onClick={() => setTab(t.key)}
              >
                {t.label}
              </Chip>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {tab === "mine" && (
              <select
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className={`${inputCls} !w-44 !py-2.5`}
                aria-label="Semester"
              >
                <option value="all">Both semesters</option>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
              </select>
            )}
            <div className="relative">
              <Search
                size={15}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search units"
                className="rounded-2xl border border-line bg-white pl-10 pr-4 py-2.5 text-[14px] w-56 focus:outline-none focus:border-ink"
              />
            </div>
          </div>

          {tab === "mine" && (
            <div
              className="rounded-3xl px-5 py-4 flex items-center justify-between gap-3 flex-wrap text-ink"
              style={{ backgroundColor: MINT }}
            >
              <p className="text-[13px] max-w-md">
                Register together, then confirm once. Core units are the
                quickest place to start.
              </p>
              <button
                onClick={selectCore}
                className="inline-flex items-center gap-1.5 rounded-full bg-ink text-white px-4 py-2 text-[13px] font-semibold hover:bg-ink/90"
              >
                <GraduationCap size={14} /> Select my core units
              </button>
            </div>
          )}
          {tab === "other" && (
            <div className="bg-amber-50 text-amber-800 rounded-3xl px-5 py-4 text-[13px]">
              Units from another year (a retake or catching up) or another
              school need the admin's approval. Your request stays pending until
              then, and only counts towards your credit hours once approved.
            </div>
          )}
          {tab === "short" && (
            <div className="bg-black/[0.04] rounded-3xl px-5 py-4 text-[13px] text-subtle">
              Short courses run for a few weeks or months, can be taken any
              time, and one at a time. The fee is added to your account when you
              enrol.
            </div>
          )}

          {tab !== "short" && (
            <div className="bg-black/[0.04] rounded-[26px] p-3 flex flex-col gap-2.5">
              {list.length === 0 && (
                <p className="py-10 text-center text-[14px] text-subtle">
                  No units match.
                </p>
              )}
              {list.map((u) => (
                <UnitRow
                  key={u._id}
                  unit={u}
                  ev={evaluateUnit(me, u)}
                  checked={selected.includes(u._id)}
                  onToggle={toggle}
                />
              ))}
            </div>
          )}

          {tab === "short" && (
            <div className="bg-black/[0.04] rounded-[26px] p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              {shorts.map((u) => (
                <ShortCard
                  key={u._id}
                  unit={u}
                  ev={evaluateUnit(me, u)}
                  onEnrol={setShortUnit}
                />
              ))}
              {shorts.length === 0 && (
                <p className="py-8 text-center text-[14px] text-subtle md:col-span-2">
                  No short courses match.
                </p>
              )}
            </div>
          )}
        </section>

        {/* right: summary */}
        <div className="flex flex-col gap-5 xl:sticky xl:top-20">
          <section className="bg-white rounded-[28px] p-6">
            <h2 className="text-2xl font-semibold tracking-tight mb-4">
              Your registration
            </h2>
            <div
              className={`text-[13px] rounded-2xl px-4 py-3 mb-5 ${tones[banner.tone]}`}
            >
              {banner.text}
            </div>
            <CreditMeter
              credits={credits}
              add={addCredits}
              min={w.minCredits}
              max={w.maxCredits}
            />

            <div className="mt-6">
              <p className="text-[13px] font-semibold mb-2">
                Selected ({chosen.length})
              </p>
              {chosen.length === 0 && (
                <p className="text-[13px] text-subtle">
                  Tick units on the left to add them here.
                </p>
              )}
              <ul className="flex flex-col gap-2">
                {chosen.map((u) => (
                  <li
                    key={u._id}
                    className="flex items-center justify-between gap-2 text-[13px] bg-black/[0.04] rounded-2xl px-4 py-2.5"
                  >
                    <span className="truncate">
                      {u.code} {u.name}
                    </span>
                    <span className="flex items-center gap-2 shrink-0">
                      <span className="text-[12px] text-subtle">
                        {u.creditHours} cr
                      </span>
                      <button
                        onClick={() => toggle(u._id)}
                        className="text-subtle hover:text-red-600"
                        aria-label={`Remove ${u.code}`}
                      >
                        <X size={14} />
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
              {problems.map((p) => (
                <p
                  key={p}
                  className="text-[13px] text-red-600 mt-2 flex items-center gap-1.5"
                >
                  <AlertCircle size={13} /> {p}
                </p>
              ))}
              {needApproval.length > 0 && !problems.length && (
                <p className="text-[13px] text-amber-700 mt-2">
                  {needApproval.length} of these need admin approval.
                </p>
              )}
            </div>

            <DarkBtn
              onClick={() => setConfirm(true)}
              disabled={!chosen.length || problems.length > 0}
              className="w-full mt-5 py-3"
            >
              {chosen.length
                ? `Review & register ${chosen.length} unit${chosen.length === 1 ? "" : "s"}`
                : "Register selected units"}
            </DarkBtn>
          </section>

          <section className="bg-black/[0.04] rounded-[28px] p-6">
            <h2 className="text-2xl font-semibold tracking-tight">
              Registered this semester
            </h2>
            <p className="text-[13px] text-subtle mt-1 mb-4">
              {currentProgramme.length} unit
              {currentProgramme.length === 1 ? "" : "s"} · {credits} credit
              hours
            </p>
            {current.length === 0 && (
              <p className="text-[14px] text-subtle">Nothing registered yet.</p>
            )}
            <ul className="flex flex-col gap-2.5">
              {[...currentProgramme, ...currentShort].map((r) => {
                const u = catalogUnit(r.unitId);
                return (
                  <li
                    key={r.id}
                    className="bg-white rounded-3xl px-5 py-3.5 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-[14px] font-medium truncate">
                        {u?.code} {u?.name}
                      </p>
                      <p className="text-[12px] text-subtle">
                        {r.type === "short"
                          ? `Short course · ${u?.duration}`
                          : `${u?.creditHours} credit hours`}{" "}
                        ·{" "}
                        {r.status === "pending"
                          ? "awaiting approval"
                          : "registered"}
                      </p>
                    </div>
                    {!(r.type === "short" && r.status === "registered") && (
                      <OutlineBtn onClick={() => drop(r)}>Drop</OutlineBtn>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>

          {charges.length > 0 && (
            <section className="bg-white rounded-[28px] p-6">
              <h2 className="text-2xl font-semibold tracking-tight">
                Fees added by registration
              </h2>
              <p className="text-[13px] text-subtle mt-1 mb-4">
                These also appear under My fees
              </p>
              <ul className="flex flex-col gap-2">
                {charges.slice(0, 5).map((c) => (
                  <li
                    key={c.id}
                    className="bg-black/[0.04] rounded-2xl px-4 py-3 flex items-center justify-between gap-3 text-[13px]"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <Wallet size={14} className="text-subtle shrink-0" />
                      <span className="truncate">{c.description}</span>
                    </span>
                    <b className="text-[13px] shrink-0">{kes(c.amount)}</b>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>

      {confirm && (
        <Modal title="Confirm registration" onClose={() => setConfirm(false)}>
          <ul className="flex flex-col gap-2 mb-4">
            {chosen.map((u) => {
              const needs = evaluateUnit(me, u).needsApproval;
              return (
                <li
                  key={u._id}
                  className="flex items-center justify-between gap-3 text-[13px] bg-black/[0.04] rounded-2xl px-4 py-2.5"
                >
                  <span>
                    {u.code} {u.name}
                  </span>
                  <Pill tone={needs ? "amber" : "green"}>
                    {needs ? "Request" : `${u.creditHours} cr`}
                  </Pill>
                </li>
              );
            })}
          </ul>
          <div className="text-[13px] text-subtle flex flex-col gap-1 mb-5">
            <p>
              Total: <b className="text-ink">{addCredits} credit hours</b> →{" "}
              {credits + addCredits} this semester.
            </p>
            {needApproval.length > 0 && (
              <p>
                {needApproval.length} unit{needApproval.length === 1 ? "" : "s"}{" "}
                will wait for the admin to approve.
              </p>
            )}
            {lateFee && (
              <p className="text-amber-700">
                A late registration fee of {kes(w.lateFee)} will be added to
                your fees.
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <OutlineBtn onClick={() => setConfirm(false)}>Back</OutlineBtn>
            <DarkBtn onClick={submit}>Confirm</DarkBtn>
          </div>
        </Modal>
      )}

      {shortUnit && (
        <Modal title="Enrol in short course" onClose={() => setShortUnit(null)}>
          <p className="text-[15px] font-medium">
            {shortUnit.code} · {shortUnit.name}
          </p>
          <p className="text-[13px] text-subtle mt-1">
            {shortUnit.duration} · starts {day(shortUnit.startDate)} ·{" "}
            {shortUnit.instructor}
          </p>
          <div
            className="my-4 rounded-3xl px-5 py-4 flex items-center justify-between text-[14px] text-ink"
            style={{ backgroundColor: MINT }}
          >
            <span>Course fee</span>
            <b className="text-lg">{kes(shortUnit.fee)}</b>
          </div>
          <p className="text-[13px] text-subtle mb-5">
            The fee is added to your account and shows under My fees. You can
            take one short course at a time. The admin marks it completed when
            it ends.
          </p>
          <div className="flex justify-end gap-2">
            <OutlineBtn onClick={() => setShortUnit(null)}>Cancel</OutlineBtn>
            <DarkBtn onClick={enrolShort}>Enrol · {kes(shortUnit.fee)}</DarkBtn>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default RegisterUnits;

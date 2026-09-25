import { useSyncExternalStore } from "react";
import { students, transcriptHistory } from "./mockData";

// Unit catalogue + registrations for the demo phase. Persisted in localStorage.
// TODO(api): the catalogue comes from Programs & Units, registrations from /units/register,
// and every rule in evaluateUnit() must also be enforced on the server.
//
// Exports other files already rely on: catalogUnit, useRegistrations, approveRequest,
// rejectRequest, completeRegistration, isShortCourse, useCharges.

const KEY = "portal-mock-registration-v2";

const plusDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};
const slot = (day, start, end) => ({ day, start, end });

// Registration window for the current term. Programme units follow it; short courses are open all year.
const defaultWindow = () => ({
  term: 1,
  termName: "Semester 1",
  academicYear: "2026/2027",
  opens: plusDays(-21),
  closes: plusDays(14),
  lateUntil: plusDays(21),
  lateFee: 1000,
  minCredits: 12,
  maxCredits: 24,
});

// type: "core" | "elective" | "short". year/term place a programme unit in the plan.
// prerequisites are unit CODES that must already be passed. enrolled = other students already in.
const seedCatalog = [
  // Year 3, Semester 1 (the student's own year and term)
  {
    _id: "u1",
    code: "BUS 101",
    name: "Principles of Management",
    type: "core",
    dept: "BUS",
    year: 3,
    term: 1,
    creditHours: 3,
    slots: [slot("Mon", "09:00", "11:00")],
    instructor: "Mr. Peter Kamau",
    capacity: 60,
    enrolled: 41,
    prerequisites: [],
  },
  {
    _id: "u2",
    code: "BUS 104",
    name: "Business Communication",
    type: "core",
    dept: "BUS",
    year: 3,
    term: 1,
    creditHours: 3,
    slots: [slot("Tue", "08:00", "11:00")],
    instructor: "Ms. Grace Wairimu",
    capacity: 60,
    enrolled: 38,
    prerequisites: [],
  },
  {
    _id: "u3",
    code: "BUS 203",
    name: "Financial Accounting",
    type: "core",
    dept: "BUS",
    year: 3,
    term: 1,
    creditHours: 4,
    slots: [slot("Wed", "10:00", "13:00")],
    instructor: "Mr. Daniel Otieno",
    capacity: 60,
    enrolled: 44,
    prerequisites: [],
  },
  {
    _id: "u4",
    code: "BUS 301",
    name: "Strategic Management",
    type: "core",
    dept: "BUS",
    year: 3,
    term: 1,
    creditHours: 3,
    slots: [slot("Thu", "08:00", "11:00")],
    instructor: "Dr. Alice Mutheu",
    capacity: 55,
    enrolled: 30,
    prerequisites: [],
  },
  {
    _id: "u5",
    code: "BUS 305",
    name: "Project Management",
    type: "elective",
    dept: "BUS",
    year: 3,
    term: 1,
    creditHours: 3,
    slots: [slot("Mon", "08:00", "10:00")],
    instructor: "Mr. Samuel Mwangi",
    capacity: 40,
    enrolled: 38,
    prerequisites: [],
  },
  {
    _id: "u6",
    code: "BUS 307",
    name: "Business Research Methods",
    type: "elective",
    dept: "BUS",
    year: 3,
    term: 1,
    creditHours: 3,
    slots: [slot("Fri", "09:00", "12:00")],
    instructor: "Dr. Alice Mutheu",
    capacity: 45,
    enrolled: 20,
    prerequisites: ["BUS 301"],
  },
  {
    _id: "u7",
    code: "BUS 309",
    name: "Entrepreneurship II",
    type: "elective",
    dept: "BUS",
    year: 3,
    term: 1,
    creditHours: 3,
    slots: [slot("Thu", "13:00", "16:00")],
    instructor: "Ms. Ruth Njeri",
    capacity: 40,
    enrolled: 40,
    prerequisites: ["BUS 106"],
  },
  {
    _id: "u16",
    code: "BUS 311",
    name: "Business Ethics",
    type: "elective",
    dept: "BUS",
    year: 3,
    term: 1,
    creditHours: 2,
    slots: [slot("Fri", "14:00", "16:00")],
    instructor: "Ms. Ruth Njeri",
    capacity: 50,
    enrolled: 22,
    prerequisites: [],
  },
  // Year 3, Semester 2 (opens later)
  {
    _id: "u8",
    code: "BUS 302",
    name: "Corporate Governance",
    type: "core",
    dept: "BUS",
    year: 3,
    term: 2,
    creditHours: 3,
    slots: [slot("Mon", "09:00", "12:00")],
    instructor: "Dr. Alice Mutheu",
    capacity: 55,
    enrolled: 0,
    prerequisites: [],
  },
  {
    _id: "u9",
    code: "BUS 306",
    name: "International Business",
    type: "elective",
    dept: "BUS",
    year: 3,
    term: 2,
    creditHours: 3,
    slots: [slot("Tue", "09:00", "12:00")],
    instructor: "Mr. Peter Kamau",
    capacity: 45,
    enrolled: 0,
    prerequisites: [],
  },
  // Other years (need admin approval)
  {
    _id: "u10",
    code: "BUS 204",
    name: "Cost Accounting",
    type: "core",
    dept: "BUS",
    year: 2,
    term: 2,
    creditHours: 3,
    slots: [slot("Tue", "14:00", "17:00")],
    instructor: "Mr. Daniel Otieno",
    capacity: 50,
    enrolled: 35,
    prerequisites: [],
  },
  {
    _id: "u11",
    code: "BUS 105",
    name: "Business Law",
    type: "core",
    dept: "BUS",
    year: 2,
    term: 2,
    creditHours: 3,
    slots: [slot("Wed", "14:00", "17:00")],
    instructor: "Mr. Daniel Otieno",
    capacity: 50,
    enrolled: 30,
    prerequisites: [],
  },
  {
    _id: "u13",
    code: "BUS 003",
    name: "Computer Applications",
    type: "core",
    dept: "BUS",
    year: 1,
    term: 2,
    creditHours: 4,
    slots: [slot("Fri", "10:00", "14:00")],
    instructor: "Mr. Samuel Mwangi",
    capacity: 60,
    enrolled: 45,
    prerequisites: [],
  },
  // Other schools (need admin approval)
  {
    _id: "u14",
    code: "ICT 210",
    name: "Database Systems",
    type: "elective",
    dept: "ICT",
    year: 2,
    term: 1,
    creditHours: 3,
    slots: [slot("Tue", "14:00", "17:00")],
    instructor: "Mr. Kevin Ouma",
    capacity: 30,
    enrolled: 18,
    prerequisites: [],
  },
  {
    _id: "u15",
    code: "ENG 150",
    name: "Workshop Safety",
    type: "elective",
    dept: "ENG",
    year: 1,
    term: 1,
    creditHours: 2,
    slots: [slot("Thu", "14:00", "16:00")],
    instructor: "Eng. Paul Kariuki",
    capacity: 40,
    enrolled: 12,
    prerequisites: [],
  },
  // Short courses: enrol any time, one at a time, fee added to your account
  {
    _id: "sc1",
    code: "SC 101",
    name: "Computer Packages",
    type: "short",
    dept: "ICT",
    duration: "3 weeks",
    fee: 4500,
    startDate: plusDays(7),
    instructor: "Mr. Samuel Mwangi",
    capacity: 30,
    enrolled: 12,
    description: "Word, Excel, PowerPoint and email for the workplace.",
    prerequisites: [],
  },
  {
    _id: "sc2",
    code: "SC 102",
    name: "Basic Bookkeeping (QuickBooks)",
    type: "short",
    dept: "BUS",
    duration: "2 months",
    fee: 8000,
    startDate: plusDays(10),
    instructor: "Mr. Daniel Otieno",
    capacity: 25,
    enrolled: 25,
    description:
      "Record transactions and produce basic reports with QuickBooks.",
    prerequisites: [],
  },
  {
    _id: "sc3",
    code: "SC 103",
    name: "Customer Care & Service Excellence",
    type: "short",
    dept: "BUS",
    duration: "1 month",
    fee: 5500,
    startDate: plusDays(14),
    instructor: "Ms. Grace Wairimu",
    capacity: 35,
    enrolled: 9,
    description: "Handling customers, complaints and service recovery.",
    prerequisites: [],
  },
  {
    _id: "sc4",
    code: "SC 104",
    name: "Public Speaking",
    type: "short",
    dept: "BUS",
    duration: "3 weeks",
    fee: 3000,
    startDate: plusDays(5),
    instructor: "Ms. Ruth Njeri",
    capacity: 30,
    enrolled: 14,
    description: "Confidence, structure and delivery for presentations.",
    prerequisites: [],
  },
];

const seed = () => ({
  catalog: seedCatalog,
  window: {},
  charges: [],
  registrations: [
    ["u1", "2026-09-07T09:10:00"],
    ["u2", "2026-09-07T09:12:00"],
    ["u3", "2026-09-07T09:15:00"],
  ].map(([unitId, at], i) => ({
    id: `seed${i}`,
    studentId: students[0]._id,
    unitId,
    status: "registered",
    type: "programme",
    fee: 0,
    requestedAt: at,
    registeredAt: at,
    term: 1,
    academicYear: "2026/2027",
  })),
});

const load = () => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : seed();
  } catch {
    return seed();
  }
};

let state = load();
const listeners = new Set();
const commit = (patch) => {
  state = { ...state, ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* keep in memory */
  }
  listeners.forEach((l) => l());
};
const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useRegistrations = () =>
  useSyncExternalStore(subscribe, () => state).registrations;
export const useCatalog = () =>
  useSyncExternalStore(subscribe, () => state).catalog;
export const useRegistrationWindow = () => ({
  ...defaultWindow(),
  ...useSyncExternalStore(subscribe, () => state).window,
});
export const useCharges = (studentId) =>
  useSyncExternalStore(subscribe, () => state)
    .charges.filter((c) => c.studentId === studentId)
    .sort((a, b) => b.at.localeCompare(a.at));

export const catalogUnit = (id) => state.catalog.find((u) => u._id === id);

// Accepts a unit, a registration, or a unit id.
export const isShortCourse = (x) => {
  const unit =
    typeof x === "string"
      ? catalogUnit(x)
      : x?.unitId
        ? catalogUnit(x.unitId)
        : x;
  return unit?.type === "short";
};

// ---------- rules ----------

export const windowState = (w, now = new Date()) => {
  const t = now.toISOString().slice(0, 10);
  if (t < w.opens) return "upcoming";
  if (t <= w.closes) return "open";
  if (t <= w.lateUntil) return "late";
  return "closed";
};

const ACTIVE = ["registered", "pending"];
const overlap = (a, b) => a.day === b.day && a.start < b.end && b.start < a.end;
// Units only clash when they run in the same semester and their weekly slots overlap.
export const clash = (u1, u2) =>
  u1.term === u2.term &&
  (u1.slots || []).some((s1) => (u2.slots || []).some((s2) => overlap(s1, s2)));

export const creditsOf = (regs) =>
  regs
    .filter((r) => ACTIVE.includes(r.status) && r.type !== "short")
    .reduce((s, r) => s + (catalogUnit(r.unitId)?.creditHours || 0), 0);

export const seatsLeft = (unit) =>
  unit.capacity -
  unit.enrolled -
  state.registrations.filter(
    (r) => r.unitId === unit._id && ACTIVE.includes(r.status),
  ).length;

const completedCodes = (student, regs) => {
  const codes = new Set(
    regs
      .filter((r) => r.status === "completed")
      .map((r) => catalogUnit(r.unitId)?.code),
  );
  if (student._id === students[0]._id)
    transcriptHistory.forEach((p) =>
      p.rows.forEach((r) => r.total >= 40 && codes.add(r.code)),
    );
  return codes;
};

// The single source of truth for "can this student register this unit?".
// admin: true skips window, fees, term and prerequisite rules (used when approving requests).
export const evaluateUnit = (student, unit, { ignoreId, admin } = {}) => {
  const regs = state.registrations.filter(
    (r) => r.studentId === student._id && r.id !== ignoreId,
  );
  const own = regs.find(
    (r) =>
      r.unitId === unit._id &&
      ["registered", "pending", "completed"].includes(r.status),
  );
  if (own)
    return { state: own.status, reasons: [], needsApproval: false, reg: own };

  const w = { ...defaultWindow(), ...state.window };
  const ws = windowState(w);
  const short = unit.type === "short";
  const reasons = [];

  if (!admin) {
    if (!student.feesCleared && !short)
      reasons.push("Clear your fee balance before registering units");
    if (!short) {
      if (ws === "upcoming") reasons.push(`Registration opens on ${w.opens}`);
      if (ws === "closed")
        reasons.push("The registration window has closed. Contact the admin");
      if (
        unit.year === student.year &&
        unit.dept === student.dept &&
        unit.term !== w.term
      )
        reasons.push(`Opens in Semester ${unit.term}`);
      if (completedCodes(student, regs).has(unit.code))
        reasons.push("You have already passed this unit");
      const missing = (unit.prerequisites || []).filter(
        (c) => !completedCodes(student, regs).has(c),
      );
      if (missing.length) reasons.push(`Requires ${missing.join(", ")} first`);
    }
  }
  if (
    short &&
    regs.some((r) => r.type === "short" && r.status === "registered")
  )
    reasons.push("Finish your current short course first");

  if (!short) {
    const active = regs.filter(
      (r) => ACTIVE.includes(r.status) && r.type !== "short",
    );
    const c = active
      .map((r) => catalogUnit(r.unitId))
      .find((u) => u && clash(u, unit));
    if (c) reasons.push(`Clashes with ${c.code} ${c.name}`);
    if (!admin && creditsOf(regs) + unit.creditHours > w.maxCredits)
      reasons.push(`Would go over the ${w.maxCredits} credit-hour limit`);
  }
  if (seatsLeft(unit) <= 0) reasons.push("No seats left");

  return {
    state: reasons.length ? "blocked" : "available",
    reasons,
    needsApproval:
      !short && (unit.dept !== student.dept || unit.year !== student.year),
    lateFee: !short && ws === "late",
  };
};

// ---------- actions ----------

const stamp = () => new Date().toISOString();

export const registerUnits = (student, unitIds) => {
  const w = { ...defaultWindow(), ...state.window };
  return unitIds.map((id) => {
    const unit = catalogUnit(id);
    if (!unit) return { unitId: id, ok: false, reason: "Unit not found" };
    const ev = evaluateUnit(student, unit);
    if (ev.state !== "available")
      return {
        unitId: id,
        ok: false,
        reason: ev.reasons[0] || `Already ${ev.state}`,
      };

    const now = stamp();
    const short = unit.type === "short";
    const status = ev.needsApproval ? "pending" : "registered";
    const reg = {
      id: `r${Date.now()}-${id}`,
      studentId: student._id,
      unitId: id,
      status,
      type: short ? "short" : "programme",
      fee: unit.fee || 0,
      requestedAt: now,
      registeredAt: status === "registered" ? now : null,
      term: w.term,
      academicYear: w.academicYear,
    };
    const charges = [...state.charges];
    if (status === "registered" && unit.fee > 0) {
      charges.push({
        id: `c${Date.now()}-${id}`,
        studentId: student._id,
        registrationId: reg.id,
        kind: "unit",
        description: `${unit.code} ${unit.name}`,
        amount: unit.fee,
        at: now,
      });
    }
    if (
      ev.lateFee &&
      !charges.some(
        (c) =>
          c.studentId === student._id && c.kind === "late" && c.term === w.term,
      )
    ) {
      charges.push({
        id: `cl${Date.now()}`,
        studentId: student._id,
        kind: "late",
        term: w.term,
        description: "Late registration fee",
        amount: w.lateFee,
        at: now,
      });
    }
    commit({ registrations: [reg, ...state.registrations], charges });
    return { unitId: id, ok: true, status };
  });
};

// Students may drop programme units and pending requests while the window is open. Short courses need the admin.
export const dropRegistration = (id) => {
  const reg = state.registrations.find((r) => r.id === id);
  if (!reg || !ACTIVE.includes(reg.status))
    return { ok: false, reason: "This registration can no longer be dropped" };
  if (reg.type === "short" && reg.status === "registered")
    return {
      ok: false,
      reason: "Ask the admin to remove a running short course",
    };
  const ws = windowState({ ...defaultWindow(), ...state.window });
  if (reg.status === "registered" && !["open", "late"].includes(ws))
    return {
      ok: false,
      reason: "The registration window is closed. Contact the admin",
    };
  commit({
    registrations: state.registrations.map((r) =>
      r.id === id
        ? { ...r, status: "dropped", droppedAt: stamp(), decidedAt: stamp() }
        : r,
    ),
  });
  return { ok: true };
};

export const approveRequest = (id) => {
  const reg = state.registrations.find((r) => r.id === id);
  if (!reg || reg.status !== "pending")
    return { ok: false, reason: "This request is no longer pending" };
  const student = students.find((s) => s._id === reg.studentId);
  const unit = catalogUnit(reg.unitId);
  if (!student || !unit)
    return { ok: false, reason: "Student or unit not found" };
  const ev = evaluateUnit(student, unit, { ignoreId: id, admin: true });
  if (ev.state === "blocked") return { ok: false, reason: ev.reasons[0] };
  const now = stamp();
  const charges =
    unit.fee > 0
      ? [
          ...state.charges,
          {
            id: `c${Date.now()}`,
            studentId: student._id,
            registrationId: id,
            kind: "unit",
            description: `${unit.code} ${unit.name}`,
            amount: unit.fee,
            at: now,
          },
        ]
      : state.charges;
  commit({
    registrations: state.registrations.map((r) =>
      r.id === id
        ? { ...r, status: "registered", registeredAt: now, decidedAt: now }
        : r,
    ),
    charges,
  });
  return { ok: true };
};

export const rejectRequest = (id) => {
  const reg = state.registrations.find((r) => r.id === id);
  if (!reg || reg.status !== "pending")
    return { ok: false, reason: "This request is no longer pending" };
  const now = stamp();
  commit({
    registrations: state.registrations.map((r) =>
      r.id === id
        ? { ...r, status: "rejected", rejectedAt: now, decidedAt: now }
        : r,
    ),
  });
  return { ok: true };
};

export const completeRegistration = (id) => {
  const reg = state.registrations.find((r) => r.id === id);
  if (!reg || reg.status !== "registered")
    return { ok: false, reason: "This registration is not active" };
  const now = stamp();
  commit({
    registrations: state.registrations.map((r) =>
      r.id === id
        ? { ...r, status: "completed", completedAt: now, decidedAt: now }
        : r,
    ),
  });
  return { ok: true };
};

export const setRegistrationWindow = (patch) =>
  commit({ window: { ...state.window, ...patch } });

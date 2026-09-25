import { useSyncExternalStore } from "react";

// Tiny shared store so the student, teacher and admin attachment pages see the
// same data during the frontend-only phase. Persisted in localStorage.
// TODO(api): replace each action with a request to the attachments endpoints.

// Assessment weights (percent) — make these configurable per programme later.
export const weights = { logbook: 20, assessment: 30, host: 30, report: 20 };

const KEY = "portal-mock-attachments-v2";

const seed = {
  placements: [
    {
      id: "a1",
      studentId: "s2",
      studentName: "Brian Otieno",
      admissionNumber: "BUS/00002/026",
      department: "Business",
      organisation: "Kenya Commercial Traders",
      location: "Nairobi",
      supervisor: {
        name: "Mary Njeri",
        phone: "0712 000 000",
        email: "mary@kct.co.ke",
      },
      start: "2026-05-04",
      end: "2026-08-14",
      status: "approved",
      logbook: [
        {
          id: "l1",
          week: 1,
          activities: "Orientation and shadowing the accounts team.",
          skills: "Filing, ledger basics",
          signed: true,
        },
        {
          id: "l2",
          week: 2,
          activities: "Captured supplier invoices in the accounting system.",
          skills: "Data entry, reconciliation",
          signed: false,
        },
      ],
      instructor: "Dev Teacher",
      assessment: null, // { date, time, venue } once scheduled
      remarks: "",
      scores: { logbook: null, assessment: null, host: null, report: null },
    },
  ],
};

const load = () => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : seed;
  } catch {
    return seed;
  }
};

let state = load();
const listeners = new Set();
const commit = (next) => {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
};
const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useAttachments = () =>
  useSyncExternalStore(subscribe, () => state).placements;

const patch = (id, fn) =>
  commit({
    placements: state.placements.map((p) => (p.id === id ? fn(p) : p)),
  });

export const actions = {
  submit: (data) =>
    commit({
      placements: [
        {
          ...data,
          id: `a${Date.now()}`,
          status: "submitted",
          logbook: [],
          instructor: null,
          assessment: null,
          remarks: "",
          scores: { logbook: null, assessment: null, host: null, report: null },
        },
        ...state.placements,
      ],
    }),
  setStatus: (id, status) => patch(id, (p) => ({ ...p, status })),
  remove: (id) =>
    commit({ placements: state.placements.filter((p) => p.id !== id) }),
  addLog: (id, entry) =>
    patch(id, (p) => ({
      ...p,
      logbook: [
        ...p.logbook,
        {
          ...entry,
          id: `l${Date.now()}`,
          week: p.logbook.length + 1,
          signed: false,
        },
      ],
    })),
  toggleSign: (id, logId) =>
    patch(id, (p) => ({
      ...p,
      logbook: p.logbook.map((l) =>
        l.id === logId ? { ...l, signed: !l.signed } : l,
      ),
    })),
  approve: (id, instructor) =>
    patch(id, (p) => ({ ...p, status: "approved", instructor })),
  schedule: (id, assessment) => patch(id, (p) => ({ ...p, assessment })),
  finalise: (id, remarks) =>
    patch(id, (p) => ({ ...p, remarks, status: "completed" })),
  setScore: (id, key, value) =>
    patch(id, (p) => ({
      ...p,
      scores: { ...p.scores, [key]: value === "" ? null : Number(value) },
    })),
};

// Weighted final attachment mark (0-100), or null until every component is in.
export const finalMark = (p) => {
  const parts = p.scores;
  if (
    !parts ||
    Object.keys(weights).some(
      (k) => parts[k] === null || parts[k] === undefined,
    )
  )
    return null;
  return Math.round(
    Object.keys(weights).reduce((s, k) => s + (parts[k] * weights[k]) / 100, 0),
  );
};

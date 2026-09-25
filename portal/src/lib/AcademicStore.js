import { useSyncExternalStore } from "react";

// Shared demo store for Semesters/intakes and Unit assignment (instructor-per-unit-per-semester).
// Persisted in localStorage. TODO(api): replace each action with an endpoint call.

const KEY = "portal-mock-academic-v1";

// TODO(api): instructors belong in their own module (Admin > Instructors is still a
// placeholder). Minimal seed here so Unit assignment has someone to pick from —
// swap this for a real instructor list once that page exists.
export const instructors = [
  { _id: "t1", fullName: "Dev Teacher", dept: "BUS" },
  { _id: "t2", fullName: "Grace Wambui", dept: "BUS" },
  { _id: "t3", fullName: "Peter Kamau", dept: "ICT" },
  { _id: "t4", fullName: "Susan Achieng", dept: "ENG" },
];

const seed = {
  semesters: [
    {
      _id: "sem1",
      label: "Semester 1, 2026",
      startDate: "2026-09-01",
      endDate: "2026-12-19",
      registrationOpens: "2026-08-18",
      registrationCloses: "2026-09-05",
    },
  ],
  // assignments[semesterId][unitId] = instructorId
  assignments: {},
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
const commit = (patch) => {
  state = { ...state, ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full: keep in memory */
  }
  listeners.forEach((l) => l());
};
const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useAcademic = () => useSyncExternalStore(subscribe, () => state);

export const actions = {
  addSemester: (data) =>
    commit({
      semesters: [{ ...data, _id: `sem${Date.now()}` }, ...state.semesters],
    }),
  updateSemester: (id, patch) =>
    commit({
      semesters: state.semesters.map((s) =>
        s._id === id ? { ...s, ...patch } : s,
      ),
    }),
  deleteSemester: (id) => {
    const assignments = { ...state.assignments };
    delete assignments[id];
    commit({
      semesters: state.semesters.filter((s) => s._id !== id),
      assignments,
    });
  },

  setAssignment: (semesterId, unitId, instructorId) =>
    commit({
      assignments: {
        ...state.assignments,
        [semesterId]: {
          ...state.assignments[semesterId],
          [unitId]: instructorId || undefined,
        },
      },
    }),
};

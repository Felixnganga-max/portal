import { useSyncExternalStore } from "react";

// Shared demo store for teaching data, so the instructor and student dashboards
// see the same assignments, submissions, marks and published results.
// Persisted in localStorage. TODO(api): replace each action with an endpoint call.

const KEY = "portal-mock-teaching-v1";

// Every unit starts with a CAT (from assignments) and a main exam (entered by hand).
// Teachers can add more components, e.g. "Practical" or "Project", per unit.
export const defaultComponents = () => [
  { id: "cat", name: "CAT", weight: 30, mode: "assignments" },
  { id: "exam", name: "Main exam", weight: 70, mode: "manual" },
];

const seed = {
  components: {},
  assignments: [
    {
      id: "as1",
      unitId: "u1",
      title: "Case study: Leadership styles",
      description:
        "Read the case handout and write a 2-page analysis of the leadership style used.",
      due: "2026-10-05",
      outOf: 20,
      componentId: "cat",
      online: true,
      file: null,
      createdAt: "2026-09-10",
    },
  ],
  submissions: [
    {
      id: "sb1",
      assignmentId: "as1",
      studentId: "s2",
      studentName: "Brian Otieno",
      text: "The manager mostly uses a democratic style because…",
      file: null,
      submittedAt: "2026-09-15T10:00:00",
    },
  ],
  marks: {
    as1: { s2: { mark: 15, feedback: "Good analysis, add more examples." } },
  },
  manual: {},
  published: {},
  attendance: {},
  materials: [],
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

export const useTeaching = () => useSyncExternalStore(subscribe, () => state);

export const componentsFor = (st, unitId) =>
  st.components[unitId] || defaultComponents();

export const actions = {
  setComponents: (unitId, list) =>
    commit({ components: { ...state.components, [unitId]: list } }),

  addAssignment: (a) =>
    commit({
      assignments: [
        {
          ...a,
          id: `as${Date.now()}`,
          createdAt: new Date().toISOString().slice(0, 10),
        },
        ...state.assignments,
      ],
    }),
  removeAssignment: (id) => {
    const marks = { ...state.marks };
    delete marks[id];
    commit({
      assignments: state.assignments.filter((a) => a.id !== id),
      submissions: state.submissions.filter((s) => s.assignmentId !== id),
      marks,
    });
  },

  // A student can resubmit until the teacher has graded the work.
  submitWork: ({ assignmentId, studentId, studentName, text, file }) =>
    commit({
      submissions: [
        {
          id: `sb${Date.now()}`,
          assignmentId,
          studentId,
          studentName,
          text,
          file,
          submittedAt: new Date().toISOString(),
        },
        ...state.submissions.filter(
          (s) =>
            !(s.assignmentId === assignmentId && s.studentId === studentId),
        ),
      ],
    }),

  saveMarks: (assignmentId, byStudent) =>
    commit({ marks: { ...state.marks, [assignmentId]: byStudent } }),

  setManual: (unitId, studentId, componentId, value) =>
    commit({
      manual: {
        ...state.manual,
        [unitId]: {
          ...state.manual[unitId],
          [studentId]: {
            ...state.manual[unitId]?.[studentId],
            [componentId]: value,
          },
        },
      },
    }),

  setPublished: (unitId, value) =>
    commit({ published: { ...state.published, [unitId]: value } }),

  saveAttendance: (unitId, date, map) =>
    commit({
      attendance: {
        ...state.attendance,
        [unitId]: { ...state.attendance[unitId], [date]: map },
      },
    }),

  addMaterial: (m) =>
    commit({
      materials: [
        { ...m, id: `m${Date.now()}`, postedAt: new Date().toISOString() },
        ...state.materials,
      ],
    }),
  removeMaterial: (id) =>
    commit({ materials: state.materials.filter((m) => m.id !== id) }),
};

const sum = (arr) => arr.reduce((s, n) => s + n, 0);
const round1 = (n) => Math.round(n * 10) / 10;

// Score per component, then the unit total. Assignment-based components add up
// every linked assignment (unmarked work counts as 0); manual components are typed in.
export const computeResult = (st, unitId, studentId) => {
  const parts = componentsFor(st, unitId).map((component) => {
    if (component.mode === "assignments") {
      const linked = st.assignments.filter(
        (a) => a.unitId === unitId && a.componentId === component.id,
      );
      if (!linked.length)
        return { component, score: null, note: "No assignments linked yet" };
      const outOf = sum(linked.map((a) => Number(a.outOf)));
      const earned = sum(
        linked.map((a) => Number(st.marks[a.id]?.[studentId]?.mark ?? 0)),
      );
      return {
        component,
        score: round1((earned / outOf) * component.weight),
        earned,
        outOf,
      };
    }
    const v = st.manual[unitId]?.[studentId]?.[component.id];
    return { component, score: v === undefined || v === "" ? null : Number(v) };
  });
  const complete = parts.every((p) => p.score !== null);
  return {
    parts,
    complete,
    total: complete ? Math.round(sum(parts.map((p) => p.score))) : null,
  };
};

export const isLate = (assignment, submission) =>
  submission &&
  new Date(submission.submittedAt) > new Date(`${assignment.due}T23:59:59`);

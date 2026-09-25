import { useSyncExternalStore } from "react";

// Assignments, submissions, marks, deadlines and weighting rules.
// Demo phase: persisted in localStorage. TODO(api): replace each action with an endpoint,
// and enforce submissionWindow() and the file rules on the server too.
//
// INTEGRATION: teachingStore.computeResult() should call componentAssignmentScore()
// for components whose mode is "assignments" (see the patch in the chat).

const KEY = "portal-mock-assignments-v1";

const pad = (n) => String(n).padStart(2, "0");
export const toLocalInput = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
export const inDays = (n, hh = 17, mm = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(hh, mm, 0, 0);
  return toLocalInput(d);
};

const online = {
  text: true,
  files: true,
  link: false,
  maxFiles: 3,
  maxSizeMB: 5,
  types: ["pdf", "doc", "docx"],
};
const base = {
  status: "published",
  submitMode: "online",
  accept: online,
  briefFiles: [],
  requireDeclaration: true,
  released: false,
  latePolicy: { mode: "none" },
  description: "",
};

const seed = () => ({
  assignments: [
    {
      ...base,
      id: "as1",
      unitId: "u1",
      title: "Case study: Leadership styles",
      description:
        "Read the case handout and write a two-page analysis of the leadership style used, with two recommendations.",
      kind: "graded",
      componentId: "cat",
      outOf: 20,
      weight: 40,
      opensAt: inDays(-10, 8),
      dueAt: inDays(5),
      latePolicy: {
        mode: "penalty",
        cutoffAt: inDays(8),
        penaltyPerDay: 10,
        maxPenalty: 30,
      },
      createdAt: inDays(-11),
    },
    {
      ...base,
      id: "as2",
      unitId: "u1",
      title: "Group presentation slides",
      description:
        "Submit the slide deck for your group presentation. One member submits for the group.",
      kind: "graded",
      componentId: "cat",
      outOf: 30,
      weight: 60,
      opensAt: inDays(-3, 8),
      dueAt: inDays(12),
      latePolicy: { mode: "flag" },
      accept: { ...online, types: ["ppt", "pptx", "pdf"], maxSizeMB: 10 },
      createdAt: inDays(-4),
    },
    {
      ...base,
      id: "as3",
      unitId: "u1",
      title: "Reading quiz (practice)",
      description:
        "Try this before the CAT. It is not graded, but your teacher will comment on your answers.",
      kind: "practice",
      componentId: null,
      outOf: null,
      weight: null,
      opensAt: inDays(-2, 8),
      dueAt: inDays(3),
      latePolicy: { mode: "flag" },
      requireDeclaration: false,
      accept: { ...online, files: false, text: true },
      createdAt: inDays(-2),
    },
    {
      ...base,
      id: "as4",
      unitId: "u2",
      title: "Business memo",
      description:
        "Write a one-page memo to a manager recommending a change to office hours.",
      kind: "graded",
      componentId: "cat",
      outOf: 25,
      weight: 50,
      opensAt: inDays(-14, 8),
      dueAt: inDays(-2),
      createdAt: inDays(-15),
    },
    {
      ...base,
      id: "as5",
      unitId: "u2",
      title: "Oral assessment",
      description: "Marked in class.",
      kind: "graded",
      componentId: "cat",
      outOf: 25,
      weight: 50,
      submitMode: "offline",
      opensAt: "",
      dueAt: inDays(-6),
      released: true,
      requireDeclaration: false,
      createdAt: inDays(-16),
    },
    {
      ...base,
      id: "as6",
      unitId: "u3",
      title: "Lab logbook (compulsory)",
      description:
        "Keep your accounting lab logbook up to date. You must complete it to sit the exam.",
      kind: "compulsory",
      componentId: null,
      outOf: null,
      weight: null,
      opensAt: inDays(-7, 8),
      dueAt: inDays(20),
      accept: { ...online, types: ["pdf", "xlsx"] },
      createdAt: inDays(-8),
    },
    {
      ...base,
      id: "as7",
      unitId: "u3",
      title: "Bonus: Excel modelling challenge",
      description:
        "Optional. Build a small cash-flow model. Adds up to 5% bonus to your CAT.",
      kind: "extra",
      componentId: "cat",
      outOf: 10,
      bonus: 5,
      opensAt: inDays(-1, 8),
      dueAt: inDays(9),
      latePolicy: { mode: "none" },
      accept: { ...online, types: ["xls", "xlsx"] },
      createdAt: inDays(-2),
    },
    {
      ...base,
      id: "as8",
      unitId: "u3",
      title: "Ledger exercise",
      description:
        "Post the transactions to the ledger and extract a trial balance.",
      kind: "graded",
      componentId: "cat",
      outOf: 20,
      weight: 50,
      opensAt: inDays(-12, 8),
      dueAt: inDays(-1),
      latePolicy: {
        mode: "penalty",
        cutoffAt: inDays(3),
        penaltyPerDay: 10,
        maxPenalty: 20,
      },
      createdAt: inDays(-13),
    },
    {
      ...base,
      id: "as9",
      unitId: "u3",
      title: "Trial balance drill",
      description: "Timed drill in class.",
      kind: "graded",
      componentId: "cat",
      outOf: 20,
      weight: 50,
      submitMode: "offline",
      opensAt: "",
      dueAt: inDays(-4),
      requireDeclaration: false,
      createdAt: inDays(-10),
    },
  ],
  submissions: [
    {
      id: "sb1",
      assignmentId: "as1",
      studentId: "s2",
      studentName: "Brian Otieno",
      text: "The manager mostly uses a democratic style because staff are consulted before decisions…",
      files: [],
      link: "",
      declaration: true,
      submittedAt: inDays(-1, 10),
      version: 1,
      history: [],
      penalty: 0,
      late: false,
    },
    {
      id: "sb2",
      assignmentId: "as4",
      studentId: "s1",
      studentName: "Amina Wanjiku",
      text: "To: Operations Manager\nSubject: Proposed change to office hours…",
      files: [],
      link: "",
      declaration: true,
      submittedAt: inDays(-3, 15),
      version: 1,
      history: [],
      penalty: 0,
      late: false,
    },
    {
      id: "sb3",
      assignmentId: "as4",
      studentId: "s3",
      studentName: "Cynthia Mwende",
      text: "Dear Manager, I recommend staggered start times…",
      files: [],
      link: "",
      declaration: true,
      submittedAt: inDays(-3, 9),
      version: 1,
      history: [],
      penalty: 0,
      late: false,
    },
    {
      id: "sb4",
      assignmentId: "as8",
      studentId: "s1",
      studentName: "Amina Wanjiku",
      text: "Ledger posted and trial balance extracted. Totals agree at KES 412,000.",
      files: [],
      link: "",
      declaration: true,
      submittedAt: inDays(0, 9),
      version: 1,
      history: [],
      penalty: 10,
      late: true,
      lateDays: 1,
    },
  ],
  marks: {
    as4: {
      s1: {
        mark: 20,
        feedback: "Clear structure and tone. Watch the closing paragraph.",
      },
      s3: { mark: 22, feedback: "Excellent." },
    },
    as5: {
      s1: { mark: 21 },
      s2: { mark: 17 },
      s3: { mark: 23, feedback: "Confident delivery." },
      s4: { mark: 14 },
      s5: { mark: 19 },
      s6: { mark: 12 },
    },
    as9: { s1: { mark: 16 }, s2: { mark: 15 }, s3: { mark: 18 } },
  },
  extensions: { as4: { s2: inDays(1, 17) } },
  rules: {},
  overrides: {},
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
    /* storage full: keep in memory */
  }
  listeners.forEach((l) => l());
};
const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
export const useAssignments = () =>
  useSyncExternalStore(subscribe, () => state);
export const getAssignmentState = () => state;

const round1 = (n) => Math.round(n * 10) / 10;
const now = () => new Date();

// ---------- lookups ----------

export const submissionOf = (assignmentId, studentId) =>
  state.submissions.find(
    (s) => s.assignmentId === assignmentId && s.studentId === studentId,
  );
export const markOf = (assignmentId, studentId) =>
  state.marks[assignmentId]?.[studentId];
export const deadlineFor = (a, studentId) =>
  (studentId && state.extensions[a.id]?.[studentId]) || a.dueAt;

// ---------- deadlines ----------

export const assignmentPhase = (a, at = now()) => {
  if (a.status === "draft") return "draft";
  if (a.opensAt && new Date(a.opensAt) > at) return "scheduled";
  if (at <= new Date(a.dueAt)) return "open";
  const lp = a.latePolicy || { mode: "none" };
  if (lp.mode === "flag") return "late-open";
  if (lp.mode === "penalty" && (!lp.cutoffAt || at <= new Date(lp.cutoffAt)))
    return "late-open";
  return "closed";
};

// Can this student hand in right now, and at what cost?
export const submissionWindow = (a, studentId, at = now()) => {
  if (a.status === "draft")
    return { canSubmit: false, reason: "Not published yet" };
  if (a.submitMode === "offline")
    return { canSubmit: false, reason: "Handed in offline" };
  if (a.opensAt && new Date(a.opensAt) > at)
    return { canSubmit: false, reason: "Not open yet" };
  const due = new Date(deadlineFor(a, studentId));
  if (at <= due)
    return { canSubmit: true, late: false, penalty: 0, lateDays: 0 };
  const days = Math.max(1, Math.ceil((at - due) / 86400000));
  const lp = a.latePolicy || { mode: "none" };
  if (lp.mode === "flag")
    return { canSubmit: true, late: true, penalty: 0, lateDays: days };
  if (lp.mode === "penalty") {
    if (lp.cutoffAt && at > new Date(lp.cutoffAt))
      return {
        canSubmit: false,
        reason: "Closed. The late cut-off has passed",
      };
    return {
      canSubmit: true,
      late: true,
      penalty: Math.min(lp.maxPenalty ?? 100, days * (lp.penaltyPerDay || 0)),
      lateDays: days,
    };
  }
  return { canSubmit: false, reason: "The deadline has passed" };
};

// ---------- marks and results ----------

// Mark after any late penalty (unless waived). null until marked.
export const finalMark = (a, studentId) => {
  const m = markOf(a.id, studentId);
  if (!m || m.mark === "" || m.mark == null) return null;
  const pen = m.waived ? 0 : submissionOf(a.id, studentId)?.penalty || 0;
  return round1(Number(m.mark) * (1 - pen / 100));
};

export const ruleFor = (unitId, componentId) =>
  state.rules[unitId]?.[componentId] || { mode: "percent", bestN: 3 };

// Score of one "from assignments" component, in points out of the component's weight.
// Returns null when no graded assignment is linked. Used by teachingStore.computeResult().
export const componentAssignmentScore = (unitId, component, studentId) => {
  const linked = state.assignments.filter(
    (a) =>
      a.unitId === unitId &&
      a.componentId === component.id &&
      a.status !== "draft",
  );
  const graded = linked.filter((a) => a.kind === "graded");
  if (!graded.length) return null;

  const fractions = graded.map((a) => ({
    a,
    f: (finalMark(a, studentId) ?? 0) / Number(a.outOf),
  }));
  const rule = ruleFor(unitId, component.id);
  let frac;
  if (rule.mode === "equal") {
    frac = fractions.reduce((s, x) => s + x.f, 0) / fractions.length;
  } else if (rule.mode === "best") {
    const top = [...fractions]
      .sort((x, y) => y.f - x.f)
      .slice(0, Math.max(1, Math.min(rule.bestN || 1, fractions.length)));
    frac = top.reduce((s, x) => s + x.f, 0) / top.length;
  } else {
    const total =
      fractions.reduce((s, x) => s + Number(x.a.weight || 0), 0) || 1;
    frac =
      fractions.reduce((s, x) => s + x.f * Number(x.a.weight || 0), 0) / total;
  }
  const bonus = linked
    .filter((a) => a.kind === "extra")
    .reduce(
      (s, a) =>
        s +
        ((finalMark(a, studentId) ?? 0) / Number(a.outOf)) *
          (Number(a.bonus || 0) / 100),
      0,
    );
  const score = Math.min(
    component.weight,
    round1((frac + bonus) * component.weight),
  );
  return { score, earned: score, outOf: component.weight };
};

// Compulsory assignments a student has not completed yet (for exam eligibility checks).
export const compulsoryGaps = (unitId, studentId) =>
  state.assignments.filter(
    (a) =>
      a.unitId === unitId &&
      a.kind === "compulsory" &&
      a.status !== "draft" &&
      markOf(a.id, studentId)?.status !== "complete",
  );

// A teacher can let a student sit the exam despite outstanding compulsory work.
export const hasEligibilityOverride = (unitId, studentId) =>
  !!state.overrides?.[unitId]?.[studentId];

// Class-level numbers for one assignment.
export const statsFor = (a, classIds) => {
  const subs = state.submissions.filter(
    (s) => s.assignmentId === a.id && classIds.includes(s.studentId),
  );
  const marked = classIds.filter((id) => {
    const m = markOf(a.id, id);
    return a.kind === "graded" || a.kind === "extra"
      ? m && m.mark !== "" && m.mark != null
      : !!m?.status;
  });
  const finals = classIds
    .map((id) => finalMark(a, id))
    .filter((v) => v !== null);
  return {
    enrolled: classIds.length,
    submitted: subs.length,
    late: subs.filter((s) => s.late).length,
    marked: marked.length,
    toMark:
      a.submitMode === "offline"
        ? classIds.length - marked.length
        : subs.filter((s) => !marked.includes(s.studentId)).length,
    average: finals.length
      ? round1(finals.reduce((s, v) => s + v, 0) / finals.length)
      : null,
  };
};

// ---------- actions ----------

export const actions = {
  addAssignment: (a) => {
    const id = `as${Date.now()}`;
    commit({
      assignments: [
        { ...a, id, createdAt: toLocalInput(now()) },
        ...state.assignments,
      ],
    });
    return id;
  },
  updateAssignment: (id, patch) =>
    commit({
      assignments: state.assignments.map((a) =>
        a.id === id ? { ...a, ...patch } : a,
      ),
    }),
  duplicateAssignment: (id) => {
    const a = state.assignments.find((x) => x.id === id);
    if (!a) return null;
    const copy = `as${Date.now()}`;
    commit({
      assignments: [
        {
          ...a,
          id: copy,
          title: `Copy of ${a.title}`,
          status: "draft",
          released: false,
          createdAt: toLocalInput(now()),
        },
        ...state.assignments,
      ],
    });
    return copy;
  },
  removeAssignment: (id) => {
    const marks = { ...state.marks };
    const extensions = { ...state.extensions };
    delete marks[id];
    delete extensions[id];
    commit({
      assignments: state.assignments.filter((a) => a.id !== id),
      submissions: state.submissions.filter((s) => s.assignmentId !== id),
      marks,
      extensions,
    });
  },

  // A student hands in (or replaces) work. Replacing is allowed until the work is marked and released.
  submitWork: ({ assignmentId, studentId, studentName, text, files, link }) => {
    const a = state.assignments.find((x) => x.id === assignmentId);
    if (!a) return { ok: false, reason: "Assignment not found" };
    const win = submissionWindow(a, studentId);
    if (!win.canSubmit) return { ok: false, reason: win.reason };
    if (a.released && markOf(assignmentId, studentId))
      return { ok: false, reason: "This work has already been marked" };
    const existing = submissionOf(assignmentId, studentId);
    const at = toLocalInput(now());
    const sub = {
      id: existing?.id || `sb${Date.now()}`,
      assignmentId,
      studentId,
      studentName,
      text: text || "",
      files: files || [],
      link: link || "",
      declaration: true,
      submittedAt: at,
      version: (existing?.version || 0) + 1,
      history: [
        ...(existing?.history || []),
        ...(existing
          ? [
              {
                at: existing.submittedAt,
                version: existing.version,
                files: existing.files.length,
              },
            ]
          : []),
      ],
      penalty: win.penalty,
      late: win.late,
      lateDays: win.lateDays,
    };
    commit({
      submissions: [
        sub,
        ...state.submissions.filter(
          (s) =>
            !(s.assignmentId === assignmentId && s.studentId === studentId),
        ),
      ],
    });
    return { ok: true, late: win.late, penalty: win.penalty };
  },

  saveMark: (assignmentId, studentId, entry) =>
    commit({
      marks: {
        ...state.marks,
        [assignmentId]: {
          ...state.marks[assignmentId],
          [studentId]: { ...state.marks[assignmentId]?.[studentId], ...entry },
        },
      },
    }),
  saveMarksBulk: (assignmentId, byStudent) =>
    commit({
      marks: {
        ...state.marks,
        [assignmentId]: { ...state.marks[assignmentId], ...byStudent },
      },
    }),
  releaseMarks: (assignmentId, released) =>
    commit({
      assignments: state.assignments.map((a) =>
        a.id === assignmentId ? { ...a, released } : a,
      ),
    }),

  grantExtension: (assignmentId, studentId, until) => {
    const forAssignment = { ...state.extensions[assignmentId] };
    if (until) forAssignment[studentId] = until;
    else delete forAssignment[studentId];
    commit({
      extensions: { ...state.extensions, [assignmentId]: forAssignment },
    });
  },

  setEligibilityOverride: (unitId, studentId, value) =>
    commit({
      overrides: {
        ...state.overrides,
        [unitId]: { ...state.overrides?.[unitId], [studentId]: value },
      },
    }),

  setRule: (unitId, componentId, rule) =>
    commit({
      rules: {
        ...state.rules,
        [unitId]: {
          ...state.rules[unitId],
          [componentId]: { ...ruleFor(unitId, componentId), ...rule },
        },
      },
    }),
};

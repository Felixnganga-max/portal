import { useSyncExternalStore } from "react";
import { programmes as seedProgrammes, units as seedUnits } from "./mockData";

// Shared demo store for Programs & Units, same shape as teachingStore/attachmentStore.
// Persisted in localStorage. TODO(api): replace each action with an endpoint call.

const KEY = "portal-mock-programs-v1";

// Reshape the flat mockData.programmes/units into this store's richer shape, once, at seed time.
// mockData still has `years` on programmes and no creditHours/prerequisites on units — normalise here
// rather than editing mockData, since other pages (Admissions, Promotion) still read the old shape.
const seedProgramsFromMock = () =>
  seedProgrammes.map((p) => ({
    _id: p._id,
    code: p.code || p._id.toUpperCase(),
    name: p.name,
    dept: p.dept,
    level: (p.years || 1) >= 2 ? "diploma" : "certificate",
    duration: p.duration || { value: p.years || 1, unit: "years" },
    // TODO(api): real per-program structure. Seeding every unit into period 1 so the
    // list/detail pages have something to show; adjust per program once this is live.
    structure: [{ period: 1, unitIds: seedUnits.map((u) => u._id) }],
    status: "active",
  }));

const seedUnitsFromMock = () =>
  seedUnits.map((u) => ({
    _id: u._id,
    code: u.code,
    name: u.name,
    creditHours: u.creditHours || 3,
    prerequisiteIds: u.prerequisiteIds || [],
  }));

const seed = {
  programs: seedProgramsFromMock(),
  units: seedUnitsFromMock(),
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

export const usePrograms = () => useSyncExternalStore(subscribe, () => state);

// Derived helpers — keep scoring/roster logic here, not in the pages.
export const unitsInProgram = (st, programId) => {
  const p = st.programs.find((pr) => pr._id === programId);
  if (!p) return [];
  const ids = new Set(p.structure.flatMap((s) => s.unitIds));
  return st.units.filter((u) => ids.has(u._id));
};

export const programsUsingUnit = (st, unitId) =>
  st.programs.filter((p) =>
    p.structure.some((s) => s.unitIds.includes(unitId)),
  );

export const actions = {
  addProgram: (data) =>
    commit({
      programs: [
        {
          ...data,
          _id: `p${Date.now()}`,
          structure: data.structure || [],
          status: "active",
        },
        ...state.programs,
      ],
    }),
  updateProgram: (id, patch) =>
    commit({
      programs: state.programs.map((p) =>
        p._id === id ? { ...p, ...patch } : p,
      ),
    }),
  deleteProgram: (id) =>
    commit({ programs: state.programs.filter((p) => p._id !== id) }),
  setProgramStructure: (id, structure) =>
    commit({
      programs: state.programs.map((p) =>
        p._id === id ? { ...p, structure } : p,
      ),
    }),

  addUnit: (data) =>
    commit({ units: [{ ...data, _id: `u${Date.now()}` }, ...state.units] }),
  updateUnit: (id, patch) =>
    commit({
      units: state.units.map((u) => (u._id === id ? { ...u, ...patch } : u)),
    }),
  // Deleting a unit strips it out of every program's structure too, so nothing dangles.
  deleteUnit: (id) =>
    commit({
      units: state.units.filter((u) => u._id !== id),
      programs: state.programs.map((p) => ({
        ...p,
        structure: p.structure.map((s) => ({
          ...s,
          unitIds: s.unitIds.filter((uid) => uid !== id),
        })),
      })),
    }),
};

import Panel, { PageHeader, StatusPill } from "../../components/layouts/Panel";
import { units, classFor } from "../../lib/mockData";
import {
  useTeaching,
  componentsFor,
  computeResult,
} from "../../lib/teachingStore";

// Admin's cross-unit view: where does every unit stand on setup, marking and release.
// Read-only — actual marking still happens on the instructor's own Results page.
// Note: classFor(unitId) currently ignores its argument and always returns the same
// BUS/p1 class (see mockData.js) — same limitation instructor/Results.jsx already has.
// Fix classFor once Programs & Units has real per-unit rosters; this page will pick it up for free.
const AdminResults = () => {
  const st = useTeaching();

  const rows = units.map((u) => {
    const comps = componentsFor(st, u._id);
    const weightSum = comps.reduce((s, c) => s + Number(c.weight || 0), 0);
    const klass = classFor(u._id);
    const results = klass.map((s) => computeResult(st, u._id, s._id));
    const complete = results.filter((r) => r.complete);
    const avg = complete.length
      ? Math.round(complete.reduce((s, r) => s + r.total, 0) / complete.length)
      : null;
    return {
      unit: u,
      weightSum,
      studentCount: klass.length,
      markedCount: complete.length,
      published: !!st.published[u._id],
      avg,
    };
  });

  return (
    <div>
      <PageHeader
        title="Results"
        subtitle="Cross-unit view of assessment setup, marking progress and release status"
      />
      <Panel flush>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-subtle text-xs bg-canvas">
                <th className="px-5 py-2.5 font-medium">Unit</th>
                <th className="px-5 py-2.5 font-medium">Assessment setup</th>
                <th className="px-5 py-2.5 font-medium">Marked</th>
                <th className="px-5 py-2.5 font-medium">Average</th>
                <th className="px-5 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(
                ({
                  unit,
                  weightSum,
                  studentCount,
                  markedCount,
                  published,
                  avg,
                }) => (
                  <tr key={unit._id} className="border-t border-line">
                    <td className="px-5 py-3">
                      <p className="font-semibold">{unit.name}</p>
                      <p className="text-xs text-subtle font-mono">
                        {unit.code}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={
                          weightSum === 100 ? "text-good" : "text-badge"
                        }
                      >
                        {weightSum}%{weightSum !== 100 && " (incomplete)"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {markedCount}/{studentCount}
                    </td>
                    <td className="px-5 py-3">{avg ?? "—"}</td>
                    <td className="px-5 py-3">
                      <StatusPill status={published ? "published" : "draft"} />
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
};

export default AdminResults;

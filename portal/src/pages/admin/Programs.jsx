import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus } from "lucide-react";
import Panel, {
  PageHeader,
  StatusPill,
  OutlineButton,
} from "../../components/layouts/Panel";
import { departments } from "../../lib/mockData";
import { usePrograms, unitsInProgram } from "../../lib/programStore";
import { durationLabel } from "../../lib/duration";

const deptName = (code) =>
  departments.find((d) => d.code === code)?.name || code;

const Programs = () => {
  const st = usePrograms();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const rows = st.programs.filter((p) =>
    `${p.name} ${p.code} ${deptName(p.dept)}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        title="Programs"
        subtitle="Every course the college runs, its duration, and the units that make it up"
        actions={
          <button
            onClick={() => navigate("/admin/programs/new")}
            className="flex items-center gap-1.5 bg-ink text-white rounded px-4 py-2 text-xs font-semibold hover:bg-ink/90"
          >
            <Plus size={14} /> Add program
          </button>
        }
      />

      <Panel flush>
        <div className="p-4 border-b border-line">
          <div className="relative max-w-xs">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search programs"
              className="w-full border border-line rounded pl-9 pr-3 py-2 text-[13px] focus:outline-none focus:border-ink"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-subtle text-xs bg-canvas">
                <th className="px-5 py-2.5 font-medium">Program</th>
                <th className="px-5 py-2.5 font-medium">Department</th>
                <th className="px-5 py-2.5 font-medium">Level</th>
                <th className="px-5 py-2.5 font-medium">Duration</th>
                <th className="px-5 py-2.5 font-medium">Units</th>
                <th className="px-5 py-2.5 font-medium">Status</th>
                <th className="px-5 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr
                  key={p._id}
                  className="border-t border-line hover:bg-canvas"
                >
                  <td className="px-5 py-3">
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-xs text-subtle font-mono">{p.code}</p>
                  </td>
                  <td className="px-5 py-3">{deptName(p.dept)}</td>
                  <td className="px-5 py-3 capitalize">{p.level}</td>
                  <td className="px-5 py-3">{durationLabel(p.duration)}</td>
                  <td className="px-5 py-3">
                    {unitsInProgram(st, p._id).length}
                  </td>
                  <td className="px-5 py-3">
                    <StatusPill status={p.status} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <OutlineButton
                      onClick={() => navigate(`/admin/programs/${p._id}`)}
                    >
                      View
                    </OutlineButton>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-subtle"
                  >
                    No programs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
};

export default Programs;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus } from "lucide-react";
import Panel, {
  PageHeader,
  OutlineButton,
} from "../../components/layouts/Panel";
import { usePrograms, programsUsingUnit } from "../../lib/programStore";

const Units = () => {
  const st = usePrograms();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const rows = st.units.filter((u) =>
    `${u.code} ${u.name}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        title="Units"
        subtitle="Every unit taught across all programs"
        actions={
          <button
            onClick={() => navigate("/admin/units/new")}
            className="flex items-center gap-1.5 bg-ink text-white rounded px-4 py-2 text-xs font-semibold hover:bg-ink/90"
          >
            <Plus size={14} /> Add unit
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
              placeholder="Search units"
              className="w-full border border-line rounded pl-9 pr-3 py-2 text-[13px] focus:outline-none focus:border-ink"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-subtle text-xs bg-canvas">
                <th className="px-5 py-2.5 font-medium">Unit</th>
                <th className="px-5 py-2.5 font-medium">Credit hours</th>
                <th className="px-5 py-2.5 font-medium">Used by</th>
                <th className="px-5 py-2.5 font-medium">Prerequisites</th>
                <th className="px-5 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr
                  key={u._id}
                  className="border-t border-line hover:bg-canvas"
                >
                  <td className="px-5 py-3">
                    <p className="font-semibold">{u.name}</p>
                    <p className="text-xs text-subtle font-mono">{u.code}</p>
                  </td>
                  <td className="px-5 py-3">{u.creditHours}</td>
                  <td className="px-5 py-3">
                    {programsUsingUnit(st, u._id).length} program(s)
                  </td>
                  <td className="px-5 py-3">
                    {u.prerequisiteIds?.length || 0}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <OutlineButton
                      onClick={() => navigate(`/admin/units/${u._id}`)}
                    >
                      View
                    </OutlineButton>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-subtle"
                  >
                    No units found.
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

export default Units;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import Panel, {
  OutlineButton,
  StatusPill,
} from "../../components/layouts/Panel";
import Pagination from "../../components/layouts/Pagination";
import { students, programmes } from "../../lib/mockData";

const PAGE_SIZE = 10;

const StudentsList = () => {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  // TODO(api): replace with api.get("/users", { params: { role: "student" } })
  const programmeName = (id) =>
    programmes.find((p) => p._id === id)?.name || "—";

  const filtered = students.filter((s) =>
    `${s.fullName} ${s.admissionNumber}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <Panel flush>
        <div className="p-4 border-b border-line">
          <div className="relative max-w-xs">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle"
            />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name or admission no."
              className="w-full border border-line rounded pl-9 pr-3 py-2 text-[13px] focus:outline-none focus:border-ink"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-subtle text-xs bg-canvas">
                <th className="px-5 py-2.5 font-medium">Student</th>
                <th className="px-5 py-2.5 font-medium">Admission no.</th>
                <th className="px-5 py-2.5 font-medium">Program</th>
                <th className="px-5 py-2.5 font-medium">Status</th>
                <th className="px-5 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {pageRows.map((s) => (
                <tr
                  key={s._id}
                  className="border-t border-line hover:bg-canvas"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-tenant-soft text-tenant text-xs font-bold flex items-center justify-center">
                        {s.fullName?.[0]}
                      </div>
                      <span className="font-semibold">{s.fullName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">{s.admissionNumber}</td>
                  <td className="px-5 py-3">{programmeName(s.programmeId)}</td>
                  <td className="px-5 py-3">
                    <StatusPill status={s.status} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <OutlineButton
                      onClick={() => navigate(`/admin/students/${s._id}`)}
                    >
                      View
                    </OutlineButton>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-subtle"
                  >
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          setPage={setPage}
          pageSize={PAGE_SIZE}
          total={filtered.length}
        />
      </Panel>
    </div>
  );
};

export default StudentsList;

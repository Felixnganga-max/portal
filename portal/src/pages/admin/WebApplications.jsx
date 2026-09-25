import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import Panel, {
  PageHeader,
  OutlineButton,
} from "../../components/layouts/Panel";
import Pagination from "../../components/layouts/Pagination";
import { webApplications, programmes } from "../../lib/mockData";

const PAGE_SIZE = 10;

const FILTERS = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "reviewing", label: "Under review" },
  { key: "admitted", label: "Admitted" },
  { key: "rejected", label: "Rejected" },
];

const STATUS_STYLE = {
  new: "bg-tenant-soft text-tenant",
  reviewing: "bg-canvas text-ink border border-line",
  admitted: "bg-canvas text-good border border-line",
  rejected: "bg-canvas text-badge border border-line",
};

const STATUS_LABEL = {
  new: "New",
  reviewing: "Under review",
  admitted: "Admitted",
  rejected: "Rejected",
};

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

const AppStatus = ({ status }) => (
  <span
    className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
      STATUS_STYLE[status] || STATUS_STYLE.reviewing
    }`}
  >
    {STATUS_LABEL[status] || status}
  </span>
);

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-[11px] text-subtle uppercase tracking-wide">{label}</p>
      <p className="text-sm font-semibold text-ink mt-0.5">{value || "—"}</p>
    </div>
  );
}

const WebApplications = () => {
  // TODO(api): replace with api.get("/applications", { params: { source: "website" } })
  const [applications, setApplications] = useState(webApplications);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const navigate = useNavigate();

  const programmeName = (id) =>
    programmes.find((p) => p._id === id)?.name || "—";

  const counts = applications.reduce(
    (acc, a) => ({ ...acc, [a.status]: (acc[a.status] || 0) + 1 }),
    { all: applications.length },
  );

  const filtered = applications
    .filter((a) => filter === "all" || a.status === filter)
    .filter((a) =>
      `${a.fullName} ${a.email} ${a.phone} ${programmeName(a.programmeId)}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    )
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selected = applications.find((a) => a._id === selectedId);

  const setStatus = (id, status) => {
    // TODO(api): api.patch(`/applications/${id}`, { status })
    setApplications((list) =>
      list.map((a) => (a._id === id ? { ...a, status } : a)),
    );
  };

  const admit = (applicant) => {
    // Sends the applicant's details to the Admissions page so it can prefill the form.
    navigate("/admin/students/admissions", { state: { applicant } });
  };

  return (
    <div>
      <PageHeader
        title="Website applications"
        subtitle="People who applied through the school website"
      />

      <div className="flex flex-wrap gap-1 mb-4">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => {
              setFilter(f.key);
              setPage(1);
            }}
            className={`px-3.5 py-1.5 text-xs rounded border ${
              filter === f.key
                ? "bg-tenant text-white font-semibold border-transparent"
                : "bg-surface text-subtle border-line hover:text-ink"
            }`}
          >
            {f.label} ({counts[f.key] || 0})
          </button>
        ))}
      </div>

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
              placeholder="Search name, email, phone or programme"
              className="w-full border border-line rounded pl-9 pr-3 py-2 text-[13px] focus:outline-none focus:border-ink"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-subtle text-xs bg-canvas">
                <th className="px-5 py-2.5 font-medium">Applicant</th>
                <th className="px-5 py-2.5 font-medium">Programme</th>
                <th className="px-5 py-2.5 font-medium">Intake</th>
                <th className="px-5 py-2.5 font-medium">Applied</th>
                <th className="px-5 py-2.5 font-medium">Status</th>
                <th className="px-5 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {pageRows.map((a) => (
                <tr
                  key={a._id}
                  className={`border-t border-line hover:bg-canvas ${
                    selectedId === a._id ? "bg-canvas" : ""
                  }`}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-tenant-soft text-tenant text-xs font-bold flex items-center justify-center">
                        {a.fullName?.[0]}
                      </div>
                      <div>
                        <p className="font-semibold">{a.fullName}</p>
                        <p className="text-xs text-subtle">{a.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">{programmeName(a.programmeId)}</td>
                  <td className="px-5 py-3">{a.intake}</td>
                  <td className="px-5 py-3">{fmtDate(a.submittedAt)}</td>
                  <td className="px-5 py-3">
                    <AppStatus status={a.status} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <OutlineButton
                      onClick={() =>
                        setSelectedId(selectedId === a._id ? null : a._id)
                      }
                    >
                      {selectedId === a._id ? "Close" : "View"}
                    </OutlineButton>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-subtle"
                  >
                    No applications found.
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

      {selected && (
        <div className="mt-5">
          <Panel
            title={selected.fullName}
            description="Application details from the website form"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
              <Detail label="Email" value={selected.email} />
              <Detail label="Phone" value={selected.phone} />
              <Detail label="County" value={selected.county} />
              <Detail
                label="Programme"
                value={programmeName(selected.programmeId)}
              />
              <Detail label="Intake" value={selected.intake} />
              <Detail label="KCSE grade" value={selected.kcseGrade} />
              <Detail
                label="Applied on"
                value={fmtDate(selected.submittedAt)}
              />
              <div>
                <p className="text-[11px] text-subtle uppercase tracking-wide">
                  Status
                </p>
                <div className="mt-1">
                  <AppStatus status={selected.status} />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {selected.status !== "reviewing" &&
                selected.status !== "admitted" && (
                  <OutlineButton
                    onClick={() => setStatus(selected._id, "reviewing")}
                  >
                    Mark under review
                  </OutlineButton>
                )}
              {selected.status !== "admitted" && (
                <OutlineButton onClick={() => admit(selected)}>
                  Admit &amp; enrol
                </OutlineButton>
              )}
              {selected.status !== "rejected" &&
                selected.status !== "admitted" && (
                  <OutlineButton
                    onClick={() => setStatus(selected._id, "rejected")}
                  >
                    Reject
                  </OutlineButton>
                )}
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
};

export default WebApplications;

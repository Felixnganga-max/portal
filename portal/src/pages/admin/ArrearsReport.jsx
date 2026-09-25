import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import api from "../../lib/api";
import Panel, { PageHeader } from "../../components/layouts/Panel";
import Pagination from "../../components/layouts/Pagination";

const PAGE_SIZE = 10;

const ArrearsReport = () => {
  const [accounts, setAccounts] = useState(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const currentYear = new Date().getFullYear().toString();

  useEffect(() => {
    api
      .get("/finance/arrears-report", { params: { academicYear: currentYear } })
      .then(({ data }) => setAccounts(data));
  }, []);

  const filtered = (accounts || []).filter((acc) =>
    `${acc.student?.fullName} ${acc.student?.admissionNumber}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const total = filtered.reduce((s, a) => s + a.balance, 0);

  return (
    <div>
      <PageHeader
        title="Arrears report"
        subtitle={`Students with outstanding fees, ${currentYear}`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5 max-w-xl">
        <Panel title="Students in arrears">
          <p className="text-2xl font-bold">
            {accounts ? filtered.length : "—"}
          </p>
        </Panel>
        <Panel title="Total outstanding">
          <p className="text-2xl font-bold text-tenant">
            KES {total.toLocaleString()}
          </p>
        </Panel>
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
              placeholder="Search"
              className="w-full border border-line rounded pl-9 pr-3 py-2 text-[13px] focus:outline-none focus:border-ink"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-subtle text-xs bg-canvas">
                <th className="px-5 py-2.5 font-medium">Admission no.</th>
                <th className="px-5 py-2.5 font-medium">Name</th>
                <th className="px-5 py-2.5 font-medium">Phone</th>
                <th className="px-5 py-2.5 font-medium text-right">Balance</th>
                <th className="px-5 py-2.5 font-medium w-48">Cleared</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((acc) => (
                <tr
                  key={acc._id}
                  className="border-t border-line hover:bg-canvas"
                >
                  <td className="px-5 py-3">{acc.student?.admissionNumber}</td>
                  <td className="px-5 py-3 font-semibold">
                    {acc.student?.fullName}
                  </td>
                  <td className="px-5 py-3">{acc.student?.phone}</td>
                  <td className="px-5 py-3 text-right font-semibold">
                    KES {acc.balance.toLocaleString()}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-canvas rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${acc.percentPaid >= 75 ? "bg-good" : "bg-tenant"}`}
                          style={{ width: `${acc.percentPaid}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold w-9 text-right">
                        {acc.percentPaid}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              {accounts && filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-subtle"
                  >
                    No outstanding balances.
                  </td>
                </tr>
              )}
              {!accounts && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-subtle"
                  >
                    Loading…
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

export default ArrearsReport;

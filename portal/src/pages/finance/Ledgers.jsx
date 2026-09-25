import { useState } from "react";
import { Search } from "lucide-react";
import Panel, {
  PageHeader,
  OutlineButton,
} from "../../components/layouts/Panel";
import { ledgers } from "../../lib/mockData";

const num = (n) => {
  const v = Number(n);
  return Number.isFinite(v) ? v : 0;
};
const kes = (n) => `KES ${num(n).toLocaleString()}`;

const Ledgers = () => {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  // TODO(api): GET /finance/ledgers and GET /finance/ledgers/:studentId for entries

  const rows = ledgers.filter((l) =>
    `${l.fullName} ${l.admissionNumber}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        title="Student ledgers"
        subtitle="Charges, payments and balances per student"
      />
      <div className="flex flex-col gap-5">
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
                  <th className="px-5 py-2.5 font-medium text-right">
                    Charged
                  </th>
                  <th className="px-5 py-2.5 font-medium text-right">Paid</th>
                  <th className="px-5 py-2.5 font-medium text-right">
                    Balance
                  </th>
                  <th className="px-5 py-2.5 font-medium w-40">Cleared</th>
                  <th className="px-5 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {rows.map((l) => {
                  const charged = num(l.charged);
                  const paid = num(l.paid);
                  const pct = charged ? Math.round((paid / charged) * 100) : 0;
                  return (
                    <tr
                      key={l._id}
                      className="border-t border-line hover:bg-canvas"
                    >
                      <td className="px-5 py-3">
                        <p className="font-semibold">{l.fullName}</p>
                        <p className="text-xs text-subtle">
                          {l.admissionNumber}
                        </p>
                      </td>
                      <td className="px-5 py-3 text-right">{kes(charged)}</td>
                      <td className="px-5 py-3 text-right">{kes(paid)}</td>
                      <td className="px-5 py-3 text-right font-semibold">
                        {kes(charged - paid)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-canvas rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${pct >= 75 ? "bg-good" : "bg-tenant"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold w-9 text-right">
                            {pct}%
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <OutlineButton onClick={() => setSelected(l)}>
                          View
                        </OutlineButton>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>

        {selected && (
          <Panel
            title={`Ledger: ${selected.fullName}`}
            description={selected.admissionNumber}
            action={{ label: "Close", onClick: () => setSelected(null) }}
            flush
          >
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-subtle text-xs bg-canvas">
                  <th className="px-5 py-2.5 font-medium">Description</th>
                  <th className="px-5 py-2.5 font-medium">Type</th>
                  <th className="px-5 py-2.5 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-line">
                  <td className="px-5 py-3">Semester fees</td>
                  <td className="px-5 py-3">Charge</td>
                  <td className="px-5 py-3 text-right">
                    {kes(selected.charged)}
                  </td>
                </tr>
                {num(selected.paid) > 0 && (
                  <tr className="border-t border-line">
                    <td className="px-5 py-3">Payments received</td>
                    <td className="px-5 py-3">Payment</td>
                    <td className="px-5 py-3 text-right text-good font-semibold">
                      − {kes(selected.paid)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Panel>
        )}
      </div>
    </div>
  );
};

export default Ledgers;

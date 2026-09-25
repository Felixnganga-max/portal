import { Landmark, GraduationCap, HandCoins } from "lucide-react";
import { funding, fundingTypeLabel } from "../../lib/mockData";

// Same two accent colours as StudentHome and Attachment. Change them here to re-theme.
const MINT = "#A6F4A3";
const VIOLET = "#A48CFA";

const icons = {
  "helb-loan": Landmark,
  "helb-scholarship": GraduationCap,
  bursary: HandCoins,
};
const kes = (n) => `KES ${Number(n || 0).toLocaleString()}`;

const statusStyle = {
  disbursed: { label: "Disbursed", cls: "bg-green-100 text-green-800" },
  approved: { label: "Approved", cls: "bg-violet-100 text-violet-800" },
  pending: { label: "Pending", cls: "bg-amber-100 text-amber-800" },
  rejected: { label: "Rejected", cls: "bg-red-100 text-red-800" },
};

const Pill = ({ status }) => {
  const s = statusStyle[status] || {
    label: status,
    cls: "bg-black/5 text-ink",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${s.cls}`}
    >
      {s.label}
    </span>
  );
};

const ROW = "grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-3 items-center";

const Funding = () => {
  // TODO(api): const { data } = await api.get("/finance/my-funding");
  const entries = funding;

  const sum = (statuses) =>
    entries
      .filter((e) => statuses.includes(e.status))
      .reduce((s, e) => s + e.amount, 0);
  const disbursed = sum(["disbursed"]);
  const expected = sum(["approved", "pending"]);

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">
          Funding &amp; HELB
        </h1>
        <p className="text-sm text-subtle mt-1">
          Loans, scholarships and bursaries paying your fees
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {/* Summary colour blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            className="rounded-[26px] p-5 flex flex-col min-h-[170px] text-ink"
            style={{ backgroundColor: MINT }}
          >
            <p className="text-[17px] font-medium">Disbursed to your fees</p>
            <p className="text-2xl font-semibold tracking-tight mt-auto">
              {kes(disbursed)}
            </p>
          </div>

          <div
            className="rounded-[26px] p-5 flex flex-col min-h-[170px] text-white"
            style={{ backgroundColor: VIOLET }}
          >
            <p className="text-[17px] font-medium">Approved / pending</p>
            <p className="text-2xl font-semibold tracking-tight mt-auto">
              {kes(expected)}
            </p>
          </div>

          <div className="rounded-[26px] p-5 flex flex-col min-h-[170px] bg-white">
            <p className="text-[17px] font-medium">Funding sources</p>
            <p className="text-2xl font-semibold tracking-tight mt-auto">
              {entries.length}
            </p>
          </div>
        </div>

        {/* Funding list */}
        <section className="bg-black/[0.04] rounded-[28px] p-6">
          <h2 className="text-2xl font-semibold tracking-tight">
            Your funding
          </h2>
          <p className="text-[13px] text-subtle mt-1 mb-5">
            Amounts marked disbursed are already deducted from your fee balance
          </p>

          {entries.length === 0 ? (
            <p className="text-sm text-subtle py-4">
              No funding recorded yet. The finance office posts it here once it
              is confirmed.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[640px]">
                <div className={`${ROW} px-5 pb-2 text-[13px] text-subtle`}>
                  <span>Source</span>
                  <span>Semester</span>
                  <span>Status</span>
                  <span>Disbursed on</span>
                  <span className="text-right">Amount</span>
                </div>
                <ul className="flex flex-col gap-2.5">
                  {entries.map((e) => {
                    const Icon = icons[e.type] || Landmark;
                    return (
                      <li
                        key={e._id}
                        className={`${ROW} bg-white rounded-3xl px-5 py-3.5`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-ink"
                            style={{ backgroundColor: MINT }}
                          >
                            <Icon size={17} />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[15px] font-medium truncate">
                              {e.source}
                            </p>
                            <p className="text-[13px] text-subtle truncate">
                              {fundingTypeLabel[e.type]}
                            </p>
                          </div>
                        </div>
                        <span className="text-[14px]">{e.semester}</span>
                        <span>
                          <Pill status={e.status} />
                        </span>
                        <span className="text-[14px]">
                          {e.date
                            ? new Date(e.date).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </span>
                        <span className="text-right text-[15px] font-semibold">
                          {kes(e.amount)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
        </section>

        <p className="text-[13px] text-subtle px-2">
          Funding is posted by the finance office. If something is missing,
          contact them with your admission number.
        </p>
      </div>
    </div>
  );
};

export default Funding;

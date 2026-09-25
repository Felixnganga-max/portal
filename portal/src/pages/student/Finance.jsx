import { useEffect, useState } from "react";
import { Smartphone, Landmark } from "lucide-react";
import api from "../../lib/api";
import Panel, {
  PageHeader,
  DarkButton,
  StatusPill,
} from "../../components/layouts/Panel";
import RailBlock from "../../components/layouts/RailBlock";

const currentYear = new Date().getFullYear().toString();

const helbLabel = {
  "not-applied": "Not applied",
  pending: "Pending",
  approved: "Approved",
  disbursed: "Disbursed",
  rejected: "Rejected",
};

const StudentFinance = () => {
  const [account, setAccount] = useState(null);
  const [amount, setAmount] = useState("");
  const [paying, setPaying] = useState(false);
  const [message, setMessage] = useState("");

  const load = async () => {
    const { data } = await api.get("/finance/my-account", {
      params: { academicYear: currentYear },
    });
    setAccount(data);
  };

  useEffect(() => {
    load();
  }, []);

  const handlePayNow = async (e) => {
    e.preventDefault();
    setPaying(true);
    setMessage("");
    try {
      await api.post("/finance/pay-now", { amount: Number(amount) });
      setMessage(
        "STK push sent — enter your M-Pesa PIN on your phone to complete payment.",
      );
      setAmount("");
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Payment could not be initiated.",
      );
    } finally {
      setPaying(false);
    }
  };

  if (!account) return <p className="text-sm text-subtle">Loading…</p>;

  const cleared = account.percentPaid || 0;
  const stat = (label, value) => (
    <div>
      <div className="text-xs text-subtle">{label}</div>
      <div className="text-[15px] font-bold mt-0.5">{value}</div>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Finance"
        subtitle={`Fees and payments, ${currentYear}`}
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5 items-start">
        <div className="flex flex-col gap-5">
          <Panel title="Fee summary">
            <p className="text-xs text-subtle">Balance owed</p>
            <p className="text-2xl font-bold text-tenant mt-1">
              KES {(account.balance || 0).toLocaleString()}
            </p>
            <div className="grid grid-cols-3 gap-4 mt-5 pt-4 border-t border-line">
              {stat(
                "Charged",
                `KES ${(account.totalCharged || 0).toLocaleString()}`,
              )}
              {stat("Paid", `KES ${(account.totalPaid || 0).toLocaleString()}`)}
              {stat("Cleared", `${cleared}%`)}
            </div>
            <div className="h-1.5 bg-canvas rounded-full overflow-hidden mt-4">
              <div
                className="h-full bg-good rounded-full"
                style={{ width: `${cleared}%` }}
              />
            </div>
          </Panel>

          <Panel title="Transaction history" flush>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-left text-subtle text-xs bg-canvas">
                    <th className="px-5 py-2.5 font-medium">Date</th>
                    <th className="px-5 py-2.5 font-medium">Description</th>
                    <th className="px-5 py-2.5 font-medium">Type</th>
                    <th className="px-5 py-2.5 font-medium text-right">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {account.entries?.length ? (
                    [...account.entries].reverse().map((entry) => (
                      <tr
                        key={entry._id}
                        className="border-t border-line hover:bg-canvas"
                      >
                        <td className="px-5 py-3">
                          {new Date(entry.date).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3">{entry.description}</td>
                        <td className="px-5 py-3">
                          <StatusPill status={entry.type} />
                        </td>
                        <td className="px-5 py-3 text-right font-semibold">
                          KES {entry.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-10 text-center text-subtle"
                      >
                        No transactions yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        <div className="flex flex-col gap-5">
          <RailBlock title="Pay now" description="M-Pesa STK push">
            <form onSubmit={handlePayNow} className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs text-subtle">
                <Smartphone size={14} /> Sent to your registered phone
              </div>
              <input
                required
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount (KES)"
                className="border border-line rounded px-3 py-2 text-[13px] focus:outline-none focus:border-ink"
              />
              <DarkButton
                type="submit"
                disabled={paying}
                className="py-2.5 disabled:opacity-50"
              >
                {paying ? "Sending…" : "Send STK push"}
              </DarkButton>
              {message && <p className="text-xs text-subtle">{message}</p>}
            </form>
          </RailBlock>

          <RailBlock
            title="HELB status"
            action={{ label: "View funding", to: "/student/funding" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-tenant-soft text-tenant flex items-center justify-center">
                <Landmark size={15} />
              </div>
              <div>
                <p className="text-[13px] font-semibold">
                  {helbLabel[account.helbStatus] || "Not applied"}
                </p>
                {account.helbAmount && (
                  <p className="text-xs text-subtle">
                    KES {account.helbAmount.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </RailBlock>
        </div>
      </div>
    </div>
  );
};

export default StudentFinance;

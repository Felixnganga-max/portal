import { useState } from "react";
import Panel, {
  PageHeader,
  StatusPill,
  OutlineButton,
  DarkButton,
} from "../../components/layouts/Panel";
import { initialWaivers } from "../../lib/mockData";

const Waivers = () => {
  const [waivers, setWaivers] = useState(initialWaivers); // TODO(api): GET /finance/waivers
  const [filter, setFilter] = useState("pending");

  const decide = (id, status) => {
    // TODO(api): PATCH /finance/waivers/:id { status }
    setWaivers(waivers.map((w) => (w._id === id ? { ...w, status } : w)));
  };
  const shown = waivers.filter((w) => filter === "all" || w.status === filter);

  return (
    <div>
      <PageHeader title="Waivers" subtitle="Review fee waiver requests" />
      <div className="inline-flex gap-1 bg-surface border border-line rounded-md p-1 mb-5">
        {["pending", "approved", "rejected", "all"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 text-xs rounded capitalize ${filter === f ? "bg-tenant text-white font-semibold" : "text-subtle hover:text-ink"}`}
          >
            {f}
          </button>
        ))}
      </div>

      <Panel flush className="max-w-4xl">
        {shown.length === 0 && (
          <p className="px-5 py-10 text-center text-xs text-subtle">
            No {filter === "all" ? "" : filter} requests.
          </p>
        )}
        {shown.map((w, i) => (
          <div
            key={w._id}
            className={`px-5 py-4 flex items-center gap-4 flex-wrap ${i ? "border-t border-line" : ""}`}
          >
            <div className="flex-1 min-w-[220px]">
              <p className="text-[13px] font-semibold">
                {w.student}{" "}
                <span className="text-xs text-subtle font-normal">
                  · {w.admissionNumber}
                </span>
              </p>
              <p className="text-xs text-subtle mt-0.5">{w.reason}</p>
            </div>
            <b className="text-[13px]">KES {w.amount.toLocaleString()}</b>
            <StatusPill status={w.status} />
            {w.status === "pending" && (
              <div className="flex gap-2">
                <OutlineButton onClick={() => decide(w._id, "rejected")}>
                  Reject
                </OutlineButton>
                <DarkButton onClick={() => decide(w._id, "approved")}>
                  Approve
                </DarkButton>
              </div>
            )}
          </div>
        ))}
      </Panel>
    </div>
  );
};

export default Waivers;

import { useState } from "react";
import Panel, { PageHeader } from "../../components/layouts/Panel";
import { students } from "../../lib/mockData";
import {
  catalogUnit,
  approveRequest,
  rejectRequest,
  completeRegistration,
  useRegistrations,
} from "../../lib/registrationStore";

const kes = (n) => (n > 0 ? `KES ${n.toLocaleString()}` : "No fee");
const day = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";

const smallBtn =
  "px-3 py-1.5 rounded-md border border-line text-xs font-semibold hover:bg-canvas";

const who = (id) => students.find((s) => s._id === id);

const Row = ({ r, children }) => {
  const s = who(r.studentId);
  const u = catalogUnit(r.unitId);
  return (
    <div className="px-5 py-3 border-t border-line flex items-center justify-between gap-3 flex-wrap hover:bg-canvas">
      <div>
        <p className="text-[13px] font-semibold">
          {s?.fullName ?? r.studentId}
          <span className="ml-2 text-xs font-normal font-mono text-subtle">
            {s?.admissionNumber}
          </span>
        </p>
        <p className="text-xs text-subtle">
          {u?.code} {u?.name} · {kes(r.fee)}
          {r.status === "pending"
            ? ` · requested ${day(r.requestedAt)}`
            : ` · started ${day(r.registeredAt)}`}
        </p>
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
};

// Admin has full rights over registration. Instructors will be able to mark
// short courses completed from their own pages using completeRegistration().
const RegistrationRequests = () => {
  const regs = useRegistrations();
  const [notice, setNotice] = useState(null);

  const pending = regs
    .filter((r) => r.status === "pending")
    .sort((a, b) => a.requestedAt.localeCompare(b.requestedAt));
  const active = regs
    .filter((r) => r.status === "registered" && r.type === "short")
    .sort((a, b) => a.registeredAt.localeCompare(b.registeredAt));

  const run = (fn, r, text) => {
    const res = fn(r.id);
    setNotice(res.ok ? { ok: true, text } : { ok: false, text: res.reason });
  };

  const name = (r) => who(r.studentId)?.fullName ?? "the student";
  const unitName = (r) => catalogUnit(r.unitId)?.name ?? "the unit";

  return (
    <div>
      <PageHeader
        title="Registration requests"
        subtitle="Approve units from other years or schools, and close out finished short courses."
      />
      <div className="max-w-4xl flex flex-col gap-5">
        {notice && (
          <div
            className={`px-4 py-2.5 rounded-lg text-[13px] flex items-center justify-between gap-3 ${
              notice.ok
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
            role="status"
          >
            <span>{notice.text}</span>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="text-xs font-semibold underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <Panel title={`Pending requests (${pending.length})`} flush>
          {pending.length === 0 ? (
            <p className="px-5 py-4 text-[13px] text-subtle border-t border-line">
              No requests waiting.
            </p>
          ) : (
            pending.map((r) => (
              <Row key={r.id} r={r}>
                <button
                  type="button"
                  className={smallBtn}
                  onClick={() =>
                    run(
                      approveRequest,
                      r,
                      `Approved ${unitName(r)} for ${name(r)}.`,
                    )
                  }
                >
                  Approve
                </button>
                <button
                  type="button"
                  className={smallBtn}
                  onClick={() =>
                    run(
                      rejectRequest,
                      r,
                      `Rejected ${unitName(r)} for ${name(r)}.`,
                    )
                  }
                >
                  Reject
                </button>
              </Row>
            ))
          )}
        </Panel>

        <Panel title={`Short courses in progress (${active.length})`} flush>
          {active.length === 0 ? (
            <p className="px-5 py-4 text-[13px] text-subtle border-t border-line">
              No short courses running.
            </p>
          ) : (
            active.map((r) => (
              <Row key={r.id} r={r}>
                <button
                  type="button"
                  className={smallBtn}
                  onClick={() => {
                    if (
                      !window.confirm(
                        `Mark ${unitName(r)} as completed for ${name(r)}? They can then enrol in another short course.`,
                      )
                    )
                      return;
                    run(
                      completeRegistration,
                      r,
                      `${unitName(r)} marked completed for ${name(r)}.`,
                    );
                  }}
                >
                  Mark completed
                </button>
              </Row>
            ))
          )}
        </Panel>
      </div>
    </div>
  );
};

export default RegistrationRequests;

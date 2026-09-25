import { useState } from "react";
import {
  Inbox,
  Briefcase,
  CalendarCheck,
  BadgeCheck,
  Check,
} from "lucide-react";
import Panel, {
  PageHeader,
  StatusPill,
  OutlineButton,
  DarkButton,
  Field,
  StatCard,
  RowCard,
  Step,
  EmptyState,
  inputCls,
  tableCls,
  thCls,
  rowCls,
  Avatar,
} from "../../components/layouts/Panel";
import {
  useAttachments,
  actions,
  weights,
  finalMark,
} from "../../lib/Attachmentstore";
import { useAuth } from "../../context/AuthContext";
import { gradeFor } from "../../lib/mockData";

const labels = {
  logbook: "Logbook",
  assessment: "On-site assessment",
  host: "Host evaluation",
  report: "Final report",
};

// TODO(api): only placements from the teacher's own department should be returned.
const Attachment = () => {
  const { user } = useAuth();
  const placements = useAttachments();
  const [openId, setOpenId] = useState(null);
  const [sched, setSched] = useState({ date: "", time: "", venue: "" });
  const [remarks, setRemarks] = useState("");

  const pending = placements.filter((p) => p.status === "submitted");
  const active = placements.filter((p) =>
    ["approved", "completed"].includes(p.status),
  );
  const completed = placements.filter((p) => p.status === "completed").length;
  const scheduled = active.filter((p) => p.assessment?.date).length;
  const open = placements.find((p) => p.id === openId);
  const openIt = (p) => {
    setOpenId(p.id);
    setSched(p.assessment || { date: "", time: "", venue: "" });
    setRemarks(p.remarks || "");
  };
  const locked = open?.status === "completed";
  const mark = open ? finalMark(open) : null;

  return (
    <div>
      <PageHeader
        title="Attachment"
        subtitle="Accept placements, schedule the assessment day, then record the score and remarks"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard
          icon={Inbox}
          tone="amber"
          label="Requests waiting"
          value={pending.length}
        />
        <StatCard
          icon={Briefcase}
          tone="blue"
          label="Active placements"
          value={active.length - completed}
        />
        <StatCard
          icon={CalendarCheck}
          tone="violet"
          label="Assessments scheduled"
          value={scheduled}
        />
        <StatCard
          icon={BadgeCheck}
          tone="green"
          label="Completed"
          value={completed}
        />
      </div>

      <div className="flex flex-col gap-5">
        <Panel
          title="Placement requests"
          description="Students who found an attachment and informed the school"
        >
          {pending.length === 0 ? (
            <EmptyState
              title="No requests waiting"
              text="New requests from students show up here."
            />
          ) : (
            <div className="flex flex-col gap-2.5">
              {pending.map((p) => (
                <RowCard
                  key={p.id}
                  avatar={p.studentName}
                  title={
                    <>
                      {p.studentName}{" "}
                      <span className="text-xs text-subtle font-normal font-mono">
                        · {p.admissionNumber}
                      </span>
                    </>
                  }
                  meta={`${p.organisation}, ${p.location} · ${new Date(
                    p.start,
                  ).toLocaleDateString()} – ${new Date(p.end).toLocaleDateString()}`}
                  trailing={
                    <div className="flex gap-2">
                      <OutlineButton
                        onClick={() => actions.setStatus(p.id, "rejected")}
                      >
                        Decline
                      </OutlineButton>
                      <DarkButton
                        onClick={() => actions.approve(p.id, user.fullName)}
                      >
                        Accept &amp; take charge
                      </DarkButton>
                    </div>
                  }
                />
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Placements" flush>
          <div className="px-4 pb-3 overflow-x-auto">
            <table className={tableCls}>
              <thead>
                <tr className="text-left text-subtle text-xs">
                  <th className={thCls}>Student</th>
                  <th className={thCls}>Organisation</th>
                  <th className={thCls}>Assessment day</th>
                  <th className={thCls}>Status</th>
                  <th className={thCls} />
                </tr>
              </thead>
              <tbody>
                {active.map((p) => (
                  <tr
                    key={p.id}
                    className={`${rowCls} ${openId === p.id ? "[&>td]:!bg-tenant-soft/40" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={p.studentName} />
                        <div>
                          <p className="font-semibold">{p.studentName}</p>
                          <p className="text-xs text-subtle font-mono">
                            {p.admissionNumber}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{p.organisation}</td>
                    <td className="px-4 py-3 text-xs">
                      {p.assessment?.date
                        ? `${new Date(p.assessment.date).toLocaleDateString()} ${p.assessment.time || ""}`
                        : "Not scheduled"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <OutlineButton onClick={() => openIt(p)}>
                        Open
                      </OutlineButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {active.length === 0 && (
              <EmptyState title="No accepted placements yet" />
            )}
          </div>
        </Panel>

        {open && (
          <Panel
            title={`${open.studentName}: ${open.organisation}`}
            description={`Host supervisor: ${open.supervisor.name}, ${open.supervisor.phone} · In charge: ${open.instructor || "unassigned"}`}
            action={{ label: "Close", onClick: () => setOpenId(null) }}
          >
            {/* 1. Logbook */}
            <Step
              n={1}
              title="Logbook"
              hint="Sign each week once you've read it"
            />
            <div className="flex flex-col gap-2 mb-7">
              {open.logbook.length === 0 && (
                <p className="rounded-xl border border-dashed border-line p-4 text-xs text-subtle">
                  The student has not added entries yet.
                </p>
              )}
              {open.logbook.map((l) => (
                <div
                  key={l.id}
                  className="flex items-start gap-3 rounded-xl border border-line/70 px-4 py-3"
                >
                  <span className="text-[11px] font-bold text-tenant bg-tenant-soft rounded-full px-2.5 py-1 shrink-0">
                    Week {l.week}
                  </span>
                  <p className="flex-1 text-[13px] pt-0.5">{l.activities}</p>
                  {l.signed && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 pt-1">
                      <Check size={13} /> Signed
                    </span>
                  )}
                  <OutlineButton
                    disabled={locked}
                    onClick={() => actions.toggleSign(open.id, l.id)}
                  >
                    {l.signed ? "Unsign" : "Sign"}
                  </OutlineButton>
                </div>
              ))}
            </div>

            {/* 2. Schedule */}
            <Step n={2} title="Schedule the assessment day" />
            <div className="grid grid-cols-1 sm:grid-cols-[160px_130px_1fr_auto] gap-3 items-end mb-7">
              <Field label="Date">
                <input
                  type="date"
                  disabled={locked}
                  value={sched.date}
                  onChange={(e) => setSched({ ...sched, date: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="Time">
                <input
                  type="time"
                  disabled={locked}
                  value={sched.time}
                  onChange={(e) => setSched({ ...sched, time: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="Venue / how">
                <input
                  disabled={locked}
                  value={sched.venue}
                  onChange={(e) =>
                    setSched({ ...sched, venue: e.target.value })
                  }
                  placeholder="At the host organisation"
                  className={inputCls}
                />
              </Field>
              <DarkButton
                disabled={locked || !sched.date}
                onClick={() => actions.schedule(open.id, sched)}
                className="py-2.5"
              >
                {open.assessment ? "Reschedule" : "Schedule"}
              </DarkButton>
            </div>

            {/* 3. Scores */}
            <Step n={3} title="Scores after the assessment" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.keys(weights).map((k) => (
                <Field key={k} label={`${labels[k]} · ${weights[k]}%`}>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    disabled={locked}
                    value={open.scores[k] ?? ""}
                    onChange={(e) =>
                      actions.setScore(open.id, k, e.target.value)
                    }
                    className={inputCls}
                  />
                </Field>
              ))}
            </div>

            <div className="mt-5">
              <Field label="Remarks (the student will see this, and it appears on their transcript)">
                <textarea
                  rows={3}
                  disabled={locked}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>

            <div className="mt-6 rounded-xl bg-canvas px-5 py-4 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-[11px] uppercase tracking-wide font-semibold text-subtle">
                  Final mark
                </p>
                <p className="text-2xl font-bold text-tenant mt-0.5">
                  {mark !== null
                    ? `${mark}% (${gradeFor(mark)})`
                    : "Incomplete"}
                </p>
              </div>
              {locked ? (
                <OutlineButton
                  onClick={() => actions.setStatus(open.id, "approved")}
                >
                  Reopen
                </OutlineButton>
              ) : (
                <DarkButton
                  disabled={mark === null}
                  onClick={() => actions.finalise(open.id, remarks)}
                >
                  Release result to student
                </DarkButton>
              )}
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
};

export default Attachment;

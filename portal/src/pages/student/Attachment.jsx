import { useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { students, gradeFor } from "../../lib/mockData";
import {
  useAttachments,
  actions,
  weights,
  finalMark,
} from "../../lib/Attachmentstore";
import { isShortCourse, totalYears } from "../../lib/duration";

const me = students[0]; // TODO(api): the logged-in student

// Same two accent colours as StudentHome. Change them here to re-theme.
const MINT = "#A6F4A3";
const VIOLET = "#A48CFA";

const blank = {
  organisation: "",
  location: "",
  supName: "",
  supPhone: "",
  supEmail: "",
  start: "",
  end: "",
};
const labels = {
  logbook: "Logbook",
  assessment: "On-site assessment",
  host: "Host evaluation",
  report: "Final report",
};

const inputCls =
  "w-full rounded-2xl border border-line bg-white px-4 py-3 text-[14px] focus:outline-none focus:border-ink";

const Field = ({ label, children }) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-[13px] text-subtle">{label}</span>
    {children}
  </label>
);

const Pill = ({ className = "", children }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${className}`}
  >
    {children}
  </span>
);

const DarkBtn = ({ className = "", ...props }) => (
  <button
    className={`rounded-full bg-ink text-white px-6 py-3 text-[13px] font-semibold hover:bg-ink/90 disabled:opacity-50 ${className}`}
    {...props}
  />
);

const OutlineBtn = ({ className = "", ...props }) => (
  <button
    className={`rounded-full border border-line bg-white px-5 py-2.5 text-[13px] font-medium hover:bg-black/[0.03] ${className}`}
    {...props}
  />
);

// White card with a large heading, like the EduWay cards.
const Card = ({ title, description, tone = "white", children }) => (
  <section
    className={`rounded-[28px] p-6 ${tone === "grey" ? "bg-black/[0.04]" : "bg-white"}`}
  >
    {title && (
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
    )}
    {description && (
      <p className="text-[13px] text-subtle mt-1 max-w-xl">{description}</p>
    )}
    <div className={title ? "mt-5" : ""}>{children}</div>
  </section>
);

const Detail = ({ label, value, sub }) => (
  <div className="bg-white rounded-3xl px-5 py-4">
    <p className="text-[13px] text-subtle">{label}</p>
    <p className="text-[15px] font-semibold mt-0.5">{value}</p>
    {sub && <p className="text-[13px] text-subtle">{sub}</p>}
  </div>
);

const Shell = ({ title, subtitle, children }) => (
  <div className="w-full max-w-5xl mx-auto">
    <div className="mb-6">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      {subtitle && <p className="text-sm text-subtle mt-1">{subtitle}</p>}
    </div>
    <div className="flex flex-col gap-5">{children}</div>
  </div>
);

const Attachment = () => {
  const placement = useAttachments().find((p) => p.studentId === me._id);
  const [form, setForm] = useState(blank);
  const [log, setLog] = useState({ activities: "", skills: "" });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  // Attachment applies to the final year of a course longer than a year.
  const eligible =
    !isShortCourse(me.duration) && me.year >= totalYears(me.duration);

  const submit = (e) => {
    e.preventDefault();
    actions.submit({
      studentId: me._id,
      studentName: me.fullName,
      admissionNumber: me.admissionNumber,
      department: "Business",
      organisation: form.organisation,
      location: form.location,
      start: form.start,
      end: form.end,
      supervisor: {
        name: form.supName,
        phone: form.supPhone,
        email: form.supEmail,
      },
    });
    setForm(blank);
  };

  if (!eligible) {
    return (
      <Shell title="Attachment" subtitle="Industrial attachment">
        <Card title="Not available yet">
          <p className="text-[14px] text-subtle">
            Attachment opens in the final year of a course longer than one year.
            You are in year {me.year} of {totalYears(me.duration)}.
          </p>
        </Card>
      </Shell>
    );
  }

  const status = placement?.status;
  const done = status === "completed";
  const mark = placement ? finalMark(placement) : null;
  const steps = [
    ["Informed the school", !!placement],
    ["Accepted", ["approved", "completed"].includes(status)],
    ["Assessment scheduled", !!placement?.assessment?.date],
    ["Assessed", done],
  ];

  return (
    <Shell
      title="Attachment"
      subtitle="Your industrial attachment counts towards your final result"
    >
      {!placement && (
        <Card
          title="I have got an attachment"
          description="Tell the school where you will be. The department will review it and, once accepted, an instructor is put in charge of you."
        >
          <form
            onSubmit={submit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <Field label="Host organisation">
              <input
                required
                value={form.organisation}
                onChange={set("organisation")}
                className={inputCls}
              />
            </Field>
            <Field label="Location">
              <input
                required
                value={form.location}
                onChange={set("location")}
                className={inputCls}
              />
            </Field>
            <Field label="Supervisor name">
              <input
                required
                value={form.supName}
                onChange={set("supName")}
                className={inputCls}
              />
            </Field>
            <Field label="Supervisor phone">
              <input
                required
                value={form.supPhone}
                onChange={set("supPhone")}
                className={inputCls}
              />
            </Field>
            <Field label="Supervisor email">
              <input
                type="email"
                value={form.supEmail}
                onChange={set("supEmail")}
                className={inputCls}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start">
                <input
                  required
                  type="date"
                  value={form.start}
                  onChange={set("start")}
                  className={inputCls}
                />
              </Field>
              <Field label="End">
                <input
                  required
                  type="date"
                  value={form.end}
                  onChange={set("end")}
                  className={inputCls}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <DarkBtn type="submit">Inform the school</DarkBtn>
            </div>
          </form>
        </Card>
      )}

      {placement && (
        <>
          {/* Progress */}
          <Card title="Progress">
            {status === "rejected" ? (
              <div className="flex items-center justify-between gap-3 flex-wrap rounded-3xl bg-red-50 px-5 py-4">
                <p className="text-[14px] text-red-700 font-medium">
                  The school could not accept this placement. Please submit
                  another.
                </p>
                <OutlineBtn onClick={() => actions.remove(placement.id)}>
                  Submit a new placement
                </OutlineBtn>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {steps.map(([label, reached]) => (
                  <div
                    key={label}
                    className={`flex items-center gap-2.5 rounded-3xl px-4 py-3.5 text-[14px] border ${
                      reached
                        ? "border-transparent font-semibold text-ink"
                        : "border-line bg-white text-subtle"
                    }`}
                    style={reached ? { backgroundColor: MINT } : undefined}
                  >
                    {reached ? (
                      <CheckCircle2 size={18} />
                    ) : (
                      <Circle size={18} />
                    )}
                    {label}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Placement */}
          <Card title="Placement" tone="grey">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Detail
                label="Organisation"
                value={placement.organisation}
                sub={placement.location}
              />
              <Detail
                label="Host supervisor"
                value={placement.supervisor.name}
                sub={placement.supervisor.phone}
              />
              <Detail
                label="Period"
                value={`${new Date(placement.start).toLocaleDateString()} – ${new Date(placement.end).toLocaleDateString()}`}
              />
              <Detail
                label="Instructor in charge"
                value={placement.instructor || "To be assigned"}
              />
            </div>

            {status === "submitted" && (
              <p className="text-[13px] text-subtle mt-4">
                Waiting for the school to accept.
              </p>
            )}

            {placement.assessment?.date && !done && (
              <div
                className="mt-4 rounded-3xl px-5 py-4 text-[14px] text-ink"
                style={{ backgroundColor: MINT }}
              >
                <b>Assessment day:</b>{" "}
                {new Date(placement.assessment.date).toLocaleDateString()}
                {placement.assessment.time &&
                  ` at ${placement.assessment.time}`}
                {placement.assessment.venue &&
                  `, ${placement.assessment.venue}`}
              </div>
            )}
          </Card>

          {/* Logbook */}
          {["approved", "completed"].includes(status) && (
            <Card
              title="Logbook"
              description="One entry per week. Your host supervisor or instructor signs each entry."
              tone="grey"
            >
              {placement.logbook.length === 0 && (
                <p className="text-[14px] text-subtle">No entries yet.</p>
              )}

              <ul className="flex flex-col gap-2.5">
                {placement.logbook.map((l) => (
                  <li
                    key={l.id}
                    className="bg-white rounded-3xl px-5 py-4 flex items-start gap-4"
                  >
                    <Pill className="bg-violet-100 text-violet-800 mt-0.5">
                      Week {l.week}
                    </Pill>
                    <div className="flex-1 min-w-0 text-[14px]">
                      <p>{l.activities}</p>
                      <p className="text-[13px] text-subtle mt-1">
                        Skills: {l.skills}
                      </p>
                    </div>
                    <Pill
                      className={
                        l.signed
                          ? "bg-green-100 text-green-800"
                          : "bg-amber-100 text-amber-800"
                      }
                    >
                      {l.signed ? "Signed" : "Awaiting signature"}
                    </Pill>
                  </li>
                ))}
              </ul>

              {!done && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    actions.addLog(placement.id, log);
                    setLog({ activities: "", skills: "" });
                  }}
                  className="mt-4 bg-white rounded-3xl p-5 flex flex-col gap-4"
                >
                  <Field
                    label={`Week ${placement.logbook.length + 1}: what did you do?`}
                  >
                    <textarea
                      required
                      rows={3}
                      value={log.activities}
                      onChange={(e) =>
                        setLog({ ...log, activities: e.target.value })
                      }
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Skills learned">
                    <input
                      required
                      value={log.skills}
                      onChange={(e) =>
                        setLog({ ...log, skills: e.target.value })
                      }
                      className={inputCls}
                    />
                  </Field>
                  <div>
                    <DarkBtn type="submit">Add entry</DarkBtn>
                  </div>
                </form>
              )}
            </Card>
          )}

          {/* Result */}
          {done && mark !== null && (
            <Card
              title="Your result"
              description="Released by your instructor. It also appears on your transcript."
            >
              <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-4">
                <div
                  className="rounded-[26px] p-6 flex flex-col text-white min-h-[220px]"
                  style={{ backgroundColor: VIOLET }}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[17px] font-medium">
                      Final attachment mark
                    </p>
                    <Pill className="bg-white/25 text-white">
                      Grade {gradeFor(mark)}
                    </Pill>
                  </div>
                  <p className="text-5xl font-semibold tracking-tight mt-auto">
                    {mark}%
                  </p>
                </div>

                <ul className="flex flex-col gap-2.5 bg-black/[0.04] rounded-[26px] p-4">
                  {Object.keys(weights).map((k) => (
                    <li
                      key={k}
                      className="bg-white rounded-3xl px-5 py-3.5 flex items-center justify-between gap-3"
                    >
                      <div>
                        <p className="text-[15px]">{labels[k]}</p>
                        <p className="text-[13px] text-subtle">
                          Weighs {weights[k]}%
                        </p>
                      </div>
                      <p className="text-[15px] font-semibold">
                        {placement.scores[k]}/100
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              {placement.remarks && (
                <div className="mt-4 rounded-3xl bg-black/[0.04] px-5 py-4">
                  <p className="text-[13px] text-subtle mb-1">
                    Instructor remarks
                  </p>
                  <p className="text-[14px]">{placement.remarks}</p>
                </div>
              )}
            </Card>
          )}
        </>
      )}
    </Shell>
  );
};

export default Attachment;

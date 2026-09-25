import { useState } from "react";
import { Download } from "lucide-react";
import Panel, {
  PageHeader,
  OutlineButton,
  DarkButton,
  Field,
  inputCls,
} from "../../components/layouts/Panel";
import { units, classFor } from "../../lib/mockData";
import { useTeaching, actions } from "../../lib/teachingStore";
import { downloadCsv } from "../../lib/Csv";

const Register = ({ unitId, date, klass, saved }) => {
  const [present, setPresent] = useState(saved || {});
  const [message, setMessage] = useState("");
  const count = klass.filter((s) => present[s._id]).length;
  const mark = (id, v) => {
    setPresent({ ...present, [id]: v });
    setMessage("");
  };
  const seg = (on, tone) =>
    `px-3 py-1 text-xs font-semibold rounded ${on ? tone : "text-subtle hover:text-ink"}`;

  return (
    <Panel flush>
      {klass.map((s, i) => (
        <div
          key={s._id}
          className={`px-5 py-3 flex items-center justify-between gap-3 ${i ? "border-t border-line" : ""}`}
        >
          <div>
            <p className="text-[13px] font-semibold">{s.fullName}</p>
            <p className="text-xs text-subtle font-mono">{s.admissionNumber}</p>
          </div>
          <div className="inline-flex gap-1 border border-line rounded p-0.5">
            <button
              onClick={() => mark(s._id, true)}
              className={seg(
                present[s._id] === true,
                "bg-green-50 text-green-700",
              )}
            >
              Present
            </button>
            <button
              onClick={() => mark(s._id, false)}
              className={seg(
                present[s._id] === false,
                "bg-red-50 text-red-700",
              )}
            >
              Absent
            </button>
          </div>
        </div>
      ))}
      <div className="p-4 border-t border-line flex items-center justify-between gap-3">
        <p className="text-xs text-subtle">
          {message || `${count} of ${klass.length} marked present`}
        </p>
        <div className="flex gap-2">
          <OutlineButton
            onClick={() => {
              const all = {};
              klass.forEach((s) => (all[s._id] = true));
              setPresent(all);
              setMessage("");
            }}
          >
            Mark all present
          </OutlineButton>
          <DarkButton
            onClick={() => {
              actions.saveAttendance(unitId, date, present);
              setMessage("Register saved.");
            }}
          >
            Save register
          </DarkButton>
        </div>
      </div>
    </Panel>
  );
};

const Attendance = () => {
  const st = useTeaching();
  const [unitId, setUnitId] = useState(units[0]._id);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const klass = classFor(unitId); // TODO(api): students registered for this unit
  const days = Object.keys(st.attendance[unitId] || {}).sort();

  const pct = (id) =>
    days.length
      ? Math.round(
          (days.filter((d) => st.attendance[unitId][d][id]).length /
            days.length) *
            100,
        )
      : null;
  const download = () =>
    downloadCsv(
      `attendance-${units.find((u) => u._id === unitId).code.replace(" ", "-")}.csv`,
      [
        ["Admission no.", "Name", ...days, "Attendance %"],
        ...klass.map((s) => [
          s.admissionNumber,
          s.fullName,
          ...days.map((d) => (st.attendance[unitId][d][s._id] ? "P" : "A")),
          pct(s._id) ?? "",
        ]),
      ],
    );

  return (
    <div>
      <PageHeader
        title="Attendance"
        subtitle="Mark who attended a class"
        actions={
          days.length > 0 && (
            <OutlineButton
              onClick={download}
              className="flex items-center gap-1.5"
            >
              <Download size={13} /> Download register
            </OutlineButton>
          )
        }
      />
      <div className="max-w-3xl flex flex-col gap-5">
        <Panel>
          <div className="flex gap-4 flex-wrap items-end">
            <div className="w-72">
              <Field label="Unit">
                <select
                  value={unitId}
                  onChange={(e) => setUnitId(e.target.value)}
                  className={inputCls}
                >
                  {units.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.code} — {u.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="w-44">
              <Field label="Date">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>
          </div>
        </Panel>

        <Register
          key={`${unitId}-${date}`}
          unitId={unitId}
          date={date}
          klass={klass}
          saved={st.attendance[unitId]?.[date]}
        />

        {days.length > 0 && (
          <Panel
            title="Attendance summary"
            description={`${days.length} class${days.length === 1 ? "" : "es"} recorded`}
            flush
          >
            {klass.map((s, i) => (
              <div
                key={s._id}
                className={`px-5 py-2.5 flex items-center gap-3 ${i ? "border-t border-line" : ""}`}
              >
                <span className="flex-1 text-[13px]">{s.fullName}</span>
                <div className="w-40 h-1.5 bg-canvas rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${pct(s._id) >= 75 ? "bg-good" : "bg-tenant"}`}
                    style={{ width: `${pct(s._id)}%` }}
                  />
                </div>
                <b className="text-xs w-10 text-right">{pct(s._id)}%</b>
              </div>
            ))}
          </Panel>
        )}
      </div>
    </div>
  );
};

export default Attendance;

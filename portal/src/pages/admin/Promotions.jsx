import { useState } from "react";
import Panel, {
  PageHeader,
  StatusPill,
  DarkButton,
  Field,
  inputCls,
} from "../../components/layouts/Panel";
import { students as seed, programmes } from "../../lib/mockData";
import { useAttachments } from "../../lib/Attachmentstore";
import {
  durationLabel,
  isShortCourse,
  totalYears,
  todayISO,
} from "../../lib/duration";

const decisions = [
  "promote",
  "repeat",
  "defer",
  "discontinue",
  "graduate",
  "hold",
  "continue",
];

// Long courses are promoted year by year. Short courses (a year or less) have no
// promotion: the student continues until the course period ends, then graduates.
const Promotion = () => {
  const placements = useAttachments();
  const [programmeId, setProgrammeId] = useState(programmes[0]._id);
  const [rules, setRules] = useState({
    passMark: 40,
    maxFailed: 2,
    requireFees: true,
  });
  const [list, setList] = useState(seed); // TODO(api): GET /students?programme=...&academicYear=...
  const [overrides, setOverrides] = useState({});
  const [message, setMessage] = useState("");

  const prog = programmes.find((p) => p._id === programmeId);
  const rows = list.filter(
    (s) => s.programmeId === programmeId && s.status === "active",
  );
  const today = todayISO();

  const attachmentDone = (s) =>
    placements.some((p) => p.studentId === s._id && p.status === "completed");
  const passes = (s) =>
    s.mean >= rules.passMark &&
    s.failed <= rules.maxFailed &&
    (!rules.requireFees || s.feesCleared);

  const suggest = (s) => {
    if (isShortCourse(s.duration)) {
      if (s.endDate > today) return "continue";
      return passes(s) ? "graduate" : "repeat";
    }
    if (s.year >= totalYears(s.duration))
      return attachmentDone(s) && s.failed === 0 ? "graduate" : "hold";
    return passes(s) ? "promote" : "repeat";
  };
  const decision = (s) => overrides[s._id] || suggest(s);

  const apply = () => {
    // TODO(api): await api.post("/students/promotion", { decisions })
    setList(
      list.map((s) => {
        if (s.programmeId !== programmeId || s.status !== "active") return s;
        const d = decision(s);
        if (d === "promote") return { ...s, year: s.year + 1 };
        if (d === "graduate") return { ...s, status: "graduated" };
        if (d === "discontinue") return { ...s, status: "discontinued" };
        if (d === "defer") return { ...s, status: "deferred" };
        return s;
      }),
    );
    setOverrides({});
    setMessage("Applied. Each student's year history is kept.");
  };

  const num = (k) => (e) => setRules({ ...rules, [k]: Number(e.target.value) });

  return (
    <div>
      <PageHeader
        title="Promotion & graduation"
        subtitle="Review by each student's own course period"
      />
      <div className="flex flex-col gap-5">
        <Panel
          title="Rules"
          description="Suggestions follow these. You can override any student below."
        >
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <Field label="Programme">
              <select
                value={programmeId}
                onChange={(e) => setProgrammeId(e.target.value)}
                className={inputCls}
              >
                {programmes.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Pass mark (mean %)">
              <input
                type="number"
                value={rules.passMark}
                onChange={num("passMark")}
                className={inputCls}
              />
            </Field>
            <Field label="Max failed units">
              <input
                type="number"
                value={rules.maxFailed}
                onChange={num("maxFailed")}
                className={inputCls}
              />
            </Field>
            <label className="flex items-center gap-2 text-xs pb-2">
              <input
                type="checkbox"
                checked={rules.requireFees}
                onChange={(e) =>
                  setRules({ ...rules, requireFees: e.target.checked })
                }
              />{" "}
              Require fees cleared
            </label>
          </div>
        </Panel>

        <Panel
          title={prog.name}
          description="Long courses: final-year students graduate only after attachment is completed. Short courses graduate when their period ends."
          flush
        >
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-subtle text-xs bg-canvas">
                  <th className="px-5 py-2.5 font-medium">Student</th>
                  <th className="px-5 py-2.5 font-medium">Course period</th>
                  <th className="px-5 py-2.5 font-medium">Progress</th>
                  <th className="px-5 py-2.5 font-medium text-right">Mean</th>
                  <th className="px-5 py-2.5 font-medium text-right">Failed</th>
                  <th className="px-5 py-2.5 font-medium">Fees</th>
                  <th className="px-5 py-2.5 font-medium">Attachment</th>
                  <th className="px-5 py-2.5 font-medium">Decision</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => {
                  const short = isShortCourse(s.duration);
                  const final = !short && s.year >= totalYears(s.duration);
                  return (
                    <tr
                      key={s._id}
                      className="border-t border-line hover:bg-canvas"
                    >
                      <td className="px-5 py-3">
                        <p className="font-semibold">{s.fullName}</p>
                        <p className="text-xs text-subtle font-mono">
                          {s.admissionNumber}
                        </p>
                      </td>
                      <td className="px-5 py-3">
                        {durationLabel(s.duration)}
                        <p className="text-xs text-subtle">
                          ends {new Date(s.endDate).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-5 py-3">
                        {short ? (
                          s.endDate > today ? (
                            "In progress"
                          ) : (
                            "Period ended"
                          )
                        ) : (
                          <>
                            Year {s.year} of {totalYears(s.duration)}
                            {final && (
                              <span className="text-xs text-subtle">
                                {" "}
                                (final)
                              </span>
                            )}
                          </>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">{s.mean}%</td>
                      <td className="px-5 py-3 text-right">{s.failed}</td>
                      <td className="px-5 py-3">
                        {s.feesCleared ? (
                          <span className="text-good font-semibold text-xs">
                            Cleared
                          </span>
                        ) : (
                          <span className="text-badge font-semibold text-xs">
                            Owing
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {final ? (
                          <StatusPill
                            status={attachmentDone(s) ? "completed" : "pending"}
                          />
                        ) : (
                          <span className="text-subtle">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <select
                            value={decision(s)}
                            onChange={(e) =>
                              setOverrides({
                                ...overrides,
                                [s._id]: e.target.value,
                              })
                            }
                            className="border border-line rounded px-2 py-1 text-xs capitalize"
                          >
                            {decisions.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                          {overrides[s._id] && (
                            <span className="text-[10px] text-link font-semibold">
                              edited
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-10 text-center text-subtle"
                    >
                      No active students in this programme.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-line flex items-center justify-between gap-3">
            <p className="text-xs text-good font-semibold">{message}</p>
            <DarkButton
              onClick={apply}
              disabled={!rows.length}
              className="disabled:opacity-40"
            >
              Apply decisions
            </DarkButton>
          </div>
        </Panel>
      </div>
    </div>
  );
};

export default Promotion;

import { useState } from "react";
import Panel, {
  PageHeader,
  Field,
  inputCls,
} from "../../components/layouts/Panel";
import { usePrograms } from "../../lib/programStore";
import { useAcademic, actions, instructors } from "../../lib/AcademicStore";

const UnitAssignment = () => {
  const progSt = usePrograms();
  const acSt = useAcademic();
  const [semesterId, setSemesterId] = useState(acSt.semesters[0]?._id || "");

  const semester = acSt.semesters.find((s) => s._id === semesterId);
  const assignedMap = acSt.assignments[semesterId] || {};

  if (!acSt.semesters.length) {
    return (
      <div>
        <PageHeader
          title="Unit assignment"
          subtitle="Assign an instructor to each unit for a semester"
        />
        <Panel>
          <p className="text-sm text-subtle">
            Add a semester first, under Semesters & intakes.
          </p>
        </Panel>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Unit assignment"
        subtitle="Assign an instructor to each unit for a semester"
      />

      <Panel className="mb-5">
        <div className="w-80">
          <Field label="Semester">
            <select
              value={semesterId}
              onChange={(e) => setSemesterId(e.target.value)}
              className={inputCls}
            >
              {acSt.semesters.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Panel>

      <Panel flush>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-subtle text-xs bg-canvas">
                <th className="px-5 py-2.5 font-medium">Unit</th>
                <th className="px-5 py-2.5 font-medium">Instructor</th>
              </tr>
            </thead>
            <tbody>
              {progSt.units.map((u) => (
                <tr key={u._id} className="border-t border-line">
                  <td className="px-5 py-2.5">
                    <p className="font-semibold">{u.name}</p>
                    <p className="text-xs text-subtle font-mono">{u.code}</p>
                  </td>
                  <td className="px-5 py-2.5">
                    <select
                      value={assignedMap[u._id] || ""}
                      onChange={(e) =>
                        actions.setAssignment(semesterId, u._id, e.target.value)
                      }
                      className={`${inputCls} !w-56`}
                    >
                      <option value="">Unassigned</option>
                      {instructors.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.fullName}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {progSt.units.length === 0 && (
                <tr>
                  <td
                    colSpan={2}
                    className="px-5 py-10 text-center text-subtle"
                  >
                    No units yet — add some under Units.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      {semester && (
        <p className="text-xs text-subtle mt-3">
          Registration for {semester.label} runs{" "}
          {semester.registrationOpens
            ? new Date(semester.registrationOpens).toLocaleDateString()
            : "—"}{" "}
          to{" "}
          {semester.registrationCloses
            ? new Date(semester.registrationCloses).toLocaleDateString()
            : "—"}
          .
        </p>
      )}
    </div>
  );
};

export default UnitAssignment;

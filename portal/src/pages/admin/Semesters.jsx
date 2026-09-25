import { useState } from "react";
import { Trash2, Pencil, Plus } from "lucide-react";
import Panel, {
  PageHeader,
  DarkButton,
  OutlineButton,
  Field,
  inputCls,
} from "../../components/layouts/Panel";
import { useAcademic, actions } from "../../lib/AcademicStore";

const blank = {
  label: "",
  startDate: "",
  endDate: "",
  registrationOpens: "",
  registrationCloses: "",
};

const dateCols = [
  ["startDate", "Start date"],
  ["endDate", "End date"],
  ["registrationOpens", "Registration opens"],
  ["registrationCloses", "Registration closes"],
];

const Semesters = () => {
  const st = useAcademic();
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [message, setMessage] = useState("");

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const add = (e) => {
    e.preventDefault();
    if (!form.label || !form.startDate || !form.endDate)
      return setMessage("Label, start date and end date are required.");
    actions.addSemester(form);
    setForm(blank);
    setMessage(`${form.label} added.`);
  };

  const startEdit = (s) => {
    setEditingId(s._id);
    setEditForm({ ...s });
  };
  const saveEdit = () => {
    actions.updateSemester(editingId, editForm);
    setEditingId(null);
    setEditForm(null);
  };

  return (
    <div>
      <PageHeader
        title="Semesters & intakes"
        subtitle="Define each semester's dates and its registration window"
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5 items-start mb-5">
        <Panel title="Semesters" flush>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-subtle text-xs bg-canvas">
                  <th className="px-5 py-2.5 font-medium">Semester</th>
                  {dateCols.map(([, label]) => (
                    <th key={label} className="px-3 py-2.5 font-medium">
                      {label}
                    </th>
                  ))}
                  <th className="px-5 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {st.semesters.map((s) => {
                  const editing = editingId === s._id;
                  return (
                    <tr key={s._id} className="border-t border-line">
                      <td className="px-5 py-2.5">
                        {editing ? (
                          <input
                            value={editForm.label}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                label: e.target.value,
                              })
                            }
                            className={`${inputCls} !w-40`}
                          />
                        ) : (
                          <span className="font-semibold">{s.label}</span>
                        )}
                      </td>
                      {dateCols.map(([key]) => (
                        <td key={key} className="px-3 py-2.5">
                          {editing ? (
                            <input
                              type="date"
                              value={editForm[key] || ""}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  [key]: e.target.value,
                                })
                              }
                              className={`${inputCls} !w-36`}
                            />
                          ) : (
                            <span className="text-xs">
                              {s[key]
                                ? new Date(s[key]).toLocaleDateString()
                                : "—"}
                            </span>
                          )}
                        </td>
                      ))}
                      <td className="px-5 py-2.5 text-right whitespace-nowrap">
                        {editing ? (
                          <button
                            onClick={saveEdit}
                            className="text-xs font-semibold text-link"
                          >
                            Save
                          </button>
                        ) : (
                          <button
                            onClick={() => startEdit(s)}
                            className="text-subtle hover:text-ink mr-2"
                            aria-label="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => actions.deleteSemester(s._id)}
                          className="text-subtle hover:text-badge"
                          aria-label="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {st.semesters.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-10 text-center text-subtle"
                    >
                      No semesters yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Add semester / intake">
          <form onSubmit={add} className="flex flex-col gap-3">
            <Field label="Label">
              <input
                value={form.label}
                onChange={set("label")}
                placeholder="Semester 2, 2026"
                className={inputCls}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start date">
                <input
                  type="date"
                  value={form.startDate}
                  onChange={set("startDate")}
                  className={inputCls}
                />
              </Field>
              <Field label="End date">
                <input
                  type="date"
                  value={form.endDate}
                  onChange={set("endDate")}
                  className={inputCls}
                />
              </Field>
              <Field label="Registration opens">
                <input
                  type="date"
                  value={form.registrationOpens}
                  onChange={set("registrationOpens")}
                  className={inputCls}
                />
              </Field>
              <Field label="Registration closes">
                <input
                  type="date"
                  value={form.registrationCloses}
                  onChange={set("registrationCloses")}
                  className={inputCls}
                />
              </Field>
            </div>
            {message && (
              <p className="text-xs text-good font-semibold">{message}</p>
            )}
            <DarkButton
              type="submit"
              className="w-full py-2.5 flex items-center justify-center gap-1.5"
            >
              <Plus size={14} /> Add semester
            </DarkButton>
          </form>
        </Panel>
      </div>
    </div>
  );
};

export default Semesters;

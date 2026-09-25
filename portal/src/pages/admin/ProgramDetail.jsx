import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Panel, {
  PageHeader,
  StatusPill,
  OutlineButton,
  DarkButton,
  Field,
  inputCls,
} from "../../components/layouts/Panel";
import { departments } from "../../lib/mockData";
import { presets } from "../../lib/duration";
import { usePrograms, actions, unitsInProgram } from "../../lib/programStore";

const blank = {
  code: "",
  name: "",
  dept: "",
  level: "diploma",
  duration: { value: 3, unit: "years" },
};

// Handles /admin/programs/new and /admin/programs/:id — same page, same as StudentDetail's shape.
const ProgramDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const st = usePrograms();
  const isNew = id === "new";
  const existing = !isNew ? st.programs.find((p) => p._id === id) : null;

  const [form, setForm] = useState(existing ? { ...existing } : blank);
  const [message, setMessage] = useState("");
  const [addUnitId, setAddUnitId] = useState("");
  const [addPeriod, setAddPeriod] = useState(1);

  if (!isNew && !existing) {
    return (
      <div>
        <PageHeader title="Program not found" />
        <Link to="/admin/programs" className="text-xs text-link">
          Back to programs
        </Link>
      </div>
    );
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const totalYears = form.duration?.unit === "years" ? form.duration.value : 1;
  const periods = Array.from(
    { length: Math.max(1, totalYears) },
    (_, i) => i + 1,
  );
  const structure = existing?.structure || [];
  const inProgram = existing ? unitsInProgram(st, existing._id) : [];
  const available = st.units.filter(
    (u) => !inProgram.some((iu) => iu._id === u._id),
  );

  const save = () => {
    if (!form.name || !form.dept)
      return setMessage("Name and department are required.");
    if (isNew) {
      actions.addProgram({ ...form, structure: [] });
      navigate("/admin/programs");
    } else {
      actions.updateProgram(existing._id, form);
      setMessage("Saved.");
    }
  };

  const remove = () => {
    if (!existing) return;
    actions.deleteProgram(existing._id);
    navigate("/admin/programs");
  };

  const toggleArchive = () =>
    actions.updateProgram(existing._id, {
      status: existing.status === "active" ? "archived" : "active",
    });

  const addUnitToPeriod = () => {
    if (!addUnitId) return;
    const next = structure.some((s) => s.period === addPeriod)
      ? structure.map((s) =>
          s.period === addPeriod
            ? { ...s, unitIds: [...s.unitIds, addUnitId] }
            : s,
        )
      : [...structure, { period: addPeriod, unitIds: [addUnitId] }];
    actions.setProgramStructure(existing._id, next);
    setAddUnitId("");
  };

  const removeUnitFromPeriod = (period, unitId) =>
    actions.setProgramStructure(
      existing._id,
      structure.map((s) =>
        s.period === period
          ? { ...s, unitIds: s.unitIds.filter((uid) => uid !== unitId) }
          : s,
      ),
    );

  return (
    <div>
      <Link
        to="/admin/programs"
        className="inline-flex items-center gap-1.5 text-xs text-subtle hover:text-ink mb-3"
      >
        <ArrowLeft size={14} /> Back to programs
      </Link>
      <PageHeader
        title={isNew ? "Add program" : form.name}
        subtitle={isNew ? "Define a new program" : form.code}
        actions={
          !isNew && (
            <div className="flex gap-2">
              <OutlineButton onClick={toggleArchive}>
                {existing.status === "active" ? "Archive" : "Reactivate"}
              </OutlineButton>
              <OutlineButton onClick={remove} className="text-badge">
                <Trash2 size={13} className="inline mr-1" /> Delete
              </OutlineButton>
            </div>
          )
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5 items-start">
        <div className="flex flex-col gap-5">
          <Panel title="Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Program name">
                <input
                  value={form.name}
                  onChange={set("name")}
                  className={inputCls}
                />
              </Field>
              <Field label="Code">
                <input
                  value={form.code}
                  onChange={set("code")}
                  className={inputCls}
                />
              </Field>
              <Field label="Department">
                <select
                  value={form.dept}
                  onChange={set("dept")}
                  className={inputCls}
                >
                  <option value="">Select…</option>
                  {departments.map((d) => (
                    <option key={d.code} value={d.code}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Level">
                <select
                  value={form.level}
                  onChange={set("level")}
                  className={inputCls}
                >
                  <option value="certificate">Certificate</option>
                  <option value="diploma">Diploma</option>
                </select>
              </Field>
              <Field label="Course period">
                <select
                  value={presets.findIndex(
                    (p) =>
                      p.value === form.duration?.value &&
                      p.unit === form.duration?.unit,
                  )}
                  onChange={(e) => {
                    const p = presets[Number(e.target.value)];
                    setForm({
                      ...form,
                      duration: { value: p.value, unit: p.unit },
                    });
                  }}
                  className={inputCls}
                >
                  {presets.map((p, i) => (
                    <option key={p.label} value={i}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </Field>
              {!isNew && (
                <div className="flex items-end pb-2">
                  <StatusPill status={existing.status} />
                </div>
              )}
            </div>
          </Panel>

          {!isNew && (
            <Panel
              title="Units by period"
              description="Which units belong to each year (or the whole course, for programs a year or less)"
              flush
            >
              <div className="px-5 pb-4 flex flex-col gap-4">
                {periods.map((period) => {
                  const row = structure.find((s) => s.period === period);
                  const periodUnits = row
                    ? st.units.filter((u) => row.unitIds.includes(u._id))
                    : [];
                  return (
                    <div key={period}>
                      <p className="text-xs font-semibold text-subtle mb-1.5">
                        {totalYears > 1 ? `Year ${period}` : "Full course"}
                      </p>
                      {periodUnits.length === 0 && (
                        <p className="text-xs text-subtle">No units yet.</p>
                      )}
                      <div className="flex flex-col gap-1">
                        {periodUnits.map((u) => (
                          <div
                            key={u._id}
                            className="flex items-center justify-between border border-line rounded px-3 py-1.5"
                          >
                            <span>
                              {u.code} — {u.name}
                            </span>
                            <button
                              onClick={() =>
                                removeUnitFromPeriod(period, u._id)
                              }
                              className="text-subtle hover:text-badge"
                              aria-label="Remove unit"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                <div className="flex items-end gap-2 pt-2 border-t border-line">
                  <div className="flex-1">
                    <Field label="Add unit">
                      <select
                        value={addUnitId}
                        onChange={(e) => setAddUnitId(e.target.value)}
                        className={inputCls}
                      >
                        <option value="">Select a unit…</option>
                        {available.map((u) => (
                          <option key={u._id} value={u._id}>
                            {u.code} — {u.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  {totalYears > 1 && (
                    <div className="w-32">
                      <Field label="Period">
                        <select
                          value={addPeriod}
                          onChange={(e) => setAddPeriod(Number(e.target.value))}
                          className={inputCls}
                        >
                          {periods.map((p) => (
                            <option key={p} value={p}>
                              Year {p}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                  )}
                  <button
                    onClick={addUnitToPeriod}
                    className="flex items-center gap-1 text-xs font-semibold text-link py-2"
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>
              </div>
            </Panel>
          )}
        </div>

        <Panel title={isNew ? "Create" : "Save changes"}>
          {message && (
            <p className="text-xs text-good font-semibold mb-3">{message}</p>
          )}
          <DarkButton onClick={save} className="w-full py-2.5">
            {isNew ? "Create program" : "Save"}
          </DarkButton>
        </Panel>
      </div>
    </div>
  );
};

export default ProgramDetail;

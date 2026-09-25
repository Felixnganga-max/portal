import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import Panel, {
  PageHeader,
  OutlineButton,
  DarkButton,
  Field,
  inputCls,
} from "../../components/layouts/Panel";
import {
  usePrograms,
  actions,
  programsUsingUnit,
} from "../../lib/programStore";

const blank = { code: "", name: "", creditHours: 3, prerequisiteIds: [] };

// Handles /admin/units/new and /admin/units/:id.
const UnitDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const st = usePrograms();
  const isNew = id === "new";
  const existing = !isNew ? st.units.find((u) => u._id === id) : null;
  const [form, setForm] = useState(existing ? { ...existing } : blank);
  const [message, setMessage] = useState("");

  if (!isNew && !existing) {
    return (
      <div>
        <PageHeader title="Unit not found" />
        <Link to="/admin/units" className="text-xs text-link">
          Back to units
        </Link>
      </div>
    );
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const usedBy = existing ? programsUsingUnit(st, existing._id) : [];
  const otherUnits = st.units.filter((u) => u._id !== existing?._id);

  const togglePrereq = (uid) =>
    setForm({
      ...form,
      prerequisiteIds: form.prerequisiteIds?.includes(uid)
        ? form.prerequisiteIds.filter((x) => x !== uid)
        : [...(form.prerequisiteIds || []), uid],
    });

  const save = () => {
    if (!form.code || !form.name)
      return setMessage("Code and name are required.");
    const payload = { ...form, creditHours: Number(form.creditHours) };
    if (isNew) {
      actions.addUnit(payload);
      navigate("/admin/units");
    } else {
      actions.updateUnit(existing._id, payload);
      setMessage("Saved.");
    }
  };

  const remove = () => {
    if (!existing) return;
    actions.deleteUnit(existing._id);
    navigate("/admin/units");
  };

  return (
    <div>
      <Link
        to="/admin/units"
        className="inline-flex items-center gap-1.5 text-xs text-subtle hover:text-ink mb-3"
      >
        <ArrowLeft size={14} /> Back to units
      </Link>
      <PageHeader
        title={isNew ? "Add unit" : `${form.code} — ${form.name}`}
        subtitle={
          isNew ? "Define a new unit" : `Used by ${usedBy.length} program(s)`
        }
        actions={
          !isNew && (
            <OutlineButton onClick={remove} className="text-badge">
              <Trash2 size={13} className="inline mr-1" /> Delete
            </OutlineButton>
          )
        }
      />
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5 items-start">
        <div className="flex flex-col gap-5">
          <Panel title="Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Code">
                <input
                  value={form.code}
                  onChange={set("code")}
                  className={inputCls}
                />
              </Field>
              <Field label="Name">
                <input
                  value={form.name}
                  onChange={set("name")}
                  className={inputCls}
                />
              </Field>
              <Field label="Credit hours">
                <input
                  type="number"
                  min="0"
                  value={form.creditHours}
                  onChange={set("creditHours")}
                  className={inputCls}
                />
              </Field>
            </div>
          </Panel>

          <Panel
            title="Prerequisites"
            description="Units a student must pass before taking this one"
          >
            <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto">
              {otherUnits.length === 0 && (
                <p className="text-xs text-subtle">No other units yet.</p>
              )}
              {otherUnits.map((u) => (
                <label
                  key={u._id}
                  className="flex items-center gap-2 text-[13px]"
                >
                  <input
                    type="checkbox"
                    checked={form.prerequisiteIds?.includes(u._id) || false}
                    onChange={() => togglePrereq(u._id)}
                  />
                  {u.code} — {u.name}
                </label>
              ))}
            </div>
          </Panel>

          {!isNew && (
            <Panel title="Used by">
              {usedBy.length === 0 ? (
                <p className="text-xs text-subtle">
                  Not part of any program yet.
                </p>
              ) : (
                <ul className="text-[13px] flex flex-col gap-1">
                  {usedBy.map((p) => (
                    <li key={p._id}>
                      <Link
                        to={`/admin/programs/${p._id}`}
                        className="text-link"
                      >
                        {p.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          )}
        </div>

        <Panel title={isNew ? "Create" : "Save changes"}>
          {message && (
            <p className="text-xs text-good font-semibold mb-3">{message}</p>
          )}
          <DarkButton onClick={save} className="w-full py-2.5">
            {isNew ? "Create unit" : "Save"}
          </DarkButton>
        </Panel>
      </div>
    </div>
  );
};

export default UnitDetail;

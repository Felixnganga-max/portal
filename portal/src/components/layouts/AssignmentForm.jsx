import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { DarkButton, OutlineButton, Field, inputCls } from "../layouts/Panel";
import FileDrop from "./FileDrop";
import { KIND, FILE_TYPES } from "./Ui";
import { inDays } from "../../lib/assignmentStore";

const blank = (unitId) => ({
  unitId,
  title: "",
  description: "",
  kind: "graded",
  componentId: "",
  outOf: 20,
  weight: "",
  bonus: 5,
  opensAt: "",
  dueAt: inDays(7),
  latePolicy: { mode: "none", cutoffAt: "", penaltyPerDay: 10, maxPenalty: 30 },
  submitMode: "online",
  accept: {
    text: true,
    files: true,
    link: false,
    maxFiles: 3,
    maxSizeMB: 5,
    types: ["pdf", "doc", "docx"],
  },
  briefFiles: [],
  requireDeclaration: true,
});

const Section = ({ title, hint, children }) => (
  <section className="mb-7">
    <h3 className="text-sm font-bold">{title}</h3>
    {hint && <p className="text-xs text-subtle mt-0.5 mb-3">{hint}</p>}
    {!hint && <div className="mb-3" />}
    <div className="flex flex-col gap-4">{children}</div>
  </section>
);

// Create or edit an assignment. Everything the teacher can define lives here:
// kind, marks and weight, schedule and late policy, what students may submit, and the brief.
const AssignmentForm = ({
  initial,
  units,
  defaultUnitId,
  getComponents,
  siblingWeight,
  onSave,
  onCancel,
}) => {
  const [f, setF] = useState(() =>
    initial
      ? {
          ...blank(initial.unitId),
          ...initial,
          weight: initial.weight ?? "",
          bonus: initial.bonus ?? 5,
          outOf: initial.outOf ?? 20,
          componentId: initial.componentId || "",
        }
      : blank(defaultUnitId),
  );
  const [errors, setErrors] = useState([]);

  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const setLate = (k, v) =>
    setF((x) => ({ ...x, latePolicy: { ...x.latePolicy, [k]: v } }));
  const setAccept = (k, v) =>
    setF((x) => ({ ...x, accept: { ...x.accept, [k]: v } }));

  const comps = getComponents(f.unitId);
  const marked = f.kind === "graded" || f.kind === "extra";
  const componentId = marked ? f.componentId || comps[0]?.id || "" : "";
  const comp = comps.find((c) => c.id === componentId);
  const used =
    f.kind === "graded" && componentId
      ? siblingWeight(f.unitId, componentId, initial?.id)
      : 0;
  const total = used + Number(f.weight || 0);
  const scheduled = f.opensAt && new Date(f.opensAt) > new Date();

  const toggleType = (t) =>
    setAccept(
      "types",
      f.accept.types.includes(t)
        ? f.accept.types.filter((x) => x !== t)
        : [...f.accept.types, t],
    );

  const submit = (status) => {
    const errs = [];
    if (!f.title.trim()) errs.push("Give the assignment a title.");
    if (!f.dueAt) errs.push("Set a due date and time.");
    if (f.opensAt && f.dueAt && new Date(f.opensAt) >= new Date(f.dueAt))
      errs.push("It must open before it is due.");
    if (marked) {
      if (!componentId)
        errs.push(
          "Choose which component it counts towards. Add one in Results if the unit has none made from assignments.",
        );
      if (!(Number(f.outOf) > 0)) errs.push("Total marks must be more than 0.");
    }
    if (f.kind === "graded" && !(Number(f.weight) > 0))
      errs.push("Give it a weight (a percentage of the component).");
    if (f.kind === "extra" && !(Number(f.bonus) > 0))
      errs.push("Set how much bonus it can add.");
    if (
      f.submitMode === "online" &&
      !f.accept.text &&
      !f.accept.files &&
      !f.accept.link
    )
      errs.push("Allow at least one way to submit: text, files or a link.");
    if (f.submitMode === "online" && f.accept.files && !f.accept.types.length)
      errs.push("Pick at least one accepted file type.");
    if (
      f.submitMode === "online" &&
      f.latePolicy.mode === "penalty" &&
      f.latePolicy.cutoffAt &&
      new Date(f.latePolicy.cutoffAt) <= new Date(f.dueAt)
    )
      errs.push("The late cut-off must be after the due date.");
    setErrors(errs);
    if (errs.length) return;

    onSave({
      ...f,
      title: f.title.trim(),
      componentId: marked ? componentId : null,
      outOf: marked ? Number(f.outOf) : null,
      weight: f.kind === "graded" ? Number(f.weight) : null,
      bonus: f.kind === "extra" ? Number(f.bonus) : undefined,
      accept: {
        ...f.accept,
        maxFiles: Number(f.accept.maxFiles) || 1,
        maxSizeMB: Number(f.accept.maxSizeMB) || 1,
      },
      latePolicy: {
        ...f.latePolicy,
        penaltyPerDay: Number(f.latePolicy.penaltyPerDay) || 0,
        maxPenalty: Number(f.latePolicy.maxPenalty) || 0,
      },
      requireDeclaration: f.submitMode === "online" && f.requireDeclaration,
      status,
    });
  };

  return (
    <div className="flex flex-col min-h-full">
      <Section title="1. The basics">
        <Field label="Unit">
          <select
            value={f.unitId}
            onChange={(e) =>
              setF((x) => ({ ...x, unitId: e.target.value, componentId: "" }))
            }
            className={inputCls}
          >
            {units.map((u) => (
              <option key={u._id} value={u._id}>
                {u.code} — {u.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Title">
          <input
            value={f.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Case study: Leadership styles"
            className={inputCls}
          />
        </Field>
        <Field label="Instructions">
          <textarea
            rows={4}
            value={f.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="What students must do, and how it will be marked"
            className={inputCls}
          />
        </Field>
      </Section>

      <Section
        title="2. What kind of assignment is it?"
        hint="This decides whether it is marked and whether it counts."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(KIND).map(([key, k]) => (
            <label
              key={key}
              className={`border rounded-md p-3 cursor-pointer ${f.kind === key ? "border-tenant bg-tenant-soft" : "border-line hover:bg-canvas"}`}
            >
              <span className="flex items-center gap-2">
                <input
                  type="radio"
                  name="kind"
                  checked={f.kind === key}
                  onChange={() => set("kind", key)}
                  className="accent-[var(--tenant-color,#C0272D)]"
                />
                <span className="text-[13px] font-semibold">{k.label}</span>
              </span>
              <span className="block text-xs text-subtle mt-1 ml-6">
                {k.hint}
              </span>
            </label>
          ))}
        </div>
      </Section>

      {marked && (
        <Section
          title="3. Marks and weight"
          hint={
            f.kind === "extra"
              ? "Bonus marks are added on top of the component score, which is capped at its full weight."
              : "Weights are percentages of the component. They should add up to 100% across its graded assignments."
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Counts towards">
              <select
                value={componentId}
                onChange={(e) => set("componentId", e.target.value)}
                className={inputCls}
              >
                {comps.length === 0 && (
                  <option value="">No component made from assignments</option>
                )}
                {comps.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.weight}% of the unit)
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Total marks">
              <input
                type="number"
                min="1"
                value={f.outOf}
                onChange={(e) => set("outOf", e.target.value)}
                className={inputCls}
              />
            </Field>
            {f.kind === "graded" ? (
              <Field label={`Weight (% of ${comp?.name || "the component"})`}>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={f.weight}
                  onChange={(e) => set("weight", e.target.value)}
                  className={inputCls}
                />
              </Field>
            ) : (
              <Field
                label={`Bonus (% of ${comp?.name || "the component"} it can add)`}
              >
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={f.bonus}
                  onChange={(e) => set("bonus", e.target.value)}
                  className={inputCls}
                />
              </Field>
            )}
          </div>
          {f.kind === "graded" && comp && (
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-subtle">
                  Weights in {comp.name}: {used}% already +{" "}
                  {Number(f.weight || 0)}% this one
                </span>
                <b
                  className={
                    total === 100
                      ? "text-good"
                      : total > 100
                        ? "text-badge"
                        : "text-amber-700"
                  }
                >
                  {total}% of 100%
                </b>
              </div>
              <div className="h-2 bg-canvas rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-ink/30"
                  style={{ width: `${Math.min(100, used)}%` }}
                />
                <div
                  className={`h-full ${total > 100 ? "bg-badge" : "bg-tenant"}`}
                  style={{
                    width: `${Math.max(0, Math.min(100 - Math.min(100, used), Number(f.weight || 0)))}%`,
                  }}
                />
              </div>
              {total !== 100 && (
                <p className="text-[11px] text-subtle mt-1.5">
                  {total < 100
                    ? "You can add more assignments to reach 100%."
                    : "Over 100%. Marks will be scaled to fit, or lower another weight."}
                </p>
              )}
            </div>
          )}
        </Section>
      )}

      <Section
        title={marked ? "4. Schedule" : "3. Schedule"}
        hint="Students only see it once it opens. Set a due time as well as a date."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Opens (optional)">
            <input
              type="datetime-local"
              value={f.opensAt}
              onChange={(e) => set("opensAt", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field
            label={f.submitMode === "offline" ? "Date held / marks due" : "Due"}
          >
            <input
              type="datetime-local"
              value={f.dueAt}
              onChange={(e) => set("dueAt", e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>
        {f.submitMode === "online" && (
          <>
            <Field label="Late work">
              <select
                value={f.latePolicy.mode}
                onChange={(e) => setLate("mode", e.target.value)}
                className={inputCls}
              >
                <option value="none">Not accepted after the deadline</option>
                <option value="penalty">
                  Accepted with a penalty, until a cut-off
                </option>
                <option value="flag">Accepted any time, flagged as late</option>
              </select>
            </Field>
            {f.latePolicy.mode === "penalty" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Penalty per day (%)">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={f.latePolicy.penaltyPerDay}
                    onChange={(e) => setLate("penaltyPerDay", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Maximum penalty (%)">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={f.latePolicy.maxPenalty}
                    onChange={(e) => setLate("maxPenalty", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Closes completely at">
                  <input
                    type="datetime-local"
                    value={f.latePolicy.cutoffAt}
                    onChange={(e) => setLate("cutoffAt", e.target.value)}
                    className={inputCls}
                  />
                </Field>
              </div>
            )}
          </>
        )}
      </Section>

      <Section
        title={marked ? "5. How students hand in" : "4. How students hand in"}
      >
        <div className="grid grid-cols-2 gap-3">
          {[
            ["online", "Online", "Students submit here"],
            [
              "offline",
              "Offline",
              "Done in class or on paper. You enter marks",
            ],
          ].map(([v, l, h]) => (
            <label
              key={v}
              className={`border rounded-md p-3 cursor-pointer ${f.submitMode === v ? "border-tenant bg-tenant-soft" : "border-line hover:bg-canvas"}`}
            >
              <span className="flex items-center gap-2">
                <input
                  type="radio"
                  name="mode"
                  checked={f.submitMode === v}
                  onChange={() => set("submitMode", v)}
                  className="accent-[var(--tenant-color,#C0272D)]"
                />
                <span className="text-[13px] font-semibold">{l}</span>
              </span>
              <span className="block text-xs text-subtle mt-1 ml-6">{h}</span>
            </label>
          ))}
        </div>
        {f.submitMode === "online" && (
          <>
            <div>
              <p className="text-xs text-subtle mb-1.5">Students may submit</p>
              <div className="flex gap-5 flex-wrap text-[13px]">
                {[
                  ["text", "A typed answer"],
                  ["files", "Files"],
                  ["link", "A link"],
                ].map(([k, l]) => (
                  <label key={k} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={f.accept[k]}
                      onChange={(e) => setAccept(k, e.target.checked)}
                    />{" "}
                    {l}
                  </label>
                ))}
              </div>
            </div>
            {f.accept.files && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Most files per submission">
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={f.accept.maxFiles}
                      onChange={(e) => setAccept("maxFiles", e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Largest file (MB)">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={f.accept.maxSizeMB}
                      onChange={(e) => setAccept("maxSizeMB", e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                </div>
                <div>
                  <p className="text-xs text-subtle mb-1.5">
                    Accepted file types
                  </p>
                  <div className="flex gap-1.5 flex-wrap">
                    {FILE_TYPES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleType(t)}
                        className={`px-2.5 py-1 text-xs rounded-full border ${f.accept.types.includes(t) ? "border-tenant bg-tenant-soft text-tenant font-semibold" : "border-line text-subtle hover:text-ink"}`}
                      >
                        .{t}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
            <label className="flex items-center gap-2 text-[13px]">
              <input
                type="checkbox"
                checked={f.requireDeclaration}
                onChange={(e) => set("requireDeclaration", e.target.checked)}
              />{" "}
              Students must tick "this is my own work"
            </label>
          </>
        )}
      </Section>

      <Section
        title={marked ? "6. Brief and materials" : "5. Brief and materials"}
        hint="Attach a brief, template or rubric for students to download."
      >
        <FileDrop
          files={f.briefFiles}
          onChange={(files) => set("briefFiles", files)}
          maxFiles={5}
          maxSizeMB={10}
        />
      </Section>

      {errors.length > 0 && (
        <div className="bg-red-50 text-red-700 rounded-md p-3 mb-4 text-xs flex flex-col gap-1">
          {errors.map((e) => (
            <p key={e} className="flex items-start gap-1.5">
              <AlertCircle size={13} className="mt-0.5 shrink-0" /> {e}
            </p>
          ))}
        </div>
      )}

      <div className="sticky bottom-0 -mx-6 -mb-5 px-6 py-4 border-t border-line bg-canvas flex items-center justify-between gap-3 flex-wrap mt-auto">
        <OutlineButton type="button" onClick={onCancel}>
          Cancel
        </OutlineButton>
        <div className="flex gap-2">
          <OutlineButton type="button" onClick={() => submit("draft")}>
            Save as draft
          </OutlineButton>
          <DarkButton type="button" onClick={() => submit("published")}>
            {scheduled
              ? "Schedule"
              : initial?.status === "published"
                ? "Save changes"
                : "Publish"}
          </DarkButton>
        </div>
      </div>
    </div>
  );
};

export default AssignmentForm;

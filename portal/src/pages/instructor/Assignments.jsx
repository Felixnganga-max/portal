import { useState } from "react";
import {
  Plus,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  Pencil,
  FolderOpen,
  Clock,
  ClipboardCheck,
  TrendingUp,
} from "lucide-react";
import Panel, {
  PageHeader,
  OutlineButton,
  DarkButton,
  Field,
  StatCard,
  Tabs,
  SearchBox,
  ProgressBar,
  Notice,
  EmptyState,
  RowCard,
  inputCls,
  tableCls,
  thCls,
  rowCls,
} from "../../components/layouts/Panel";
import Drawer from "../../components/layouts/Drawer";
import AssignmentForm from "../../components/layouts/AssignmentForm";
import MarkingView from "../../components/layouts/MarkingView";
import {
  Pill,
  KIND,
  PHASE,
  fmtDateTime,
  countdown,
  useNow,
} from "../../components/layouts/Ui";
import { units, classFor } from "../../lib/mockData";
import { useTeaching, componentsFor } from "../../lib/teachingStore";
import {
  useAssignments,
  actions,
  assignmentPhase,
  statsFor,
  ruleFor,
} from "../../lib/assignmentStore";

const KIND_FILTERS = [
  ["all", "All kinds"],
  ...Object.entries(KIND).map(([k, v]) => [k, v.label]),
];
const STATUS_FILTERS = [
  ["all", "Any status"],
  ["draft", "Draft"],
  ["scheduled", "Scheduled"],
  ["open", "Open"],
  ["closed", "Closed"],
  ["tomark", "Needs marking"],
  ["released", "Released"],
];

const iconBtn =
  "p-2 rounded-lg text-subtle hover:text-ink hover:bg-canvas transition";

const Assignments = () => {
  const store = useAssignments();
  const teaching = useTeaching();
  const now = useNow();

  const [tab, setTab] = useState("list");
  const [unitFilter, setUnitFilter] = useState("all");
  const [kindFilter, setKindFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [drawer, setDrawer] = useState(null); // { id } to edit, {} for new
  const [markingId, setMarkingId] = useState(null);
  const [notice, setNotice] = useState("");
  const [weightUnit, setWeightUnit] = useState(units[0]._id);

  const unitOf = (id) => units.find((u) => u._id === id);
  const classIds = (unitId) => classFor(unitId).map((s) => s._id);
  const compsOf = (unitId) => componentsFor(teaching, unitId);
  const compName = (a) =>
    compsOf(a.unitId).find((c) => c.id === a.componentId)?.name || "—";
  const assignComps = (unitId) =>
    compsOf(unitId).filter((c) => c.mode === "assignments");
  const siblingWeight = (unitId, componentId, excludeId) =>
    store.assignments
      .filter(
        (a) =>
          a.unitId === unitId &&
          a.componentId === componentId &&
          a.kind === "graded" &&
          a.id !== excludeId,
      )
      .reduce((s, a) => s + Number(a.weight || 0), 0);

  const rows = store.assignments.map((a) => ({
    a,
    phase: assignmentPhase(a, now),
    stats: statsFor(a, classIds(a.unitId)),
  }));
  const filtered = rows
    .filter(({ a }) => unitFilter === "all" || a.unitId === unitFilter)
    .filter(({ a }) => kindFilter === "all" || a.kind === kindFilter)
    .filter(({ a, phase, stats }) => {
      if (statusFilter === "all") return true;
      if (statusFilter === "tomark")
        return stats.toMark > 0 && a.status === "published";
      if (statusFilter === "released") return a.released;
      return (
        phase === statusFilter ||
        (statusFilter === "open" && phase === "late-open")
      );
    })
    .filter(({ a }) =>
      `${a.title} ${unitOf(a.unitId)?.code} ${unitOf(a.unitId)?.name}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    )
    .sort((x, y) => new Date(y.a.dueAt) - new Date(x.a.dueAt));

  const published = rows.filter(({ a }) => a.status === "published");
  const openNow = published.filter(
    ({ phase }) => phase === "open" || phase === "late-open",
  ).length;
  const dueWeek = published.filter(
    ({ a, phase }) =>
      (phase === "open" || phase === "late-open") &&
      new Date(a.dueAt) - now < 7 * 86400000 &&
      new Date(a.dueAt) > now,
  ).length;
  const toMark = published.reduce((s, { stats }) => s + stats.toMark, 0);
  const online = published.filter(
    ({ a }) =>
      a.submitMode === "online" &&
      a.status === "published" &&
      new Date(a.dueAt) < now,
  );
  const rate = online.length
    ? Math.round(
        (online.reduce(
          (s, { stats }) => s + stats.submitted / Math.max(1, stats.enrolled),
          0,
        ) /
          online.length) *
          100,
      )
    : null;

  const editing = drawer?.id
    ? store.assignments.find((a) => a.id === drawer.id)
    : null;

  const save = (payload) => {
    if (drawer?.id) actions.updateAssignment(drawer.id, payload);
    else actions.addAssignment(payload);
    setNotice(
      payload.status === "draft"
        ? "Saved as a draft. Students can't see it yet."
        : drawer?.id
          ? "Changes saved."
          : new Date(payload.opensAt || 0) > new Date()
            ? "Scheduled. It will appear to students when it opens."
            : "Published. Students can see it now.",
    );
    setDrawer(null);
  };
  const remove = (a) => {
    if (
      window.confirm(
        `Delete "${a.title}"? Submissions and marks for it will be removed.`,
      )
    ) {
      actions.removeAssignment(a.id);
      setNotice("Assignment deleted.");
    }
  };

  const drawerEl = (
    <Drawer
      open={!!drawer}
      onClose={() => setDrawer(null)}
      title={drawer?.id ? "Edit assignment" : "New assignment"}
      subtitle={
        drawer?.id
          ? "Changes apply to students straight away"
          : "Define the type, marks, deadlines and what students can hand in"
      }
    >
      {drawer && (
        <AssignmentForm
          key={drawer.id || "new"}
          initial={editing}
          units={units}
          defaultUnitId={units[0]._id}
          getComponents={assignComps}
          siblingWeight={siblingWeight}
          onSave={save}
          onCancel={() => setDrawer(null)}
        />
      )}
    </Drawer>
  );

  if (markingId) {
    return (
      <>
        <MarkingView
          assignmentId={markingId}
          onBack={() => setMarkingId(null)}
          onEdit={(id) => setDrawer({ id })}
        />
        {drawerEl}
      </>
    );
  }

  // deadlines tab groups
  const upcoming = published.filter(
    ({ phase }) =>
      phase === "open" || phase === "late-open" || phase === "scheduled",
  );
  const inRange = (a, from, to) => {
    const d = new Date(a.dueAt);
    return d >= from && d < to;
  };
  const day = (n) => {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + n);
    return d;
  };
  const groups = [
    [
      "Overdue, still to mark",
      rows.filter(
        ({ a, stats }) =>
          a.status === "published" &&
          new Date(a.dueAt) < now &&
          stats.toMark > 0,
      ),
      "red",
    ],
    [
      "Due in the next 7 days",
      upcoming.filter(({ a }) => inRange(a, now, day(7))),
      "amber",
    ],
    [
      "Due in 7 to 14 days",
      upcoming.filter(({ a }) => inRange(a, day(7), day(14))),
      "blue",
    ],
    ["Later", upcoming.filter(({ a }) => new Date(a.dueAt) >= day(14)), "grey"],
  ];
  const extensions = Object.entries(store.extensions).flatMap(
    ([aid, byStudent]) =>
      Object.entries(byStudent).map(([sid, until]) => ({ aid, sid, until })),
  );

  // weighting tab
  const wComps = compsOf(weightUnit);

  return (
    <div>
      <PageHeader
        title="Assignments"
        subtitle="Set work, control deadlines and weights, mark, then release results to the class"
        actions={
          <DarkButton onClick={() => setDrawer({})}>
            <Plus size={14} /> New assignment
          </DarkButton>
        }
      />

      {notice && <Notice onDismiss={() => setNotice("")}>{notice}</Notice>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard
          icon={FolderOpen}
          tone="green"
          label="Open now"
          value={openNow}
          sub={`${rows.filter(({ a }) => a.status === "draft").length} in draft`}
        />
        <StatCard
          icon={Clock}
          tone="amber"
          label="Due in the next 7 days"
          value={dueWeek}
        />
        <StatCard
          icon={ClipboardCheck}
          tone="pink"
          label="Waiting to be marked"
          value={toMark}
          sub="submitted, no mark yet"
        />
        <StatCard
          icon={TrendingUp}
          tone="blue"
          label="Submission rate"
          value={rate !== null ? `${rate}%` : "—"}
          sub="closed online assignments"
        />
      </div>

      <Tabs
        tabs={[
          ["list", "Assignments"],
          ["weighting", "Weighting"],
          ["deadlines", "Deadlines"],
        ]}
        value={tab}
        onChange={setTab}
      />

      {/* ------------------------------ LIST ------------------------------ */}
      {tab === "list" && (
        <Panel flush>
          <div className="p-4 flex items-center gap-3 flex-wrap">
            <SearchBox
              value={query}
              onChange={setQuery}
              placeholder="Search assignments"
            />
            <select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className={`${inputCls} !w-64 !py-2`}
            >
              <option value="all">All units</option>
              {units.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.code} — {u.name}
                </option>
              ))}
            </select>
            <select
              value={kindFilter}
              onChange={(e) => setKindFilter(e.target.value)}
              className={`${inputCls} !w-40 !py-2`}
            >
              {KIND_FILTERS.map(([k, l]) => (
                <option key={k} value={k}>
                  {l}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`${inputCls} !w-44 !py-2`}
            >
              {STATUS_FILTERS.map(([k, l]) => (
                <option key={k} value={k}>
                  {l}
                </option>
              ))}
            </select>
            <span className="text-xs text-subtle ml-auto">
              {filtered.length} of {rows.length}
            </span>
          </div>

          <div className="px-4 pb-3 overflow-x-auto">
            <table className={`${tableCls} min-w-[1100px]`}>
              <thead>
                <tr className="text-left text-subtle text-xs">
                  <th className={thCls}>Assignment</th>
                  <th className={thCls}>Counts</th>
                  <th className={thCls}>Opens</th>
                  <th className={thCls}>Due</th>
                  <th className={thCls}>Status</th>
                  <th className={`${thCls} w-40`}>Submitted</th>
                  <th className={`${thCls} w-32`}>Marked</th>
                  <th className={`${thCls} text-right`}>Average</th>
                  <th className={`${thCls} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(({ a, phase, stats }) => {
                  const ph = PHASE[phase];
                  const cd =
                    a.status === "published" &&
                    (phase === "open" || phase === "late-open")
                      ? countdown(a.dueAt, now)
                      : null;
                  const marks = a.kind === "graded" || a.kind === "extra";
                  const pct = (n) =>
                    Math.round((n / Math.max(1, stats.enrolled)) * 100);
                  return (
                    <tr key={a.id} className={`${rowCls} align-top`}>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => setMarkingId(a.id)}
                          className="text-left"
                        >
                          <span className="block font-semibold hover:text-tenant transition-colors">
                            {a.title}
                          </span>
                          <span className="block text-xs text-subtle mt-0.5">
                            {unitOf(a.unitId)?.code} · {unitOf(a.unitId)?.name}
                          </span>
                        </button>
                        <span className="inline-flex gap-1.5 mt-1.5 flex-wrap">
                          <Pill tone={KIND[a.kind].tone}>
                            {KIND[a.kind].label}
                          </Pill>
                          {a.submitMode === "offline" && <Pill>Offline</Pill>}
                          {a.released && <Pill tone="green">Released</Pill>}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs">
                        {a.kind === "graded" && (
                          <>
                            <b className="text-[13px]">{a.outOf} marks</b>
                            <span className="block text-subtle">
                              {a.weight}% of {compName(a)}
                            </span>
                          </>
                        )}
                        {a.kind === "extra" && (
                          <>
                            <b className="text-[13px]">+{a.bonus}% bonus</b>
                            <span className="block text-subtle">
                              to {compName(a)} · {a.outOf} marks
                            </span>
                          </>
                        )}
                        {a.kind === "practice" && (
                          <span className="text-subtle">Not graded</span>
                        )}
                        {a.kind === "compulsory" && (
                          <span className="text-subtle">Pass or fail</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-xs">
                        {a.opensAt ? fmtDateTime(a.opensAt) : "Immediately"}
                      </td>
                      <td className="px-4 py-3.5 text-xs">
                        {fmtDateTime(a.dueAt)}
                        {cd && (
                          <span className="block mt-1">
                            <Pill tone={cd.tone}>{cd.text}</Pill>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <Pill tone={ph.tone}>{ph.label}</Pill>
                      </td>
                      <td className="px-4 py-3.5">
                        {a.submitMode === "offline" ? (
                          <span className="text-xs text-subtle">In class</span>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <ProgressBar
                                className="flex-1"
                                value={pct(stats.submitted)}
                              />
                              <span className="text-xs font-semibold w-12 text-right">
                                {stats.submitted}/{stats.enrolled}
                              </span>
                            </div>
                            {stats.late > 0 && (
                              <span className="text-[11px] text-badge">
                                {stats.late} late
                              </span>
                            )}
                          </>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <ProgressBar
                            className="flex-1"
                            tone="good"
                            value={pct(stats.marked)}
                          />
                          <span className="text-xs font-semibold w-12 text-right">
                            {stats.marked}/{stats.enrolled}
                          </span>
                        </div>
                        {stats.toMark > 0 && (
                          <span className="text-[11px] text-amber-700">
                            {stats.toMark} to mark
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right font-semibold">
                        {marks && stats.average !== null ? (
                          `${stats.average}/${a.outOf}`
                        ) : (
                          <span className="text-subtle font-normal">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-0.5">
                          <DarkButton
                            onClick={() => setMarkingId(a.id)}
                            className="mr-1.5 !py-1.5"
                          >
                            {a.submitMode === "offline"
                              ? "Enter marks"
                              : "Mark"}
                          </DarkButton>
                          <button
                            onClick={() => setDrawer({ id: a.id })}
                            className={iconBtn}
                            title="Edit"
                            aria-label="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => {
                              actions.duplicateAssignment(a.id);
                              setNotice("Duplicated as a draft.");
                            }}
                            className={iconBtn}
                            title="Duplicate"
                            aria-label="Duplicate"
                          >
                            <Copy size={14} />
                          </button>
                          <button
                            onClick={() =>
                              actions.updateAssignment(a.id, {
                                status:
                                  a.status === "draft" ? "published" : "draft",
                              })
                            }
                            className={iconBtn}
                            title={
                              a.status === "draft" ? "Publish" : "Unpublish"
                            }
                            aria-label="Toggle published"
                          >
                            {a.status === "draft" ? (
                              <Eye size={14} />
                            ) : (
                              <EyeOff size={14} />
                            )}
                          </button>
                          <button
                            onClick={() => remove(a)}
                            className={`${iconBtn} hover:!text-badge`}
                            title="Delete"
                            aria-label="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <EmptyState
                title="No assignments match"
                text="Try clearing the filters, or create a new one."
              />
            )}
          </div>
        </Panel>
      )}

      {/* ---------------------------- WEIGHTING --------------------------- */}
      {tab === "weighting" && (
        <div className="flex flex-col gap-5">
          <Panel>
            <div className="flex items-end gap-4 flex-wrap">
              <div className="w-96 max-w-full">
                <Field label="Unit">
                  <select
                    value={weightUnit}
                    onChange={(e) => setWeightUnit(e.target.value)}
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
              <p className="text-xs text-subtle pb-2.5 max-w-xl">
                Each component of the unit result is built from its assignments.
                Choose how they combine, and keep the weights at 100%.
              </p>
            </div>
          </Panel>

          {wComps.map((c) => {
            if (c.mode !== "assignments") {
              return (
                <Panel
                  key={c.id}
                  title={`${c.name} · ${c.weight}% of the unit`}
                  description="Entered by hand on the Grades page, so no assignments feed it."
                />
              );
            }
            const rule = ruleFor(weightUnit, c.id);
            const graded = store.assignments.filter(
              (a) =>
                a.unitId === weightUnit &&
                a.componentId === c.id &&
                a.kind === "graded",
            );
            const extras = store.assignments.filter(
              (a) =>
                a.unitId === weightUnit &&
                a.componentId === c.id &&
                a.kind === "extra",
            );
            const sum = graded.reduce((s, a) => s + Number(a.weight || 0), 0);
            return (
              <Panel
                key={c.id}
                title={`${c.name} · ${c.weight}% of the unit`}
                description="Made from assignments"
                flush
              >
                <div className="px-5 pb-4 flex items-end gap-4 flex-wrap">
                  <div className="w-72 max-w-full">
                    <Field label="How assignments combine">
                      <select
                        value={rule.mode}
                        onChange={(e) =>
                          actions.setRule(weightUnit, c.id, {
                            mode: e.target.value,
                          })
                        }
                        className={inputCls}
                      >
                        <option value="percent">
                          By weight (each one's % of the component)
                        </option>
                        <option value="equal">Equal weight for all</option>
                        <option value="best">
                          Best N of the graded assignments
                        </option>
                      </select>
                    </Field>
                  </div>
                  {rule.mode === "best" && (
                    <div className="w-32">
                      <Field label="N (count the best)">
                        <input
                          type="number"
                          min="1"
                          value={rule.bestN}
                          onChange={(e) =>
                            actions.setRule(weightUnit, c.id, {
                              bestN: Number(e.target.value) || 1,
                            })
                          }
                          className={inputCls}
                        />
                      </Field>
                    </div>
                  )}
                  {rule.mode === "percent" && (
                    <div className="flex-1 min-w-[240px] pb-1">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-subtle">Weights added up</span>
                        <b className={sum === 100 ? "text-good" : "text-badge"}>
                          {sum}%{" "}
                          {sum !== 100 &&
                            (sum < 100
                              ? `(${100 - sum}% unassigned)`
                              : "(over 100%)")}
                        </b>
                      </div>
                      <div className="h-2 bg-canvas rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${sum === 100 ? "bg-good" : sum > 100 ? "bg-badge" : "bg-tenant"}`}
                          style={{ width: `${Math.min(100, sum)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="px-4 pb-2 overflow-x-auto">
                  <table className={tableCls}>
                    <thead>
                      <tr className="text-left text-subtle text-xs">
                        <th className={thCls}>Assignment</th>
                        <th className={thCls}>Status</th>
                        <th className={`${thCls} text-right`}>Marks</th>
                        <th className={`${thCls} w-40`}>Weight %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {graded.map((a) => (
                        <tr key={a.id} className={rowCls}>
                          <td className="px-4 py-3 font-semibold">{a.title}</td>
                          <td className="px-4 py-3">
                            <Pill tone={PHASE[assignmentPhase(a, now)].tone}>
                              {PHASE[assignmentPhase(a, now)].label}
                            </Pill>
                          </td>
                          <td className="px-4 py-3 text-right">{a.outOf}</td>
                          <td className="px-4 py-2.5">
                            {rule.mode === "percent" ? (
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={a.weight ?? ""}
                                onChange={(e) =>
                                  actions.updateAssignment(a.id, {
                                    weight: Number(e.target.value),
                                  })
                                }
                                className={`${inputCls} !py-1.5`}
                              />
                            ) : (
                              <span className="text-xs text-subtle">
                                {rule.mode === "equal"
                                  ? "Equal"
                                  : `Best ${rule.bestN}`}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {extras.map((a) => (
                        <tr key={a.id} className={rowCls}>
                          <td className="px-4 py-3 font-semibold">
                            {a.title} <Pill tone="green">Extra credit</Pill>
                          </td>
                          <td className="px-4 py-3">
                            <Pill tone={PHASE[assignmentPhase(a, now)].tone}>
                              {PHASE[assignmentPhase(a, now)].label}
                            </Pill>
                          </td>
                          <td className="px-4 py-3 text-right">{a.outOf}</td>
                          <td className="px-4 py-3 text-xs text-subtle">
                            +{a.bonus}% bonus
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {graded.length === 0 && (
                    <EmptyState
                      title="No graded assignments yet"
                      text={`Create one and choose ${c.name}.`}
                    />
                  )}
                </div>

                <div className="px-5 py-3.5 border-t border-line/70">
                  <OutlineButton onClick={() => setDrawer({})}>
                    <Plus size={13} /> Add an assignment to {c.name}
                  </OutlineButton>
                </div>
              </Panel>
            );
          })}
        </div>
      )}

      {/* ---------------------------- DEADLINES --------------------------- */}
      {tab === "deadlines" && (
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-5 items-start">
          <div className="flex flex-col gap-5">
            {groups.map(([title, list, tone]) => (
              <Panel key={title} title={`${title} (${list.length})`}>
                {list.length === 0 && (
                  <p className="text-xs text-subtle">Nothing here.</p>
                )}
                <div className="flex flex-col gap-2.5">
                  {list
                    .sort((x, y) => new Date(x.a.dueAt) - new Date(y.a.dueAt))
                    .map(({ a, phase, stats }) => (
                      <RowCard
                        key={a.id}
                        onClick={() => setMarkingId(a.id)}
                        title={a.title}
                        meta={`${unitOf(a.unitId)?.code} · ${KIND[a.kind].label} · ${
                          a.submitMode === "offline"
                            ? "in class"
                            : `${stats.submitted}/${stats.enrolled} submitted`
                        }`}
                        trailing={
                          <span className="flex items-center gap-2 flex-wrap justify-end">
                            <Pill tone={tone}>{fmtDateTime(a.dueAt)}</Pill>
                            <Pill tone={PHASE[phase].tone}>
                              {PHASE[phase].label}
                            </Pill>
                          </span>
                        }
                      />
                    ))}
                </div>
              </Panel>
            ))}
          </div>

          <Panel
            title="Extensions granted"
            description="Per-student deadline changes"
          >
            {extensions.length === 0 && (
              <p className="text-xs text-subtle">
                No extensions. Grant one from an assignment's marking screen.
              </p>
            )}
            <div className="flex flex-col gap-2.5">
              {extensions.map(({ aid, sid, until }) => {
                const a = store.assignments.find((x) => x.id === aid);
                const s = classFor(a?.unitId).find((x) => x._id === sid);
                return a ? (
                  <RowCard
                    key={`${aid}${sid}`}
                    avatar={s?.fullName || sid}
                    title={s?.fullName || sid}
                    meta={`${a.title} · until ${fmtDateTime(until)}`}
                    trailing={
                      <OutlineButton
                        onClick={() => actions.grantExtension(aid, sid, null)}
                      >
                        Remove
                      </OutlineButton>
                    }
                  />
                ) : null;
              })}
            </div>
          </Panel>
        </div>
      )}

      {drawerEl}
    </div>
  );
};

export default Assignments;

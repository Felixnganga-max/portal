import { useState } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  EyeOff,
  Pencil,
  Link2,
  Clock,
  Lock,
  AlertCircle,
} from "lucide-react";
import Panel, {
  OutlineButton,
  DarkButton,
  Field,
  inputCls,
} from "../layouts/Panel";
import FileLink from "../layouts/FileLink";
import FileDrop from "./FileDrop";
import { Pill, KIND, PHASE, fmtDateTime, countdown } from "./Ui";
import {
  useAssignments,
  actions,
  assignmentPhase,
  submissionOf,
  markOf,
  finalMark,
  deadlineFor,
  statsFor,
} from "../../lib/assignmentStore";
import { classFor } from "../../lib/mockData";
import { downloadCsv } from "../../lib/Csv";
import { units } from "../../lib/mockData";

const isImage = (f) => f.dataUrl?.startsWith("data:image");
const isPdf = (f) => f.dataUrl?.startsWith("data:application/pdf");

const Preview = ({ file }) => {
  const [open, setOpen] = useState(false);
  if (!isImage(file) && !isPdf(file)) return null;
  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-xs font-semibold text-link"
      >
        {open ? "Hide preview" : "Preview"}
      </button>
      {open &&
        (isImage(file) ? (
          <img
            src={file.dataUrl}
            alt={file.name}
            className="mt-2 max-h-96 border border-line rounded"
          />
        ) : (
          <iframe
            title={file.name}
            src={file.dataUrl}
            className="mt-2 w-full h-96 border border-line rounded"
          />
        ))}
    </div>
  );
};

// Full-width marking screen: class list on the left, the student's work and marking on the right.
const MarkingView = ({ assignmentId, onBack, onEdit }) => {
  const store = useAssignments();
  const a = store.assignments.find((x) => x.id === assignmentId);
  const klass = a ? classFor(a.unitId) : [];
  const [selected, setSelected] = useState(klass[0]?._id);
  const [filter, setFilter] = useState("all");
  const [edits, setEdits] = useState({});
  const [notice, setNotice] = useState("");
  const [bulk, setBulk] = useState("");

  if (!a) return null;
  const marks = a.kind === "graded" || a.kind === "extra";
  const offline = a.submitMode === "offline";
  const unit = units.find((u) => u._id === a.unitId);
  const stats = statsFor(
    a,
    klass.map((s) => s._id),
  );
  const phase = PHASE[assignmentPhase(a)];

  const entryOf = (sid) => ({
    ...(markOf(a.id, sid) || {}),
    ...(edits[sid] || {}),
  });
  const isMarked = (sid) => {
    const m = markOf(a.id, sid);
    return marks ? m && m.mark !== "" && m.mark != null : !!m?.status;
  };

  const rowInfo = (s) => {
    const sub = submissionOf(a.id, s._id);
    if (isMarked(s._id))
      return {
        key: "marked",
        label: marks
          ? `${finalMark(a, s._id)}/${a.outOf}`
          : markOf(a.id, s._id).status === "complete"
            ? "Complete"
            : "Incomplete",
        tone: "green",
        sub,
      };
    if (offline) return { key: "tomark", label: "To mark", tone: "amber", sub };
    if (!sub) return { key: "missing", label: "Missing", tone: "grey", sub };
    return {
      key: "tomark",
      label: sub.late ? "To mark · late" : "To mark",
      tone: sub.late ? "red" : "amber",
      sub,
    };
  };

  const rows = klass.map((s) => ({ s, info: rowInfo(s) }));
  const shown = rows.filter(
    ({ info }) =>
      filter === "all" ||
      (filter === "late" ? info.sub?.late : info.key === filter),
  );
  const idx = shown.findIndex(({ s }) => s._id === selected);
  const current = klass.find((s) => s._id === selected);
  const sub = current ? submissionOf(a.id, current._id) : null;
  const e = current ? entryOf(current._id) : {};
  const penalty = sub && !e.waived ? sub.penalty || 0 : 0;
  const rawNum = e.mark === "" || e.mark == null ? null : Number(e.mark);
  const previewFinal =
    rawNum === null ? null : Math.round(rawNum * (1 - penalty / 100) * 10) / 10;
  const ext = current ? store.extensions[a.id]?.[current._id] : null;

  const patchEdit = (sid, patch) => {
    setNotice("");
    setEdits((x) => ({ ...x, [sid]: { ...x[sid], ...patch } }));
  };
  const saveCurrent = () => {
    if (!current) return;
    const entry = {
      ...(markOf(a.id, current._id) || {}),
      ...(edits[current._id] || {}),
    };
    if (marks && entry.mark !== "" && entry.mark != null)
      entry.mark = Number(entry.mark);
    actions.saveMark(a.id, current._id, entry);
    setEdits((x) => {
      const n = { ...x };
      delete n[current._id];
      return n;
    });
  };
  const go = (delta) => {
    const t = shown[idx + delta];
    if (t) {
      saveCurrent();
      setSelected(t.s._id);
    }
  };
  const saveAndNext = () => {
    saveCurrent();
    const t = shown[idx + 1];
    if (t) setSelected(t.s._id);
    setNotice("Saved.");
  };

  const unmarked = rows.filter(
    ({ info }) =>
      info.key !== "marked" && !(info.key === "missing" && !offline),
  ).length;
  const release = () => {
    if (
      !a.released &&
      unmarked > 0 &&
      !window.confirm(
        `${unmarked} student${unmarked === 1 ? " has" : "s have"} no mark yet. Release anyway?`,
      )
    )
      return;
    actions.releaseMarks(a.id, !a.released);
  };

  const setMissingToZero = () => {
    const missing = rows
      .filter(({ info }) => info.key === "missing")
      .map(({ s }) => s._id);
    const patch = {};
    missing.forEach((id) => {
      patch[id] = { mark: 0, feedback: "No submission" };
    });
    actions.saveMarksBulk(a.id, patch);
    setNotice(
      `${missing.length} missing submission${missing.length === 1 ? "" : "s"} set to 0.`,
    );
  };
  const setEveryone = () => {
    const v = Number(bulk);
    if (bulk === "" || Number.isNaN(v) || v < 0 || v > a.outOf)
      return setNotice(`Enter a mark between 0 and ${a.outOf}.`);
    const patch = {};
    klass.forEach((s) => {
      if (!isMarked(s._id)) patch[s._id] = { mark: v };
    });
    actions.saveMarksBulk(a.id, patch);
    setNotice(`Set ${Object.keys(patch).length} unmarked student(s) to ${v}.`);
    setBulk("");
  };
  const allComplete = () => {
    const patch = {};
    klass.forEach((s) => {
      if (!isMarked(s._id)) patch[s._id] = { status: "complete" };
    });
    actions.saveMarksBulk(a.id, patch);
    setNotice("Everyone unmarked is now complete.");
  };

  const csv = () =>
    downloadCsv(
      `${unit?.code.replace(" ", "-")}-${a.title.replace(/\W+/g, "-")}.csv`,
      [
        [
          "Admission no.",
          "Name",
          "Submitted",
          "Late",
          "Penalty %",
          ...(marks ? ["Raw mark", "Final mark"] : ["Status"]),
          "Feedback",
        ],
        ...klass.map((s) => {
          const sb = submissionOf(a.id, s._id);
          const m = markOf(a.id, s._id) || {};
          return [
            s.admissionNumber,
            s.fullName,
            sb ? fmtDateTime(sb.submittedAt) : "",
            sb?.late ? "Yes" : "",
            m.waived ? 0 : sb?.penalty || 0,
            ...(marks
              ? [m.mark ?? "", finalMark(a, s._id) ?? ""]
              : [m.status ?? ""]),
            m.feedback || "",
          ];
        }),
      ],
    );

  const downloadAll = () => {
    const files = store.submissions
      .filter((x) => x.assignmentId === a.id)
      .flatMap((x) =>
        x.files
          .filter((f) => f.dataUrl)
          .map((f) => ({
            ...f,
            name: `${x.studentName.replace(/\s+/g, "_")}-${f.name}`,
          })),
      );
    if (!files.length) return setNotice("No stored files to download yet.");
    files.forEach((f, i) =>
      setTimeout(() => {
        const el = document.createElement("a");
        el.href = f.dataUrl;
        el.download = f.name;
        el.click();
      }, i * 250),
    );
    setNotice(
      `Downloading ${files.length} file${files.length === 1 ? "" : "s"}…`,
    );
  };

  const filters = [
    ["all", "All"],
    ["tomark", "To mark"],
    ...(offline
      ? []
      : [
          ["missing", "Missing"],
          ["late", "Late"],
        ]),
    ["marked", "Marked"],
  ];
  const filterCount = (k) =>
    rows.filter(
      ({ info }) =>
        k === "all" || (k === "late" ? info.sub?.late : info.key === k),
    ).length;

  return (
    <div>
      <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
        <div className="min-w-0">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs text-subtle hover:text-ink mb-2"
          >
            <ArrowLeft size={14} /> All assignments
          </button>
          <h1 className="text-[22px] font-bold leading-tight">{a.title}</h1>
          <div className="flex items-center gap-2 flex-wrap mt-2">
            <Pill tone={KIND[a.kind].tone}>{KIND[a.kind].label}</Pill>
            <Pill tone={phase.tone}>{phase.label}</Pill>
            {a.released ? (
              <Pill tone="green">
                <Eye size={11} /> Released to students
              </Pill>
            ) : (
              <Pill>
                <EyeOff size={11} /> Not released
              </Pill>
            )}
            <span className="text-xs text-subtle">
              {unit?.code} · {unit?.name} · due {fmtDateTime(a.dueAt)}
              {marks ? ` · out of ${a.outOf}` : ""}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <OutlineButton
            onClick={() => onEdit(a.id)}
            className="flex items-center gap-1.5"
          >
            <Pencil size={13} /> Edit
          </OutlineButton>
          <OutlineButton onClick={csv} className="flex items-center gap-1.5">
            <Download size={13} /> Marks (CSV)
          </OutlineButton>
          {!offline && (
            <OutlineButton
              onClick={downloadAll}
              className="flex items-center gap-1.5"
            >
              <Download size={13} /> All files
            </OutlineButton>
          )}
          {a.released ? (
            <OutlineButton
              onClick={release}
              className="flex items-center gap-1.5"
            >
              <EyeOff size={13} /> Withdraw
            </OutlineButton>
          ) : (
            <DarkButton onClick={release} className="flex items-center gap-1.5">
              <Eye size={13} /> Release marks
            </DarkButton>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-5">
        {[
          ["Class", stats.enrolled],
          [
            offline ? "In class" : "Submitted",
            offline ? stats.enrolled : `${stats.submitted} / ${stats.enrolled}`,
          ],
          ["Late", stats.late],
          [
            marks ? "Marked" : "Reviewed",
            `${stats.marked} / ${stats.enrolled}`,
          ],
          [
            marks ? "Class average" : "Complete",
            marks
              ? stats.average !== null
                ? `${stats.average} / ${a.outOf}`
                : "—"
              : klass.filter((s) => markOf(a.id, s._id)?.status === "complete")
                  .length,
          ],
        ].map(([l, v]) => (
          <Panel key={l}>
            <p className="text-xs text-subtle">{l}</p>
            <p className="text-xl font-bold mt-1">{v}</p>
          </Panel>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-4">
        <span className="text-xs text-subtle mr-1">Bulk:</span>
        {marks && !offline && (
          <OutlineButton onClick={setMissingToZero}>
            Set missing to 0
          </OutlineButton>
        )}
        {marks && (
          <span className="inline-flex items-center gap-1.5">
            <input
              type="number"
              value={bulk}
              onChange={(ev) => setBulk(ev.target.value)}
              placeholder={`Mark /${a.outOf}`}
              className="border border-line rounded px-2 py-1.5 text-xs w-28"
            />
            <OutlineButton onClick={setEveryone}>
              Give all unmarked
            </OutlineButton>
          </span>
        )}
        {!marks && (
          <OutlineButton onClick={allComplete}>Mark all complete</OutlineButton>
        )}
        {notice && (
          <span className="text-xs text-good font-semibold ml-2">{notice}</span>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-5 items-start">
        {/* class list */}
        <Panel flush>
          <div className="px-4 pt-4 pb-3 flex gap-1 flex-wrap">
            {filters.map(([k, l]) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={`px-2.5 py-1 text-xs rounded-full border ${filter === k ? "border-tenant bg-tenant-soft text-tenant font-semibold" : "border-line text-subtle hover:text-ink"}`}
              >
                {l} ({filterCount(k)})
              </button>
            ))}
          </div>
          <div className="max-h-[560px] overflow-y-auto">
            {shown.length === 0 && (
              <p className="px-5 py-8 text-center text-xs text-subtle">
                No students in this view.
              </p>
            )}
            {shown.map(({ s, info }) => (
              <button
                key={s._id}
                onClick={() => {
                  saveCurrent();
                  setSelected(s._id);
                }}
                className={`w-full text-left px-4 py-3 border-t border-line flex items-center justify-between gap-3 hover:bg-canvas ${selected === s._id ? "bg-tenant-soft/60" : ""}`}
              >
                <span className="min-w-0">
                  <span className="block text-[13px] font-semibold truncate">
                    {s.fullName}
                  </span>
                  <span className="block text-xs text-subtle font-mono">
                    {s.admissionNumber}
                  </span>
                </span>
                <Pill tone={info.tone}>{info.label}</Pill>
              </button>
            ))}
          </div>
        </Panel>

        {/* student work + marking */}
        {current ? (
          <div className="flex flex-col gap-5 min-w-0">
            <Panel
              title={current.fullName}
              description={`${current.admissionNumber}${idx >= 0 ? ` · ${idx + 1} of ${shown.length}` : ""}`}
              action={undefined}
            >
              <div className="flex items-center justify-between gap-3 flex-wrap -mt-1 mb-4">
                <div className="flex gap-2">
                  <OutlineButton
                    onClick={() => go(-1)}
                    disabled={idx <= 0}
                    className="flex items-center gap-1 disabled:opacity-40"
                  >
                    <ChevronLeft size={13} /> Previous
                  </OutlineButton>
                  <OutlineButton
                    onClick={() => go(1)}
                    disabled={idx < 0 || idx >= shown.length - 1}
                    className="flex items-center gap-1 disabled:opacity-40"
                  >
                    Next <ChevronRight size={13} />
                  </OutlineButton>
                </div>
                {!offline && (
                  <div className="flex items-center gap-2 text-xs">
                    <Clock size={13} className="text-subtle" />
                    <span className="text-subtle">
                      Deadline for this student:{" "}
                      <b className="text-ink">
                        {fmtDateTime(deadlineFor(a, current._id))}
                      </b>
                      {ext && " (extended)"}
                    </span>
                  </div>
                )}
              </div>

              {!offline && (
                <>
                  <h3 className="text-xs font-bold mb-2">Submission</h3>
                  {sub ? (
                    <div className="border border-line rounded-md p-4 flex flex-col gap-3 mb-5">
                      <div className="flex items-center gap-2 flex-wrap text-xs text-subtle">
                        <span>Submitted {fmtDateTime(sub.submittedAt)}</span>
                        <span>· version {sub.version}</span>
                        {sub.late && (
                          <Pill tone="red">
                            <AlertCircle size={11} /> {sub.lateDays} day
                            {sub.lateDays === 1 ? "" : "s"} late
                            {sub.penalty ? ` · ${sub.penalty}% penalty` : ""}
                          </Pill>
                        )}
                        {sub.declaration && (
                          <Pill tone="green">Own-work declaration ticked</Pill>
                        )}
                      </div>
                      {sub.text && (
                        <p className="text-[13px] whitespace-pre-wrap bg-canvas rounded p-3">
                          {sub.text}
                        </p>
                      )}
                      {sub.link && (
                        <a
                          href={sub.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-link"
                        >
                          <Link2 size={13} /> {sub.link}
                        </a>
                      )}
                      {sub.files.length > 0 && (
                        <ul className="flex flex-col gap-2">
                          {sub.files.map((f, i) => (
                            <li key={`${f.name}-${i}`}>
                              <FileLink file={f} />
                              <Preview file={f} />
                            </li>
                          ))}
                        </ul>
                      )}
                      {sub.history?.length > 0 && (
                        <p className="text-[11px] text-subtle">
                          Earlier versions:{" "}
                          {sub.history
                            .map((h) => `v${h.version} (${fmtDateTime(h.at)})`)
                            .join(", ")}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="border border-dashed border-line rounded-md p-4 text-xs text-subtle mb-5">
                      No submission yet.
                    </div>
                  )}

                  <div className="flex items-end gap-3 flex-wrap mb-6">
                    <div className="w-60">
                      <Field label="Extension: new deadline for this student">
                        <input
                          type="datetime-local"
                          value={ext || ""}
                          onChange={(ev) =>
                            actions.grantExtension(
                              a.id,
                              current._id,
                              ev.target.value,
                            )
                          }
                          className={inputCls}
                        />
                      </Field>
                    </div>
                    {ext && (
                      <OutlineButton
                        onClick={() =>
                          actions.grantExtension(a.id, current._id, null)
                        }
                      >
                        Remove extension
                      </OutlineButton>
                    )}
                  </div>
                </>
              )}

              <h3 className="text-xs font-bold mb-2">
                {marks ? "Marks and feedback" : "Review"}
              </h3>
              <div className="flex flex-col gap-4">
                {marks ? (
                  <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-4 items-end">
                    <Field label={`Mark (out of ${a.outOf})`}>
                      <input
                        type="number"
                        min="0"
                        max={a.outOf}
                        value={e.mark ?? ""}
                        onChange={(ev) =>
                          patchEdit(current._id, {
                            mark:
                              ev.target.value === ""
                                ? ""
                                : Math.max(
                                    0,
                                    Math.min(a.outOf, Number(ev.target.value)),
                                  ),
                          })
                        }
                        className={inputCls}
                      />
                    </Field>
                    <div className="text-xs text-subtle pb-2">
                      {rawNum === null ? (
                        "Enter a mark."
                      ) : sub?.penalty && !e.waived ? (
                        <>
                          After the {sub.penalty}% late penalty:{" "}
                          <b className="text-ink text-sm">
                            {previewFinal} / {a.outOf}
                          </b>
                        </>
                      ) : (
                        <>
                          Final mark:{" "}
                          <b className="text-ink text-sm">
                            {previewFinal} / {a.outOf}
                          </b>
                        </>
                      )}
                      {sub?.penalty > 0 && (
                        <label className="flex items-center gap-2 mt-1.5 text-[13px] text-ink">
                          <input
                            type="checkbox"
                            checked={!!e.waived}
                            onChange={(ev) =>
                              patchEdit(current._id, {
                                waived: ev.target.checked,
                              })
                            }
                          />{" "}
                          Waive the late penalty
                        </label>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    {[
                      ["complete", "Complete"],
                      ["incomplete", "Incomplete"],
                    ].map(([v, l]) => (
                      <label
                        key={v}
                        className={`border rounded-md px-4 py-2 text-[13px] cursor-pointer ${e.status === v ? "border-tenant bg-tenant-soft font-semibold" : "border-line hover:bg-canvas"}`}
                      >
                        <input
                          type="radio"
                          name="status"
                          className="mr-2 accent-[var(--tenant-color,#C0272D)]"
                          checked={e.status === v}
                          onChange={() => patchEdit(current._id, { status: v })}
                        />{" "}
                        {l}
                      </label>
                    ))}
                  </div>
                )}
                <Field label="Feedback">
                  <textarea
                    rows={4}
                    value={e.feedback || ""}
                    onChange={(ev) =>
                      patchEdit(current._id, { feedback: ev.target.value })
                    }
                    placeholder="What went well, what to improve"
                    className={inputCls}
                  />
                </Field>
                <Field label="Marked copy or feedback file (optional)">
                  <FileDrop
                    files={e.feedbackFile ? [e.feedbackFile] : []}
                    onChange={(files) =>
                      patchEdit(current._id, { feedbackFile: files[0] || null })
                    }
                    maxFiles={1}
                    maxSizeMB={10}
                    label="Drop a marked-up file here, or browse"
                  />
                </Field>
                {a.released && (
                  <p className="text-xs text-subtle flex items-center gap-1.5">
                    <Lock size={12} /> Marks are released. Changes here are
                    visible to the student straight away.
                  </p>
                )}
                <div className="flex justify-end gap-2">
                  <OutlineButton
                    onClick={() => {
                      saveCurrent();
                      setNotice("Saved.");
                    }}
                  >
                    Save
                  </OutlineButton>
                  <DarkButton
                    onClick={saveAndNext}
                    disabled={idx < 0 || idx >= shown.length - 1}
                    className="disabled:opacity-40"
                  >
                    Save &amp; next
                  </DarkButton>
                </div>
              </div>
            </Panel>
          </div>
        ) : (
          <Panel>
            <p className="text-xs text-subtle">
              Select a student to start marking.
            </p>
          </Panel>
        )}
      </div>
    </div>
  );
};

export default MarkingView;

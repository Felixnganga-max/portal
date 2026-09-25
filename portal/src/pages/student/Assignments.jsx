import { useState } from "react";
import {
  Search,
  Clock,
  AlertCircle,
  CheckCircle2,
  Link2,
  Lock,
  Send,
} from "lucide-react";
import FileLink from "../../components/layouts/FileLink";
import FileDrop from "../../components/layouts/FileDrop";
import {
  KIND,
  fmtDateTime,
  countdown,
  useNow,
  lateSentence,
  rulesSentence,
} from "../../components/layouts/Ui";
import { students, units, myUnitIds } from "../../lib/mockData";
import { useTeaching, componentsFor } from "../../lib/teachingStore";
import {
  useAssignments,
  actions,
  submissionWindow,
  submissionOf,
  markOf,
  finalMark,
  deadlineFor,
} from "../../lib/assignmentStore";

const me = students[0]; // TODO(api): the logged-in student

// Same two accent colours as the other student pages. Change them here to re-theme.
const MINT = "#A6F4A3";
const VIOLET = "#A48CFA";

const TABS = [
  ["todo", "To do"],
  ["submitted", "Submitted"],
  ["results", "Results"],
  ["practice", "Practice"],
  ["all", "All"],
];

// ---------- small pieces ----------

const inputCls =
  "w-full rounded-2xl border border-line bg-white px-4 py-3 text-[14px] focus:outline-none focus:border-ink";

const Field = ({ label, children }) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-[13px] text-subtle">{label}</span>
    {children}
  </label>
);

// Local pill: maps the tone names used by the store helpers to soft colours.
const toneCls = {
  green: "bg-green-100 text-green-800",
  amber: "bg-amber-100 text-amber-800",
  blue: "bg-blue-100 text-blue-800",
  red: "bg-red-100 text-red-800",
  brand: "bg-violet-100 text-violet-800",
  purple: "bg-violet-100 text-violet-800",
  grey: "bg-black/[0.06] text-ink",
  gray: "bg-black/[0.06] text-ink",
};
const Pill = ({ tone = "grey", children }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${toneCls[tone] || toneCls.grey}`}
  >
    {children}
  </span>
);

const DarkBtn = ({ className = "", ...props }) => (
  <button
    className={`inline-flex items-center gap-1.5 rounded-full bg-ink text-white px-5 py-2.5 text-[13px] font-semibold hover:bg-ink/90 disabled:opacity-50 ${className}`}
    {...props}
  />
);

const OutlineBtn = ({ className = "", ...props }) => (
  <button
    className={`inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-5 py-2.5 text-[13px] font-medium hover:bg-black/[0.03] ${className}`}
    {...props}
  />
);

const Chip = ({ active, children, ...props }) => (
  <button
    type="button"
    className={`px-4 py-2 rounded-full text-[13px] border transition-colors ${
      active
        ? "bg-ink text-white border-ink"
        : "bg-white text-ink border-line hover:bg-black/[0.03]"
    }`}
    {...props}
  >
    {children}
  </button>
);

const Block = ({ title, children, className = "" }) => (
  <div className={`rounded-3xl bg-black/[0.04] px-5 py-4 ${className}`}>
    {title && <h4 className="text-[13px] font-semibold mb-2">{title}</h4>}
    {children}
  </div>
);

// ---------- the hand-in form ----------

const SubmitForm = ({ a, existing, win, onDone }) => {
  const acc = a.accept || {};
  const [text, setText] = useState(existing?.text || "");
  const [link, setLink] = useState(existing?.link || "");
  const [files, setFiles] = useState(existing?.files || []);
  const [declared, setDeclared] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    const hasText = acc.text && text.trim();
    const hasLink = acc.link && link.trim();
    const hasFiles = acc.files && files.length > 0;
    if (!hasText && !hasLink && !hasFiles)
      return setError(
        "Add your work first: " +
          [
            acc.text && "type an answer",
            acc.files && "upload a file",
            acc.link && "paste a link",
          ]
            .filter(Boolean)
            .join(", or ") +
          ".",
      );
    if (hasLink && !/^https?:\/\//i.test(link.trim()))
      return setError("The link must start with http:// or https://");
    if (a.requireDeclaration && !declared)
      return setError("Please tick the box to confirm this is your own work.");
    const res = actions.submitWork({
      assignmentId: a.id,
      studentId: me._id,
      studentName: me.fullName,
      text: acc.text ? text.trim() : "",
      files: acc.files ? files : [],
      link: acc.link ? link.trim() : "",
    });
    if (!res.ok) return setError(res.reason);
    setError("");
    setResult(res);
  };

  if (result) {
    return (
      <div
        className="rounded-3xl p-5 text-[14px] flex flex-col gap-2 text-ink"
        style={{ backgroundColor: MINT }}
      >
        <p className="flex items-center gap-2 font-semibold">
          <CheckCircle2 size={17} /> Submitted. Your teacher has received it.
        </p>
        {result.late && (
          <p className="text-[13px]">
            It was late
            {result.penalty
              ? `, so ${result.penalty}% will be taken off your mark`
              : ""}
            .
          </p>
        )}
        <div className="mt-1">
          <OutlineBtn type="button" onClick={onDone}>
            Done
          </OutlineBtn>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      {win.late && (
        <div className="bg-amber-50 text-amber-800 rounded-3xl px-5 py-3 text-[13px] flex items-start gap-2">
          <AlertCircle size={15} className="mt-0.5 shrink-0" /> The deadline has
          passed. Handing in now counts as {win.lateDays} day
          {win.lateDays === 1 ? "" : "s"} late
          {win.penalty
            ? `, and ${win.penalty}% will be taken off your mark`
            : ""}
          .
        </div>
      )}
      {existing && (
        <p className="text-[13px] text-subtle">
          You already submitted (version {existing.version}). Submitting again
          replaces it until it is marked.
        </p>
      )}
      {acc.text && (
        <Field label="Your answer">
          <textarea
            rows={8}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your answer here"
            className={inputCls}
          />
        </Field>
      )}
      {acc.files && (
        <Field label="Upload files">
          <FileDrop
            files={files}
            onChange={setFiles}
            types={acc.types}
            maxFiles={acc.maxFiles}
            maxSizeMB={acc.maxSizeMB}
          />
        </Field>
      )}
      {acc.link && (
        <Field label="Link to your work">
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://"
            className={inputCls}
          />
        </Field>
      )}
      {a.requireDeclaration && (
        <label className="flex items-start gap-2 text-[13px]">
          <input
            type="checkbox"
            checked={declared}
            onChange={(e) => setDeclared(e.target.checked)}
            className="mt-0.5"
          />{" "}
          I confirm this is my own work.
        </label>
      )}
      {error && (
        <p className="text-[13px] text-red-600 flex items-center gap-1.5">
          <AlertCircle size={14} /> {error}
        </p>
      )}
      <div className="flex gap-2">
        <DarkBtn type="submit">
          <Send size={13} /> {existing ? "Replace submission" : "Submit"}
        </DarkBtn>
        <OutlineBtn type="button" onClick={onDone}>
          Cancel
        </OutlineBtn>
      </div>
    </form>
  );
};

// ---------- one assignment ----------

const Card = ({ a, now, open, onToggle, compName }) => {
  const unit = units.find((u) => u._id === a.unitId);
  const sub = submissionOf(a.id, me._id);
  const win = submissionWindow(a, me._id, now);
  const entry = markOf(a.id, me._id);
  const graded = a.kind === "graded" || a.kind === "extra";
  const released =
    a.released &&
    !!entry &&
    (graded ? entry.mark !== "" && entry.mark != null : !!entry.status);
  const final = released && graded ? finalMark(a, me._id) : null;
  const deadline = deadlineFor(a, me._id);
  const extended = deadline !== a.dueAt;
  const cd = countdown(deadline, now);
  const offline = a.submitMode === "offline";

  let state;
  if (released)
    state = {
      label: graded
        ? "Marked"
        : entry.status === "complete"
          ? "Complete"
          : "Needs more work",
      tone: graded || entry.status === "complete" ? "green" : "amber",
    };
  else if (sub)
    state = {
      label: sub.late ? "Submitted late" : "Submitted",
      tone: sub.late ? "amber" : "blue",
    };
  else if (offline) state = { label: "Done in class", tone: "grey" };
  else if (win.canSubmit)
    state = {
      label: win.late ? "Late, still open" : "To do",
      tone: win.late ? "amber" : "brand",
    };
  else state = { label: "Missed", tone: "red" };

  const canEdit = win.canSubmit && !(a.released && entry);
  const worth =
    a.kind === "graded"
      ? `${a.weight}% of your ${compName}`
      : a.kind === "extra"
        ? `Up to +${a.bonus}% bonus on your ${compName}`
        : a.kind === "compulsory"
          ? "Compulsory. Must be completed"
          : "Practice. Not graded";
  const pct = final !== null ? Math.round((final / a.outOf) * 100) : null;

  return (
    <div
      className={`bg-white rounded-3xl border ${open ? "border-ink/30" : "border-transparent"}`}
    >
      <button
        onClick={onToggle}
        className="w-full text-left px-5 py-4 flex items-start justify-between gap-4 flex-wrap"
      >
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 flex-wrap">
            <span className="text-[17px] leading-snug">{a.title}</span>
            <Pill tone={KIND[a.kind].tone}>{KIND[a.kind].label}</Pill>
            <Pill tone={state.tone}>{state.label}</Pill>
          </span>
          <span className="block text-[13px] text-subtle mt-1.5">
            {unit?.code} · {unit?.name} · {worth}
            {graded ? ` · ${a.outOf} marks` : ""}
          </span>
        </span>
        <span className="text-right shrink-0">
          {released && graded ? (
            <span className="block">
              <b className="text-xl">{final}</b>
              <span className="text-[13px] text-subtle"> / {a.outOf}</span>
              <span className="block text-[13px] text-subtle">{pct}%</span>
            </span>
          ) : !offline && !sub ? (
            <>
              <span className="block text-[13px] text-subtle">
                Due {fmtDateTime(deadline)}
                {extended && " (extended)"}
              </span>
              <span className="inline-block mt-1.5">
                <Pill tone={cd.tone}>
                  <Clock size={11} /> {cd.text}
                </Pill>
              </span>
            </>
          ) : (
            <span className="block text-[13px] text-subtle">
              {sub
                ? `Submitted ${fmtDateTime(sub.submittedAt)}`
                : `Held ${fmtDateTime(a.dueAt)}`}
            </span>
          )}
        </span>
      </button>

      {open && (
        <div className="px-5 pb-5 pt-1 flex flex-col gap-4">
          {a.description && (
            <Block title="Instructions">
              <p className="text-[14px] whitespace-pre-wrap">{a.description}</p>
            </Block>
          )}
          {a.briefFiles?.length > 0 && (
            <Block title="Materials from your teacher">
              <ul className="flex flex-col gap-1.5">
                {a.briefFiles.map((f, i) => (
                  <li key={`${f.name}-${i}`}>
                    <FileLink file={f} />
                  </li>
                ))}
              </ul>
            </Block>
          )}
          {!offline && (
            <div className="text-[13px] text-subtle flex flex-col gap-0.5 px-1">
              <p>{rulesSentence(a)}</p>
              <p>{lateSentence(a)}</p>
              {extended && (
                <p className="text-amber-700">
                  Your deadline was extended to {fmtDateTime(deadline)}.
                </p>
              )}
            </div>
          )}

          {released && (
            <div
              className="rounded-3xl px-5 py-4 flex flex-col gap-2 text-ink"
              style={{ backgroundColor: MINT }}
            >
              <h4 className="text-[13px] font-semibold">Your result</h4>
              {graded ? (
                <>
                  <p className="text-[14px]">
                    <b className="text-2xl">
                      {final} / {a.outOf}
                    </b>{" "}
                    <span className="text-ink/70">({pct}%)</span>
                  </p>
                  {sub?.penalty > 0 && !entry.waived && (
                    <p className="text-[13px] text-ink/70">
                      Raw mark {entry.mark}, with a {sub.penalty}% late penalty
                      applied.
                    </p>
                  )}
                  {sub?.penalty > 0 && entry.waived && (
                    <p className="text-[13px] text-green-900 font-medium">
                      The late penalty was waived.
                    </p>
                  )}
                </>
              ) : (
                <p className="text-[14px]">
                  {entry.status === "complete"
                    ? "Marked complete."
                    : "Marked incomplete. Speak to your teacher about redoing it."}
                </p>
              )}
              {entry.feedback && (
                <div>
                  <p className="text-[13px] text-ink/70">Feedback</p>
                  <p className="text-[14px] whitespace-pre-wrap">
                    {entry.feedback}
                  </p>
                </div>
              )}
              {entry.feedbackFile && <FileLink file={entry.feedbackFile} />}
            </div>
          )}

          {sub && (
            <Block>
              <h4 className="text-[13px] font-semibold flex items-center gap-2">
                Your submission{" "}
                <Pill tone="green">
                  <CheckCircle2 size={11} /> Received
                </Pill>
              </h4>
              <p className="text-[13px] text-subtle mt-1">
                {fmtDateTime(sub.submittedAt)} · version {sub.version}
                {sub.late ? " · late" : ""}
              </p>
              {sub.text && (
                <p className="text-[14px] whitespace-pre-wrap bg-white rounded-2xl p-4 mt-3 max-h-48 overflow-y-auto">
                  {sub.text}
                </p>
              )}
              {sub.link && (
                <a
                  href={sub.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-link mt-3"
                >
                  <Link2 size={14} /> {sub.link}
                </a>
              )}
              {sub.files.length > 0 && (
                <ul className="flex flex-col gap-1.5 mt-3">
                  {sub.files.map((f, i) => (
                    <li key={`${f.name}-${i}`}>
                      <FileLink file={f} />
                    </li>
                  ))}
                </ul>
              )}
              {sub.history?.length > 0 && (
                <p className="text-[12px] text-subtle mt-3">
                  Earlier versions:{" "}
                  {sub.history
                    .map((h) => `v${h.version} (${fmtDateTime(h.at)})`)
                    .join(", ")}
                </p>
              )}
            </Block>
          )}

          {!offline && canEdit && (
            <SubmitForm a={a} existing={sub} win={win} onDone={onToggle} />
          )}
          {!offline && !canEdit && !sub && (
            <p className="text-[13px] text-red-600 flex items-center gap-1.5 px-1">
              <Lock size={14} /> {win.reason}. If you have a good reason, ask
              your teacher for an extension.
            </p>
          )}
          {!offline && sub && a.released && entry && (
            <p className="text-[13px] text-subtle flex items-center gap-1.5 px-1">
              <Lock size={13} /> This work has been marked, so it can no longer
              be replaced.
            </p>
          )}
          {offline && !released && (
            <p className="text-[13px] text-subtle px-1">
              This is done in class. Your teacher will enter the result.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// ---------- page ----------

const Assignments = () => {
  const store = useAssignments();
  const teaching = useTeaching();
  const now = useNow();
  const [tab, setTab] = useState("todo");
  const [unitFilter, setUnitFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(null);

  // Students see published assignments that have opened, for their own units.
  const mine = store.assignments.filter(
    (a) =>
      myUnitIds.includes(a.unitId) &&
      a.status === "published" &&
      (!a.opensAt || new Date(a.opensAt) <= now),
  );
  const info = (a) => {
    const sub = submissionOf(a.id, me._id);
    const entry = markOf(a.id, me._id);
    const graded = a.kind === "graded" || a.kind === "extra";
    const released =
      a.released &&
      !!entry &&
      (graded ? entry.mark !== "" && entry.mark != null : !!entry.status);
    const win = submissionWindow(a, me._id, now);
    return {
      sub,
      released,
      todo: a.submitMode === "online" && !sub && win.canSubmit,
      deadline: deadlineFor(a, me._id),
    };
  };

  const inTab = (a) => {
    const i = info(a);
    if (tab === "todo") return i.todo && a.kind !== "practice";
    if (tab === "submitted") return !!i.sub && !i.released;
    if (tab === "results") return i.released;
    if (tab === "practice") return a.kind === "practice";
    return true;
  };
  const count = (key) =>
    mine.filter((a) => {
      const i = info(a);
      return key === "todo"
        ? i.todo && a.kind !== "practice"
        : key === "submitted"
          ? !!i.sub && !i.released
          : key === "results"
            ? i.released
            : key === "practice"
              ? a.kind === "practice"
              : true;
    }).length;

  const list = mine
    .filter(inTab)
    .filter((a) => unitFilter === "all" || a.unitId === unitFilter)
    .filter((a) =>
      `${a.title} ${units.find((u) => u._id === a.unitId)?.name}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    )
    .sort((x, y) =>
      tab === "results"
        ? new Date(y.dueAt) - new Date(x.dueAt)
        : new Date(info(x).deadline) - new Date(info(y).deadline),
    );

  const todo = mine.filter((a) => info(a).todo && a.kind !== "practice");
  const dueSoon = todo.filter((a) => {
    const d = new Date(info(a).deadline) - now;
    return d > 0 && d < 3 * 86400000;
  }).length;
  const overdueOpen = todo.filter(
    (a) => new Date(info(a).deadline) < now,
  ).length;
  const results = mine.filter(
    (a) =>
      info(a).released &&
      (a.kind === "graded" || a.kind === "extra") &&
      finalMark(a, me._id) !== null,
  );
  const avg = results.length
    ? Math.round(
        results.reduce(
          (s, a) => s + (finalMark(a, me._id) / a.outOf) * 100,
          0,
        ) / results.length,
      )
    : null;

  const compName = (a) =>
    componentsFor(teaching, a.unitId).find((c) => c.id === a.componentId)
      ?.name || "result";
  const myUnits = units.filter((u) => myUnitIds.includes(u._id));

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Assignments</h1>
        <p className="text-sm text-subtle mt-1">
          Your coursework, deadlines and results in one place
        </p>
      </div>

      {/* Summary colour blocks */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <div
          className="rounded-[26px] p-5 flex flex-col min-h-[150px] text-ink"
          style={{ backgroundColor: MINT }}
        >
          <p className="text-[15px] font-medium">To do</p>
          <p className="text-4xl font-semibold tracking-tight mt-auto">
            {todo.length}
          </p>
          <p className="text-[13px] text-ink/70 mt-1">
            {overdueOpen > 0 ? `${overdueOpen} already late` : "on time so far"}
          </p>
        </div>
        <div className="rounded-[26px] p-5 flex flex-col min-h-[150px] bg-white">
          <p className="text-[15px] font-medium">Due in 3 days</p>
          <p
            className={`text-4xl font-semibold tracking-tight mt-auto ${dueSoon ? "text-amber-600" : ""}`}
          >
            {dueSoon}
          </p>
        </div>
        <div className="rounded-[26px] p-5 flex flex-col min-h-[150px] bg-white">
          <p className="text-[15px] font-medium">Waiting for marks</p>
          <p className="text-4xl font-semibold tracking-tight mt-auto">
            {count("submitted")}
          </p>
        </div>
        <div
          className="rounded-[26px] p-5 flex flex-col min-h-[150px] text-white"
          style={{ backgroundColor: VIOLET }}
        >
          <p className="text-[15px] font-medium">Average so far</p>
          <p className="text-4xl font-semibold tracking-tight mt-auto">
            {avg !== null ? `${avg}%` : "—"}
          </p>
          <p className="text-[13px] text-white/85 mt-1">
            {results.length} marked assignment{results.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {/* Tabs, filters and list */}
      <section className="bg-white rounded-[28px] p-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {TABS.map(([k, l]) => (
            <Chip
              key={k}
              active={tab === k}
              onClick={() => {
                setTab(k);
                setOpenId(null);
              }}
            >
              {l} ({count(k)})
            </Chip>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap mb-5">
          <select
            value={unitFilter}
            onChange={(e) => setUnitFilter(e.target.value)}
            className={`${inputCls} !w-64 !py-2.5`}
          >
            <option value="all">All my units</option>
            {myUnits.map((u) => (
              <option key={u._id} value={u._id}>
                {u.code} — {u.name}
              </option>
            ))}
          </select>
          <div className="relative">
            <Search
              size={15}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="rounded-2xl border border-line bg-white pl-10 pr-4 py-2.5 text-[14px] w-52 focus:outline-none focus:border-ink"
            />
          </div>
        </div>

        <div className="bg-black/[0.04] rounded-[26px] p-3 flex flex-col gap-2.5">
          {list.length === 0 && (
            <p className="text-[14px] text-subtle py-8 text-center">
              {tab === "todo"
                ? "You are all caught up. Nothing is waiting for you."
                : "Nothing to show here."}
            </p>
          )}
          {list.map((a) => (
            <Card
              key={a.id}
              a={a}
              now={now}
              open={openId === a.id}
              onToggle={() => setOpenId(openId === a.id ? null : a.id)}
              compName={compName(a)}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Assignments;

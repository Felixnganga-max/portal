import { useEffect, useState } from "react";

const tones = {
  green: "bg-green-50 text-green-700",
  blue: "bg-blue-50 text-blue-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
  grey: "bg-canvas text-subtle",
  brand: "bg-tenant-soft text-tenant",
};

export const Pill = ({ tone = "grey", children, className = "" }) => (
  <span
    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${tones[tone]} ${className}`}
  >
    {children}
  </span>
);

// The four kinds of assignment.
export const KIND = {
  graded: {
    label: "Graded",
    tone: "blue",
    hint: "Marked, and counts towards a component of the unit result",
  },
  practice: {
    label: "Practice",
    tone: "grey",
    hint: "Feedback only. Not graded and never counted",
  },
  compulsory: {
    label: "Compulsory",
    tone: "amber",
    hint: "Must be completed (pass or fail). Carries no marks",
  },
  extra: {
    label: "Extra credit",
    tone: "green",
    hint: "Optional. Adds bonus marks to a component",
  },
};

export const PHASE = {
  draft: { label: "Draft", tone: "grey" },
  scheduled: { label: "Scheduled", tone: "blue" },
  open: { label: "Open", tone: "green" },
  "late-open": { label: "Open (late)", tone: "amber" },
  closed: { label: "Closed", tone: "red" },
};

export const FILE_TYPES = [
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "txt",
  "csv",
  "png",
  "jpg",
  "zip",
];

export const fmtDate = (s) =>
  s
    ? new Date(s).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";
export const fmtTime = (s) =>
  s
    ? new Date(s).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";
export const fmtDateTime = (s) => (s ? `${fmtDate(s)}, ${fmtTime(s)}` : "—");

const span = (ms) => {
  const abs = Math.abs(ms);
  if (abs < 3600000) return `${Math.max(1, Math.round(abs / 60000))} min`;
  if (abs < 86400000) {
    const h = Math.round(abs / 3600000);
    return `${h} hour${h === 1 ? "" : "s"}`;
  }
  const d = Math.round(abs / 86400000);
  return `${d} day${d === 1 ? "" : "s"}`;
};

export const countdown = (iso, at = new Date()) => {
  const ms = new Date(iso) - at;
  if (ms >= 0)
    return {
      text: `Due in ${span(ms)}`,
      tone: ms < 172800000 ? "amber" : "grey",
      overdue: false,
    };
  return { text: `Overdue by ${span(ms)}`, tone: "red", overdue: true };
};

// Re-renders every minute so countdowns stay honest.
export const useNow = (every = 60000) => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), every);
    return () => clearInterval(t);
  }, [every]);
  return now;
};

export const lateSentence = (a) => {
  const lp = a.latePolicy || { mode: "none" };
  if (a.submitMode === "offline") return "Handed in offline.";
  if (lp.mode === "flag") return "Late work is accepted but flagged as late.";
  if (lp.mode === "penalty")
    return `Late work loses ${lp.penaltyPerDay}% per day (up to ${lp.maxPenalty}%)${lp.cutoffAt ? ` and closes on ${fmtDateTime(lp.cutoffAt)}` : ""}.`;
  return "No late submissions.";
};

export const rulesSentence = (a) => {
  const acc = a.accept || {};
  const parts = [
    acc.text && "typed answer",
    acc.files &&
      `up to ${acc.maxFiles} file${acc.maxFiles === 1 ? "" : "s"} (${(acc.types || []).join(", ")}, max ${acc.maxSizeMB} MB each)`,
    acc.link && "a link",
  ].filter(Boolean);
  return parts.length ? `Accepts ${parts.join(", ")}.` : "";
};

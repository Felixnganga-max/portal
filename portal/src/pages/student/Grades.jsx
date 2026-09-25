import { useEffect, useState } from "react";
import { Download, Eye, X } from "lucide-react";
import {
  students,
  units,
  myUnitIds,
  gradeFor,
  transcriptHistory,
  programmes,
  departments,
  institution,
} from "../../lib/mockData";
import { useTeaching, computeResult } from "../../lib/teachingStore";
import { useAttachments, finalMark } from "../../lib/Attachmentstore";
import { durationLabel } from "../../lib/duration";
import {
  downloadTranscript,
  downloadYearTranscript,
  downloadUnitReport,
} from "../../lib/Transcript";

const me = students[0]; // TODO(api): the logged-in student

// Same two accent colours as the other student pages. Change them here to re-theme.
const MINT = "#A6F4A3";
const VIOLET = "#A48CFA";

const tone = {
  A: "bg-green-100 text-green-800",
  B: "bg-green-100 text-green-800",
  C: "bg-blue-100 text-blue-800",
  D: "bg-amber-100 text-amber-800",
  E: "bg-red-100 text-red-800",
};
const Grade = ({ total }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${tone[gradeFor(total)]}`}
  >
    {gradeFor(total)}
  </span>
);

const OutlineBtn = ({ className = "", ...props }) => (
  <button
    type="button"
    className={`inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-4 py-2 text-[13px] font-medium hover:bg-black/[0.03] transition-colors ${className}`}
    {...props}
  />
);

const DarkBtn = ({ className = "", ...props }) => (
  <button
    type="button"
    className={`inline-flex items-center gap-1.5 rounded-full bg-ink text-white px-5 py-2.5 text-[13px] font-semibold hover:bg-ink/90 transition-colors ${className}`}
    {...props}
  />
);

const IconBtn = ({ className = "", ...props }) => (
  <button
    type="button"
    className={`inline-flex w-9 h-9 items-center justify-center rounded-full border border-line bg-white hover:bg-black/[0.03] transition-colors ${className}`}
    {...props}
  />
);

// Extra detail printed on the single-unit PDF (instructor, when it was taken,
// how long it ran). Only plain strings are passed through, so an id or object
// never ends up printed on the slip; anything missing shows as "-".
// TODO(api): fill these from the unit assignment in teachingStore / the
// transcript endpoint once the real fields are known.
const str = (v) => (typeof v === "string" && v ? v : undefined);
const metaFor = (u) =>
  u
    ? {
        instructor: str(u.instructor),
        dateTaken: str(u.dateTaken),
        duration: str(u.duration),
      }
    : {};

const Field = ({ label, value }) => (
  <div>
    <p className="text-[13px] text-subtle">{label}</p>
    <p className="text-[15px] font-semibold mt-0.5">{value || "-"}</p>
  </div>
);

// Compact list used inside the preview modal (year + full transcript views).
const MiniList = ({ rows }) => (
  <ul className="flex flex-col gap-2 bg-black/[0.04] rounded-3xl p-2.5">
    {rows.map((r) => (
      <li
        key={r.code}
        className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3"
      >
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-medium truncate">{r.name}</p>
          <p className="text-xs text-subtle">{r.code}</p>
        </div>
        <span className="text-[14px] font-semibold">{r.total}%</span>
        <Grade total={r.total} />
      </li>
    ))}
  </ul>
);

const Modal = ({ title, subtitle, onClose, onDownload, children }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
    onClick={onClose}
    role="dialog"
    aria-modal="true"
  >
    <div
      className="bg-white rounded-[28px] shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xl font-semibold tracking-tight">{title}</p>
          {subtitle && (
            <p className="text-[13px] text-subtle mt-0.5">{subtitle}</p>
          )}
        </div>
        <IconBtn onClick={onClose} aria-label="Close preview">
          <X size={15} />
        </IconBtn>
      </div>
      <div className="px-6 pb-4 overflow-y-auto text-[14px]">{children}</div>
      <div className="px-6 py-4 border-t border-line flex justify-end gap-2">
        <OutlineBtn onClick={onClose}>Close</OutlineBtn>
        <DarkBtn onClick={onDownload}>
          <Download size={14} /> Download PDF
        </DarkBtn>
      </div>
    </div>
  </div>
);

// Students only see their transcript: results the teacher has released, plus earlier years.
const Grades = () => {
  const st = useTeaching();
  const placement = useAttachments().find(
    (p) => p.studentId === me._id && p.status === "completed",
  );

  // Preview modal: null | { kind: "full" } | { kind: "year", period, index } | { kind: "unit", row, period }
  const [view, setView] = useState(null);
  const close = () => setView(null);

  useEffect(() => {
    if (!view) return;
    const onKey = (e) => e.key === "Escape" && setView(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view]);

  // TODO(api): GET /transcripts/mine, which already includes every past year.
  const current = units
    .filter((u) => myUnitIds.includes(u._id) && st.published[u._id])
    .map((u) => ({
      code: u.code,
      name: u.name,
      total: computeResult(st, u._id, me._id).total,
      ...metaFor(u),
    }))
    .filter((r) => r.total !== null);

  // Earlier years only carry code/name/total, so look the extra detail up by unit code.
  const history = transcriptHistory.map((p) => ({
    ...p,
    rows: p.rows.map((r) => ({
      ...metaFor(units.find((u) => u.code === r.code)),
      ...r,
    })),
  }));

  const periods = [
    ...history,
    ...(current.length
      ? [{ title: `Year ${me.year} (2026/2027)`, rows: current }]
      : []),
  ];
  const attachmentMark = placement ? finalMark(placement) : null;
  const attachment =
    placement && attachmentMark !== null
      ? {
          organisation: placement.organisation,
          mark: attachmentMark,
          remarks: placement.remarks,
        }
      : null;

  const all = [
    ...periods.flatMap((p) => p.rows.map((r) => r.total)),
    ...(attachment ? [attachment.mark] : []),
  ];
  const mean = all.length
    ? Math.round(all.reduce((s, n) => s + n, 0) / all.length)
    : null;

  const transcript = {
    institution: institution.name,
    student: {
      fullName: me.fullName,
      admissionNumber: me.admissionNumber,
      programme: programmes.find((p) => p._id === me.programmeId)?.name,
      department: departments.find((d) => d.code === me.dept)?.name,
      period: `${durationLabel(me.duration)} (${new Date(me.startDate).toLocaleDateString()} – ${new Date(me.endDate).toLocaleDateString()})`,
    },
    periods,
    attachment,
  };

  const meanOf = (rows) =>
    rows.length
      ? Math.round(rows.reduce((s, r) => s + r.total, 0) / rows.length)
      : null;

  // Attachment sits in the final year, so it rides on the latest period's PDF.
  const yearHasAttachment = (i) => i === periods.length - 1 && !!attachment;
  const downloadYear = (p, i) =>
    downloadYearTranscript(transcript, p, {
      includeAttachment: yearHasAttachment(i),
    });

  const renderPreview = () => {
    if (!view) return null;

    if (view.kind === "unit") {
      const { row: r, period: p } = view;
      return (
        <Modal
          title={r.name}
          subtitle={`${r.code} · Unit result slip`}
          onClose={close}
          onDownload={() => downloadUnitReport(transcript, r, p)}
        >
          <div className="grid grid-cols-2 gap-4">
            <Field label="Unit code" value={r.code} />
            <Field label="Unit title" value={r.name} />
            <Field label="Institution" value={transcript.institution} />
            <Field label="Department" value={transcript.student.department} />
            <Field label="Academic period" value={p?.title} />
            <Field label="Date taken" value={r.dateTaken} />
            <Field label="Duration" value={r.duration} />
            <Field label="Instructor" value={r.instructor} />
          </div>
          <div
            className="mt-5 rounded-3xl px-5 py-4 flex items-center justify-between text-ink"
            style={{ backgroundColor: MINT }}
          >
            <span className="text-[14px] font-medium">Total marks</span>
            <span className="flex items-center gap-3">
              <b className="text-2xl">{r.total}%</b>
              <Grade total={r.total} />
            </span>
          </div>
          {r.remarks && (
            <div className="mt-4 rounded-3xl bg-black/[0.04] px-5 py-4">
              <p className="text-[13px] text-subtle mb-1">Remarks</p>
              <p>{r.remarks}</p>
            </div>
          )}
        </Modal>
      );
    }

    if (view.kind === "year") {
      const { period: p, index: i } = view;
      const m = meanOf(p.rows);
      return (
        <Modal
          title={p.title}
          subtitle="Year transcript"
          onClose={close}
          onDownload={() => downloadYear(p, i)}
        >
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Field label="Name" value={transcript.student.fullName} />
            <Field
              label="Admission no."
              value={transcript.student.admissionNumber}
            />
          </div>
          <MiniList rows={p.rows} />
          {m !== null && (
            <p className="mt-4 font-semibold">
              Year mean: {m}% (Grade {gradeFor(m)})
            </p>
          )}
          {yearHasAttachment(i) && (
            <div className="mt-4 rounded-3xl bg-black/[0.04] px-5 py-4">
              <p className="text-[13px] text-subtle mb-1">
                Industrial attachment (included in this PDF)
              </p>
              <p className="font-semibold">
                {attachment.organisation} · {attachment.mark}% (
                {gradeFor(attachment.mark)})
              </p>
            </div>
          )}
        </Modal>
      );
    }

    // kind === "full"
    return (
      <Modal
        title="Full academic transcript"
        subtitle={`${transcript.student.fullName} · ${transcript.student.admissionNumber}`}
        onClose={close}
        onDownload={() => downloadTranscript(transcript)}
      >
        <div className="grid grid-cols-2 gap-4 mb-5">
          <Field label="Programme" value={transcript.student.programme} />
          <Field label="Department" value={transcript.student.department} />
          <Field label="Course period" value={transcript.student.period} />
          <Field
            label="Overall mean"
            value={mean !== null ? `${mean}% (${gradeFor(mean)})` : null}
          />
        </div>
        <div className="flex flex-col gap-5">
          {periods.map((p) => (
            <div key={p.title}>
              <p className="font-semibold mb-2">{p.title}</p>
              <MiniList rows={p.rows} />
            </div>
          ))}
          {attachment && (
            <div>
              <p className="font-semibold mb-2">Industrial attachment</p>
              <div className="rounded-3xl bg-black/[0.04] px-5 py-4">
                {attachment.organisation} · {attachment.mark}% (
                {gradeFor(attachment.mark)})
              </div>
            </div>
          )}
        </div>
      </Modal>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Transcript</h1>
          <p className="text-sm text-subtle mt-1 max-w-xl">
            Your released results. View the details, then download a PDF copy
            whenever you need one.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <OutlineBtn onClick={() => setView({ kind: "full" })}>
            <Eye size={14} /> View
          </OutlineBtn>
          <DarkBtn onClick={() => downloadTranscript(transcript)}>
            <Download size={14} /> Download PDF
          </DarkBtn>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] gap-4">
          <div
            className="rounded-[26px] p-6 flex flex-col min-h-[190px] text-white"
            style={{ backgroundColor: VIOLET }}
          >
            <div className="flex items-center justify-between">
              <p className="text-[17px] font-medium">Overall mean</p>
              {mean !== null && (
                <span className="inline-flex rounded-full bg-white/25 px-2.5 py-1 text-[11px] font-semibold">
                  Grade {gradeFor(mean)}
                </span>
              )}
            </div>
            <p className="text-5xl font-semibold tracking-tight mt-auto">
              {mean !== null ? `${mean}%` : "—"}
            </p>
          </div>

          <div className="rounded-[26px] bg-white p-6 grid grid-cols-1 sm:grid-cols-3 gap-5 content-center">
            <Field label="Name" value={transcript.student.fullName} />
            <div>
              <p className="text-[13px] text-subtle">Admission no.</p>
              <p className="text-[15px] font-semibold font-mono mt-0.5">
                {transcript.student.admissionNumber || "-"}
              </p>
            </div>
            <Field label="Programme" value={transcript.student.programme} />
          </div>
        </div>

        {/* Years */}
        {periods.map((p, i) => {
          const yearMean = meanOf(p.rows);

          return (
            <section
              key={p.title}
              className="bg-black/[0.04] rounded-[28px] p-6"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap mb-5">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    {p.title}
                  </h2>
                  <p className="text-[13px] text-subtle mt-1">
                    {p.rows.length} {p.rows.length === 1 ? "unit" : "units"}
                    {yearMean !== null &&
                      ` · Year mean ${yearMean}% (${gradeFor(yearMean)})`}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <OutlineBtn
                    onClick={() =>
                      setView({ kind: "year", period: p, index: i })
                    }
                  >
                    <Eye size={13} /> View details
                  </OutlineBtn>
                  <OutlineBtn onClick={() => downloadYear(p, i)}>
                    <Download size={13} /> Download year PDF
                  </OutlineBtn>
                </div>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[480px]">
                  <div className="grid grid-cols-[2fr_.7fr_.7fr_1fr] gap-3 px-5 pb-2 text-[13px] text-subtle">
                    <span>Unit</span>
                    <span className="text-right">Marks</span>
                    <span>Grade</span>
                    <span className="text-right">Slip</span>
                  </div>
                  <ul className="flex flex-col gap-2.5">
                    {p.rows.map((r) => (
                      <li
                        key={r.code}
                        className="grid grid-cols-[2fr_.7fr_.7fr_1fr] gap-3 items-center bg-white rounded-3xl px-5 py-3.5"
                      >
                        <div className="min-w-0">
                          <p className="text-[15px] font-medium truncate">
                            {r.name}
                          </p>
                          <p className="text-[13px] text-subtle">{r.code}</p>
                        </div>
                        <span className="text-right text-[15px] font-semibold">
                          {r.total}%
                        </span>
                        <span>
                          <Grade total={r.total} />
                        </span>
                        <div className="flex items-center justify-end gap-1.5">
                          <IconBtn
                            onClick={() =>
                              setView({ kind: "unit", row: r, period: p })
                            }
                            title={`View ${r.code} details`}
                            aria-label={`View details for ${r.name}`}
                          >
                            <Eye size={14} />
                          </IconBtn>
                          <IconBtn
                            onClick={() => downloadUnitReport(transcript, r, p)}
                            title={`Download ${r.code} result slip`}
                            aria-label={`Download ${r.name} result slip as PDF`}
                          >
                            <Download size={14} />
                          </IconBtn>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          );
        })}

        {/* Attachment */}
        {attachment && (
          <section className="bg-white rounded-[28px] p-6">
            <h2 className="text-2xl font-semibold tracking-tight mb-5">
              Industrial attachment
            </h2>
            <div
              className="rounded-3xl px-5 py-4 flex items-center justify-between gap-3 flex-wrap text-ink"
              style={{ backgroundColor: MINT }}
            >
              <p className="text-[15px] font-semibold">
                {attachment.organisation}
              </p>
              <div className="flex items-center gap-3">
                <b className="text-xl">{attachment.mark}%</b>
                <Grade total={attachment.mark} />
              </div>
            </div>
            {attachment.remarks && (
              <div className="mt-3 rounded-3xl bg-black/[0.04] px-5 py-4">
                <p className="text-[13px] text-subtle mb-1">
                  Instructor remarks
                </p>
                <p className="text-[14px]">{attachment.remarks}</p>
              </div>
            )}
          </section>
        )}

        {current.length === 0 && (
          <p className="text-[13px] text-subtle px-2">
            Results for this year appear here once your instructors release
            them.
          </p>
        )}
      </div>

      {renderPreview()}
    </div>
  );
};

export default Grades;

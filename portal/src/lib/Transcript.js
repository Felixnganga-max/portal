import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { gradeFor } from "./mockData";

/*
  Shapes used by this file

  t = {
    institution,
    student: { fullName, admissionNumber, programme, department, period },
    periods: [{ title, rows: [row] }],
    attachment: { organisation, mark, remarks } | null,
  }

  row = {
    code, name, total,                       // required (already used today)
    instructor,                              // optional - shown on the unit PDF
    dateTaken | (startDate + endDate),       // optional - when the unit was taken
    duration,                                // optional - string, e.g. "12 weeks" or "45 hours"
    remarks,                                 // optional
    components: [{ name, mark, max }],       // optional - CAT 1, CAT 2, Exam ...
  }
*/

const BRAND = [192, 39, 45];
const MARGIN = 50;

// ---------- helpers ----------

const dash = (v) =>
  v === undefined || v === null || v === "" ? "-" : String(v);

const slug = (s) =>
  String(s ?? "")
    .trim()
    .replace(/[\\/]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/[^\w.-]/g, "");

const fmtDate = (d) => {
  if (!d) return "-";
  const x = new Date(d);
  return Number.isNaN(x.getTime())
    ? String(d)
    : x.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
};

const meanOf = (marks) =>
  Math.round(marks.reduce((s, n) => s + n, 0) / marks.length);

const drawHeader = (doc, institution, title) => {
  const W = doc.internal.pageSize.getWidth();
  doc
    .setFont("helvetica", "bold")
    .setFontSize(18)
    .text(institution, W / 2, 50, { align: "center" });
  doc.setFontSize(12).text(title, W / 2, 72, { align: "center" });
  return 98;
};

const drawStudentInfo = (doc, student, y, extra = []) => {
  doc.setFont("helvetica", "normal").setFontSize(10);
  const info = [
    ["Name", student.fullName],
    ["Admission no.", student.admissionNumber],
    ["Programme", student.programme],
    ["Department", student.department],
    ["Course period", student.period],
    ...extra,
  ];
  info.forEach(([k, v]) => {
    doc.setFont("helvetica", "bold").text(`${k}:`, MARGIN, y);
    doc.setFont("helvetica", "normal").text(dash(v), 140, y);
    y += 16;
  });
  return y + 8;
};

// Footer on every page: generated date + page x of y
const drawFooters = (doc) => {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(120);
    doc.text(
      `Generated from the student portal on ${new Date().toLocaleDateString()}`,
      MARGIN,
      H - 30,
    );
    doc.text(`Page ${i} of ${pages}`, W - MARGIN, H - 30, { align: "right" });
  }
  doc.setTextColor(0);
};

// ---------- full / per-year transcript ----------

// opts.title overrides the heading under the institution name.
export const buildTranscript = (t, opts = {}) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();

  let y = drawHeader(doc, t.institution, opts.title || "ACADEMIC TRANSCRIPT");
  y = drawStudentInfo(doc, t.student, y);

  const all = [];
  t.periods.forEach((p) => {
    if (y > 700) {
      doc.addPage();
      y = MARGIN;
    }
    doc.setFont("helvetica", "bold").setFontSize(11).text(p.title, MARGIN, y);
    autoTable(doc, {
      startY: y + 6,
      head: [["Code", "Unit", "Marks", "Grade"]],
      body: p.rows.map((r) => [
        r.code,
        r.name,
        `${r.total}%`,
        gradeFor(r.total),
      ]),
      theme: "grid",
      styles: { fontSize: 9 },
      headStyles: { fillColor: BRAND },
      margin: { left: MARGIN, right: MARGIN },
    });
    p.rows.forEach((r) => all.push(r.total));
    y = doc.lastAutoTable.finalY + 22;
  });

  if (t.attachment) {
    if (y > 700) {
      doc.addPage();
      y = MARGIN;
    }
    doc
      .setFont("helvetica", "bold")
      .setFontSize(11)
      .text("Industrial attachment", MARGIN, y);
    autoTable(doc, {
      startY: y + 6,
      head: [["Host organisation", "Marks", "Grade"]],
      body: [
        [
          t.attachment.organisation,
          `${t.attachment.mark}%`,
          gradeFor(t.attachment.mark),
        ],
      ],
      theme: "grid",
      styles: { fontSize: 9 },
      headStyles: { fillColor: BRAND },
      margin: { left: MARGIN, right: MARGIN },
    });
    y = doc.lastAutoTable.finalY + 14;
    if (t.attachment.remarks) {
      const lines = doc.splitTextToSize(t.attachment.remarks, W - MARGIN * 2);
      doc
        .setFont("helvetica", "bold")
        .setFontSize(10)
        .text("Instructor remarks", MARGIN, y);
      doc.setFont("helvetica", "normal").text(lines, MARGIN, y + 14);
      y += 14 + lines.length * 12 + 10;
    }
    all.push(t.attachment.mark);
  }

  if (all.length) {
    const mean = meanOf(all);
    if (y > 760) {
      doc.addPage();
      y = MARGIN;
    }
    doc
      .setFont("helvetica", "bold")
      .setFontSize(11)
      .text(`Overall mean: ${mean}%  (Grade ${gradeFor(mean)})`, MARGIN, y);
  }

  drawFooters(doc);
  return doc;
};

export const downloadTranscript = (t) =>
  buildTranscript(t).save(`Transcript-${slug(t.student.admissionNumber)}.pdf`);

// One year on its own. `period` is one entry from t.periods.
// Pass { includeAttachment: true } for the final year if attachment
// should appear on that year's PDF.
export const buildYearTranscript = (t, period, opts = {}) =>
  buildTranscript(
    {
      ...t,
      periods: [period],
      attachment: opts.includeAttachment ? t.attachment : null,
    },
    { title: `ACADEMIC TRANSCRIPT - ${String(period.title).toUpperCase()}` },
  );

export const downloadYearTranscript = (t, period, opts = {}) =>
  buildYearTranscript(t, period, opts).save(
    `Transcript-${slug(t.student.admissionNumber)}-${slug(period.title)}.pdf`,
  );

// ---------- per-unit result slip ----------

// `unit` is one row; `period` (optional) is the period it sits in, used
// for the "Academic period" line.
export const buildUnitReport = (t, unit, period) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();

  let y = drawHeader(doc, t.institution, "UNIT RESULT SLIP");
  y = drawStudentInfo(doc, t.student, y);

  const taken =
    unit.dateTaken ??
    (unit.startDate && unit.endDate
      ? `${fmtDate(unit.startDate)} to ${fmtDate(unit.endDate)}`
      : unit.startDate
        ? fmtDate(unit.startDate)
        : null);

  doc
    .setFont("helvetica", "bold")
    .setFontSize(11)
    .text("Unit details", MARGIN, y);
  autoTable(doc, {
    startY: y + 6,
    body: [
      ["Unit code", dash(unit.code)],
      ["Unit title", dash(unit.name)],
      ["Institution", dash(t.institution)],
      ["Department", dash(t.student.department)],
      ["Academic period", dash(period?.title ?? unit.period)],
      [
        "Date taken",
        taken ? (unit.dateTaken ? fmtDate(unit.dateTaken) : taken) : "-",
      ],
      ["Duration", dash(unit.duration)],
      ["Instructor", dash(unit.instructor)],
    ],
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 5 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 130, fillColor: [245, 245, 245] },
    },
    margin: { left: MARGIN, right: MARGIN },
  });
  y = doc.lastAutoTable.finalY + 22;

  if (Array.isArray(unit.components) && unit.components.length) {
    doc
      .setFont("helvetica", "bold")
      .setFontSize(11)
      .text("Assessment breakdown", MARGIN, y);
    autoTable(doc, {
      startY: y + 6,
      head: [["Component", "Mark", "Out of"]],
      body: unit.components.map((c) => [c.name, dash(c.mark), dash(c.max)]),
      theme: "grid",
      styles: { fontSize: 9 },
      headStyles: { fillColor: BRAND },
      margin: { left: MARGIN, right: MARGIN },
    });
    y = doc.lastAutoTable.finalY + 22;
  }

  doc.setFont("helvetica", "bold").setFontSize(11).text("Result", MARGIN, y);
  autoTable(doc, {
    startY: y + 6,
    head: [["Total marks", "Grade"]],
    body: [[`${unit.total}%`, gradeFor(unit.total)]],
    theme: "grid",
    styles: { fontSize: 11, halign: "center" },
    headStyles: { fillColor: BRAND, halign: "center" },
    margin: { left: MARGIN, right: MARGIN },
  });
  y = doc.lastAutoTable.finalY + 18;

  if (unit.remarks) {
    const lines = doc.splitTextToSize(String(unit.remarks), W - MARGIN * 2);
    doc.setFont("helvetica", "bold").setFontSize(10).text("Remarks", MARGIN, y);
    doc.setFont("helvetica", "normal").text(lines, MARGIN, y + 14);
    y += 14 + lines.length * 12 + 10;
  }

  // Signature lines
  const sigY = Math.max(y + 60, 640);
  doc.setDrawColor(120).setLineWidth(0.5);
  doc.line(MARGIN, sigY, MARGIN + 180, sigY);
  doc.line(W - MARGIN - 180, sigY, W - MARGIN, sigY);
  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(90);
  doc.text("Head of Department", MARGIN, sigY + 13);
  doc.text("Registrar / Academic office", W - MARGIN - 180, sigY + 13);

  drawFooters(doc);
  return doc;
};

export const downloadUnitReport = (t, unit, period) =>
  buildUnitReport(t, unit, period).save(
    `Unit-${slug(t.student.admissionNumber)}-${slug(unit.code)}.pdf`,
  );

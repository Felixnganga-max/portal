import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Card from "../../components/layouts/Card";
import Panel, { PageHeader, StatusPill } from "../../components/layouts/Panel";
import {
  students,
  departments,
  programmes,
  units,
  ledgers,
  funding,
  fundingTypeLabel,
  myGrades,
  myUnitIds,
} from "../../lib/mockData";

const tabs = ["Overview", "Units", "Finance", "Attachment"];

const fmt = (n) => (Number(n) || 0).toLocaleString();
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-[11px] text-subtle uppercase tracking-wide">{label}</p>
      <div className="text-sm font-semibold text-ink mt-0.5">
        {value || "—"}
      </div>
    </div>
  );
}

function Stat({ label, value, tone = "text-ink" }) {
  return (
    <div className="bg-canvas rounded p-4">
      <p className="text-[11px] text-subtle uppercase">{label}</p>
      <p className={`text-xl font-bold mt-1 ${tone}`}>{value}</p>
    </div>
  );
}

const BackLink = () => (
  <Link
    to="/admin/students"
    className="inline-flex items-center gap-1.5 text-xs text-subtle hover:text-ink mb-3"
  >
    <ArrowLeft size={14} /> Back to students
  </Link>
);

const StudentDetail = () => {
  const { id } = useParams();
  const [tab, setTab] = useState("Overview");

  // TODO(api): replace lookups with api.get(`/users/${id}`) etc.
  const student = students.find((s) => s._id === id);

  if (!student) {
    return (
      <div>
        <BackLink />
        <PageHeader
          title="Student not found"
          subtitle="Check the link and try again"
        />
      </div>
    );
  }

  const department = departments.find((d) => d.code === student.dept);
  const programme = programmes.find((p) => p._id === student.programmeId);

  // Finance (ledgers are student records + charged/paid, so match on _id)
  const ledger = ledgers.find((l) => l._id === id);
  const charged = ledger?.charged ?? 0;
  const paid = ledger?.paid ?? 0;
  const balance = charged - paid;

  // Mock funding isn't scoped to a student; it belongs to students[0].
  const studentFunding = id === students[0]._id ? funding : [];

  // Units: mock only defines units for the Business Management programme.
  const studentUnits =
    student.programmeId === "p1"
      ? units.filter((u) => myUnitIds.includes(u._id))
      : [];
  const gradeFor = (code) => myGrades.find((g) => g.code === code);

  return (
    <div>
      <BackLink />
      <PageHeader
        title={student.fullName}
        subtitle={`${student.admissionNumber} · ${programme?.name || "—"}`}
      />

      <div className="inline-flex gap-1 bg-surface border border-line rounded-md p-1 mb-5">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-xs rounded ${
              tab === t
                ? "bg-tenant text-white font-semibold"
                : "text-subtle hover:text-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <Panel
          title="Overview"
          description="Programme, intake and academic standing"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <InfoRow label="Full name" value={student.fullName} />
            <InfoRow label="Admission no." value={student.admissionNumber} />
            <InfoRow
              label="Status"
              value={<StatusPill status={student.status} />}
            />
            <InfoRow label="School email" value={student.email} />
            <InfoRow
              label="Department"
              value={department?.name || student.dept}
            />
            <InfoRow label="Programme" value={programme?.name} />
            <InfoRow label="Year of study" value={student.year} />
            <InfoRow
              label="Duration"
              value={`${student.duration.value} ${student.duration.unit}`}
            />
            <InfoRow label="Start date" value={fmtDate(student.startDate)} />
            <InfoRow label="End date" value={fmtDate(student.endDate)} />
            <InfoRow label="Mean score" value={student.mean} />
            <InfoRow label="Failed units" value={student.failed} />
            <InfoRow
              label="Fees cleared"
              value={student.feesCleared ? "Yes" : "No"}
            />
          </div>
        </Panel>
      )}

      {tab === "Units" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {studentUnits.map((u) => {
            const g = gradeFor(u.code);
            const total = g ? g.cat + g.exam : 0;
            return (
              <Card
                key={u._id}
                category={u.code}
                title={u.name}
                progress={total}
              >
                <p className="text-xs text-subtle">
                  {g
                    ? `CAT ${g.cat} · Exam ${g.exam} · Total ${total}`
                    : "No marks yet"}
                </p>
              </Card>
            );
          })}
          {studentUnits.length === 0 && (
            <p className="text-sm text-subtle">
              No units recorded for this student.
            </p>
          )}
        </div>
      )}

      {tab === "Finance" && (
        <Panel
          title="Fees"
          description="Amounts charged and paid for this student"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            <Stat label="Total charged" value={fmt(charged)} />
            <Stat label="Total paid" value={fmt(paid)} tone="text-good" />
            <Stat
              label="Balance"
              value={fmt(balance)}
              tone={balance > 0 ? "text-badge" : "text-good"}
            />
          </div>

          <h3 className="text-xs font-semibold text-ink mb-2">
            Funding (HELB / bursary)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-subtle text-xs bg-canvas">
                  <th className="px-4 py-2.5 font-medium">Source</th>
                  <th className="px-4 py-2.5 font-medium">Semester</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {studentFunding.map((f) => (
                  <tr
                    key={f._id}
                    className="border-t border-line hover:bg-canvas"
                  >
                    <td className="px-4 py-3">
                      {fundingTypeLabel[f.type] || f.source}
                    </td>
                    <td className="px-4 py-3">{f.semester}</td>
                    <td className="px-4 py-3 capitalize">{f.status}</td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {fmt(f.amount)}
                    </td>
                  </tr>
                ))}
                {studentFunding.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-subtle"
                    >
                      No funding recorded for this student.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {tab === "Attachment" && (
        <Panel title="Attachment" description="Logbook status goes here." />
      )}
    </div>
  );
};

export default StudentDetail;

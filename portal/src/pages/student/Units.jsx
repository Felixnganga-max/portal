import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../../components/layouts/Card";
import { PageHeader } from "../../components/layouts/Panel";
import api from "../../lib/api";
import { students } from "../../lib/mockData";
import { catalogUnit, useRegistrations } from "../../lib/registrationStore";

const me = students[0]; // TODO(api): the logged-in student

const kes = (n) => (n > 0 ? `KES ${Number(n).toLocaleString()}` : null);
const day = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

// Catalogue durations are labels like "3 weeks" or "2 months".
const daysOf = (label) => {
  const m = /(\d+)\s*(week|month|year)/i.exec(label || "");
  if (!m) return null;
  return Number(m[1]) * { week: 7, month: 30, year: 365 }[m[2].toLowerCase()];
};

// How far through a short course the student is, from the day it started.
const progressFor = (reg, unit) => {
  const total = daysOf(unit.duration);
  if (reg.status !== "registered" || !reg.registeredAt || !total) return 0;
  const elapsed =
    (Date.now() - new Date(reg.registeredAt).getTime()) / 86400000;
  return Math.max(0, Math.min(100, Math.round((elapsed / total) * 100)));
};

// Registered units only: what the student is taking now, plus requests awaiting approval.
// Registering happens on /student/units/register; finished units live in /student/units/history.
const StudentUnits = () => {
  const [apiRegs, setApiRegs] = useState(null);
  const localRegs = useRegistrations();

  useEffect(() => {
    api
      .get("/units/registrations/mine")
      .then(({ data }) => setApiRegs(data))
      // No backend answer should not leave the page stuck on "Loading…".
      .catch(() => setApiRegs([]));
  }, []);

  if (!apiRegs) return <p className="text-sm text-subtle">Loading…</p>;

  // TODO(api): drop the store once /units/register serves the new flow too.
  const current = localRegs
    .filter(
      (r) =>
        r.studentId === me._id && ["registered", "pending"].includes(r.status),
    )
    .map((r) => ({ reg: r, unit: catalogUnit(r.unitId) }))
    .filter(({ unit }) => unit)
    // If the API already returns the unit, don't show it twice.
    .filter(({ unit }) => !apiRegs.some((a) => a.unit?.code === unit.code))
    .sort(
      (a, b) => (a.reg.status === "pending") - (b.reg.status === "pending"),
    );

  const total = apiRegs.length + current.length;
  const pending = current.filter(({ reg }) => reg.status === "pending").length;
  const credits =
    current
      .filter(({ reg }) => reg.status === "registered" && reg.type !== "short")
      .reduce((s, { unit }) => s + (unit.creditHours || 0), 0) +
    apiRegs.reduce((s, r) => s + (r.unit?.creditHours || 0), 0);

  return (
    <div>
      <PageHeader
        title="Registered units"
        subtitle={`This semester · ${total} unit${total === 1 ? "" : "s"}${credits ? ` · ${credits} credit hours` : ""}${pending ? ` · ${pending} awaiting approval` : ""}`}
        actions={
          <Link
            to="/student/units/register"
            className="bg-ink text-white rounded px-4 py-2 text-xs font-semibold hover:bg-ink/90"
          >
            Register units
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {total === 0 && (
          <p className="text-sm text-subtle">
            No units registered yet this semester. Use Register units to add
            some.
          </p>
        )}

        {apiRegs.map((reg) => (
          <Card
            key={reg._id}
            category={reg.unit.code}
            title={reg.unit.name}
            progress={reg.attendancePercent}
          >
            <p className="text-xs text-subtle">
              {reg.instructor
                ? reg.instructor.fullName
                : "Instructor to be assigned"}
            </p>
            <p className="text-xs text-subtle">
              {reg.unit.creditHours} credit hours
            </p>
          </Card>
        ))}

        {current.map(({ reg, unit }) => (
          <Card
            key={reg.id}
            category={
              unit.type === "short" ? `${unit.code} · Short course` : unit.code
            }
            title={unit.name}
            progress={progressFor(reg, unit)}
          >
            <p className="text-xs text-subtle">
              {reg.status === "pending"
                ? `Awaiting admin approval · requested ${day(reg.requestedAt)}`
                : `${unit.instructor || "Instructor to be assigned"} · started ${day(reg.registeredAt)}`}
            </p>
            <p className="text-xs text-subtle">
              {[
                unit.type === "short"
                  ? unit.duration
                  : unit.creditHours
                    ? `${unit.creditHours} credit hours`
                    : null,
                kes(reg.fee),
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StudentUnits;

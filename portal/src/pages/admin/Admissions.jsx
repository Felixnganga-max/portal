import { useState } from "react";
import { Search } from "lucide-react";
import Panel, {
  PageHeader,
  StatusPill,
  DarkButton,
  Field,
  inputCls,
} from "../../components/layouts/Panel";
import { useAuth } from "../../context/AuthContext";
import {
  students as seedStudents,
  departments,
  programmes,
  institution,
} from "../../lib/mockData";
import { formatAdmission, nextSeq, suggestEmail } from "../../lib/Admission";
import {
  presets,
  addDuration,
  durationLabel,
  todayISO,
} from "../../lib/duration";

const thisYear = new Date().getFullYear();
const blank = {
  fullName: "",
  dept: "",
  programmeId: "",
  year: thisYear,
  phone: "",
  personalEmail: "",
  guardian: "",
  presetIdx: "",
  customValue: "",
  customUnit: "months",
  startDate: todayISO(),
};

// Used by admin (/admin/students/admissions, all departments, can set the
// school email) and by department staff (/instructor/enrolment, own department only).
const Admissions = () => {
  const { user } = useAuth();
  const isAdmin = user.role === "admin";
  const scopeDept = isAdmin ? null : user.department?.code;
  const deptOptions = scopeDept
    ? departments.filter((d) => d.code === scopeDept)
    : departments;

  const [list, setList] = useState(seedStudents); // TODO(api): GET /users?role=student
  const [form, setForm] = useState({ ...blank, dept: scopeDept || "" });
  const [emailEdit, setEmailEdit] = useState(null);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");

  const set = (k) => (e) =>
    setForm({
      ...form,
      [k]: e.target.value,
      ...(k === "dept" ? { programmeId: "" } : {}),
    });
  const progOptions = programmes.filter((p) => p.dept === form.dept);

  const seq = form.dept ? nextSeq(list, form.dept, Number(form.year)) : null;
  const admissionNumber = form.dept
    ? formatAdmission(form.dept, seq, Number(form.year))
    : "—";
  const takenEmails = list.map((s) => s.email);
  const suggestion = form.fullName
    ? suggestEmail(form.fullName, institution.emailDomain, takenEmails)
    : "";
  const email = emailEdit ?? suggestion;
  const emailTaken =
    emailEdit !== null && takenEmails.includes(emailEdit.toLowerCase());
  const emailBadDomain =
    email && !email.toLowerCase().endsWith(`@${institution.emailDomain}`);

  const chosen =
    form.presetIdx === "custom"
      ? { value: Number(form.customValue) || 0, unit: form.customUnit }
      : presets[form.presetIdx]
        ? {
            value: presets[form.presetIdx].value,
            unit: presets[form.presetIdx].unit,
          }
        : null;
  const endDate = chosen?.value
    ? addDuration(form.startDate, chosen.value, chosen.unit)
    : "";

  const submit = (e) => {
    e.preventDefault();
    if (!chosen?.value) return setMessage("Choose the course period.");
    if (!email || emailTaken || emailBadDomain)
      return setMessage("Fix the school email before saving.");
    // TODO(api): await api.post("/users/students", { ...form, email }); the server assigns the real admission number.
    setList([
      {
        _id: `s${Date.now()}`,
        fullName: form.fullName,
        admissionNumber,
        email,
        dept: form.dept,
        programmeId: form.programmeId,
        year: 1,
        duration: chosen,
        startDate: form.startDate,
        endDate,
        status: "active",
      },
      ...list,
    ]);
    setMessage(`${form.fullName} enrolled as ${admissionNumber}.`);
    setForm({ ...blank, dept: scopeDept || "" });
    setEmailEdit(null);
  };

  const rows = list.filter((s) =>
    `${s.fullName} ${s.admissionNumber} ${s.email}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const progName = (id) => programmes.find((p) => p._id === id)?.name || "—";

  return (
    <div>
      <PageHeader
        title={isAdmin ? "Admissions" : "Enrolment"}
        subtitle={
          isAdmin
            ? "Enrol students in any department and set their school email"
            : `Enrol students into ${user.department?.name || "your department"}`
        }
      />

      <form
        onSubmit={submit}
        className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5 items-start mb-5"
      >
        <Panel title="Student details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Field label="Full name">
                <input
                  required
                  value={form.fullName}
                  onChange={set("fullName")}
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label="Department">
              <select
                required
                value={form.dept}
                onChange={set("dept")}
                disabled={!isAdmin}
                className={inputCls}
              >
                <option value="">Select…</option>
                {deptOptions.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Programme">
              <select
                required
                value={form.programmeId}
                onChange={set("programmeId")}
                className={inputCls}
              >
                <option value="">
                  {form.dept ? "Select…" : "Pick a department first"}
                </option>
                {progOptions.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Intake year">
              <input
                required
                type="number"
                min="2000"
                max="2100"
                value={form.year}
                onChange={set("year")}
                className={inputCls}
              />
            </Field>
            <Field label="Course period">
              <select
                required
                value={form.presetIdx}
                onChange={set("presetIdx")}
                className={inputCls}
              >
                <option value="">Select…</option>
                {presets.map((p, i) => (
                  <option key={p.label} value={i}>
                    {p.label}
                  </option>
                ))}
                <option value="custom">Custom…</option>
              </select>
            </Field>
            {form.presetIdx === "custom" && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Length">
                  <input
                    type="number"
                    min="1"
                    value={form.customValue}
                    onChange={set("customValue")}
                    className={inputCls}
                  />
                </Field>
                <Field label="Unit">
                  <select
                    value={form.customUnit}
                    onChange={set("customUnit")}
                    className={inputCls}
                  >
                    <option value="weeks">weeks</option>
                    <option value="months">months</option>
                    <option value="years">years</option>
                  </select>
                </Field>
              </div>
            )}
            <Field label="Start date">
              <input
                required
                type="date"
                value={form.startDate}
                onChange={set("startDate")}
                className={inputCls}
              />
            </Field>
            <div className="flex items-end pb-2 text-xs text-subtle">
              {endDate ? (
                <>
                  Course ends on{" "}
                  <b className="text-ink ml-1">
                    {new Date(endDate).toLocaleDateString()}
                  </b>
                </>
              ) : (
                "Pick a course period to see the end date."
              )}
            </div>
            <Field label="Phone">
              <input
                required
                value={form.phone}
                onChange={set("phone")}
                placeholder="07XX XXX XXX"
                className={inputCls}
              />
            </Field>
            <Field label="Personal email">
              <input
                type="email"
                value={form.personalEmail}
                onChange={set("personalEmail")}
                className={inputCls}
              />
            </Field>
            <Field label="Guardian name & phone">
              <input
                value={form.guardian}
                onChange={set("guardian")}
                className={inputCls}
              />
            </Field>
          </div>
        </Panel>

        <Panel
          title="Generated details"
          description="Assigned automatically when you save"
        >
          <p className="text-xs text-subtle">Admission number</p>
          <p className="text-2xl font-bold text-tenant mt-1 font-mono">
            {admissionNumber}
          </p>
          <p className="text-[11px] text-subtle mt-1">
            Department / running number / year
          </p>

          <div className="mt-5">
            <Field label="School email">
              <input
                value={email}
                onChange={(e) => setEmailEdit(e.target.value)}
                readOnly={!isAdmin}
                placeholder={`name@${institution.emailDomain}`}
                className={`${inputCls} ${!isAdmin ? "bg-canvas" : ""}`}
              />
            </Field>
            <p
              className={`text-xs mt-1.5 ${emailTaken || emailBadDomain ? "text-badge" : "text-subtle"}`}
            >
              {emailTaken
                ? "That address is already in use."
                : emailBadDomain
                  ? `Must end with @${institution.emailDomain}`
                  : isAdmin
                    ? "Suggested from the name. You can edit it."
                    : "Suggested from the name. Admin can change it."}
            </p>
          </div>

          {message && (
            <p className="text-xs text-good font-semibold mt-4">{message}</p>
          )}
          <DarkButton type="submit" className="w-full mt-4 py-2.5">
            Enrol student
          </DarkButton>
        </Panel>
      </form>

      <Panel title="Enrolled students" flush>
        <div className="px-5 pb-4">
          <div className="relative max-w-xs">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="w-full border border-line rounded pl-9 pr-3 py-2 text-[13px] focus:outline-none focus:border-ink"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-subtle text-xs bg-canvas">
                <th className="px-5 py-2.5 font-medium">Student</th>
                <th className="px-5 py-2.5 font-medium">Admission no.</th>
                <th className="px-5 py-2.5 font-medium">School email</th>
                <th className="px-5 py-2.5 font-medium">Programme</th>
                <th className="px-5 py-2.5 font-medium">Course period</th>
                <th className="px-5 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows
                .filter((s) => !scopeDept || s.dept === scopeDept)
                .map((s) => (
                  <tr
                    key={s._id}
                    className="border-t border-line hover:bg-canvas"
                  >
                    <td className="px-5 py-3 font-semibold">{s.fullName}</td>
                    <td className="px-5 py-3 font-mono text-xs">
                      {s.admissionNumber}
                    </td>
                    <td className="px-5 py-3">{s.email}</td>
                    <td className="px-5 py-3">{progName(s.programmeId)}</td>
                    <td className="px-5 py-3">
                      {durationLabel(s.duration)}
                      <p className="text-xs text-subtle">
                        ends{" "}
                        {s.endDate
                          ? new Date(s.endDate).toLocaleDateString()
                          : "—"}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <StatusPill status={s.status} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
};

export default Admissions;

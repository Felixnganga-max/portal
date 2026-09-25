// Course period chosen at enrolment: 3 weeks, 2 months, 1 year, 3 years...
export const presets = [
  { label: "3 weeks", value: 3, unit: "weeks" },
  { label: "1 month", value: 1, unit: "months" },
  { label: "2 months", value: 2, unit: "months" },
  { label: "3 months", value: 3, unit: "months" },
  { label: "6 months", value: 6, unit: "months" },
  { label: "1 year", value: 1, unit: "years" },
  { label: "2 years", value: 2, unit: "years" },
  { label: "3 years", value: 3, unit: "years" },
];

const pad = (n) => String(n).padStart(2, "0");
const fmt = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// Last day of the course, counting the start day as day 1.
export const addDuration = (startISO, value, unit) => {
  if (!startISO || !value) return "";
  const d = new Date(`${startISO}T00:00:00`);
  if (unit === "weeks") d.setDate(d.getDate() + value * 7);
  else if (unit === "months") d.setMonth(d.getMonth() + value);
  else d.setFullYear(d.getFullYear() + value);
  d.setDate(d.getDate() - 1);
  return fmt(d);
};

export const toMonths = (duration) => {
  if (!duration) return 12;
  const { value, unit } = duration;
  return unit === "weeks"
    ? value / 4.345
    : unit === "months"
      ? value
      : value * 12;
};

export const durationLabel = (duration) => {
  if (!duration) return "—";
  const { value, unit } = duration;
  return `${value} ${value === 1 ? unit.slice(0, -1) : unit}`;
};

// Courses of a year or less have no yearly promotion: they graduate when the period ends.
export const isShortCourse = (duration) => toMonths(duration) <= 12;
export const totalYears = (duration) =>
  Math.max(1, Math.ceil(toMonths(duration) / 12));
export const todayISO = () => fmt(new Date());

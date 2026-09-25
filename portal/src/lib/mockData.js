// Sample data so every page works before the backend exists.
// When an endpoint is ready, swap the import for an api.get() call
// (each page marks the spot with TODO(api)).

export const institution = { name: "Demo College", emailDomain: "felix.ac.ke" };

export const departments = [
  { code: "BUS", name: "Business" },
  { code: "ICT", name: "Information Technology" },
  { code: "ENG", name: "Engineering" },
];

export const programmes = [
  { _id: "p1", name: "Diploma in Business Management", dept: "BUS", years: 3 },
  {
    _id: "p2",
    name: "Diploma in Supply Chain Management",
    dept: "BUS",
    years: 3,
  },
  {
    _id: "p3",
    name: "Diploma in Information Technology",
    dept: "ICT",
    years: 3,
  },
  {
    _id: "p4",
    name: "Certificate in Electrical Engineering",
    dept: "ENG",
    years: 2,
  },
  {
    _id: "p5",
    name: "Certificate in Computer Packages (short course)",
    dept: "ICT",
    years: 1,
  },
];

// Each student defines their own course period at enrolment (duration, startDate, endDate).
// year = current year of study; mean/failed/feesCleared feed the promotion review.
const three = { value: 3, unit: "years" };
export const students = [
  {
    _id: "s1",
    fullName: "Amina Wanjiku",
    admissionNumber: "BUS/00001/026",
    email: "amina@felix.ac.ke",
    dept: "BUS",
    programmeId: "p1",
    year: 3,
    duration: three,
    startDate: "2024-09-02",
    endDate: "2027-09-01",
    mean: 68,
    failed: 0,
    feesCleared: true,
    status: "active",
  },
  {
    _id: "s2",
    fullName: "Brian Otieno",
    admissionNumber: "BUS/00002/026",
    email: "brian@felix.ac.ke",
    dept: "BUS",
    programmeId: "p1",
    year: 3,
    duration: three,
    startDate: "2024-09-02",
    endDate: "2027-09-01",
    mean: 55,
    failed: 0,
    feesCleared: false,
    status: "active",
  },
  {
    _id: "s3",
    fullName: "Cynthia Mwende",
    admissionNumber: "BUS/00003/026",
    email: "cynthia@felix.ac.ke",
    dept: "BUS",
    programmeId: "p1",
    year: 2,
    duration: three,
    startDate: "2025-09-01",
    endDate: "2028-08-31",
    mean: 72,
    failed: 0,
    feesCleared: true,
    status: "active",
  },
  {
    _id: "s4",
    fullName: "David Kiprop",
    admissionNumber: "BUS/00004/026",
    email: "david@felix.ac.ke",
    dept: "BUS",
    programmeId: "p1",
    year: 2,
    duration: three,
    startDate: "2025-09-01",
    endDate: "2028-08-31",
    mean: 38,
    failed: 3,
    feesCleared: true,
    status: "active",
  },
  {
    _id: "s5",
    fullName: "Esther Achieng",
    admissionNumber: "BUS/00005/026",
    email: "esther@felix.ac.ke",
    dept: "BUS",
    programmeId: "p1",
    year: 1,
    duration: three,
    startDate: "2026-09-07",
    endDate: "2029-09-06",
    mean: 61,
    failed: 0,
    feesCleared: true,
    status: "active",
  },
  {
    _id: "s6",
    fullName: "Felix Mutua",
    admissionNumber: "BUS/00006/026",
    email: "felix@felix.ac.ke",
    dept: "BUS",
    programmeId: "p1",
    year: 1,
    duration: three,
    startDate: "2026-09-07",
    endDate: "2029-09-06",
    mean: 45,
    failed: 2,
    feesCleared: false,
    status: "active",
  },
  {
    _id: "s7",
    fullName: "Grace Njoki",
    admissionNumber: "ICT/00001/026",
    email: "grace@felix.ac.ke",
    dept: "ICT",
    programmeId: "p5",
    year: 1,
    duration: { value: 3, unit: "weeks" },
    startDate: "2026-08-24",
    endDate: "2026-09-13",
    mean: 78,
    failed: 0,
    feesCleared: true,
    status: "active",
  },
  {
    _id: "s8",
    fullName: "Hassan Ali",
    admissionNumber: "ICT/00002/026",
    email: "hassan@felix.ac.ke",
    dept: "ICT",
    programmeId: "p5",
    year: 1,
    duration: { value: 2, unit: "months" },
    startDate: "2026-09-01",
    endDate: "2026-10-31",
    mean: 65,
    failed: 0,
    feesCleared: true,
    status: "active",
  },
];

export const units = [
  { _id: "u1", code: "BUS 101", name: "Principles of Management" },
  { _id: "u2", code: "BUS 104", name: "Business Communication" },
  { _id: "u3", code: "BUS 203", name: "Financial Accounting" },
];

export const funding = [
  {
    _id: "f1",
    type: "helb-loan",
    source: "HELB Loan",
    amount: 40000,
    status: "disbursed",
    semester: "Semester 1, 2026",
    date: "2026-02-14",
  },
  {
    _id: "f2",
    type: "helb-scholarship",
    source: "HELB Scholarship",
    amount: 20000,
    status: "approved",
    semester: "Semester 2, 2026",
    date: null,
  },
  {
    _id: "f3",
    type: "bursary",
    source: "County bursary",
    amount: 10000,
    status: "pending",
    semester: "Semester 2, 2026",
    date: null,
  },
];

export const fundingTypeLabel = {
  "helb-loan": "HELB loan",
  "helb-scholarship": "HELB scholarship",
  bursary: "Bursary",
};

export const myGrades = [
  { code: "BUS 101", name: "Principles of Management", cat: 24, exam: 52 },
  { code: "BUS 104", name: "Business Communication", cat: 21, exam: 44 },
  { code: "BUS 203", name: "Financial Accounting", cat: 18, exam: 39 },
];

export const gradeFor = (total) =>
  total >= 70
    ? "A"
    : total >= 60
      ? "B"
      : total >= 50
        ? "C"
        : total >= 40
          ? "D"
          : "E";

export const ledgers = students.map((s, i) => ({
  ...s,
  charged: 90000,
  paid: [90000, 60000, 45000, 90000, 30000, 75000][i],
}));

export const initialWaivers = [
  {
    _id: "w1",
    student: "Brian Otieno",
    admissionNumber: "BUS/00002/026",
    amount: 15000,
    reason: "Orphan, sponsor withdrew support",
    status: "pending",
  },
  {
    _id: "w2",
    student: "Esther Achieng",
    admissionNumber: "BUS/00005/026",
    amount: 8000,
    reason: "Medical expenses",
    status: "pending",
  },
  {
    _id: "w3",
    student: "Felix Mutua",
    admissionNumber: "BUS/00006/026",
    amount: 5000,
    reason: "Late sponsor payment",
    status: "approved",
  },
];

// Applications submitted through the school website's "Apply now" form.
export const webApplications = [
  {
    _id: "a1",
    fullName: "Faith Wambui",
    email: "faith.wambui@gmail.com",
    phone: "0712 345 678",
    programmeId: "p1",
    intake: "September 2026",
    kcseGrade: "C+",
    county: "Nairobi",
    submittedAt: "2026-09-21T09:14:00",
    status: "new",
  },
  {
    _id: "a2",
    fullName: "Kevin Omondi",
    email: "kevin.omondi@yahoo.com",
    phone: "0723 456 789",
    programmeId: "p3",
    intake: "September 2026",
    kcseGrade: "B-",
    county: "Kisumu",
    submittedAt: "2026-09-20T16:40:00",
    status: "new",
  },
  {
    _id: "a3",
    fullName: "Lucy Chebet",
    email: "lucy.chebet@gmail.com",
    phone: "0734 567 890",
    programmeId: "p4",
    intake: "September 2026",
    kcseGrade: "C",
    county: "Nakuru",
    submittedAt: "2026-09-18T11:05:00",
    status: "reviewing",
  },
  {
    _id: "a4",
    fullName: "Moses Kariuki",
    email: "moses.kariuki@gmail.com",
    phone: "0745 678 901",
    programmeId: "p2",
    intake: "January 2027",
    kcseGrade: "C-",
    county: "Nyeri",
    submittedAt: "2026-09-15T08:30:00",
    status: "admitted",
  },
  {
    _id: "a5",
    fullName: "Naomi Akinyi",
    email: "naomi.akinyi@gmail.com",
    phone: "0756 789 012",
    programmeId: "p5",
    intake: "October 2026",
    kcseGrade: "D+",
    county: "Homa Bay",
    submittedAt: "2026-09-12T14:22:00",
    status: "rejected",
  },
];

// Units the signed-in mock student (students[0]) is taking, and who is in each class.
export const myUnitIds = ["u1", "u2", "u3"];
export const classFor = () =>
  students.filter(
    (s) => s.dept === "BUS" && s.status === "active" && s.programmeId === "p1",
  );

// Earlier years already on the student's record (used in the transcript).
export const transcriptHistory = [
  {
    title: "Year 1 (2024/2025)",
    rows: [
      { code: "BUS 001", name: "Introduction to Business", total: 71 },
      { code: "BUS 002", name: "Business Mathematics", total: 64 },
      { code: "BUS 003", name: "Computer Applications", total: 78 },
    ],
  },
  {
    title: "Year 2 (2025/2026)",
    rows: [
      { code: "BUS 102", name: "Marketing Principles", total: 66 },
      { code: "BUS 105", name: "Business Law", total: 58 },
      { code: "BUS 106", name: "Entrepreneurship", total: 73 },
    ],
  },
];

import {
  Home,
  Users,
  ClipboardList,
  Wallet,
  Briefcase,
  FileText,
  Landmark,
  BookOpen,
  UserPlus,
} from "lucide-react";

// Same shape as the real navConfig, but curated to real (mock-data-backed)
// screens only — no ph() placeholders — and every path lives under
// /simulation/<role>/... so it never collides with the guarded real routes.
export const simNavConfig = {
  admin: [
    { key: "home", label: "Home", icon: Home, path: "/simulation/admin/home" },
    {
      key: "students",
      label: "Students",
      icon: Users,
      children: [
        { label: "All students", path: "/simulation/admin/students" },
        { label: "Admissions", path: "/simulation/admin/students/admissions" },
      ],
    },
    {
      key: "finance",
      label: "Finance",
      icon: Wallet,
      children: [
        { label: "Student ledgers", path: "/simulation/admin/finance/ledgers" },
        { label: "Arrears report", path: "/simulation/admin/finance/arrears" },
        { label: "Waivers", path: "/simulation/admin/finance/waivers" },
      ],
    },
    {
      key: "results",
      label: "Results",
      icon: FileText,
      path: "/simulation/admin/results",
    },
  ],

  instructor: [
    {
      key: "home",
      label: "Home",
      icon: Home,
      path: "/simulation/instructor/home",
    },
    {
      key: "assignments",
      label: "Assignments",
      icon: ClipboardList,
      path: "/simulation/instructor/assignments",
    },
    {
      key: "attendance",
      label: "Attendance",
      icon: Users,
      path: "/simulation/instructor/attendance",
    },
    {
      key: "grades",
      label: "Results",
      icon: FileText,
      path: "/simulation/instructor/grades",
    },
    {
      key: "enrolment",
      label: "Enrolment",
      icon: UserPlus,
      path: "/simulation/instructor/enrolment",
    },
  ],

  finance: [
    {
      key: "home",
      label: "Home",
      icon: Home,
      path: "/simulation/finance/home",
    },
    {
      key: "payments",
      label: "Post payment",
      icon: Wallet,
      path: "/simulation/finance/payments",
    },
    {
      key: "ledgers",
      label: "Student ledgers",
      icon: FileText,
      path: "/simulation/finance/ledgers",
    },
    {
      key: "arrears",
      label: "Arrears report",
      icon: ClipboardList,
      path: "/simulation/finance/arrears",
    },
    {
      key: "waivers",
      label: "Waivers",
      icon: Briefcase,
      path: "/simulation/finance/waivers",
    },
  ],

  student: [
    {
      key: "home",
      label: "Home",
      icon: Home,
      path: "/simulation/student/home",
    },
    {
      key: "units",
      label: "Units",
      icon: BookOpen,
      path: "/simulation/student/units",
    },
    {
      key: "grades",
      label: "Transcript",
      icon: FileText,
      path: "/simulation/student/grades",
    },
    {
      key: "finance",
      label: "My fees",
      icon: Wallet,
      path: "/simulation/student/finance",
    },
    {
      key: "funding",
      label: "Funding & HELB",
      icon: Landmark,
      path: "/simulation/student/funding",
    },
  ],
};

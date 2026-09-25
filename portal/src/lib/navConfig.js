import {
  Home,
  Users,
  UserCog,
  BookOpen,
  ClipboardList,
  Wallet,
  Briefcase,
  MessageSquare,
  BarChart3,
  GraduationCap,
  FileText,
  Landmark,
  UserPlus,
} from "lucide-react";

// Sidebar entries per role. An item with `path` is a direct link; an item
// with `children` is an expandable group. Groups with a single child are
// flattened into direct links. Settings lives in the sidebar footer and
// routes to /<role>/settings, so it isn't listed here. `section` adds a
// small heading above the first item of each section.
export const navConfig = {
  admin: [
    { key: "home", label: "Home", icon: Home, path: "/admin/home" },
    {
      key: "students",
      label: "Students",
      icon: Users,
      children: [
        { label: "All students", path: "/admin/students" },
        { label: "Admissions", path: "/admin/students/admissions" },
        { label: "Promotion", path: "/admin/students/promotion" },
      ],
    },
    {
      key: "instructors",
      label: "Instructors",
      icon: UserCog,
      path: "/admin/instructors",
    },
    {
      key: "programs",
      label: "Programs & units",
      icon: BookOpen,
      children: [
        { label: "Programs", path: "/admin/programs" },
        { label: "Units", path: "/admin/units" },
        { label: "Unit assignment", path: "/admin/units/assignment" },
        { label: "Semesters & intakes", path: "/admin/semesters" },
      ],
    },
    {
      key: "registration",
      label: "Registration",
      icon: ClipboardList,
      children: [
        { label: "Registration windows", path: "/admin/registration/windows" },
        { label: "Force register / drop", path: "/admin/registration/manual" },
      ],
    },
    {
      key: "finance",
      label: "Finance",
      icon: Wallet,
      children: [
        { label: "Fee structures", path: "/admin/finance/structures" },
        { label: "Student ledgers", path: "/admin/finance/ledgers" },
        { label: "Arrears report", path: "/admin/finance/arrears" },
        { label: "Waivers", path: "/admin/finance/waivers" },
        { label: "HELB bulk update", path: "/admin/finance/helb" },
      ],
    },
    {
      key: "attachment",
      label: "Attachment",
      icon: Briefcase,
      path: "/admin/attachment",
    },
    {
      key: "results",
      label: "Results",
      icon: FileText,
      path: "/admin/results",
    },
    {
      key: "discussions",
      label: "Discussions",
      icon: MessageSquare,
      path: "/admin/discussions",
    },
    {
      key: "reports",
      label: "Reports",
      icon: BarChart3,
      path: "/admin/reports",
    },
  ],

  // Department teachers: results, assignments and materials for their own department.
  instructor: [
    { key: "home", label: "Home", icon: Home, path: "/instructor/home" },
    {
      key: "my-units",
      label: "My units",
      icon: BookOpen,
      section: "Teaching",
      path: "/instructor/units",
    },
    {
      key: "assignments",
      label: "Assignments",
      icon: ClipboardList,
      section: "Teaching",
      path: "/instructor/assignments",
    },
    {
      key: "materials",
      label: "Materials",
      icon: GraduationCap,
      section: "Teaching",
      path: "/instructor/materials",
    },
    {
      key: "enrolment",
      label: "Enrolment",
      icon: UserPlus,
      section: "Records",
      path: "/instructor/enrolment",
    },
    {
      key: "attendance",
      label: "Attendance",
      icon: Users,
      section: "Records",
      path: "/instructor/attendance",
    },
    {
      key: "attachment",
      label: "Attachment",
      icon: Briefcase,
      section: "Records",
      path: "/instructor/attachment",
    },
    {
      key: "grades",
      label: "Results",
      icon: FileText,
      section: "Records",
      path: "/instructor/grades",
    },
    {
      key: "discussions",
      label: "Discussions",
      icon: MessageSquare,
      section: "Records",
      path: "/instructor/discussions",
    },
  ],

  // Finance office: posts payments and manages fee structures, waivers, HELB.
  finance: [
    { key: "home", label: "Home", icon: Home, path: "/finance/home" },
    {
      key: "payments",
      label: "Post payment",
      icon: Wallet,
      section: "Collections",
      path: "/finance/payments",
    },
    {
      key: "ledgers",
      label: "Student ledgers",
      icon: FileText,
      section: "Collections",
      path: "/finance/ledgers",
    },
    {
      key: "arrears",
      label: "Arrears report",
      icon: BarChart3,
      section: "Collections",
      path: "/finance/arrears",
    },
    {
      key: "structures",
      label: "Fee structures",
      icon: ClipboardList,
      section: "Setup",
      path: "/finance/structures",
    },
    {
      key: "waivers",
      label: "Waivers",
      icon: Briefcase,
      section: "Setup",
      path: "/finance/waivers",
    },
    {
      key: "helb",
      label: "HELB bulk update",
      icon: GraduationCap,
      section: "Setup",
      path: "/finance/helb",
    },
  ],

  student: [
    { key: "home", label: "Home", icon: Home, path: "/student/home" },
    {
      key: "units",
      label: "Units",
      icon: BookOpen,
      section: "Academics",
      children: [
        { label: "Registered units", path: "/student/units" },
        { label: "Register units", path: "/student/units/register" },
        { label: "Unit history", path: "/student/units/history" },
      ],
    },
    {
      key: "assignments",
      label: "Assignments",
      icon: ClipboardList,
      section: "Academics",
      path: "/student/assignments",
    },
    {
      key: "grades",
      label: "Transcript",
      icon: FileText,
      section: "Academics",
      path: "/student/grades",
    },
    {
      key: "materials",
      label: "Materials",
      icon: GraduationCap,
      section: "Academics",
      path: "/student/materials",
    },
    {
      key: "discussions",
      label: "Discussions",
      icon: MessageSquare,
      section: "Academics",
      path: "/student/discussions",
    },
    {
      key: "finance",
      label: "My fees",
      icon: Wallet,
      section: "Records",
      path: "/student/finance",
    },
    {
      key: "funding",
      label: "Funding & HELB",
      icon: Landmark,
      section: "Records",
      path: "/student/funding",
    },
    {
      key: "attachment",
      label: "Attachment",
      icon: Briefcase,
      section: "Records",
      path: "/student/attachment",
    },
  ],
};

import { Link } from "react-router-dom";
import {
  ShieldCheck,
  GraduationCap,
  Wallet,
  BookOpen,
  ArrowRight,
  Sparkles,
} from "lucide-react";

// Public, no-auth entry point into the product demo. Each card drops the
// visitor into /simulation/<role>/home — a forked copy of the real
// dashboard shell/sidebar, fed entirely from mockData.js. Nothing here
// touches the real API or the real AuthContext.
const roles = [
  {
    key: "admin",
    label: "Admin",
    icon: ShieldCheck,
    description:
      "Manage students, admissions, programs, units and results across the whole institution.",
  },
  {
    key: "student",
    label: "Student",
    icon: GraduationCap,
    description:
      "View registered units, transcript, fee balance, and HELB/bursary funding status.",
  },
  {
    key: "finance",
    label: "Finance",
    icon: Wallet,
    description:
      "Post payments, manage student ledgers, fee structures, waivers and HELB updates.",
  },
  {
    key: "instructor",
    label: "Instructor",
    icon: BookOpen,
    description:
      "Take attendance, enter results, manage assignments and course materials.",
  },
];

function RoleCard({ role }) {
  const Icon = role.icon;
  return (
    <Link
      to={`/simulation/${role.key}/home`}
      className="group relative flex flex-col bg-white border border-gray-100 p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <div className="w-12 h-12 bg-[#111184]/5 flex items-center justify-center mb-5 group-hover:bg-[#111184] transition-colors">
        <Icon
          size={22}
          className="text-[#111184] group-hover:text-white transition-colors"
        />
      </div>

      <h3
        className="text-[#111184] text-lg uppercase tracking-tight mb-2"
        style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700 }}
      >
        {role.label}
      </h3>

      <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-1">
        {role.description}
      </p>

      <span className="inline-flex items-center gap-2 text-[#dc2626] text-xs font-bold uppercase tracking-wider">
        Preview this role
        <ArrowRight
          size={14}
          className="group-hover:translate-x-1 transition-transform"
        />
      </span>
    </Link>
  );
}

export default function Simulation() {
  return (
    <div className="min-h-screen bg-white">
      <section className="max-w-[1200px] mx-auto px-4 sm:px-12 pt-20 pb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-[#111184]/5 text-[#111184] text-[11px] font-bold uppercase tracking-wider px-4 py-2 mb-6">
          <Sparkles size={13} className="text-[#dc2626]" />
          No login required · Sample data only
        </div>

        <h1
          className="text-3xl sm:text-5xl text-[#111184] leading-tight mb-5"
          style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700 }}
        >
          See the system in action
        </h1>

        <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Pick a role below to explore a live preview of the platform. Every
          screen is populated with sample students, fees and results — no
          account needed, and nothing here touches real data.
        </p>
      </section>

      <section className="max-w-[1200px] mx-auto px-4 sm:px-12 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {roles.map((role) => (
            <RoleCard key={role.key} role={role} />
          ))}
        </div>
      </section>
    </div>
  );
}

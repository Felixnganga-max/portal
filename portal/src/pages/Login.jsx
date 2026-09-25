import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  GraduationCap,
  Wallet,
  BookOpen,
  ArrowRight,
} from "lucide-react";

// Simulation entry point. AuthContext's BYPASS_AUTH derives the dev user
// straight from the URL's first path segment, so picking a role here is
// just navigation — no login call, no token, nothing to fake.
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

const Login = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center px-4 py-16">
      <div className="text-center mb-10 max-w-lg">
        <h1 className="text-2xl font-semibold text-ink mb-2">
          See the system in action
        </h1>
        <p className="text-sm text-subtle">
          Pick a role below to preview its dashboard. This is a simulation —
          every screen uses sample data.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
        {roles.map((role) => {
          const Icon = role.icon;
          return (
            <button
              key={role.key}
              onClick={() => navigate(`/${role.key}/home`)}
              className="group text-left bg-surface border border-line p-5 hover:border-ink transition-colors"
            >
              <div className="w-10 h-10 rounded bg-tenant-soft text-tenant flex items-center justify-center mb-4 group-hover:bg-tenant group-hover:text-white transition-colors">
                <Icon size={18} />
              </div>
              <h3 className="font-semibold text-ink mb-1.5">{role.label}</h3>
              <p className="text-xs text-subtle leading-relaxed mb-4">
                {role.description}
              </p>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-tenant">
                Preview
                <ArrowRight
                  size={13}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-10 text-center">
        <p className="text-sm text-subtle mb-2">
          Want something specific for your school?
        </p>
        <button
          onClick={() => navigate("/contact")}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-tenant hover:underline"
        >
          Contact us
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default Login;

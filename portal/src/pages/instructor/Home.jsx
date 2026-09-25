import { useNavigate } from "react-router-dom";
import {
  FileText,
  ClipboardList,
  GraduationCap,
  Users,
  BookOpen,
  ClipboardCheck,
  FolderOpen,
  ArrowUpRight,
  PenLine,
} from "lucide-react";
import Panel, {
  PageHeader,
  HeroBanner,
  StatCard,
  IconChip,
  RowCard,
  OutlineButton,
} from "../../components/layouts/Panel";
import { useAuth } from "../../context/AuthContext";
import { units, classFor } from "../../lib/mockData";
import { useNow } from "../../components/layouts/Ui";
import {
  useAssignments,
  assignmentPhase,
  statsFor,
} from "../../lib/assignmentStore";

const ACTIONS = [
  {
    icon: FileText,
    tone: "tenant",
    title: "Post results",
    meta: "Enter marks for your units",
    to: "/instructor/grades",
  },
  {
    icon: ClipboardList,
    tone: "violet",
    title: "Post an assignment",
    meta: "Set work and a due date",
    to: "/instructor/assignments",
  },
  {
    icon: GraduationCap,
    tone: "green",
    title: "Upload materials",
    meta: "Share notes with your classes",
    to: "/instructor/materials",
  },
  {
    icon: Users,
    tone: "amber",
    title: "Mark attendance",
    meta: "Record who attended today",
    to: "/instructor/attendance",
  },
];

// Smooth area chart drawn with plain SVG (no chart library needed).
const AreaChart = ({ values, labels }) => {
  const W = 300;
  const H = 110;
  const max = Math.max(1, ...values);
  const pts = values.map((v, i) => [
    (i / (values.length - 1)) * W,
    H - 10 - (v / max) * (H - 32),
  ]);
  const line = pts.reduce((d, [x, y], i, a) => {
    if (!i) return `M${x},${y}`;
    const cx = (a[i - 1][0] + x) / 2;
    return `${d} C${cx},${a[i - 1][1]} ${cx},${y} ${x},${y}`;
  }, "");
  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="w-full h-28 text-tenant"
      >
        <defs>
          <linearGradient id="deadlineFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="currentColor" stopOpacity=".28" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${line} L${W},${H} L0,${H} Z`} fill="url(#deadlineFill)" />
        <path
          d={line}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="flex justify-between text-[11px] text-subtle mt-2">
        {labels.map((l, i) => (
          <span key={l + i} className={i === 0 ? "font-bold text-ink" : ""}>
            {l}
          </span>
        ))}
      </div>
    </div>
  );
};

const InstructorHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const store = useAssignments();
  const now = useNow();

  const dept = user?.department?.name;
  const first = user?.fullName?.split(" ")[0];
  const classIds = (unitId) => classFor(unitId).map((s) => s._id);

  const rows = store.assignments
    .filter((a) => a.status === "published")
    .map((a) => ({
      a,
      phase: assignmentPhase(a, now),
      stats: statsFor(a, classIds(a.unitId)),
    }));
  const toMark = rows.reduce((s, { stats }) => s + stats.toMark, 0);
  const openNow = rows.filter(
    ({ phase }) => phase === "open" || phase === "late-open",
  ).length;
  const drafts = store.assignments.filter((a) => a.status === "draft").length;

  // Deadlines per day for the next 7 days
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(dayStart);
    d.setDate(d.getDate() + i);
    return d;
  });
  const values = days.map(
    (d) =>
      rows.filter(({ a }) => {
        const due = new Date(a.dueAt);
        return due >= d && due < new Date(d.getTime() + 86400000);
      }).length,
  );
  const labels = days.map((d) =>
    d.toLocaleDateString(undefined, { weekday: "short" }),
  );

  return (
    <div>
      <PageHeader
        title={first ? `Welcome back, ${first}` : "Home"}
        subtitle={dept ? `${dept} · teaching overview` : "Teaching overview"}
      />

      <div className="mb-5">
        <HeroBanner
          icon={ClipboardCheck}
          title={
            toMark > 0
              ? `${toMark} submission${toMark === 1 ? " is" : "s are"} waiting to be marked`
              : "You're all caught up. Nothing is waiting to be marked."
          }
          text={
            openNow > 0
              ? `${openNow} assignment${openNow === 1 ? " is" : "s are"} open to students right now.`
              : "No assignments are open right now."
          }
          actionLabel="Open assignments"
          onAction={() => navigate("/instructor/assignments")}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-5 items-start">
        {/* Left / main column */}
        <div className="flex flex-col gap-5">
          <Panel title="What would you like to do?">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ACTIONS.map((a) => (
                <button
                  key={a.to}
                  onClick={() => navigate(a.to)}
                  className="group text-left flex items-center gap-3.5 rounded-xl border border-line/70 bg-surface p-3.5 hover:border-tenant/40 hover:shadow-[0_8px_22px_rgba(24,24,60,0.07)] transition"
                >
                  <IconChip icon={a.icon} tone={a.tone} size={44} />
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13px] font-semibold text-ink">
                      {a.title}
                    </span>
                    <span className="block text-xs text-subtle mt-0.5">
                      {a.meta}
                    </span>
                  </span>
                  <ArrowUpRight
                    size={16}
                    className="text-subtle group-hover:text-tenant transition-colors"
                  />
                </button>
              ))}
            </div>
          </Panel>

          <Panel
            title="My units"
            description="Units assigned to you this semester"
            action={{ label: "View all", to: "/instructor/units" }}
          >
            <div className="flex flex-col gap-2.5">
              {units.map((u) => (
                <RowCard
                  key={u._id}
                  icon={BookOpen}
                  tone="blue"
                  title={`${u.code} · ${u.name}`}
                  meta={`${classFor(u._id).length} students in class`}
                  trailing={
                    <OutlineButton
                      onClick={() => navigate("/instructor/grades")}
                    >
                      Results
                    </OutlineButton>
                  }
                />
              ))}
              {units.length === 0 && (
                <p className="text-xs text-subtle">
                  Your assigned units will appear here.
                </p>
              )}
            </div>
          </Panel>
        </div>

        {/* Right column: stats + chart */}
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              icon={FolderOpen}
              tone="green"
              label="Open assignments"
              value={openNow}
            />
            <StatCard
              icon={PenLine}
              tone="amber"
              label="To mark"
              value={toMark}
            />
            <StatCard
              icon={BookOpen}
              tone="blue"
              label="Units"
              value={units.length}
            />
            <StatCard
              icon={Users}
              tone="pink"
              label="In class"
              value={classFor().length}
              sub={
                drafts ? `${drafts} draft${drafts === 1 ? "" : "s"}` : undefined
              }
            />
          </div>

          <Panel
            title="Deadlines this week"
            description="Assignments falling due each day"
          >
            <AreaChart values={values} labels={labels} />
          </Panel>
        </div>
      </div>
    </div>
  );
};

export default InstructorHome;

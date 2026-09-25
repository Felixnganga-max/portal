import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Users, GraduationCap, Wallet } from "lucide-react";
import Panel, {
  PageHeader,
  ListRow,
  OutlineButton,
  DarkButton,
} from "../../components/layouts/Panel";
import Card from "../../components/layouts/Card";
import RailBlock from "../../components/layouts/RailBlock";
import api from "../../lib/api";

const AdminHome = () => {
  const [arrears, setArrears] = useState(null);
  const [hidden, setHidden] = useState(false);
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear().toString();

  useEffect(() => {
    api
      .get("/finance/arrears-report", { params: { academicYear: currentYear } })
      .then(({ data }) => setArrears(data))
      .catch(() => setArrears([]));
  }, []);

  const outstanding = (arrears || []).reduce((s, a) => s + a.balance, 0);
  const avgPaid = arrears?.length
    ? Math.round(
        arrears.reduce((s, a) => s + a.percentPaid, 0) / arrears.length,
      )
    : 0;

  return (
    <div>
      <PageHeader title="Home" subtitle="Overview of your institution" />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5">
        <div className="flex flex-col gap-5">
          <div className="rounded-md bg-gradient-to-r from-tenant-dark to-tenant text-white p-6 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-lg font-bold">Manage student records</h2>
              <p className="text-xs text-white/80 mt-1">
                Register students, track fees and follow up on arrears in one
                place.
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/students")}
              className="bg-white text-tenant rounded px-4 py-2 text-xs font-bold"
            >
              View students
            </button>
          </div>

          <Panel title={`Fee overview: ${currentYear}`}>
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs text-subtle">Total outstanding fees</p>
                <p className="text-2xl font-bold text-tenant mt-1 flex items-center gap-2">
                  {hidden
                    ? "KES ••••••"
                    : `KES ${outstanding.toLocaleString()}`}
                  <button
                    onClick={() => setHidden(!hidden)}
                    className="text-subtle"
                    aria-label="Toggle amount"
                  >
                    {hidden ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </p>
              </div>
              <div className="flex gap-2">
                <OutlineButton onClick={() => navigate("/admin/students")}>
                  View
                </OutlineButton>
                <DarkButton>Send reminders</DarkButton>
              </div>
            </div>
            <div className="mt-5">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-subtle">
                  Average fees cleared by students in arrears
                </span>
                <b>{avgPaid}%</b>
              </div>
              <div className="h-1.5 bg-canvas rounded-full overflow-hidden">
                <div
                  className="h-full bg-good rounded-full"
                  style={{ width: `${avgPaid}%` }}
                />
              </div>
            </div>
          </Panel>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card category="Students" title="Total enrolled" />
            <Card
              category="Finance"
              title={`Arrears: ${arrears?.length ?? "—"} students`}
            />
            <Card category="Instructors" title="Total active" />
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <Panel
            title="Needs attention"
            description="Largest outstanding balances"
            flush
          >
            {arrears?.length ? (
              arrears
                .slice(0, 5)
                .map((a) => (
                  <ListRow
                    key={a._id}
                    icon={Wallet}
                    title={a.student?.fullName}
                    meta={a.student?.admissionNumber}
                    trailing={
                      <b className="text-xs">
                        KES {a.balance.toLocaleString()}
                      </b>
                    }
                  />
                ))
            ) : (
              <p className="px-5 pb-5 text-xs text-subtle">
                No outstanding arrears.
              </p>
            )}
          </Panel>
          <RailBlock title="Announcements" emptyMessage="Nothing posted yet." />
        </div>
      </div>
    </div>
  );
};

export default AdminHome;

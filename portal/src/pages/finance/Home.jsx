import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, ClipboardList, Briefcase } from "lucide-react";
import Panel, {
  PageHeader,
  ListRow,
  OutlineButton,
} from "../../components/layouts/Panel";
import api from "../../lib/api";

const FinanceHome = () => {
  const [arrears, setArrears] = useState(null);
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear().toString();

  useEffect(() => {
    api
      .get("/finance/arrears-report", { params: { academicYear: currentYear } })
      .then(({ data }) => setArrears(data))
      .catch(() => setArrears([]));
  }, []);

  const outstanding = (arrears || []).reduce((s, a) => s + a.balance, 0);
  const actions = [
    {
      icon: Wallet,
      title: "Post a payment",
      meta: "Record bank, cash or M-Pesa receipts",
      to: "/finance/payments",
    },
    {
      icon: ClipboardList,
      title: "Fee structures",
      meta: "Set what each program pays",
      to: "/finance/structures",
    },
    {
      icon: Briefcase,
      title: "Waivers",
      meta: "Approve fee waivers",
      to: "/finance/waivers",
    },
  ];

  return (
    <div>
      <PageHeader title="Home" subtitle="Finance office overview" />
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5">
        <div className="flex flex-col gap-5">
          <Panel title={`Collections: ${currentYear}`}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-subtle">Total outstanding</p>
                <p className="text-2xl font-bold text-tenant mt-1">
                  KES {outstanding.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-subtle">Students in arrears</p>
                <p className="text-2xl font-bold mt-1">
                  {arrears?.length ?? "—"}
                </p>
              </div>
            </div>
          </Panel>

          <Panel title="Quick actions" flush>
            {actions.map((a, i) => (
              <div key={a.to} className={i === 0 ? "[&>div]:border-t-0" : ""}>
                <ListRow
                  icon={a.icon}
                  title={a.title}
                  meta={a.meta}
                  trailing={
                    <OutlineButton onClick={() => navigate(a.to)}>
                      Open
                    </OutlineButton>
                  }
                />
              </div>
            ))}
          </Panel>
        </div>

        <Panel
          title="Largest balances"
          description="Students owing the most"
          action={{ label: "View all", to: "/finance/arrears" }}
          flush
        >
          {arrears?.length ? (
            arrears
              .slice(0, 6)
              .map((a) => (
                <ListRow
                  key={a._id}
                  icon={Wallet}
                  title={a.student?.fullName}
                  meta={a.student?.admissionNumber}
                  trailing={
                    <b className="text-xs">KES {a.balance.toLocaleString()}</b>
                  }
                />
              ))
          ) : (
            <p className="px-5 pb-5 text-xs text-subtle">
              No outstanding arrears.
            </p>
          )}
        </Panel>
      </div>
    </div>
  );
};

export default FinanceHome;

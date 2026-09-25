import { useMemo, useState } from "react";
import {
  Download,
  Wallet,
  HandCoins,
  AlertTriangle,
  Percent,
  ReceiptText,
} from "lucide-react";
import Panel, {
  PageHeader,
  OutlineButton,
  DarkButton,
  Field,
  StatCard,
  Tabs,
  SearchBox,
  ProgressBar,
  Avatar,
  EmptyState,
  Notice,
  inputCls,
  tableCls,
  thCls,
  rowCls,
} from "../../components/layouts/Panel";
import Pagination from "../../components/layouts/Pagination";
import { Pill } from "../../components/layouts/Ui";
import { downloadCsv } from "../../lib/Csv";

/* ------------------------------------------------------------------ *
 * Self-contained sample data. TODO(api): replace SEED with
 * api.get("/fees/ledgers") — each item needs { _id, fullName,
 * admissionNumber, dept, programme, charges[], payments[] }.
 * ------------------------------------------------------------------ */

const DEPARTMENTS = [
  { code: "BUS", name: "Business" },
  { code: "ICT", name: "Information Technology" },
  { code: "ENG", name: "Engineering" },
];

const charges = (tuition, exam = 8000) => [
  { label: "Tuition", amount: tuition },
  { label: "Registration & activity", amount: 5000 },
  { label: "Examinations", amount: exam },
];
const pay = (id, date, method, ref, amount) => ({
  id,
  date,
  method,
  ref,
  amount,
});

const SEED = [
  {
    _id: "l1",
    fullName: "Amina Wanjiku",
    admissionNumber: "BUS/00001/026",
    dept: "BUS",
    programme: "Diploma in Business Management",
    charges: charges(77000),
    payments: [
      pay("p1", "2026-09-03", "M-Pesa", "SIA4K2L9QX", 50000),
      pay("p2", "2026-10-01", "Bank", "EQ-882014", 40000),
    ],
  },
  {
    _id: "l2",
    fullName: "Brian Otieno",
    admissionNumber: "BUS/00002/026",
    dept: "BUS",
    programme: "Diploma in Business Management",
    charges: charges(77000),
    payments: [pay("p3", "2026-09-05", "M-Pesa", "SIB7M3P1ZT", 60000)],
  },
  {
    _id: "l3",
    fullName: "Cynthia Mwende",
    admissionNumber: "BUS/00003/026",
    dept: "BUS",
    programme: "Diploma in Business Management",
    charges: charges(77000),
    payments: [
      pay("p4", "2026-09-02", "Bank", "KCB-104471", 30000),
      pay("p5", "2026-09-28", "M-Pesa", "SIC2N8R4VD", 15000),
    ],
  },
  {
    _id: "l4",
    fullName: "David Kiprop",
    admissionNumber: "BUS/00004/026",
    dept: "BUS",
    programme: "Diploma in Business Management",
    charges: charges(77000),
    payments: [pay("p6", "2026-09-01", "Cash", "RCT-2210", 90000)],
  },
  {
    _id: "l5",
    fullName: "Esther Achieng",
    admissionNumber: "BUS/00005/026",
    dept: "BUS",
    programme: "Diploma in Supply Chain Management",
    charges: charges(77000),
    payments: [pay("p7", "2026-09-10", "M-Pesa", "SID9T5Q2LW", 30000)],
  },
  {
    _id: "l6",
    fullName: "Felix Mutua",
    admissionNumber: "BUS/00006/026",
    dept: "BUS",
    programme: "Diploma in Supply Chain Management",
    charges: charges(77000),
    payments: [
      pay("p8", "2026-09-08", "M-Pesa", "SIE1A6H8KM", 45000),
      pay("p9", "2026-10-06", "M-Pesa", "SIF3B9J2NP", 30000),
    ],
  },
  {
    _id: "l7",
    fullName: "Grace Njoki",
    admissionNumber: "ICT/00001/026",
    dept: "ICT",
    programme: "Certificate in Computer Packages",
    charges: charges(12000, 3000),
    payments: [pay("p10", "2026-08-24", "M-Pesa", "SIG5C2D7RS", 20000)],
  },
  {
    _id: "l8",
    fullName: "Hassan Ali",
    admissionNumber: "ICT/00002/026",
    dept: "ICT",
    programme: "Certificate in Computer Packages",
    charges: charges(12000, 3000),
    payments: [],
  },
  {
    _id: "l9",
    fullName: "Irene Chebet",
    admissionNumber: "ICT/00003/026",
    dept: "ICT",
    programme: "Diploma in Information Technology",
    charges: charges(82000, 9000),
    payments: [
      pay("p11", "2026-09-04", "Bank", "EQ-771903", 60000),
      pay("p12", "2026-10-02", "M-Pesa", "SIH8E1F6TU", 36000),
    ],
  },
  {
    _id: "l10",
    fullName: "James Kariuki",
    admissionNumber: "ICT/00004/026",
    dept: "ICT",
    programme: "Diploma in Information Technology",
    charges: charges(82000, 9000),
    payments: [pay("p13", "2026-09-06", "M-Pesa", "SII4G7K3WY", 25000)],
  },
  {
    _id: "l11",
    fullName: "Kevin Omondi",
    admissionNumber: "ENG/00001/026",
    dept: "ENG",
    programme: "Certificate in Electrical Engineering",
    charges: charges(55000, 6000),
    payments: [pay("p14", "2026-09-03", "Bank", "KCB-104502", 66000)],
  },
  {
    _id: "l12",
    fullName: "Lucy Nyambura",
    admissionNumber: "ENG/00002/026",
    dept: "ENG",
    programme: "Certificate in Electrical Engineering",
    charges: charges(55000, 6000),
    payments: [],
  },
];

/* ------------------------------ helpers ----------------------------- */

const PAGE_SIZE = 8;
const METHODS = ["M-Pesa", "Bank", "Cash", "Cheque"];

// Coerces anything (undefined, null, "", NaN, a bad string) to a safe
// number — nothing downstream of this can throw on a missing amount.
const num = (n) => {
  const v = Number(n);
  return Number.isFinite(v) ? v : 0;
};

// KSh with thousands separators. Always safe: num() guards the input.
const kes = (n) => `KSh ${num(n).toLocaleString()}`;

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

const STATUS = {
  cleared: { label: "Cleared", tone: "green" },
  partial: { label: "Part paid", tone: "amber" },
  unpaid: { label: "Not paid", tone: "red" },
};

// One place that derives totals, so nothing downstream can be undefined
// even if a charge/payment amount is missing or malformed.
const withTotals = (l) => {
  const charged = (l.charges || []).reduce((s, c) => s + num(c.amount), 0);
  const paid = (l.payments || []).reduce((s, p) => s + num(p.amount), 0);
  const balance = Math.max(0, charged - paid);
  const status =
    charged > 0 && paid >= charged
      ? "cleared"
      : paid === 0
        ? "unpaid"
        : "partial";
  return { ...l, charged, paid, balance, status };
};

/* ------------------------------- page ------------------------------- */

const Ledgers = () => {
  const [data, setData] = useState(SEED);
  const [tab, setTab] = useState("all");
  const [dept, setDept] = useState("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [pay_, setPay] = useState({ amount: "", method: "M-Pesa", ref: "" });
  const [notice, setNotice] = useState("");

  const all = useMemo(() => data.map(withTotals), [data]);
  const inDept = useMemo(
    () => all.filter((l) => dept === "all" || l.dept === dept),
    [all, dept],
  );

  const totalCharged = useMemo(
    () => inDept.reduce((s, l) => s + l.charged, 0),
    [inDept],
  );
  const totalPaid = useMemo(
    () => inDept.reduce((s, l) => s + l.paid, 0),
    [inDept],
  );
  const outstanding = useMemo(
    () => inDept.reduce((s, l) => s + l.balance, 0),
    [inDept],
  );
  const rate = totalCharged ? Math.round((totalPaid / totalCharged) * 100) : 0;

  const count = (k) =>
    k === "all" ? inDept.length : inDept.filter((l) => l.status === k).length;

  const filtered = useMemo(
    () =>
      inDept
        .filter((l) => tab === "all" || l.status === tab)
        .filter((l) =>
          `${l.fullName} ${l.admissionNumber}`
            .toLowerCase()
            .includes(query.trim().toLowerCase()),
        )
        .sort((a, b) => b.balance - a.balance),
    [inDept, tab, query],
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const selected = all.find((l) => l._id === selectedId) || null;

  // Any filter/search change should always land back on page 1.
  const resetPage = (fn) => (v) => {
    fn(v);
    setPage(1);
  };

  const selectRow = (id) =>
    setSelectedId((current) => (current === id ? null : id));

  const recordPayment = (e) => {
    e.preventDefault();
    const amount = num(pay_.amount);
    if (!selected || amount <= 0) return;

    // TODO(api): api.post(`/fees/student/${selected._id}/payments`, {...})
    setData((list) =>
      list.map((l) =>
        l._id === selected._id
          ? {
              ...l,
              payments: [
                ...l.payments,
                {
                  id: `p${Date.now()}`,
                  date: new Date().toISOString().slice(0, 10),
                  method: pay_.method,
                  ref: pay_.ref.trim() || "—",
                  amount,
                },
              ],
            }
          : l,
      ),
    );
    setNotice(`${kes(amount)} recorded for ${selected.fullName}.`);
    setPay({ amount: "", method: "M-Pesa", ref: "" });
  };

  const download = () =>
    downloadCsv("student-ledgers.csv", [
      [
        "Admission no.",
        "Name",
        "Department",
        "Programme",
        "Charged",
        "Paid",
        "Balance",
        "Status",
      ],
      ...filtered.map((l) => [
        l.admissionNumber,
        l.fullName,
        l.dept,
        l.programme,
        l.charged,
        l.paid,
        l.balance,
        STATUS[l.status].label,
      ]),
    ]);

  return (
    <div>
      <PageHeader
        title="Student ledgers"
        subtitle="What each student has been charged, what they've paid and what is still owed"
        actions={
          <OutlineButton onClick={download}>
            <Download size={13} /> Download (CSV)
          </OutlineButton>
        }
      />

      {notice && <Notice onDismiss={() => setNotice("")}>{notice}</Notice>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard
          icon={Wallet}
          tone="blue"
          label="Total charged"
          value={kes(totalCharged)}
        />
        <StatCard
          icon={HandCoins}
          tone="green"
          label="Collected"
          value={kes(totalPaid)}
        />
        <StatCard
          icon={AlertTriangle}
          tone="pink"
          label="Outstanding"
          value={kes(outstanding)}
        />
        <StatCard
          icon={Percent}
          tone="tenant"
          label="Collection rate"
          value={`${rate}%`}
        />
      </div>

      <Tabs
        tabs={[
          ["all", `All (${count("all")})`],
          ["cleared", `Cleared (${count("cleared")})`],
          ["partial", `Part paid (${count("partial")})`],
          ["unpaid", `Not paid (${count("unpaid")})`],
        ]}
        value={tab}
        onChange={resetPage(setTab)}
      />

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-5 items-start">
        {/* Ledger table */}
        <Panel flush>
          <div className="p-4 flex items-center gap-3 flex-wrap">
            <SearchBox
              value={query}
              onChange={resetPage(setQuery)}
              placeholder="Search name or admission no."
            />
            <select
              value={dept}
              onChange={(e) => resetPage(setDept)(e.target.value)}
              className={`${inputCls} !w-52 !py-2`}
            >
              <option value="all">All departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.name}
                </option>
              ))}
            </select>
            <span className="text-xs text-subtle ml-auto">
              {filtered.length} student{filtered.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="px-4 pb-3 overflow-x-auto">
            <table className={`${tableCls} min-w-[760px]`}>
              <thead>
                <tr className="text-left text-subtle text-xs">
                  <th className={thCls}>Student</th>
                  <th className={`${thCls} text-right`}>Charged</th>
                  <th className={`${thCls} text-right`}>Paid</th>
                  <th className={`${thCls} w-36`}>Progress</th>
                  <th className={`${thCls} text-right`}>Balance</th>
                  <th className={thCls}>Status</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((l) => {
                  const st = STATUS[l.status];
                  const pct = l.charged
                    ? Math.round((l.paid / l.charged) * 100)
                    : 0;
                  return (
                    <tr
                      key={l._id}
                      onClick={() => selectRow(l._id)}
                      className={`${rowCls} cursor-pointer ${
                        selectedId === l._id ? "[&>td]:!bg-tenant-soft/40" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={l.fullName} />
                          <div>
                            <p className="font-semibold">{l.fullName}</p>
                            <p className="text-xs text-subtle font-mono">
                              {l.admissionNumber}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">{kes(l.charged)}</td>
                      <td className="px-4 py-3 text-right text-good font-semibold">
                        {kes(l.paid)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <ProgressBar
                            className="flex-1"
                            tone={l.status === "cleared" ? "good" : "tenant"}
                            value={pct}
                          />
                          <span className="text-[11px] font-semibold w-9 text-right">
                            {pct}%
                          </span>
                        </div>
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-bold ${
                          l.balance > 0 ? "text-badge" : "text-good"
                        }`}
                      >
                        {kes(l.balance)}
                      </td>
                      <td className="px-4 py-3">
                        <Pill tone={st.tone}>{st.label}</Pill>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <EmptyState
                title="No ledgers match"
                text="Try another filter or search."
              />
            )}
          </div>

          <Pagination
            page={safePage}
            setPage={setPage}
            pageSize={PAGE_SIZE}
            total={filtered.length}
          />
        </Panel>

        {/* Selected student */}
        <div className="flex flex-col gap-5 xl:sticky xl:top-4">
          {!selected ? (
            <Panel
              title="Student ledger"
              description="Select a row to see charges and payments"
            >
              <EmptyState title="Nothing selected" />
            </Panel>
          ) : (
            <>
              <Panel
                title={selected.fullName}
                description={`${selected.admissionNumber} · ${selected.programme}`}
                action={{ label: "Close", onClick: () => setSelectedId(null) }}
              >
                <div className="rounded-xl bg-canvas p-4">
                  <p className="text-[11px] uppercase tracking-wide font-semibold text-subtle">
                    Balance
                  </p>
                  <p
                    className={`text-2xl font-bold mt-0.5 ${
                      selected.balance > 0 ? "text-badge" : "text-good"
                    }`}
                  >
                    {kes(selected.balance)}
                  </p>
                  <ProgressBar
                    className="mt-3"
                    tone={selected.status === "cleared" ? "good" : "tenant"}
                    value={
                      selected.charged
                        ? (selected.paid / selected.charged) * 100
                        : 0
                    }
                  />
                  <div className="flex justify-between text-xs mt-2 text-subtle">
                    <span>Paid {kes(selected.paid)}</span>
                    <span>of {kes(selected.charged)}</span>
                  </div>
                </div>

                <p className="text-[11px] uppercase tracking-wide font-semibold text-subtle mt-5 mb-2">
                  Charges
                </p>
                <div className="flex flex-col gap-1.5">
                  {(selected.charges || []).map((c) => (
                    <div
                      key={c.label}
                      className="flex justify-between text-[13px]"
                    >
                      <span className="text-subtle">{c.label}</span>
                      <b>{kes(c.amount)}</b>
                    </div>
                  ))}
                </div>

                <p className="text-[11px] uppercase tracking-wide font-semibold text-subtle mt-5 mb-2">
                  Payments
                </p>
                {(selected.payments || []).length === 0 ? (
                  <p className="text-xs text-subtle">No payments yet.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {[...selected.payments].reverse().map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center gap-3 rounded-xl border border-line/70 px-3 py-2.5"
                      >
                        <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                          <ReceiptText size={14} />
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-good">
                            {kes(p.amount)}
                          </p>
                          <p className="text-[11px] text-subtle truncate">
                            {fmtDate(p.date)} · {p.method} · {p.ref}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Panel>

              <Panel
                title="Record a payment"
                description="Adds to this student's ledger"
              >
                <form onSubmit={recordPayment} className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Amount (KSh)">
                      <input
                        required
                        type="number"
                        min="1"
                        value={pay_.amount}
                        onChange={(e) =>
                          setPay({ ...pay_, amount: e.target.value })
                        }
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Method">
                      <select
                        value={pay_.method}
                        onChange={(e) =>
                          setPay({ ...pay_, method: e.target.value })
                        }
                        className={inputCls}
                      >
                        {METHODS.map((m) => (
                          <option key={m}>{m}</option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <Field label="Reference / receipt no.">
                    <input
                      value={pay_.ref}
                      onChange={(e) => setPay({ ...pay_, ref: e.target.value })}
                      placeholder="e.g. SIA4K2L9QX"
                      className={inputCls}
                    />
                  </Field>
                  <DarkButton type="submit" className="py-2.5">
                    Record payment
                  </DarkButton>
                </form>
              </Panel>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Ledgers;

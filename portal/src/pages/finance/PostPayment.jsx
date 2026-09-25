import { useState } from "react";
import { Wallet } from "lucide-react";
import Panel, {
  PageHeader,
  ListRow,
  DarkButton,
  Field,
  inputCls,
} from "../../components/layouts/Panel";
import { students } from "../../lib/mockData";

const today = () => new Date().toISOString().slice(0, 10);
const methods = ["M-Pesa", "Bank deposit", "Cash", "Cheque"];

const PostPayment = () => {
  const [form, setForm] = useState({
    admission: "",
    amount: "",
    method: "M-Pesa",
    reference: "",
    date: today(),
  });
  const [posted, setPosted] = useState([]);
  const [message, setMessage] = useState("");

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  // TODO(api): look the student up with GET /users?admissionNumber=...
  const student = students.find(
    (s) =>
      s.admissionNumber.toLowerCase() === form.admission.trim().toLowerCase(),
  );

  const submit = (e) => {
    e.preventDefault();
    if (!student)
      return setMessage("No student found with that admission number.");
    // TODO(api): await api.post("/finance/payments", { ...form, student: student._id });
    setPosted([{ ...form, id: Date.now(), name: student.fullName }, ...posted]);
    setMessage(
      `Payment of KES ${Number(form.amount).toLocaleString()} posted to ${student.fullName}.`,
    );
    setForm({ ...form, admission: "", amount: "", reference: "" });
  };

  return (
    <div>
      <PageHeader
        title="Post payment"
        subtitle="Record bank, cash, cheque or M-Pesa receipts against a student"
      />
      <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-5 items-start">
        <Panel title="Payment details">
          <form onSubmit={submit} className="flex flex-col gap-4">
            <Field label="Admission number">
              <input
                required
                value={form.admission}
                onChange={set("admission")}
                placeholder="BUS/00001/026"
                className={inputCls}
              />
              {form.admission && (
                <p
                  className={`text-xs mt-1 ${student ? "text-good" : "text-subtle"}`}
                >
                  {student ? student.fullName : "No match yet"}
                </p>
              )}
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Amount (KES)">
                <input
                  required
                  type="number"
                  min="1"
                  value={form.amount}
                  onChange={set("amount")}
                  className={inputCls}
                />
              </Field>
              <Field label="Date">
                <input
                  required
                  type="date"
                  value={form.date}
                  onChange={set("date")}
                  className={inputCls}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Method">
                <select
                  value={form.method}
                  onChange={set("method")}
                  className={inputCls}
                >
                  {methods.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </Field>
              <Field label="Reference">
                <input
                  required
                  value={form.reference}
                  onChange={set("reference")}
                  placeholder="e.g. SFK4X9…"
                  className={inputCls}
                />
              </Field>
            </div>
            {message && <p className="text-xs text-subtle">{message}</p>}
            <DarkButton type="submit" className="py-2.5">
              Post payment
            </DarkButton>
          </form>
        </Panel>

        <Panel title="Posted this session" description="Latest first" flush>
          {posted.length === 0 && (
            <p className="px-5 pb-5 text-xs text-subtle">Nothing posted yet.</p>
          )}
          {posted.map((p, i) => (
            <div key={p.id} className={i === 0 ? "[&>div]:border-t-0" : ""}>
              <ListRow
                icon={Wallet}
                title={p.name}
                meta={`${p.method} · ${p.reference} · ${p.date}`}
                trailing={
                  <b className="text-xs">
                    KES {Number(p.amount).toLocaleString()}
                  </b>
                }
              />
            </div>
          ))}
        </Panel>
      </div>
    </div>
  );
};

export default PostPayment;

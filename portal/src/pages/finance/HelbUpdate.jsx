import { useState } from "react";
import { Upload } from "lucide-react";
import Panel, {
  PageHeader,
  StatusPill,
  DarkButton,
  OutlineButton,
  inputCls,
} from "../../components/layouts/Panel";
import { students, fundingTypeLabel } from "../../lib/mockData";

const sample = `admission,type,amount,status
BUS/00001/026,helb-loan,40000,disbursed
BUS/00002/026,helb-scholarship,20000,approved
BUS/00999/026,helb-loan,30000,disbursed`;

const parse = (text) =>
  text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l, i) => l && !(i === 0 && /admission/i.test(l)))
    .map((line) => {
      const [admission, type, amount, status] = line
        .split(",")
        .map((c) => c.trim());
      const student = students.find(
        (s) => s.admissionNumber.toLowerCase() === admission?.toLowerCase(),
      );
      const valid =
        student &&
        fundingTypeLabel[type] &&
        Number(amount) > 0 &&
        ["pending", "approved", "disbursed", "rejected"].includes(status);
      return {
        admission,
        type,
        amount: Number(amount),
        status,
        name: student?.fullName,
        valid: Boolean(valid),
      };
    });

const HelbUpdate = () => {
  const [text, setText] = useState("");
  const [message, setMessage] = useState("");
  const rows = parse(text);
  const good = rows.filter((r) => r.valid);

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setText(String(reader.result));
    reader.readAsText(f);
  };

  const apply = () => {
    // TODO(api): await api.post("/finance/funding/bulk", { entries: good });
    setMessage(
      `${good.length} funding update${good.length === 1 ? "" : "s"} applied.`,
    );
    setText("");
  };

  return (
    <div>
      <PageHeader
        title="HELB bulk update"
        subtitle="Upload or paste HELB loan, scholarship and bursary disbursements"
      />
      <div className="max-w-4xl flex flex-col gap-5">
        <Panel
          title="Input"
          description="CSV columns: admission, type (helb-loan / helb-scholarship / bursary), amount, status (pending / approved / disbursed / rejected)"
        >
          <div className="flex gap-2 mb-3">
            <label className="border border-line rounded px-4 py-1.5 text-xs font-semibold hover:bg-canvas cursor-pointer inline-flex items-center gap-1.5">
              <Upload size={13} /> Upload CSV
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={onFile}
                className="hidden"
              />
            </label>
            <OutlineButton type="button" onClick={() => setText(sample)}>
              Use sample
            </OutlineButton>
          </div>
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setMessage("");
            }}
            rows={6}
            placeholder="Paste rows here…"
            className={`${inputCls} font-mono text-xs`}
          />
        </Panel>

        {rows.length > 0 && (
          <Panel
            title="Preview"
            description={`${good.length} of ${rows.length} rows are valid`}
            flush
          >
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-subtle text-xs bg-canvas">
                  <th className="px-5 py-2.5 font-medium">Student</th>
                  <th className="px-5 py-2.5 font-medium">Type</th>
                  <th className="px-5 py-2.5 font-medium text-right">Amount</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                  <th className="px-5 py-2.5 font-medium">Check</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-t border-line">
                    <td className="px-5 py-3">
                      <p className="font-semibold">
                        {r.name || "Unknown student"}
                      </p>
                      <p className="text-xs text-subtle">{r.admission}</p>
                    </td>
                    <td className="px-5 py-3">
                      {fundingTypeLabel[r.type] || r.type}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {r.amount ? `KES ${r.amount.toLocaleString()}` : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <StatusPill status={r.status} />
                    </td>
                    <td className="px-5 py-3 text-xs">
                      {r.valid ? (
                        <span className="text-good font-semibold">Ready</span>
                      ) : (
                        <span className="text-badge font-semibold">
                          Fix row
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-4 border-t border-line flex justify-end">
              <DarkButton
                onClick={apply}
                disabled={!good.length}
                className="disabled:opacity-40"
              >
                Apply {good.length} update{good.length === 1 ? "" : "s"}
              </DarkButton>
            </div>
          </Panel>
        )}
        {message && (
          <p className="text-xs text-good font-semibold">{message}</p>
        )}
      </div>
    </div>
  );
};

export default HelbUpdate;

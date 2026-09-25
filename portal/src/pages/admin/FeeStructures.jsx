import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import api from "../../lib/api";
import Panel, { PageHeader } from "../../components/layouts/Panel";

const emptyItem = { label: "", amount: "" };
const input =
  "w-full border border-line rounded px-3 py-2 text-[13px] mt-1 focus:outline-none focus:border-ink";

const FeeStructures = () => {
  const [form, setForm] = useState({
    program: "",
    semesterNumber: "",
    academicYear: new Date().getFullYear().toString(),
    items: [{ ...emptyItem }],
  });
  const [message, setMessage] = useState("");

  const updateItem = (index, field, value) => {
    const items = [...form.items];
    items[index] = { ...items[index], [field]: value };
    setForm({ ...form, items });
  };
  const addItem = () =>
    setForm({ ...form, items: [...form.items, { ...emptyItem }] });
  const removeItem = (index) =>
    setForm({ ...form, items: form.items.filter((_, i) => i !== index) });
  const total = form.items.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await api.post("/finance/fee-structure", {
        ...form,
        semesterNumber: Number(form.semesterNumber),
        items: form.items.map((i) => ({
          label: i.label,
          amount: Number(i.amount),
        })),
      });
      setMessage("Fee structure saved.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to save.");
    }
  };

  return (
    <div>
      <PageHeader
        title="Fee structures"
        subtitle="Define what each program pays per semester"
      />

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-start"
      >
        <div className="flex flex-col gap-5">
          <Panel title="Program details">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-subtle">Program ID</label>
                <input
                  required
                  value={form.program}
                  onChange={(e) =>
                    setForm({ ...form, program: e.target.value })
                  }
                  className={input}
                />
              </div>
              <div>
                <label className="text-xs text-subtle">Semester number</label>
                <input
                  required
                  type="number"
                  min="1"
                  value={form.semesterNumber}
                  onChange={(e) =>
                    setForm({ ...form, semesterNumber: e.target.value })
                  }
                  className={input}
                />
              </div>
              <div>
                <label className="text-xs text-subtle">Academic year</label>
                <input
                  required
                  value={form.academicYear}
                  onChange={(e) =>
                    setForm({ ...form, academicYear: e.target.value })
                  }
                  className={input}
                />
              </div>
            </div>
          </Panel>

          <Panel
            title="Fee items"
            description="Each line adds to the semester total"
          >
            <div className="flex flex-col gap-2">
              {form.items.map((item, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    placeholder="Label (e.g. Tuition)"
                    value={item.label}
                    onChange={(e) => updateItem(index, "label", e.target.value)}
                    className={`${input} !mt-0 flex-1`}
                  />
                  <input
                    placeholder="Amount"
                    type="number"
                    value={item.amount}
                    onChange={(e) =>
                      updateItem(index, "amount", e.target.value)
                    }
                    className={`${input} !mt-0 w-32`}
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-subtle hover:text-badge"
                    aria-label="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1 text-xs font-semibold text-link mt-3"
            >
              <Plus size={14} /> Add item
            </button>
          </Panel>
        </div>

        <Panel title="Summary">
          <div className="flex flex-col gap-2 text-[13px]">
            {form.items
              .filter((i) => i.label)
              .map((i, idx) => (
                <div key={idx} className="flex justify-between text-subtle">
                  <span>{i.label}</span>
                  <span>KES {(Number(i.amount) || 0).toLocaleString()}</span>
                </div>
              ))}
            <div className="flex justify-between border-t border-line pt-3 mt-1">
              <span className="font-bold">Total</span>
              <span className="font-bold text-tenant">
                KES {total.toLocaleString()}
              </span>
            </div>
          </div>
          {message && <p className="text-xs text-subtle mt-3">{message}</p>}
          <button
            type="submit"
            className="w-full mt-4 bg-ink text-white rounded py-2.5 text-xs font-semibold hover:bg-ink/90"
          >
            Save fee structure
          </button>
        </Panel>
      </form>
    </div>
  );
};

export default FeeStructures;

import { useState } from "react";
import { FileText, Trash2, UploadCloud, Files, BookOpen } from "lucide-react";
import Panel, {
  PageHeader,
  RowCard,
  DarkButton,
  Field,
  StatCard,
  SearchBox,
  EmptyState,
  inputCls,
} from "../../components/layouts/Panel";
import FileLink from "../../components/layouts/FileLink";
import { units } from "../../lib/mockData";
import { useTeaching, actions } from "../../lib/teachingStore";
import { readFile } from "../../lib/files";

const Materials = () => {
  const { materials } = useTeaching();
  const [form, setForm] = useState({
    unitId: units[0]._id,
    title: "",
    description: "",
  });
  const [file, setFile] = useState(null);
  const [unitFilter, setUnitFilter] = useState("all");
  const [query, setQuery] = useState("");

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const unitCode = (id) => units.find((u) => u._id === id)?.code;

  const upload = async (e) => {
    e.preventDefault();
    actions.addMaterial({ ...form, file: await readFile(file) });
    setForm({ ...form, title: "", description: "" });
    setFile(null);
    e.target.reset();
  };

  const shown = materials
    .filter((m) => unitFilter === "all" || m.unitId === unitFilter)
    .filter((m) =>
      `${m.title} ${m.description || ""} ${unitCode(m.unitId)}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    );
  const unitsCovered = new Set(materials.map((m) => m.unitId)).size;

  return (
    <div>
      <PageHeader
        title="Materials"
        subtitle="Share notes, slides and past papers with everyone in a unit"
      />

      <div className="grid grid-cols-1 xl:grid-cols-[400px_minmax(0,1fr)] gap-5 items-start">
        {/* Upload */}
        <Panel
          title="Upload material"
          description="Students in the unit see it straight away"
        >
          <form onSubmit={upload} className="flex flex-col gap-4">
            <Field label="Unit">
              <select
                value={form.unitId}
                onChange={set("unitId")}
                className={inputCls}
              >
                {units.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.code} — {u.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Title">
              <input
                required
                value={form.title}
                onChange={set("title")}
                placeholder="e.g. Week 3 lecture notes"
                className={inputCls}
              />
            </Field>
            <Field label="Description (optional)">
              <input
                value={form.description}
                onChange={set("description")}
                className={inputCls}
              />
            </Field>
            <Field label="File (PDF, Word, slides…)">
              <label
                className={`flex flex-col items-center gap-1.5 text-center rounded-xl border-2 border-dashed px-4 py-6 cursor-pointer transition ${
                  file
                    ? "border-tenant bg-tenant-soft/40"
                    : "border-line hover:border-tenant hover:bg-tenant-soft/30"
                }`}
              >
                <span className="w-11 h-11 rounded-full bg-tenant-soft text-tenant flex items-center justify-center">
                  <UploadCloud size={20} />
                </span>
                <span className="text-[13px] font-semibold text-ink break-all">
                  {file ? file.name : "Click to choose a file"}
                </span>
                <span className="text-[11px] text-subtle">
                  {file
                    ? `${(file.size / 1024).toFixed(0)} KB`
                    : "PDF, Word, PowerPoint and more"}
                </span>
                <input
                  required
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="sr-only"
                />
              </label>
            </Field>
            <DarkButton type="submit" className="py-2.5 mt-1">
              Upload
            </DarkButton>
          </form>
        </Panel>

        {/* Library */}
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              icon={Files}
              tone="tenant"
              label="Materials shared"
              value={materials.length}
            />
            <StatCard
              icon={BookOpen}
              tone="blue"
              label="Units covered"
              value={`${unitsCovered}/${units.length}`}
            />
          </div>

          <Panel title="Uploaded" flush>
            <div className="px-5 pb-4 flex items-center gap-3 flex-wrap">
              <SearchBox
                value={query}
                onChange={setQuery}
                placeholder="Search materials"
              />
              <select
                value={unitFilter}
                onChange={(e) => setUnitFilter(e.target.value)}
                className={`${inputCls} !w-52 !py-2`}
              >
                <option value="all">All units</option>
                {units.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.code}
                  </option>
                ))}
              </select>
              <span className="text-xs text-subtle ml-auto">
                {shown.length} of {materials.length}
              </span>
            </div>

            <div className="px-4 pb-4 flex flex-col gap-2.5">
              {materials.length === 0 && (
                <EmptyState
                  title="No materials uploaded yet"
                  text="Upload your first file using the form."
                />
              )}
              {materials.length > 0 && shown.length === 0 && (
                <EmptyState title="Nothing matches your search" />
              )}
              {shown.map((m) => (
                <RowCard
                  key={m.id}
                  icon={FileText}
                  tone="violet"
                  title={m.title}
                  meta={
                    <span className="inline-flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-ink/70">
                        {unitCode(m.unitId)}
                      </span>
                      · <FileLink file={m.file} />
                      {m.description && <span>· {m.description}</span>}
                    </span>
                  }
                  trailing={
                    <button
                      onClick={() => actions.removeMaterial(m.id)}
                      className="p-2 rounded-lg text-subtle hover:text-badge hover:bg-canvas transition"
                      aria-label="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  }
                />
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
};

export default Materials;

import { useRef, useState } from "react";
import { Upload, X, Paperclip } from "lucide-react";
import { readFile, formatSize } from "../../lib/files";

const extOf = (name) => (name.split(".").pop() || "").toLowerCase();

// Multi-file upload with drag and drop, and the teacher's rules enforced on the spot:
// allowed types, max files, max size. Files are kept as { name, size, dataUrl }.
const FileDrop = ({
  files,
  onChange,
  types = [],
  maxFiles = 5,
  maxSizeMB = 10,
  disabled = false,
  label = "Drop files here, or browse",
}) => {
  const input = useRef(null);
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState([]);

  const add = async (list) => {
    const errs = [];
    const ok = [];
    Array.from(list).forEach((f) => {
      if (types.length && !types.includes(extOf(f.name)))
        errs.push(
          `${f.name}: .${extOf(f.name)} is not accepted (use ${types.join(", ")})`,
        );
      else if (f.size > maxSizeMB * 1024 * 1024)
        errs.push(`${f.name}: larger than ${maxSizeMB} MB`);
      else if (files.length + ok.length >= maxFiles)
        errs.push(
          `${f.name}: only ${maxFiles} file${maxFiles === 1 ? "" : "s"} allowed`,
        );
      else ok.push(f);
    });
    setErrors(errs);
    if (!ok.length) return;
    setBusy(true);
    const read = await Promise.all(ok.map(readFile));
    setBusy(false);
    onChange([...files, ...read.filter(Boolean)]);
  };

  const full = files.length >= maxFiles;

  return (
    <div>
      {!disabled && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(false);
            if (!full) add(e.dataTransfer.files);
          }}
          className={`border-2 border-dashed rounded-md px-4 py-5 text-center transition-colors ${over ? "border-tenant bg-tenant-soft" : "border-line bg-canvas"} ${full ? "opacity-60" : ""}`}
        >
          <Upload size={18} className="mx-auto text-subtle mb-1.5" />
          <p className="text-xs text-subtle">
            {full
              ? `Maximum of ${maxFiles} file${maxFiles === 1 ? "" : "s"} reached`
              : label}{" "}
            {!full && (
              <button
                type="button"
                onClick={() => input.current?.click()}
                className="text-link font-semibold"
              >
                Browse
              </button>
            )}
          </p>
          <p className="text-[11px] text-subtle mt-1">
            {types.length ? `${types.join(", ")} · ` : ""}up to {maxFiles} file
            {maxFiles === 1 ? "" : "s"} · {maxSizeMB} MB each
          </p>
          <input
            ref={input}
            type="file"
            multiple={maxFiles > 1}
            accept={
              types.length ? types.map((t) => `.${t}`).join(",") : undefined
            }
            onChange={(e) => {
              add(e.target.files);
              e.target.value = "";
            }}
            className="hidden"
          />
        </div>
      )}
      {busy && <p className="text-xs text-subtle mt-2">Reading files…</p>}
      {errors.map((e) => (
        <p key={e} className="text-xs text-badge mt-1.5">
          {e}
        </p>
      ))}
      {files.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1.5">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center justify-between gap-3 border border-line rounded px-3 py-2 text-[13px] bg-surface"
            >
              <span className="flex items-center gap-2 min-w-0">
                <Paperclip size={13} className="text-subtle shrink-0" />
                <span className="truncate">{f.name}</span>
                <span className="text-xs text-subtle shrink-0">
                  {formatSize(f.size)}
                </span>
              </span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => onChange(files.filter((_, j) => j !== i))}
                  className="text-subtle hover:text-badge"
                  aria-label={`Remove ${f.name}`}
                >
                  <X size={14} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {files.some((f) => !f.dataUrl) && (
        <p className="text-[11px] text-subtle mt-1.5">
          Demo note: files over 400 KB are recorded by name only.
        </p>
      )}
    </div>
  );
};

export default FileDrop;

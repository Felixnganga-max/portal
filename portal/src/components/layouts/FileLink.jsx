import { Paperclip } from "lucide-react";
import { formatSize } from "../../lib/files";

const FileLink = ({ file }) => {
  if (!file) return null;
  const label = (
    <>
      <Paperclip size={13} /> {file.name}{" "}
      <span className="text-subtle font-normal">({formatSize(file.size)})</span>
    </>
  );
  return file.dataUrl ? (
    <a
      href={file.dataUrl}
      download={file.name}
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-link"
    >
      {label}
    </a>
  ) : (
    <span
      className="inline-flex items-center gap-1.5 text-xs text-subtle"
      title="Demo files over 400 KB are not stored"
    >
      {label} · demo copy not stored
    </span>
  );
};

export default FileLink;

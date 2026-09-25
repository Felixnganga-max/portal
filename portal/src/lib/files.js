// Demo-only file handling: small files are kept as data URLs in localStorage so
// downloads really work during the frontend phase. TODO(api): upload to storage.
const LIMIT = 400 * 1024;

export const readFile = (file) =>
  new Promise((resolve) => {
    if (!file) return resolve(null);
    const meta = { name: file.name, size: file.size, dataUrl: null };
    if (file.size > LIMIT) return resolve(meta);
    const reader = new FileReader();
    reader.onload = () => resolve({ ...meta, dataUrl: reader.result });
    reader.onerror = () => resolve(meta);
    reader.readAsDataURL(file);
  });

export const formatSize = (bytes) =>
  bytes > 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

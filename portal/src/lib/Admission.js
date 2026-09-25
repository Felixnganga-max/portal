// Admission numbers look like BUS/00123/026: department code / running number / year.
// TODO(api): the server must generate these with an atomic counter per
// (institution, department, year) so two people never get the same number.

export const yearSuffix = (year) => String(year % 1000).padStart(3, "0");

export const formatAdmission = (deptCode, seq, year) =>
  `${deptCode}/${String(seq).padStart(5, "0")}/${yearSuffix(year)}`;

export const nextSeq = (students, deptCode, year) => {
  const suffix = yearSuffix(year);
  const seqs = students
    .filter(
      (s) =>
        s.admissionNumber.startsWith(`${deptCode}/`) &&
        s.admissionNumber.endsWith(`/${suffix}`),
    )
    .map((s) => Number(s.admissionNumber.split("/")[1]));
  return (seqs.length ? Math.max(...seqs) : 0) + 1;
};

const clean = (v) => v.toLowerCase().replace(/[^a-z]/g, "");

// susan -> susan.kamau -> susan.kamau2 ... first one not already taken.
export const suggestEmail = (fullName, domain, takenEmails) => {
  const parts = fullName.trim().split(/\s+/).map(clean).filter(Boolean);
  if (!parts.length) return "";
  const first = parts[0];
  const last = parts.length > 1 ? parts[parts.length - 1] : "";
  const taken = new Set(takenEmails.map((e) => e.toLowerCase()));
  const candidates = [first, last && `${first}.${last}`];
  for (let n = 2; n < 50; n++)
    candidates.push(`${last ? `${first}.${last}` : first}${n}`);
  const local = candidates
    .filter(Boolean)
    .find((c) => !taken.has(`${c}@${domain}`));
  return `${local}@${domain}`;
};

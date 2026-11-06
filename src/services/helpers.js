// Small helpers shared by the Library pages

export const getId = (o) => (o && typeof o === "object" ? o.id || o._id : o);

// A relation can come back populated ({ _id, name }) or as a plain id string
export const refId = (v) => getId(v) || "";

export const fmtDate = (v) => {
  if (!v) return "-";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

// yyyy-mm-dd for <input type="date">
export const toDateInput = (v) => {
  const d = v ? new Date(v) : null;
  return d && !Number.isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : "";
};

export const daysOverdue = (dueDate) => {
  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) return 0;
  return Math.max(0, Math.floor((Date.now() - due.getTime()) / 86400000));
};

export const titleCase = (s) =>
  s ? String(s).replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "-";

export const inputClass =
  "w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/40 focus:border-[#0EA5E9]";

const BADGES = {
  active: "bg-emerald-100 text-emerald-700",
  available: "bg-emerald-100 text-emerald-700",
  returned: "bg-emerald-100 text-emerald-700",
  issued: "bg-blue-100 text-blue-700",
  overdue: "bg-red-100 text-red-700",
  retired: "bg-gray-200 text-gray-600",
  lost: "bg-amber-100 text-amber-700",
};
export const badgeClass = (status) => BADGES[String(status || "").toLowerCase()] || "bg-gray-100 text-gray-600";

// Books: some APIs return availableQty, some "available"
export const availableOf = (book) => book.availableQty ?? book.available ?? book.availableCopies;

// Resolve a book title whether the API populated the book or returned only an id
export const issueBookTitle = (issue, booksById) => {
  const b = issue.book || issue.bookId;
  if (b && typeof b === "object") return b.title || "-";
  return booksById[refId(b)]?.title || issue.bookTitle || "-";
};

export const issueStudentId = (issue) => refId(issue.studentId || issue.student);

export const issueStudentName = (issue) => {
  const s = issue.studentId || issue.student;
  return s && typeof s === "object" ? s.name || s.fullName || "" : "";
};

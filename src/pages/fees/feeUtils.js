// Shared helpers for the Fees pages. The API response shapes are not fixed yet, so these
// helpers read the most likely field names and fall back gracefully.

import { saveBlob } from "./feeService";

export const PAYMENT_MODES = ["cash", "upi", "card", "bank_transfer", "cheque"];

export const inr = (v) => {
  if (v === undefined || v === null || v === "" || Number.isNaN(Number(v))) return "-";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(v));
};

// first defined numeric value among keys
export const num = (o, ...keys) => {
  for (const k of keys) {
    const v = o?.[k];
    if (v !== undefined && v !== null && v !== "" && !Number.isNaN(Number(v))) return Number(v);
  }
  return undefined;
};

// first non-empty string/number among keys
export const str = (o, ...keys) => {
  for (const k of keys) {
    const v = o?.[k];
    if ((typeof v === "string" && v.trim()) || typeof v === "number") return String(v);
  }
  return "";
};

export const labelOf = (key) =>
  String(key)
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^\w/, (c) => c.toUpperCase());

export const fmtDateTime = (v) => {
  const d = v ? new Date(v) : null;
  if (!d || Number.isNaN(d.getTime())) return "-";
  const dateOnly = typeof v === "string" && v.endsWith("T00:00:00.000Z");
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(dateOnly ? {} : { hour: "2-digit", minute: "2-digit" }),
  });
};

const OBJECT_ID = /^[a-f0-9]{24}$/i;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}T/;
const MONEY_KEY = /amount|fee|paid|balance|pending|due|total|outstanding/i;
const HIDDEN_KEY = /^(__v|updatedAt|success)$/;

export const isHidden = (key, value) => HIDDEN_KEY.test(key) || (typeof value === "string" && OBJECT_ID.test(value));

// Display text for one value of a given field
export const formatValue = (key, value) => {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return MONEY_KEY.test(key) ? inr(value) : String(value);
  if (typeof value === "string" && ISO_DATE.test(value)) return fmtDateTime(value);
  if (typeof value === "string" && /^[a-z]+(_[a-z]+)+$/.test(value)) return labelOf(value);
  return String(value);
};

// Flatten an object (one level of nesting) into [label, text] rows, skipping ids and empties
export const flattenRows = (obj) => {
  const rows = [];
  const add = (label, key, v) => {
    if (v === undefined || v === null || v === "" || isHidden(key, v)) return;
    rows.push([label, formatValue(key, v)]);
  };
  Object.entries(obj || {}).forEach(([k, v]) => {
    if (Array.isArray(v)) return;
    if (v && typeof v === "object") {
      Object.entries(v).forEach(([sk, sv]) => {
        if (sv && typeof sv === "object") return;
        add(`${labelOf(k)} ${sk === "name" ? "" : labelOf(sk)}`.trim(), sk, sv);
      });
    } else add(labelOf(k), k, v);
  });
  return rows;
};

const ID_LIKE = /^[a-f0-9]{24}$/i;
export const objectIdOf = (v) => {
  if (v && typeof v === "object") return v._id || v.id || "";
  return typeof v === "string" && ID_LIKE.test(v) ? v : "";
};

export const studentNameOf = (r) => {
  const s = r?.student || r?.studentId || r?.user || r?.user_id;
  return (
    str(r, "full_name", "student_name", "studentName", "name") ||
    (s && typeof s === "object" ? s.full_name || s.name || "" : "")
  );
};

export const PAYMENT_STATUS_STYLES = {
  paid: "bg-green-100 text-green-700",
  success: "bg-green-100 text-green-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-200 text-gray-600",
  canceled: "bg-gray-200 text-gray-600",
  failed: "bg-red-100 text-red-700",
  pending: "bg-amber-100 text-amber-700",
};
export const paymentStatusClass = (s) => PAYMENT_STATUS_STYLES[String(s || "").toLowerCase()] || "bg-gray-100 text-gray-600";

/* ───── Student fee detail: download (Excel/CSV) and print / save as PDF ───── */

const dateText = (v) => {
  const d = v ? new Date(v) : null;
  return d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "";
};

// student: normalized student (name, rollNo, phone, ...). components: [{ name, amount, required_for_exam }]
export const buildFeeDetail = ({ student = {}, course = "", components = [], total, paid, pending }) => {
  const info = [
    ["Name", student.name],
    ["Student ID", student.rollNo],
    ["Phone", student.phone],
    ["Email", student.email],
    ["Guardian", student.guardian_name],
    ["Guardian phone", student.guardian_phone],
    ["Course", course],
    ["Admitted on", dateText(student.admitted_on)],
  ].filter(([, v]) => v);

  const rows = components.map((c) => [c.name, Number(c.amount || 0), c.required_for_exam ? "Yes" : "No"]);
  const summary = [
    ["Total fee", total],
    ["Paid", paid],
    ["Pending", pending],
  ].filter(([, v]) => v !== undefined && v !== null);

  return { name: student.name || "student", info, components: rows, summary };
};

const csvCell = (v) => {
  const t = v === undefined || v === null ? "" : String(v);
  return /[",\r\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
};

// Opens in Excel; plain numbers are kept so the amounts can be summed
export const downloadFeeDetailCsv = (detail) => {
  const lines = [
    ["Fire & Safety College"],
    ["Student Fee Detail"],
    ["Generated on", dateText(new Date())],
    [],
    ["STUDENT DETAILS"],
    ...detail.info,
    [],
    ["FEE COMPONENTS"],
    ["Component", "Amount (INR)", "Required for exam"],
    ...(detail.components.length ? detail.components : [["No fee components found"]]),
    [],
    ["FEE SUMMARY (INR)"],
    ...detail.summary,
  ];
  const csv = "\uFEFF" + lines.map((row) => row.map(csvCell).join(",")).join("\r\n");
  const safe = String(detail.name).replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "student";
  saveBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), `fee-detail-${safe}.csv`);
};

const htmlEsc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Opens a print window: choose "Save as PDF" in the print dialog to get a PDF file
export const printFeeDetail = (detail) => {
  const w = window.open("", "_blank", "width=760,height=900");
  if (!w) return false;
  const kv = (rows, money) =>
    rows.map(([k, v]) => `<tr><td class="k">${htmlEsc(k)}</td><td><b>${htmlEsc(money ? inr(v) : v)}</b></td></tr>`).join("");
  w.document.write(`<!doctype html><html><head><title>Student fee detail</title>
    <style>body{font-family:Arial,sans-serif;padding:32px;color:#111}h1{font-size:20px;margin:0 0 2px}
    h2{font-size:14px;margin:24px 0 6px;text-transform:uppercase;letter-spacing:.04em;color:#444}
    p{color:#555;margin:0;font-size:13px}table{width:100%;border-collapse:collapse}
    td,th{padding:8px 6px;border-bottom:1px solid #e5e7eb;font-size:14px;text-align:left}
    td.k{color:#555;width:38%}.r{text-align:right}</style></head><body>
    <h1>Fire &amp; Safety College</h1><p>Student fee detail · ${htmlEsc(dateText(new Date()))}</p>
    <h2>Student details</h2><table>${kv(detail.info, false)}</table>
    <h2>Fee components</h2>
    <table><tr><th>Component</th><th class="r">Amount</th><th>Required for exam</th></tr>
    ${detail.components
      .map(([n, a, r]) => `<tr><td>${htmlEsc(n)}</td><td class="r">${htmlEsc(inr(a))}</td><td>${htmlEsc(r)}</td></tr>`)
      .join("") || '<tr><td colspan="3">No fee components found</td></tr>'}</table>
    <h2>Fee summary</h2><table>${kv(detail.summary, true)}</table>
    </body></html>`);
  w.document.close();
  w.focus();
  w.print();
  return true;
};

/* ───── Fee ledger lines (from /fees/generate and /fees/:id/summary) ───── */

// One ledger line -> plain values
export const ledgerLine = (l) => {
  const due = Number(l.amount_due ?? l.amount ?? 0);
  const paid = Number(l.amount_paid ?? 0);
  const course = l.course_id;
  return {
    id: l._id || l.id,
    name: l.fee_name || l.name || "-",
    course: course && typeof course === "object" ? course.name || "" : "",
    due,
    paid,
    balance: Math.max(due - paid, 0),
    status: String(l.status || "pending").toLowerCase(),
    dueDate: l.due_date,
    exam: !!l.required_for_exam,
  };
};

export const ledgerTotals = (ledger = []) =>
  ledger.map(ledgerLine).reduce(
    (t, l) => ({ due: t.due + l.due, paid: t.paid + l.paid, balance: t.balance + l.balance }),
    { due: 0, paid: 0, balance: 0 }
  );

const LEDGER_STATUS_STYLES = {
  paid: "bg-green-100 text-green-700",
  partial: "bg-blue-100 text-blue-700",
  partially_paid: "bg-blue-100 text-blue-700",
  pending: "bg-amber-100 text-amber-700",
  waived: "bg-gray-200 text-gray-600",
};
export const ledgerStatusClass = (s) => LEDGER_STATUS_STYLES[s] || "bg-gray-100 text-gray-600";

import { pick, relId } from "../schedules/scheduleUtils";

export const TYPES = [
  { value: "TC", label: "Transfer Certificate (TC)" },
  { value: "LC", label: "Leaving Certificate (LC)" },
];

// Statuses used by the API: a new request is "requested", then "approved" or "rejected".
export const STATUSES = ["requested", "approved", "rejected"];

export const STATUS_STYLES = {
  requested: "bg-amber-100 text-amber-700",
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};
export const statusClass = (s) => STATUS_STYLES[s] || "bg-gray-100 text-gray-600";

// Waiting for a decision -> Approve / Reject are offered
const OPEN = ["requested", "pending"];

// One request from the API -> plain fields (student can come back as an id or a populated object)
export const readRequest = (r, names = {}) => {
  const ref = pick(r, "studentId", "student_id", "student");
  const id = relId(ref);
  const obj = ref && typeof ref === "object" ? ref : {};
  const status = String(r.status || "requested").toLowerCase();
  return {
    id: r._id || r.id,
    studentId: id,
    name: obj.full_name || obj.name || r.student_name || names[id] || "Unknown student",
    code: obj.student_id || "",
    type: String(r.type || "").toUpperCase(),
    status,
    open: OPEN.includes(status),
    canDownload: status === "approved" || status === "issued",
    reason: r.reason || "",
    rejectReason: r.reject_reason || r.rejection_reason || r.rejected_reason || "",
    certificateNo: r.certificate_no || r.serial_no || r.certificateNo || "",
    issueDate: r.issue_date || r.issued_at || "",
    eligibilityNote: r.eligibility_note || "",
    date: r.createdAt || r.requested_at,
  };
};

// Name of the saved PDF when the server does not send one
export const pdfName = (r) => `${r.certificateNo || `${String(r.type || "tc-lc").toLowerCase()}-${r.id}`}.pdf`;

const FLAG_KEYS = ["eligible", "isEligible", "is_eligible"];
const MESSAGE_KEYS = ["message", "reason", "remarks"];
const REASON_KEYS = ["reasons", "blockers", "issues", "messages"];
const HIDDEN_KEYS = ["type", "success"];

// Eligibility response -> { eligible, message, reasons, extra }
// Works with { isEligible: false, reasons: ["Course status is ..."] } as well as { eligible, message }.
export const readEligibility = (result) => {
  const data = result?.data && typeof result.data === "object" ? result.data : {};
  const flagKey = FLAG_KEYS.find((k) => typeof data[k] === "boolean");
  const messageKey = MESSAGE_KEYS.find((k) => typeof data[k] === "string" && data[k]);
  const reasonKeys = REASON_KEYS.filter((k) => Array.isArray(data[k]));
  const reasons = reasonKeys
    .flatMap((k) => data[k].map((x) => (typeof x === "string" ? x : x?.message || x?.reason || "")))
    .filter(Boolean);
  const shown = [flagKey, messageKey, ...reasonKeys, ...HIDDEN_KEYS].filter(Boolean);
  return {
    eligible: flagKey ? data[flagKey] : undefined,
    message: reasons.join(" ") || (messageKey && data[messageKey]) || result?.message || "",
    reasons,
    extra: Object.fromEntries(Object.entries(data).filter(([k]) => !shown.includes(k))),
  };
};

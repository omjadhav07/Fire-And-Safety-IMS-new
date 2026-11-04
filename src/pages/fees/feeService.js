import api from "../../services/api";

const unwrap = (data) => data?.data ?? data;
const listOf = (payload, keys = []) => {
  if (Array.isArray(payload)) return payload;
  for (const k of [...keys, "items", "rows"]) if (Array.isArray(payload?.[k])) return payload[k];
  return [];
};

const OBJECT_ID = /^[a-f0-9]{24}$/i;
export const isObjectId = (v) => typeof v === "string" && OBJECT_ID.test(v);

// ──────────────────────────────────────────────────────────────
// Which id the fee APIs expect for a student.
// The fee APIs use the student RECORD id (the student's own _id, e.g. in the ledger rows'
// student_id), not the login (user) id. Change this ONE function if that ever changes.
// ──────────────────────────────────────────────────────────────
export const feeStudentId = (s) => {
  if (!s) return "";
  if (s.feeId) return s.feeId;
  const u = s.user_id;
  return s.id || s._id || (u && typeof u === "object" ? u._id || u.id : u) || "";
};

// GET /fees/:studentId/summary  -> { totalDue, totalPaid, balance, ledger: [ ...fee lines ] }
export const normalizeSummary = (p) => {
  const d = p && typeof p === "object" ? p : {};
  return {
    totalDue: d.totalDue,
    totalPaid: d.totalPaid,
    balance: d.balance,
    ledger: Array.isArray(d.ledger) ? d.ledger : [],
  };
};

export const getFeeSummary = async (studentId) => {
  const { data } = await api.get(`/fees/${studentId}/summary`);
  return normalizeSummary(unwrap(data));
};

// POST /fees/payments  { studentId, amount, mode, reference_no }
export const createPayment = async (body) => {
  const { data } = await api.post("/fees/payments", body);
  return { message: data?.message, payment: unwrap(data) };
};

// GET /fees/pending
export const getPendingFees = async () => {
  const { data } = await api.get("/fees/pending");
  return listOf(unwrap(data), ["pending", "students", "fees"]);
};

// POST /fees/generate  { studentId, courseId }
export const generateLedger = async (body) => {
  const { data } = await api.post("/fees/generate", body);
  return { message: data?.message, data: unwrap(data) };
};

// GET /fees/payments/:id/cancel   (a GET in the API doc - kept exactly as documented)
export const cancelPayment = async (id) => {
  const { data } = await api.get(`/fees/payments/${id}/cancel`);
  return { message: data?.message, data: unwrap(data) };
};

// GET /fees/:studentId/eligibility
export const getEligibility = async (studentId) => {
  const { data } = await api.get(`/fees/${studentId}/eligibility`);
  return { message: data?.message, data: unwrap(data) };
};

// GET /fees/my/fees
export const getMyFees = async () => {
  const { data } = await api.get("/fees/my/fees");
  return unwrap(data);
};

// GET /fees/my/payments
export const getMyPayments = async () => {
  const { data } = await api.get("/fees/my/payments");
  return listOf(unwrap(data), ["payments", "history"]);
};

// Blob errors hide the JSON body inside a Blob - unwrap so getErrorMessage() works
const unwrapBlobError = async (err) => {
  const body = err?.response?.data;
  if (body instanceof Blob) {
    try {
      err.response.data = JSON.parse(await body.text());
    } catch {
      /* keep original */
    }
  }
  return err;
};

// GET /fees/payments/:id/receipt
// Works whether the server returns JSON or a file (PDF): -> { kind: "json", data } | { kind: "file", blob, filename }
export const getReceipt = async (paymentId) => {
  try {
    const res = await api.get(`/fees/payments/${paymentId}/receipt`, { responseType: "blob", timeout: 60000 });
    const type = res.data?.type || res.headers?.["content-type"] || "";
    if (type.includes("json") || type.startsWith("text/")) {
      const parsed = JSON.parse(await res.data.text());
      return { kind: "json", data: unwrap(parsed) };
    }
    const disposition = res.headers?.["content-disposition"] || "";
    const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition);
    return { kind: "file", blob: res.data, filename: match ? decodeURIComponent(match[1]) : `receipt-${paymentId}.pdf` };
  } catch (err) {
    throw await unwrapBlobError(err);
  }
};

export const saveBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

import api from "../../services/api";
import { saveBlob, unwrapBlobError } from "../library/bookImportExportService";

const unwrap = (data) => data?.data ?? data;
const BASE = "/tc-lc";

const listOf = (payload, keys = []) => {
  if (Array.isArray(payload)) return payload;
  for (const k of [...keys, "items", "rows"]) if (Array.isArray(payload?.[k])) return payload[k];
  return [];
};

// GET /tc-lc/students/:studentId/eligibility  - can this student be given a TC / LC?
export const checkStudentEligibility = async (studentId) => {
  const { data } = await api.get(`${BASE}/students/${studentId}/eligibility`);
  return { message: data?.message, data: unwrap(data) };
};

// POST /tc-lc  { studentId, type: "TC" | "LC", reason }
export const createTcLcRequest = async (body) => {
  const { data } = await api.post(BASE, body);
  return { message: data?.message, request: unwrap(data) };
};

// GET /tc-lc?status=&type=
export const getTcLcRequests = async ({ status, type } = {}) => {
  const params = {};
  if (status) params.status = status;
  if (type) params.type = type;
  const { data } = await api.get(BASE, { params });
  return listOf(unwrap(data), ["requests", "tcLc", "tc_lc"]);
};

// GET /tc-lc/:id
export const getTcLcById = async (id) => {
  const { data } = await api.get(`${BASE}/${id}`);
  const payload = unwrap(data);
  return payload?.request ?? payload;
};

// GET /tc-lc/:id/eligibility  - eligibility of an existing request
export const checkRequestEligibility = async (id) => {
  const { data } = await api.get(`${BASE}/${id}/eligibility`);
  return { message: data?.message, data: unwrap(data) };
};

// PUT /tc-lc/:id/approve
export const approveTcLc = async (id) => {
  const { data } = await api.put(`${BASE}/${id}/approve`);
  return { message: data?.message };
};

// PUT /tc-lc/:id/reject  { reason }
export const rejectTcLc = async (id, reason) => {
  const { data } = await api.put(`${BASE}/${id}/reject`, { reason });
  return { message: data?.message };
};

// GET /tc-lc/:id/pdf  - downloads the certificate (fetched with the login token, then saved as a file)
export const downloadTcLcPdf = async (id, fallbackName) => {
  let res;
  try {
    res = await api.get(`${BASE}/${id}/pdf`, { responseType: "blob", timeout: 120000 });
  } catch (err) {
    throw await unwrapBlobError(err);
  }
  // An error sent as JSON (or an empty body) must not be saved as a broken ".pdf"
  if (res.data?.type?.includes("json")) {
    let message = "The server did not return a PDF";
    try {
      message = JSON.parse(await res.data.text())?.message || message;
    } catch {
      /* keep the default message */
    }
    throw new Error(message);
  }
  if (!res.data || res.data.size === 0) throw new Error("The server returned an empty file");
  saveBlob(res, fallbackName || `tc-lc-${id}.pdf`);
};

// GET /tc-lc/my-requests  (student)
export const getMyTcLcRequests = async () => {
  const { data } = await api.get(`${BASE}/my-requests`);
  return listOf(unwrap(data), ["requests", "tcLc", "tc_lc"]);
};

import api from "../../services/api";
import { saveBlob, unwrapBlobError } from "../library/bookImportExportService";
import { getUsers } from "../users/userService";

const unwrap = (data) => data?.data ?? data;

// Make a student record easy to use everywhere:
// keeps every original field and adds id / name / rollNo aliases
export const normalizeStudent = (s) => ({
  ...s,
  id: s.id || s._id,
  name: s.full_name || s.name || "",
  rollNo: s.student_id || s.studentId || "",
});

// Query params this backend has rejected ("x" is not allowed). Remembered for the session so we
// don't repeat the failing request; those filters are then applied on the page instead.
const rejectedParams = new Set();
const NOT_ALLOWED = /"([^"]+)" is not allowed/;

// GET /students?page&limit&search&status&course_id&batch_id
// -> { list, totalPages, clientFilters }   (clientFilters = filters the API refused; apply them locally)
export const getStudents = async ({ page = 1, limit = 20, search, status, course_id, batch_id } = {}) => {
  const wanted = { search, status, course_id, batch_id };
  const params = { page, limit };
  Object.entries(wanted).forEach(([k, v]) => {
    if (v && !rejectedParams.has(k)) params[k] = v;
  });
  const refused = Object.keys(wanted).filter((k) => wanted[k] && rejectedParams.has(k));
  // filters applied locally need a big first page to filter from
  if (refused.length) Object.assign(params, { page: 1, limit: Math.max(limit, 100) });

  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      const { data } = await api.get("/students", { params });
      const payload = unwrap(data);
      const raw = Array.isArray(payload) ? payload : payload?.students || payload?.items || payload?.rows || [];
      const meta = data?.meta || data?.pagination || payload?.meta || payload?.pagination || {};
      const total = meta.total ?? meta.totalItems ?? payload?.total;
      const lim = params.limit || limit;
      const totalPages = meta.totalPages ?? meta.pages ?? (total ? Math.ceil(total / lim) : null);
      const clientFilters = Object.keys(wanted).filter((k) => wanted[k] && rejectedParams.has(k));
      return { list: raw.map(normalizeStudent), totalPages, clientFilters };
    } catch (err) {
      const key = err?.response?.status === 400 ? NOT_ALLOWED.exec(err.response.data?.message || "")?.[1] : null;
      if (!key || !(key in params)) throw err;
      delete params[key];
      if (key in wanted) {
        rejectedParams.add(key);
        Object.assign(params, { page: 1, limit: Math.max(limit, 100) });
      }
    }
  }
  throw new Error("Could not load students");
};

// GET /students/:id
export const getStudentById = async (id) => {
  const { data } = await api.get(`/students/${id}`);
  const payload = unwrap(data);
  return normalizeStudent(payload?.student ?? payload);
};

// POST /students
// IMPORTANT: The new API does not allow "student_id" in the payload.
export const createStudent = async (body) => {
  // Destructure to remove student_id, keeping the rest of the fields
  const { student_id, ...cleanBody } = body; 
  const { data } = await api.post("/students", cleanBody);
  return unwrap(data);
};

// PUT /students/:id  (personal info: name, address, guardian, ...)
export const updateStudent = async (id, body) => {
  const { data } = await api.put(`/students/${id}`, body);
  return unwrap(data);
};

// PATCH /students/:id/status  { status: "active" | "completed" | "left" }
export const setStudentStatus = async (id, status) => {
  const { data } = await api.patch(`/students/${id}/status`, { status });
  return unwrap(data);
};

// PUT /students/:id/stage  { lifecycle_stage, stage_status, remarks }
export const updateStudentStage = async (id, body) => {
  const { data } = await api.put(`/students/${id}/stage`, body);
  const payload = unwrap(data);
  return { message: data?.message, student: payload ? normalizeStudent(payload) : null };
};

// GET /students/:id/stage-history  (changed_by comes back populated)
export const getStudentStageHistory = async (id) => {
  const { data } = await api.get(`/students/${id}/stage-history`);
  const payload = unwrap(data);
  return Array.isArray(payload) ? payload : payload?.history || payload?.items || [];
};

/* ───── Excel import / export ───── */

const IO_BASE = "/import-export/students/students";

// This backend rejects unknown query params, so none are sent
const downloadExcel = async (path, fallbackName) => {
  try {
    const res = await api.get(`${IO_BASE}/${path}`, { responseType: "blob", timeout: 120000 });
    saveBlob(res, fallbackName);
  } catch (err) {
    throw await unwrapBlobError(err);
  }
};

// GET /import-export/students/students/export  -> students_students_export.xlsx
export const exportStudents = () => downloadExcel("export", "students_students_export.xlsx");

// GET /import-export/students/students/template  -> students_students_template.xlsx
export const downloadStudentTemplate = () => downloadExcel("template", "students_students_template.xlsx");

// POST /import-export/students/students/import  (multipart/form-data, field name: "file")
// -> { success, message, data: { totalRows, importedCount, skippedCount, errors: [{ row, student_id, message }] } }
export const importStudents = async (file, onProgress) => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post(`${IO_BASE}/import`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 180000,
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
    },
  });
  return data;
};

/* ───── Student documents ───── */

// GET /students/:id/documents  -> { success, count, data: [ { _id, document_type, status, remarks, upload_id: { originalName, mimeType, size, createdAt }, ... } ] }
export const getStudentDocuments = async (studentId) => {
  const { data } = await api.get(`/students/${studentId}/documents`);
  const payload = unwrap(data);
  const list = Array.isArray(payload) ? payload : payload?.documents || payload?.items || [];
  return list.filter((d) => !d.is_deleted);
};

// POST /students/:id/documents  (multipart/form-data: document_type = text, file = PDF or image)
export const uploadStudentDocument = async (studentId, { file, document_type }, onProgress) => {
  const formData = new FormData();
  formData.append("document_type", document_type);
  formData.append("file", file);
  const { data } = await api.post(`/students/${studentId}/documents`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 120000,
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
    },
  });
  return unwrap(data);
};

// PUT /documents/:id/verify  { status: "received" | "verified", remarks }
export const updateDocumentStatus = async (documentId, status, remarks) => {
  const body = remarks ? { status, remarks } : { status };
  const { data } = await api.put(`/documents/${documentId}/verify`, body);
  return unwrap(data);
};

// GET /documents/:id/file  (needs the Bearer token, so fetch as a blob and save it)
export const downloadStudentDocument = async (documentId, fallbackName = "document") => {
  try {
    const res = await api.get(`/documents/${documentId}/file`, { responseType: "blob", timeout: 120000 });
    saveBlob(res, fallbackName);
  } catch (err) {
    throw await unwrapBlobError(err);
  }
};

// DELETE /documents/:id  (soft delete)
export const deleteStudentDocument = async (documentId) => {
  const { data } = await api.delete(`/documents/${documentId}`);
  return unwrap(data);
};

/* ───────────── Student lookup ─────────────
   Uses GET /students. Results are normalised so the picker shows name / email / phone. */
export const searchStudents = async (term) => {
  const { list } = await getStudents({ search: term.trim(), limit: 10 });
  const q = term.trim().toLowerCase();
  return list
    .filter((s) => [s.name, s.email, s.phone, s.rollNo].some((v) => String(v ?? "").toLowerCase().includes(q)))
    .slice(0, 10);
};

// id -> display name map, so tables can show names instead of IDs.
// Merges students and users, so older records created with a user id still show a name.
export const getStudentNameMap = async () => {
  const [students, users] = await Promise.all([
    getStudents({ limit: 100 }).then((r) => r.list).catch(() => []),
    getUsers({ limit: 500 }).then((r) => r.list).catch(() => []),
  ]);
  const map = Object.fromEntries(users.map((u) => [u.id || u._id, u.name || u.email || ""]));
  students.forEach((s) => {
    map[s.id] = s.name || s.email || "";
  });
  return map;
};

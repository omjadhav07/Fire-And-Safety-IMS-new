import api from "../../services/api";
import { saveBlob, unwrapBlobError } from "../library/bookImportExportService";

const unwrap = (data) => data?.data ?? data;
const BASE = "/class-tests";

const listOf = (payload, keys = []) => {
  if (Array.isArray(payload)) return payload;
  for (const k of [...keys, "items", "rows"]) if (Array.isArray(payload?.[k])) return payload[k];
  return [];
};

/* ───── Class tests ───── */

// GET /class-tests?page=1&limit=10  ->  { list, totalPages }
export const getClassTests = async ({ page = 1, limit = 10 } = {}) => {
  const { data } = await api.get(BASE, { params: { page, limit } });
  const payload = unwrap(data);
  const meta = data?.meta || data?.pagination || payload?.meta || payload?.pagination || {};
  const total = meta.total ?? meta.totalItems ?? payload?.total;
  return {
    list: listOf(payload, ["tests", "classTests", "class_tests"]),
    totalPages: meta.totalPages ?? meta.pages ?? (total ? Math.ceil(total / limit) : null),
  };
};

// GET /class-tests/:id
export const getClassTestById = async (id) => {
  const { data } = await api.get(`${BASE}/${id}`);
  const payload = unwrap(data);
  return payload?.test ?? payload?.classTest ?? payload;
};

// POST /class-tests
//  { title, description, course_id, batch_id, subject, test_date, max_marks, passing_marks, duration_minutes, status }
export const createClassTest = async (body) => {
  const { data } = await api.post(BASE, body);
  return { message: data?.message, test: unwrap(data) };
};

// PUT /class-tests/:id  { title, description, test_date, max_marks, passing_marks, duration_minutes, status }
export const updateClassTest = async (id, body) => {
  const { data } = await api.put(`${BASE}/${id}`, body);
  return { message: data?.message, test: unwrap(data) };
};

// DELETE /class-tests/:id
export const deleteClassTest = async (id) => {
  const { data } = await api.delete(`${BASE}/${id}`);
  return { message: data?.message };
};

/* ───── Marks ───── */

// POST /class-tests/:id/marks/bulk  { marks: [{ student_id, marks_obtained, remarks }] }
export const saveMarksBulk = async (testId, marks) => {
  const { data } = await api.post(`${BASE}/${testId}/marks/bulk`, { marks });
  return { message: data?.message, data: unwrap(data) };
};

// PUT /class-tests/:id/marks/:studentId  { marks_obtained, remarks }
export const updateMark = async (testId, studentId, body) => {
  const { data } = await api.put(`${BASE}/${testId}/marks/${studentId}`, body);
  return { message: data?.message, data: unwrap(data) };
};

// DELETE /class-tests/:id/marks/:studentId
export const deleteMark = async (testId, studentId) => {
  const { data } = await api.delete(`${BASE}/${testId}/marks/${studentId}`);
  return { message: data?.message };
};

// GET /class-tests/:id/marks/:studentId/history
export const getMarkHistory = async (testId, studentId) => {
  const { data } = await api.get(`${BASE}/${testId}/marks/${studentId}/history`);
  return listOf(unwrap(data), ["history", "items"]);
};

// GET /class-tests/:id/insights
export const getInsights = async (testId) => {
  const { data } = await api.get(`${BASE}/${testId}/insights`);
  return unwrap(data);
};

/* ───── Excel / CSV ───── */

const download = async (path, params, fallbackName) => {
  try {
    const res = await api.get(path, { params, responseType: "blob", timeout: 120000 });
    saveBlob(res, fallbackName);
  } catch (err) {
    throw await unwrapBlobError(err);
  }
};

// GET /class-tests/:id/marks/template?format=xlsx
export const downloadMarksTemplate = (testId, format = "xlsx") =>
  download(`${BASE}/${testId}/marks/template`, { format }, `class-test-marks-template.${format}`);

// GET /class-tests/:id/marks/export?format=xlsx&include_remarks=true
export const exportMarks = (testId, { format = "xlsx", includeRemarks = true } = {}) =>
  download(`${BASE}/${testId}/marks/export`, { format, include_remarks: includeRemarks }, `class-test-marks.${format}`);

// POST /class-tests/:id/marks/import  (multipart/form-data, field name: "file")
export const importMarks = async (testId, file, onProgress) => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post(`${BASE}/${testId}/marks/import`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 180000,
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
    },
  });
  return data;
};

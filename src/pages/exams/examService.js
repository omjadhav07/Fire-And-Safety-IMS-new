// import api from "../../services/api";

// const unwrap = (data) => data?.data ?? data;
// const BASE = "/exams";

// const listOf = (payload, keys = []) => {
//   if (Array.isArray(payload)) return payload;
//   for (const k of [...keys, "items", "rows"]) if (Array.isArray(payload?.[k])) return payload[k];
//   return [];
// };

// /* ───── Exams ───── */

// // GET /exams?page&limit&course_id&batch_id&faculty_id&exam_type&status&search&start_date&end_date
// // Empty filters are not sent.  ->  { list, totalPages }
// export const getExams = async ({ page = 1, limit = 10, ...filters } = {}) => {
//   const params = { page, limit };
//   Object.entries(filters).forEach(([k, v]) => {
//     if (v !== "" && v !== undefined && v !== null) params[k] = v;
//   });
//   const { data } = await api.get(BASE, { params });
//   const payload = unwrap(data);
//   const meta = data?.meta || data?.pagination || payload?.meta || payload?.pagination || {};
//   const total = meta.total ?? meta.totalItems ?? payload?.total;
//   return {
//     list: listOf(payload, ["exams"]),
//     totalPages: meta.totalPages ?? meta.pages ?? (total ? Math.ceil(total / limit) : null),
//   };
// };

// // GET /exams/:id
// export const getExamById = async (id) => {
//   const { data } = await api.get(`${BASE}/${id}`);
//   const payload = unwrap(data);
//   return payload?.exam ?? payload;
// };

// // POST /exams
// // { title, description, course_id, batch_id, faculty_id, subject, exam_type, exam_date,
// //   form_start_date, form_end_date, max_marks, passing_marks, duration_minutes, status }
// export const createExam = async (body) => {
//   const { data } = await api.post(BASE, body);
//   return { message: data?.message, exam: unwrap(data) };
// };

// // PUT /exams/:id  (only the fields that changed)
// export const updateExam = async (id, body) => {
//   const { data } = await api.put(`${BASE}/${id}`, body);
//   return { message: data?.message, exam: unwrap(data) };
// };

// // DELETE /exams/:id
// export const deleteExam = async (id) => {
//   const { data } = await api.delete(`${BASE}/${id}`);
//   return { message: data?.message };
// };

// /* ───── Marks ───── */

// // POST /exams/:id/marks/bulk  { marks: [{ student_id, marks_obtained, remarks? }] }
// export const saveExamMarksBulk = async (examId, marks) => {
//   const { data } = await api.post(`${BASE}/${examId}/marks/bulk`, { marks });
//   return { message: data?.message, data: unwrap(data) };
// };

// // PUT /exams/:id/marks/:studentId  { marks_obtained, remarks }
// export const updateExamMark = async (examId, studentId, body) => {
//   const { data } = await api.put(`${BASE}/${examId}/marks/${studentId}`, body);
//   return { message: data?.message, data: unwrap(data) };
// };

// // DELETE /exams/:id/marks/:studentId
// export const deleteExamMark = async (examId, studentId) => {
//   const { data } = await api.delete(`${BASE}/${examId}/marks/${studentId}`);
//   return { message: data?.message };
// };

// // GET /exams/:id/marks/:studentId/history
// export const getExamMarkHistory = async (examId, studentId) => {
//   const { data } = await api.get(`${BASE}/${examId}/marks/${studentId}/history`);
//   return listOf(unwrap(data), ["history", "items"]);
// };

// /* ───── Results ───── */

// // GET /exams/:examId/results  ->  { rows, published, exam }
// export const getExamResults = async (examId) => {
//   const { data } = await api.get(`${BASE}/${examId}/results`);
//   const payload = unwrap(data);
//   const rows = Array.isArray(payload)
//     ? payload
//     : payload?.results || payload?.students || payload?.marks || payload?.items || [];
//   const flag = payload?.published ?? payload?.is_published ?? payload?.isPublished;
//   const status = payload?.status || payload?.result_status;
//   return {
//     rows,
//     published: typeof flag === "boolean" ? flag : status ? String(status).toLowerCase() === "published" : undefined,
//     exam: payload?.exam && typeof payload.exam === "object" ? payload.exam : null,
//   };
// };

// // PUT /exams/:examId/publish   (marks are saved separately with the marks endpoints)
// // An old-style body { marks } is still sent if marks are passed in.
// export const publishResults = async (examId, marks) => {
//   const { data } = await api.put(`${BASE}/${examId}/publish`, marks ? { marks } : undefined);
//   return { message: data?.message };
// };

// // PUT /exams/:examId/unpublish
// export const unpublishResults = async (examId) => {
//   const { data } = await api.put(`${BASE}/${examId}/unpublish`);
//   return { message: data?.message };
// };


import api from "../../services/api";
import { saveBlob, unwrapBlobError } from "../library/bookImportExportService";

const unwrap = (data) => data?.data ?? data;
const BASE = "/exams";

const listOf = (payload, keys = []) => {
  if (Array.isArray(payload)) return payload;
  for (const k of [...keys, "items", "rows"]) if (Array.isArray(payload?.[k])) return payload[k];
  return [];
};

/* ───── Exams ───── */

// GET /exams?page&limit&course_id&batch_id&faculty_id&exam_type&status&search&start_date&end_date
// Empty filters are not sent.  ->  { list, totalPages }
export const getExams = async ({ page = 1, limit = 10, ...filters } = {}) => {
  const params = { page, limit };
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== "" && v !== undefined && v !== null) params[k] = v;
  });
  const { data } = await api.get(BASE, { params });
  const payload = unwrap(data);
  const meta = data?.meta || data?.pagination || payload?.meta || payload?.pagination || {};
  const total = meta.total ?? meta.totalItems ?? payload?.total;
  return {
    list: listOf(payload, ["exams"]),
    totalPages: meta.totalPages ?? meta.pages ?? (total ? Math.ceil(total / limit) : null),
  };
};

// GET /exams/:id
export const getExamById = async (id) => {
  const { data } = await api.get(`${BASE}/${id}`);
  const payload = unwrap(data);
  return payload?.exam ?? payload;
};

// POST /exams
// { title, description, course_id, batch_id, faculty_id, subject, exam_type, exam_date,
//   form_start_date, form_end_date, max_marks, passing_marks, duration_minutes, status }
export const createExam = async (body) => {
  const { data } = await api.post(BASE, body);
  return { message: data?.message, exam: unwrap(data) };
};

// PUT /exams/:id  (only the fields that changed)
export const updateExam = async (id, body) => {
  const { data } = await api.put(`${BASE}/${id}`, body);
  return { message: data?.message, exam: unwrap(data) };
};

// DELETE /exams/:id
export const deleteExam = async (id) => {
  const { data } = await api.delete(`${BASE}/${id}`);
  return { message: data?.message };
};

/* ───── Marks ───── */

// POST /exams/:id/marks/bulk  { marks: [{ student_id, marks_obtained, remarks? }] }
export const saveExamMarksBulk = async (examId, marks) => {
  const { data } = await api.post(`${BASE}/${examId}/marks/bulk`, { marks });
  return { message: data?.message, data: unwrap(data) };
};

// PUT /exams/:id/marks/:studentId  { marks_obtained, remarks }
export const updateExamMark = async (examId, studentId, body) => {
  const { data } = await api.put(`${BASE}/${examId}/marks/${studentId}`, body);
  return { message: data?.message, data: unwrap(data) };
};

// DELETE /exams/:id/marks/:studentId
export const deleteExamMark = async (examId, studentId) => {
  const { data } = await api.delete(`${BASE}/${examId}/marks/${studentId}`);
  return { message: data?.message };
};

// GET /exams/:id/marks/:studentId/history
export const getExamMarkHistory = async (examId, studentId) => {
  const { data } = await api.get(`${BASE}/${examId}/marks/${studentId}/history`);
  return listOf(unwrap(data), ["history", "items"]);
};

/* ───── Results ───── */

// GET /exams/:examId/results  ->  { rows, published, exam }
export const getExamResults = async (examId) => {
  const { data } = await api.get(`${BASE}/${examId}/results`);
  const payload = unwrap(data);
  const rows = Array.isArray(payload)
    ? payload
    : payload?.results || payload?.students || payload?.marks || payload?.items || [];
  const flag = payload?.published ?? payload?.is_published ?? payload?.isPublished;
  const status = payload?.status || payload?.result_status;
  return {
    rows,
    published: typeof flag === "boolean" ? flag : status ? String(status).toLowerCase() === "published" : undefined,
    exam: payload?.exam && typeof payload.exam === "object" ? payload.exam : null,
  };
};

// PUT /exams/:examId/publish   (marks are saved separately with the marks endpoints)
// An old-style body { marks } is still sent if marks are passed in.
export const publishResults = async (examId, marks) => {
  const { data } = await api.put(`${BASE}/${examId}/publish`, marks ? { marks } : undefined);
  return { message: data?.message };
};

// PUT /exams/:examId/unpublish
export const unpublishResults = async (examId) => {
  const { data } = await api.put(`${BASE}/${examId}/unpublish`);
  return { message: data?.message };
};

/* ───── Excel / CSV Export ───── */

// GET /import-export/exams/marks/export?exam_id=...&format=xlsx
export const exportExamMarks = async (examId, format = "xlsx") => {
  try {
    const res = await api.get("/import-export/exams/marks/export", {
      params: { exam_id: examId, format },
      responseType: "blob",
      timeout: 120000, // 2 minutes for large files
    });
    // Uses the helper to trigger the browser download
    saveBlob(res, `exam-marks-${examId}.${format}`);
  } catch (err) {
    // Properly unwraps error blobs from the backend
    throw await unwrapBlobError(err);
  }
};
// import api from "../../services/api";
// import { saveBlob, unwrapBlobError } from "../library/bookImportExportService";

// const unwrap = (data) => data?.data ?? data;
// const BASE = "/exams";

// const listOf = (payload) => {
//   if (Array.isArray(payload)) return payload;
//   return payload?.exams || payload?.items || payload?.rows || [];
// };

// /* ───── Exams ───── */

// // GET /exams?page=1&limit=10&...filters
// // The result works both as a plain array and as { list, totalPages }, so any page can use it.
// export const getExams = async (filters = {}) => {
//   const { page = 1, limit = 10, ...rest } = filters;
//   const params = Object.fromEntries(
//     Object.entries({ page, limit, ...rest }).filter(([, v]) => v !== "" && v !== null && v !== undefined)
//   );
//   const { data } = await api.get(BASE, { params });
//   const payload = unwrap(data);
//   const list = listOf(payload);
//   const meta = data?.meta || data?.pagination || payload?.meta || payload?.pagination || {};
//   const total = meta.total ?? meta.totalItems ?? payload?.total;
//   const totalPages = meta.totalPages ?? meta.pages ?? (total ? Math.ceil(total / limit) : null);
//   return Object.assign([...list], { list, totalPages, total });
// };

// // GET /exams/:id
// export const getExamById = async (id) => {
//   const { data } = await api.get(`${BASE}/${id}`);
//   const payload = unwrap(data);
//   return payload?.exam ?? payload;
// };
// export const getExam = getExamById;

// // POST /exams
// export const createExam = async (body) => {
//   const { data } = await api.post(BASE, body);
//   return { message: data?.message, exam: unwrap(data) };
// };

// // PUT /exams/:id
// export const updateExam = async (id, body) => {
//   const { data } = await api.put(`${BASE}/${id}`, body);
//   return { message: data?.message, exam: unwrap(data) };
// };

// // DELETE /exams/:id
// export const deleteExam = async (id) => {
//   const { data } = await api.delete(`${BASE}/${id}`);
//   return { message: data?.message };
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

// // PUT /exams/:examId/publish  { marks: [{ student_id, marks_obtained, remarks }] }
// export const publishResults = async (examId, marks) => {
//   const { data } = await api.put(`${BASE}/${examId}/publish`, { marks });
//   return { message: data?.message };
// };

// // PUT /exams/:examId/unpublish
// export const unpublishResults = async (examId) => {
//   const { data } = await api.put(`${BASE}/${examId}/unpublish`);
//   return { message: data?.message };
// };

// /* ───── Excel / CSV ───── */

// const download = async (path, params, fallbackName) => {
//   try {
//     const res = await api.get(path, { params, responseType: "blob", timeout: 120000 });
//     saveBlob(res, fallbackName);
//   } catch (err) {
//     throw await unwrapBlobError(err);
//   }
// };

// // GET /import-export/exams/marks/export?exam_id=...&format=xlsx
// export const exportExamMarks = (examId, format = "xlsx") =>
//   download("/import-export/exams/marks/export", { exam_id: examId, format }, `exam-marks-${examId}.${format}`);

// // GET /import-export/exams/marks/template?exam_id=...&format=xlsx
// export const downloadExamMarksTemplate = (examId, format = "xlsx") =>
//   download("/import-export/exams/marks/template", { exam_id: examId, format }, `exam-marks-template.${format}`);

// // POST /import-export/exams/marks/import  (multipart/form-data: file + exam_id)
// export const importExamMarks = async (examId, file, onProgress) => {
//   const formData = new FormData();
//   formData.append("file", file);
//   formData.append("exam_id", examId);
//   const { data } = await api.post("/import-export/exams/marks/import", formData, {
//     headers: { "Content-Type": "multipart/form-data" },
//     timeout: 180000,
//     onUploadProgress: (e) => {
//       if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
//     },
//   });
//   return data;
// };


import api from "../../services/api";
import { saveBlob, unwrapBlobError } from "../library/bookImportExportService";

const unwrap = (data) => data?.data ?? data;
const BASE = "/exams";

const listOf = (payload, keys = []) => {
  if (Array.isArray(payload)) return payload;
  for (const k of [...keys, "exams", "items", "rows"]) if (Array.isArray(payload?.[k])) return payload[k];
  return [];
};

/* ───── Exams ───── */

// GET /exams?page=1&limit=10&...filters   (empty filters are not sent)
// The result works both as a plain array and as { list, totalPages, total }, so any page can use it.
export const getExams = async (filters = {}) => {
  const { page = 1, limit = 10, ...rest } = filters;
  const params = Object.fromEntries(
    Object.entries({ page, limit, ...rest }).filter(([, v]) => v !== "" && v !== null && v !== undefined)
  );
  const { data } = await api.get(BASE, { params });
  const payload = unwrap(data);
  const list = listOf(payload);
  const meta = data?.meta || data?.pagination || payload?.meta || payload?.pagination || {};
  const total = meta.total ?? meta.totalItems ?? payload?.total;
  const totalPages = meta.totalPages ?? meta.pages ?? (total ? Math.ceil(total / limit) : null);
  return Object.assign([...list], { list, totalPages, total });
};

// GET /exams/:id
export const getExamById = async (id) => {
  const { data } = await api.get(`${BASE}/${id}`);
  const payload = unwrap(data);
  return payload?.exam ?? payload;
};
export const getExam = getExamById;

// POST /exams
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
  return listOf(unwrap(data), ["history"]);
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

// PUT /exams/:examId/publish
// Marks are normally saved with the marks endpoints first. An old-style body { marks: [...] }
// is still sent when marks are passed in.
export const publishResults = async (examId, marks) => {
  const { data } = await api.put(`${BASE}/${examId}/publish`, marks ? { marks } : undefined);
  return { message: data?.message };
};

// PUT /exams/:examId/unpublish
export const unpublishResults = async (examId) => {
  const { data } = await api.put(`${BASE}/${examId}/unpublish`);
  return { message: data?.message };
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

// GET /import-export/exams/marks/export?exam_id=...&format=xlsx
export const exportExamMarks = (examId, format = "xlsx") =>
  download("/import-export/exams/marks/export", { exam_id: examId, format }, `exam-marks-${examId}.${format}`);

// GET /import-export/exams/marks/template?exam_id=...&format=xlsx
export const downloadExamMarksTemplate = (examId, format = "xlsx") =>
  download("/import-export/exams/marks/template", { exam_id: examId, format }, `exam-marks-template.${format}`);

// POST /import-export/exams/marks/import  (multipart/form-data: file + exam_id)
export const importExamMarks = async (examId, file, onProgress) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("exam_id", examId);
  const { data } = await api.post("/import-export/exams/marks/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 180000,
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
    },
  });
  return data;
};

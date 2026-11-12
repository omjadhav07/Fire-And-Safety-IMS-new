// import api from "../../services/api";

// const listOf = (data) => {
//   const payload = data?.data ?? data;
//   if (Array.isArray(payload)) return payload;
//   for (const k of ["exam_forms", "examForms", "forms", "items", "rows", "results"]) if (Array.isArray(payload?.[k])) return payload[k];
//   return [];
// };

// // GET /exam-forms   (staff: all forms)   |   GET /student/exam-forms   (student: own forms)
// export const getExamForms = async ({ student = false, ...params } = {}) => {
//   const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v != null));
//   const { data } = await api.get(student ? "/student/exam-forms" : "/exam-forms", { params: clean });
//   return listOf(data);
// };

// // GET /exam-forms/:id
// export const getExamFormById = async (id) => {
//   const { data } = await api.get(`/exam-forms/${id}`);
//   const payload = data?.data ?? data;
//   return payload?.exam_form ?? payload?.examForm ?? payload?.form ?? payload;
// };

// // POST /student/exam-forms   { exam_id }
// export const submitExamForm = async (examId) => {
//   const { data } = await api.post("/student/exam-forms", { exam_id: examId });
//   return data?.data ?? data;
// };


// import api from "../../services/api";

// const unwrap = (data) => data?.data ?? data;

// const listOf = (data) => {
//   const payload = unwrap(data);
//   if (Array.isArray(payload)) return payload;
//   for (const k of ["exam_forms", "examForms", "forms", "items", "rows", "results"]) {
//     if (Array.isArray(payload?.[k])) return payload[k];
//   }
//   return [];
// };

// const clean = (params) => Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v != null));

// // Student routes live under /student/exam-forms, staff routes under /exam-forms
// const base = (student) => (student ? "/student/exam-forms" : "/exam-forms");

// // GET /exam-forms?exam_id&student_id&status&course_id&batch_id&page&limit   (staff, faculty: own exams only)
// // GET /student/exam-forms                                                    (student: own forms)
// // Returns the list; the array also carries .meta = { page, limit, total, totalPages }
// export const getExamForms = async ({ student = false, ...params } = {}) => {
//   const { data } = await api.get(base(student), { params: student ? {} : clean(params) });
//   const list = listOf(data);
//   return Object.assign([...list], { meta: data?.meta || {} });
// };

// // GET /exam-forms/:id   or   GET /student/exam-forms/:id
// export const getExamFormById = async (id, { student = false } = {}) => {
//   const { data } = await api.get(`${base(student)}/${id}`);
//   const payload = unwrap(data);
//   return payload?.exam_form ?? payload?.examForm ?? payload?.form ?? payload;
// };

// // GET /student/exam-forms/available-exams
// // Exams open for forms for the logged-in student (students get 403 on GET /exams)
// export const getAvailableExams = async () => {
//   const { data } = await api.get("/student/exam-forms/available-exams");
//   return listOf(data);
// };

// // GET /exam-forms/eligibility?exam_id&student_id      (staff)
// // GET /student/exam-forms/eligibility?exam_id         (student: own)
// // -> { eligible, pending: [{ fee_name, amount_due, amount_paid, balance }], exam, student, existing_form }
// // Hard blockers (wrong course/batch, window closed, already submitted) come back as HTTP errors.
// export const checkEligibility = async ({ examId, studentId, student = false }) => {
//   const params = student ? { exam_id: examId } : { exam_id: examId, student_id: studentId };
//   const { data } = await api.get(`${base(student)}/eligibility`, { params });
//   return unwrap(data);
// };

// // Student:  POST /student/exam-forms  { exam_id }
// // Staff:    POST /exam-forms          { exam_id, student_id }   (pass { studentId })
// // When fees are pending the API answers 403 with code FEES_PENDING and saves the form as "blocked".
// // Use feesPendingOf(err) to read the unpaid fees from that error.
// export const submitExamForm = async (examId, { studentId } = {}) => {
//   const { data } = studentId
//     ? await api.post("/exam-forms", { exam_id: examId, student_id: studentId })
//     : await api.post("/student/exam-forms", { exam_id: examId });
//   return { message: data?.message, form: unwrap(data) };
// };

// // PUT /exam-forms/:id/override   { reason }   (super_admin only, form must be blocked / pending)
// export const overrideExamForm = async (id, reason) => {
//   const { data } = await api.put(`/exam-forms/${id}/override`, { reason });
//   return { message: data?.message, form: unwrap(data) };
// };

// // Reads the FEES_PENDING error from submitExamForm. Returns { pending, formId } or null for any other error.
// export const feesPendingOf = (err) => {
//   const body = err?.response?.data;
//   if (err?.response?.status === 403 && body?.code === "FEES_PENDING") {
//     return { pending: body.pending || [], formId: body.form_id || null, message: body.message };
//   }
//   return null;
// };

// import 12 nov

import api from "../../services/api";

const unwrap = (data) => data?.data ?? data;

const listOf = (data) => {
  const payload = unwrap(data);
  if (Array.isArray(payload)) return payload;
  for (const k of ["exam_forms", "examForms", "forms", "items", "rows", "results"]) {
    if (Array.isArray(payload?.[k])) return payload[k];
  }
  return [];
};

// GET /exam-forms?exam_id&student_id&status&page&limit   (staff: all forms, paginated)
// GET /student/exam-forms                                (student: own forms, no params)
// The result works as a plain array and also carries { list, total, totalPages, page }.
export const getExamForms = async ({ student = false, page = 1, limit = 20, ...filters } = {}) => {
  if (student) {
    const { data } = await api.get("/student/exam-forms");
    const list = listOf(data);
    return Object.assign([...list], { list, total: list.length, totalPages: 1, page: 1 });
  }

  // The backend rejects unknown query params, so only send the ones it knows
  const params = { page, limit };
  for (const key of ["exam_id", "student_id", "status"]) {
    if (filters[key]) params[key] = filters[key];
  }

  const { data } = await api.get("/exam-forms", { params });
  const list = listOf(data);
  const meta = data?.meta || data?.pagination || {};
  const total = meta.total ?? list.length;
  const totalPages = meta.totalPages ?? Math.max(1, Math.ceil(total / limit));
  return Object.assign([...list], { list, total, totalPages, page: meta.page ?? page });
};

// GET /exam-forms/:id   (staff) - student, exam and override_by come back populated
export const getExamFormById = async (id) => {
  const { data } = await api.get(`/exam-forms/${id}`);
  const payload = unwrap(data);
  return payload?.exam_form ?? payload?.examForm ?? payload?.form ?? payload;
};

// POST /student/exam-forms  { exam_id }   (student applies for themselves)
export const submitExamForm = async (examId) => {
  const { data } = await api.post("/student/exam-forms", { exam_id: examId });
  return data?.data ?? data;
};

// GET /exam-forms/eligibility?exam_id&student_id   (super_admin, office_staff)
// -> { eligible, pending: [{ fee_name, amount_due, amount_paid, balance }], exam, existing_form }
// Rejects with a readable message when the exam is for another course/batch, the form window is
// closed, or the form was already submitted.
export const checkEligibility = async ({ examId, studentId }) => {
  const { data } = await api.get("/exam-forms/eligibility", {
    params: { exam_id: examId, student_id: studentId },
  });
  return unwrap(data);
};

// POST /exam-forms  { exam_id, student_id }   (super_admin, office_staff create on behalf of a student)
// When fees are pending the backend answers 403 with code FEES_PENDING and records a blocked form.
// Use feesPendingOf(err) to read the pending list from that error.
export const createExamFormForStudent = async ({ examId, studentId }) => {
  const { data } = await api.post("/exam-forms", { exam_id: examId, student_id: studentId });
  return { message: data?.message, form: unwrap(data) };
};

// PUT /exam-forms/:id/override  { reason }   (super_admin only, reason of at least 5 characters)
export const overrideExamForm = async (id, reason) => {
  const { data } = await api.put(`/exam-forms/${id}/override`, { reason: reason.trim() });
  return { message: data?.message, form: unwrap(data) };
};

// The pending fee list carried by a FEES_PENDING error, or null for any other error
export const feesPendingOf = (err) =>
  err?.response?.data?.code === "FEES_PENDING" ? err.response.data.pending || [] : null;

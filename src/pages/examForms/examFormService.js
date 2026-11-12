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

const clean = (params) => Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v != null));

// Student routes live under /student/exam-forms, staff routes under /exam-forms
const base = (student) => (student ? "/student/exam-forms" : "/exam-forms");

// GET /exam-forms?exam_id&student_id&status&course_id&batch_id&page&limit   (staff, faculty: own exams only)
// GET /student/exam-forms                                                    (student: own forms)
// Returns the list; the array also carries .meta = { page, limit, total, totalPages }
export const getExamForms = async ({ student = false, ...params } = {}) => {
  const { data } = await api.get(base(student), { params: student ? {} : clean(params) });
  const list = listOf(data);
  return Object.assign([...list], { meta: data?.meta || {} });
};

// GET /exam-forms/:id   or   GET /student/exam-forms/:id
export const getExamFormById = async (id, { student = false } = {}) => {
  const { data } = await api.get(`${base(student)}/${id}`);
  const payload = unwrap(data);
  return payload?.exam_form ?? payload?.examForm ?? payload?.form ?? payload;
};

// GET /student/exam-forms/available-exams
// Exams open for forms for the logged-in student (students get 403 on GET /exams)
export const getAvailableExams = async () => {
  const { data } = await api.get("/student/exam-forms/available-exams");
  return listOf(data);
};

// GET /exam-forms/eligibility?exam_id&student_id      (staff)
// GET /student/exam-forms/eligibility?exam_id         (student: own)
// -> { eligible, pending: [{ fee_name, amount_due, amount_paid, balance }], exam, student, existing_form }
// Hard blockers (wrong course/batch, window closed, already submitted) come back as HTTP errors.
export const checkEligibility = async ({ examId, studentId, student = false }) => {
  const params = student ? { exam_id: examId } : { exam_id: examId, student_id: studentId };
  const { data } = await api.get(`${base(student)}/eligibility`, { params });
  return unwrap(data);
};

// Student:  POST /student/exam-forms  { exam_id }
// Staff:    POST /exam-forms          { exam_id, student_id }   (pass { studentId })
// When fees are pending the API answers 403 with code FEES_PENDING and saves the form as "blocked".
// Use feesPendingOf(err) to read the unpaid fees from that error.
export const submitExamForm = async (examId, { studentId } = {}) => {
  const { data } = studentId
    ? await api.post("/exam-forms", { exam_id: examId, student_id: studentId })
    : await api.post("/student/exam-forms", { exam_id: examId });
  return { message: data?.message, form: unwrap(data) };
};

// PUT /exam-forms/:id/override   { reason }   (super_admin only, form must be blocked / pending)
export const overrideExamForm = async (id, reason) => {
  const { data } = await api.put(`/exam-forms/${id}/override`, { reason });
  return { message: data?.message, form: unwrap(data) };
};

// Reads the FEES_PENDING error from submitExamForm. Returns { pending, formId } or null for any other error.
export const feesPendingOf = (err) => {
  const body = err?.response?.data;
  if (err?.response?.status === 403 && body?.code === "FEES_PENDING") {
    return { pending: body.pending || [], formId: body.form_id || null, message: body.message };
  }
  return null;
};


import api from "../../services/api";

const unwrap = (data) => data?.data ?? data;

// Subject master (a subject belongs to one course)
// Subject: { _id, name, course_id (id or { _id, name }), description, createdAt }

// GET /subjects
export const getSubjects = async (params = {}) => {
  const { data } = await api.get("/subjects", { params });
  const payload = unwrap(data);
  if (Array.isArray(payload)) return payload;
  return payload?.subjects || payload?.items || payload?.rows || [];
};

// GET /subjects/:id
export const getSubjectById = async (id) => {
  const { data } = await api.get(`/subjects/${id}`);
  const payload = unwrap(data);
  return payload?.subject ?? payload;
};

// POST /subjects  { name, course_id, description }
export const createSubject = async ({ name, course_id, description }) => {
  const { data } = await api.post("/subjects", { name, course_id, description });
  return { message: data?.message, subject: unwrap(data) };
};

// PUT /subjects/:id  { name, course_id, description }
export const updateSubject = async (id, { name, course_id, description }) => {
  const { data } = await api.put(`/subjects/${id}`, { name, course_id, description });
  return { message: data?.message, subject: unwrap(data) };
};

// DELETE /subjects/:id
export const deleteSubject = async (id) => {
  const { data } = await api.delete(`/subjects/${id}`);
  return { message: data?.message };
};

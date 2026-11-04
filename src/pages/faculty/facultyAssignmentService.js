import api from "../../services/api";

// Helper to safely extract the array from standard API responses
const unwrapList = (data) => {
  // If data is empty (e.g., 204 No Content), return an empty array immediately
  if (!data) return [];
  
  const payload = data?.data ?? data;
  if (Array.isArray(payload)) return payload;
  
  const list = payload?.assignments || payload?.items || payload?.rows || [];
  return Array.isArray(list) ? list : [];
};

// 4.2 LIST ASSIGNMENTS
// GET /faculty-assignments?faculty_id=&course_id=&batch_id=&subject=
export const getAssignments = async ({ faculty_id, course_id, batch_id, subject } = {}) => {
  const params = {};
  if (faculty_id) params.faculty_id = faculty_id;
  if (course_id) params.course_id = course_id;
  if (batch_id) params.batch_id = batch_id;
  if (subject) params.subject = subject;

  const { data } = await api.get("/faculty-assignments", { params });
  return unwrapList(data);
};

// 4.1 ASSIGN FACULTY
export const createAssignment = async (body) => {
  const { data } = await api.post("/faculty-assignments", body);
  return data?.data ?? data;
};

// 4.3 REMOVE ASSIGNMENT
export const deleteAssignment = async (id) => {
  const { data } = await api.delete(`/faculty-assignments/${id}`);
  return data?.data ?? data;
};
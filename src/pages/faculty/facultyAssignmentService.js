import api from "../../services/api";

const unwrap = (data) => data?.data ?? data;

// GET /faculty-assignments            (all)
// GET /faculty-assignments?faculty_id=<id>   (one faculty)
export const getAssignments = async ({ faculty_id } = {}) => {
  const params = faculty_id ? { faculty_id } : {};
  const { data } = await api.get("/faculty-assignments", { params });
  const payload = unwrap(data);
  if (Array.isArray(payload)) return payload;
  return payload?.assignments || payload?.items || payload?.rows || [];
};

// POST /faculty-assignments  { faculty_id, course_id, batch_id, subject }
export const createAssignment = async (body) => {
  const { data } = await api.post("/faculty-assignments", body);
  return unwrap(data);
};

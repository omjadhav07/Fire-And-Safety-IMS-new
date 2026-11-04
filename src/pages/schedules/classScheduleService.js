import api from "../../services/api";

const unwrap = (data) => data?.data ?? data;

// GET /classschedules  with optional filters: course_id, batch_id, faculty_id, date, status
export const getSchedules = async (filters = {}) => {
  const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
  const { data } = await api.get("/classschedules", { params });
  const payload = unwrap(data);
  if (Array.isArray(payload)) return payload;
  return payload?.schedules || payload?.classschedules || payload?.items || payload?.rows || [];
};

// GET /classschedules/:id
export const getScheduleById = async (id) => {
  const { data } = await api.get(`/classschedules/${id}`);
  const payload = unwrap(data);
  return payload?.schedule ?? payload;
};

// POST /classschedules  { course_id, batch_id, faculty_id, subject, date, start_time, end_time }
export const createSchedule = async (body) => {
  const { data } = await api.post("/classschedules", body);
  return { message: data?.message, schedule: unwrap(data) };
};

// PUT /classschedules/:id  (any of the fields above)
export const updateSchedule = async (id, body) => {
  const { data } = await api.put(`/classschedules/${id}`, body);
  return { message: data?.message, schedule: unwrap(data) };
};

// PATCH /classschedules/:id/cancel
export const cancelSchedule = async (id) => {
  const { data } = await api.patch(`/classschedules/${id}/cancel`);
  return { message: data?.message, schedule: unwrap(data) };
};

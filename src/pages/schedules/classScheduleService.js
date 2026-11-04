import api from "../../services/api";

const unwrap = (data) => data?.data ?? data;

// 10.2 LIST SCHEDULES
// GET /class-schedules?course_id=&batch_id=&faculty_id=&date=&status=
export const getSchedules = async (filters = {}) => {
  const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
  // FIXED: Changed /classschedules to /class-schedules
  const { data } = await api.get("/class-schedules", { params });
  const payload = unwrap(data);
  if (Array.isArray(payload)) return payload;
  return payload?.schedules || payload?.classSchedules || payload?.items || payload?.rows || [];
};

// 10.3 GET SCHEDULE
// GET /class-schedules/:id
export const getScheduleById = async (id) => {
  // FIXED: Changed /classschedules to /class-schedules
  const { data } = await api.get(`/class-schedules/${id}`);
  const payload = unwrap(data);
  return payload?.schedule ?? payload;
};

// 10.1 CREATE SCHEDULE
// POST /class-schedules
export const createSchedule = async (body) => {
  // FIXED: Changed /classschedules to /class-schedules
  const { data } = await api.post("/class-schedules", body);
  return { message: data?.message, schedule: unwrap(data) };
};

// 10.4 UPDATE SCHEDULE
// PUT /class-schedules/:id
export const updateSchedule = async (id, body) => {
  // FIXED: Changed /classschedules to /class-schedules
  const { data } = await api.put(`/class-schedules/${id}`, body);
  return { message: data?.message, schedule: unwrap(data) };
};

// 10.5 CANCEL SCHEDULE
// PATCH /class-schedules/:id/cancel
export const cancelSchedule = async (id) => {
  // FIXED: Changed /classschedules to /class-schedules
  const { data } = await api.patch(`/class-schedules/${id}/cancel`);
  return { message: data?.message, schedule: unwrap(data) };
};

// Helpers for the Class Schedules page

// An API field may be an id or a populated object, under several key names
export const pick = (o, ...keys) => {
  for (const k of keys) if (o?.[k] !== undefined && o[k] !== null) return o[k];
  return undefined;
};
export const relId = (v) => (v && typeof v === "object" ? v._id || v.id : v) || "";
export const relName = (v, map) => (v && typeof v === "object" ? v.name || v.title || v.full_name : map?.[v]) || "";

// "14:30" -> "2:30 PM"
export const fmtTime = (t) => {
  const m = /^(\d{1,2}):(\d{2})/.exec(t || "");
  if (!m) return t || "-";
  const h = Number(m[1]);
  return `${h % 12 || 12}:${m[2]} ${h >= 12 ? "PM" : "AM"}`;
};

export const SCHEDULE_STATUS_STYLES = {
  scheduled: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-200 text-gray-600",
};
export const scheduleStatusClass = (s) => SCHEDULE_STATUS_STYLES[String(s || "").toLowerCase()] || "bg-gray-100 text-gray-600";

/* ───── List / form constants ───── */

export const STATUSES = ["scheduled", "cancelled"];
export const emptyForm = { course_id: "", batch_id: "", faculty_id: "", subject: "", date: "", start_time: "", end_time: "" };
export const roleOf = (u) => (typeof u.role === "string" ? u.role : u.role?.name || u.roles?.[0]?.name || "");
export const today = () => new Date().toISOString().slice(0, 10);
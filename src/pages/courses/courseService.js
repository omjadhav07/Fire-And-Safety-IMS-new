import api from "../../services/api";

const unwrapList = (data, keys = []) => {
  const payload = data?.data ?? data;
  if (Array.isArray(payload)) return payload;
  for (const k of [...keys, "items", "rows"]) if (Array.isArray(payload?.[k])) return payload[k];
  return [];
};

// GET /courses
export const getCourses = async (params = {}) => {
  const { data } = await api.get("/courses", { params });
  return unwrapList(data, ["courses"]);
};

// POST /courses  { name, duration, description }
export const createCourse = async (body) => {
  const { data } = await api.post("/courses", body);
  return data?.data ?? data;
};

// GET /courses/:id/fee-components
// Returns { list, total } - total uses the API value if present, else sums the amounts.
export const getFeeComponents = async (courseId) => {
  const { data } = await api.get(`/courses/${courseId}/fee-components`);
  const payload = data?.data ?? data;
  const list = unwrapList(data, ["feeComponents", "fee_components", "components"]);
  const apiTotal = payload?.total_fee ?? payload?.totalFee ?? payload?.total ?? data?.meta?.total_fee;
  const total =
    apiTotal !== undefined && apiTotal !== null
      ? Number(apiTotal)
      : list.reduce((sum, f) => sum + Number(f.amount || 0), 0);
  return { list, total };
};

// POST /courses/:id/fee-components  { name, amount, required_for_exam }
export const addFeeComponent = async (courseId, body) => {
  const { data } = await api.post(`/courses/${courseId}/fee-components`, body);
  return data?.data ?? data;
};

// PUT /courses/fee-components/:componentId  { name, amount, required_for_exam }
// Note: the path has no course id - the component id alone identifies it.
export const updateFeeComponent = async (componentId, body) => {
  const { data } = await api.put(`/courses/fee-components/${componentId}`, body);
  return data?.data ?? data;
};

// GET /courses/:id/batches
export const getBatches = async (courseId) => {
  const { data } = await api.get(`/courses/${courseId}/batches`);
  return unwrapList(data, ["batches"]);
};

// POST /courses/:id/batches  { name, start_date, end_date }
export const createBatch = async (courseId, body) => {
  const { data } = await api.post(`/courses/${courseId}/batches`, body);
  return data?.data ?? data;
};

// PUT /courses/:id  { name, duration, description }
export const updateCourse = async (courseId, body) => {
  const { data } = await api.put(`/courses/${courseId}`, body);
  return data?.data ?? data;
};

// PATCH /courses/:id/status  { status: "active" | "inactive" }  (soft delete = inactive)
export const setCourseStatus = async (courseId, status) => {
  const { data } = await api.patch(`/courses/${courseId}/status`, { status });
  return data?.data ?? data;
};

// PUT /courses/:id/batches/:batchId  { name, start_date, end_date }
export const updateBatch = async (courseId, batchId, body) => {
  const { data } = await api.put(`/courses/${courseId}/batches/${batchId}`, body);
  return data?.data ?? data;
};

// PATCH /courses/:id/batches/:batchId/status  { status: "active" | "closed" }  (soft delete = closed)
export const setBatchStatus = async (courseId, batchId, status) => {
  const { data } = await api.patch(`/courses/${courseId}/batches/${batchId}/status`, { status });
  return data?.data ?? data;
};
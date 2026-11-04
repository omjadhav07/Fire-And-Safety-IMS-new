import api from "../../services/api";

const unwrap = (data) => data?.data ?? data;

// GET /enquiries  (list)
// NOTE: the API doc has no list endpoint, so this is an assumption. If it is missing
// the page falls back to showing enquiries created in the current session.
export const getEnquiries = async (params = {}) => {
  const { data } = await api.get("/enquiries", { params });
  const payload = unwrap(data);
  if (Array.isArray(payload)) return payload;
  return payload?.enquiries || payload?.items || payload?.rows || [];
};

// POST /enquiries  { name, phone, email, address, course_interest_id, source, notes }
export const createEnquiry = async (body) => {
  const { data } = await api.post("/enquiries", body);
  return unwrap(data);
};

// GET /enquiries/:id  (course_interest_id and created_by come back populated)
export const getEnquiryById = async (id) => {
  const { data } = await api.get(`/enquiries/${id}`);
  return unwrap(data);
};

// POST /enquiries/:id/convert  { dob, qualification, address, gender, guardian_name, guardian_phone }
// Returns { enquiry, student, account: { email, temporary_password, must_change_password }, fees_generated }
export const convertEnquiry = async (id, body) => {
  const { data } = await api.post(`/enquiries/${id}/convert`, body);
  return unwrap(data);
};

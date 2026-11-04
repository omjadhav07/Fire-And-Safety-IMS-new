import api from "../../services/api";

// GET /audit-logs  (Super Admin only). Params: page, limit, entity, action, from, to
export const getAuditLogs = async (params = {}) => {
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v != null));
  const { data } = await api.get("/audit-logs", { params: clean });
  const payload = data?.data ?? data;
  const list = Array.isArray(payload)
    ? payload
    : payload?.logs || payload?.auditLogs || payload?.items || payload?.rows || [];
  return { list, meta: data?.meta || payload?.meta || null };
};

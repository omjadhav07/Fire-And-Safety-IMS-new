// src/features/dashboard/dashboardService.js
import api from '../../services/api'; // <-- adjust to your existing axios/fetch wrapper

const BASE = '/dashboard';

export const getDashboardSummary       = () => api.get(`${BASE}/summary`).then((r) => r.data?.data ?? r.data);
export const getCourseWiseStudents     = () => api.get(`${BASE}/course-wise`).then((r) => r.data?.data ?? r.data);
export const getFeesTrend              = () => api.get(`${BASE}/fees-trend`).then((r) => r.data?.data ?? r.data);
export const getRecentActivity         = () => api.get(`${BASE}/recent-activity`).then((r) => r.data?.data ?? r.data);
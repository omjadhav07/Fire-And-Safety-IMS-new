import axios from "axios";
import BASE_URL from "../config/Config";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

// Attach the token saved at login to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the token is rejected, clear the session and go to login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const isLoginCall = error.config?.url?.includes("/auth/login");
    if (error.response?.status === 401 && !isLoginCall) {
      clearSession();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const clearSession = () => {
  ["token", "refreshToken", "isLoggedIn", "userData", "ims_recent_payments"].forEach((k) =>
    localStorage.removeItem(k)
  );
  sessionStorage.clear();
};
// POST /auth/refresh  { refreshToken }
// Uses plain axios (not `api`) so it never triggers the interceptor below.
// The backend rotates the refresh token, so the new one is saved too.
export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) throw new Error("No refresh token");

  const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
  const payload = data?.data ?? data;
  const token = payload?.accessToken || payload?.token;
  if (!token) throw new Error("Refresh succeeded but no token was returned");

  localStorage.setItem("token", token);
  if (payload?.refreshToken) localStorage.setItem("refreshToken", payload.refreshToken);
  return token;
};

// Attach the access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401: refresh once, then retry the original request.
// Parallel 401s share a single refresh call.
let refreshPromise = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const isAuthCall = original?.url?.includes("/auth/");

    if (error.response?.status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true;
      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
        const newToken = await refreshPromise;
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshError) {
        clearSession();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Backend error format: { success: false, code, message }
export const getErrorMessage = (error, fallback = "Something went wrong") =>
  error?.response?.data?.message ||
  (error?.code === "ERR_NETWORK" ? "Cannot reach the server. Is the API running on port 4000?" : null) ||
  error?.message ||
  fallback;

 export default api;
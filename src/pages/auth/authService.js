import api, { clearSession } from "../../services/api";

// POST /auth/login  { email, password }
export const loginUser = async ({ email, password }) => {
  const { data } = await api.post("/auth/login", { email, password });

  const payload = data?.data ?? data;
  const token = payload?.accessToken || payload?.token || data?.token;
  if (!token) throw new Error("Login succeeded but no token was returned");

  localStorage.setItem("token", token);
  if (payload?.refreshToken) localStorage.setItem("refreshToken", payload.refreshToken);
  localStorage.setItem("isLoggedIn", "true");
  if (payload?.user) localStorage.setItem("userData", JSON.stringify(payload.user));

  return payload;
};

// POST /auth/forgot-password  { email }
export const forgotPassword = async (email) => {
  const { data } = await api.post("/auth/forgot-password", { email });
  return data;
};

// POST /auth/reset-password  { token, password }
export const resetPassword = async ({ token, password }) => {
  const { data } = await api.post("/auth/reset-password", { token, password });
  return data;
};

// POST /auth/logout  (revokes the refresh token on the server)
// The local session is always cleared, even if the API call fails.
export const logoutUser = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    await api.post("/auth/logout", refreshToken ? { refreshToken } : {});
  } catch {
    // ignore: token may already be expired or revoked
  } finally {
    clearSession();
  }
};
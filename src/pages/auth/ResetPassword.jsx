import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Eye, EyeOff, KeyRound, ArrowLeft } from "lucide-react";
import { resetPassword } from "./authService";
import { getErrorMessage } from "../../services/api";

const inputClass =
  "w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/40 focus:border-[#0EA5E9]";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const tokenFromUrl = params.get("token") || "";

  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token.trim()) return setError("Reset token is required");
    if (password.length < 8) return setError("Password must be at least 8 characters");
    if (password !== confirm) return setError("Passwords do not match");

    setLoading(true);
    setError("");
    try {
      await resetPassword({ token: token.trim(), password });
      setSuccess("Password updated. Redirecting to login...");
      setTimeout(() => navigate("/login", { replace: true }), 1500);
    } catch (err) {
      setError(getErrorMessage(err, "Could not reset password"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5] p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-900">Reset password</h1>
        <p className="text-sm text-gray-500 mt-1 mb-6">Choose a new password for your account.</p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>
        )}
        {success && (
          <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3">{success}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {!tokenFromUrl && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Reset token</label>
              <div className="relative">
                <KeyRound size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste the token from your email"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">New password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="Minimum 8 characters"
                className={`${inputClass} pl-10 pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm password</label>
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
                setError("");
              }}
              placeholder="Re-enter password"
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !!success}
            className="w-full py-2.5 rounded-lg bg-[#0EA5E9] text-white font-medium hover:bg-[#0284C7] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Updating..." : "Update password"}
          </button>
        </form>

        <Link to="/login" className="mt-6 inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#0EA5E9]">
          <ArrowLeft size={16} /> Back to login
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword;
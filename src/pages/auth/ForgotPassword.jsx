import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Send, KeyRound, AlertCircle, CheckCircle2 } from "lucide-react";
import { forgotPassword } from "./authService";
import { getErrorMessage } from "../../services/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Enter a valid email address");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await forgotPassword(email.trim());
      setSuccess(res?.message || "If this email exists, a reset link has been sent.");
    } catch (err) {
      setError(getErrorMessage(err, "Could not send reset link"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50 p-4">
      {/* Decorative background */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-green-300/30 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-emerald-300/30 blur-3xl" />

      <div className="relative w-full max-w-md bg-white/90 backdrop-blur rounded-3xl shadow-xl shadow-green-900/10 border border-gray-100 p-8 sm:p-10">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-green-600/30 mb-6">
          <KeyRound size={26} />
        </div>

        <h1 className="text-3xl font-bold text-gray-900">Forgot password?</h1>
        <p className="text-gray-500 mt-2 mb-6 leading-relaxed">
          Enter your email and we will send you a reset link. The link is valid for{" "}
          <span className="font-semibold text-green-700">30 minutes</span>.
        </p>

        {error && (
          <div className="mb-5 flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-5 flex items-start gap-2 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Email
            </label>
            <div className="relative group">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-green-600"
              />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="admin@ims.com"
                className="w-full pl-11 pr-3 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:bg-white focus:border-green-600 focus:ring-4 focus:ring-green-600/10"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold shadow-lg shadow-green-600/30 transition-all duration-200 hover:from-green-700 hover:to-emerald-600 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send size={18} />
                Send reset link
              </>
            )}
          </button>
        </form>

        <Link
          to="/login"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-green-600 transition-colors"
        >
          <ArrowLeft size={16} /> Back to login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
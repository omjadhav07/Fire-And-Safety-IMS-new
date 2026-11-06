import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import { createUser } from "../users/userService";
import { getErrorMessage } from "../../services/api";

// Backend role names (roles.name)
const ROLE_OPTIONS = [
  { value: "office_staff", label: "Office Staff" },
  { value: "faculty", label: "Faculty" },
  { value: "librarian", label: "Librarian" },
];

const initialForm = { name: "", email: "", password: "", role: "faculty", phone: "" };

const inputClass =
  "w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/40 focus:border-[#0EA5E9]";

// "Register" = Super Admin creates a new staff user (POST /users)
const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setApiError("");
    setSuccess("");
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8) e.password = "Minimum 8 characters";
    if (!form.role) e.role = "Select a role";
    if (form.phone && !/^\d{10}$/.test(form.phone)) e.phone = "Enter a 10-digit mobile number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError("");
    try {
      const body = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      };
      if (form.phone) body.phone = form.phone;
      await createUser(body);
      setSuccess(`${body.name} was created successfully`);
      setForm(initialForm);
    } catch (err) {
      setApiError(getErrorMessage(err, "Could not create user"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add User</h1>
        <p className="text-sm text-gray-500 mt-1">Create an account for office staff, faculty or librarian</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {apiError && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
            {apiError}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5" noValidate>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Ritesh Kumar" className={inputClass} />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="ritesh@ims.com" className={inputClass} />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile</label>
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="9876543211" maxLength={10} className={inputClass} />
            {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
                className={`${inputClass} pr-10`}
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
            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
            <select name="role" value={form.role} onChange={handleChange} className={inputClass}>
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            {errors.role && <p className="text-xs text-red-600 mt-1">{errors.role}</p>}
          </div>

          <div className="sm:col-span-2 flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/users")}
              className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              View users
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0EA5E9] text-white font-medium hover:bg-[#0284C7] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <UserPlus size={18} />
              {loading ? "Creating..." : "Create user"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;

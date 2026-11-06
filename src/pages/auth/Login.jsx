// import React, { useState } from "react";
// import { useNavigate, useLocation, Link } from "react-router-dom";
// import { Eye, EyeOff, AlertCircle, Flame } from "lucide-react";
// import { loginUser } from "./authService";
// import { getErrorMessage } from "../../services/api";

// const ROLES = ["Administrators", "Accountants", "Faculty", "Librarians"];

// const Login = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const redirectTo = location.state?.from?.pathname || "/dashboard";

//   const [form, setForm] = useState({ email: "", password: "" });
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleChange = (e) => {
//     setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//     if (error) setError("");
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!form.email.trim() || !form.password) {
//       setError("Enter your email and password to continue.");
//       return;
//     }
//     setLoading(true);
//     setError("");
//     try {
//       await loginUser({ email: form.email.trim(), password: form.password });
//       navigate(redirectTo, { replace: true });
//     } catch (err) {
//       setError(getErrorMessage(err, "We couldn't sign you in. Check your details and try again."));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const inputClass =
//     "block w-full h-11 rounded-md border border-slate-300 bg-white px-3.5 text-[15px] text-slate-900 placeholder-slate-400 " +
//     "transition-colors focus:outline-none focus:border-sky-700 focus:ring-2 focus:ring-sky-700/20";

//   return (
//     <div className="min-h-screen grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] bg-white text-slate-900">
//       {/* Brand panel */}
//       <aside className="relative hidden lg:flex flex-col justify-between bg-[#0B1437] text-white px-14 py-12">
//         {/* Hazard-stripe edge: the one signature detail */}
//         <div
//           aria-hidden="true"
//           className="absolute inset-y-0 right-0 w-2"
//           style={{
//             backgroundImage:
//               "repeating-linear-gradient(135deg, #F5B820 0 10px, #0B1437 10px 20px)",
//           }}
//         />

//         <div className="flex items-center gap-3">
//           <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-[#0B1437]">
//             <Flame size={22} strokeWidth={2.25} />
//           </div>
//           <div className="leading-tight">
//             <p className="text-base font-semibold">Fire &amp; Safety College</p>
//             <p className="text-sm text-sky-100/70">Institute Management System</p>
//           </div>
//         </div>

//         <div className="max-w-md">
//           <h2 className="text-[34px] font-semibold leading-[1.2] tracking-tight">
//             Admissions, fees, exams and library in one system.
//           </h2>
//           <p className="mt-4 text-[15px] leading-relaxed text-sky-100/80">
//             Sign in with the account issued by the college office. What you see depends on your role.
//           </p>

//           <ul className="mt-8 divide-y divide-white/10 border-y border-white/10 text-[15px]">
//             {ROLES.map((r) => (
//               <li key={r} className="py-3 text-sky-50/90">
//                 {r}
//               </li>
//             ))}
//           </ul>
//         </div>

//         <p className="text-sm text-sky-100/60">
//           &copy; {new Date().getFullYear()} Fire &amp; Safety College. All rights reserved.
//         </p>
//       </aside>

//       {/* Form panel */}
//       <main className="flex flex-col justify-center px-6 py-12 sm:px-12">
//         <div className="mx-auto w-full max-w-[400px]">
//           {/* Mobile brand */}
//           <div className="mb-10 flex items-center gap-3 lg:hidden">
//             <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#0B1437] text-white">
//               <Flame size={22} strokeWidth={2.25} />
//             </div>
//             <div className="leading-tight">
//               <p className="text-base font-semibold">Fire &amp; Safety College</p>
//               <p className="text-sm text-slate-500">Institute Management System</p>
//             </div>
//           </div>

//           <h1 className="text-[28px] font-semibold tracking-tight">Sign in</h1>
//           <p className="mt-2 text-[15px] text-slate-600">Use your college email and password.</p>

//           {error && (
//             <div
//               role="alert"
//               className="mt-6 flex items-start gap-2.5 rounded-md border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-800"
//             >
//               <AlertCircle size={18} className="mt-0.5 shrink-0" />
//               <span>{error}</span>
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
//             <div>
//               <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-800">
//                 Email address
//               </label>
//               <input
//                 id="email"
//                 name="email"
//                 type="email"
//                 autoComplete="username"
//                 autoFocus
//                 value={form.email}
//                 onChange={handleChange}
//                 placeholder="name@college.com"
//                 className={inputClass}
//               />
//             </div>

//             <div>
//               <div className="mb-1.5 flex items-center justify-between">
//                 <label htmlFor="password" className="block text-sm font-medium text-slate-800">
//                   Password
//                 </label>
//                 <Link
//                   to="/forgot-password"
//                   className="rounded text-sm font-medium text-sky-800 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-700/40"
//                 >
//                   Forgot password?
//                 </Link>
//               </div>
//               <div className="relative">
//                 <input
//                   id="password"
//                   name="password"
//                   type={showPassword ? "text" : "password"}
//                   autoComplete="current-password"
//                   value={form.password}
//                   onChange={handleChange}
//                   placeholder="Enter your password"
//                   className={`${inputClass} pr-11`}
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword((s) => !s)}
//                   className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded text-slate-500 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-700/40"
//                   aria-label={showPassword ? "Hide password" : "Show password"}
//                 >
//                   {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                 </button>
//               </div>
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-sky-800 text-[15px] font-semibold text-white transition-colors hover:bg-sky-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
//             >
//               {loading && (
//                 <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
//               )}
//               {loading ? "Signing in" : "Sign in"}
//             </button>
//           </form>

//           <p className="mt-8 border-t border-slate-200 pt-6 text-sm text-slate-600">
//             Don&rsquo;t have an account? Ask the college office or your administrator to create one.
//           </p>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default Login;




// import React, { useState } from "react";
// import { useNavigate, useLocation, Link } from "react-router-dom";
// import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Flame } from "lucide-react";
// import { loginUser } from "./authService";
// import { getErrorMessage } from "../../services/api";

// /*
//   HERO IMAGE
//   File lives in the public folder, so the URL starts with "/" (no "public").
//   If the file is missing, a dark orange-brown gradient shows instead.
// */
// const HERO_IMAGE = "/Firefighters Battling a Blazing Inferno.png";

// const Login = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const redirectTo = location.state?.from?.pathname || "/dashboard";

//   const [form, setForm] = useState({ email: "", password: "" });
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleChange = (e) => {
//     setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//     if (error) setError("");
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!form.email.trim() || !form.password) {
//       setError("Enter your email and password to continue.");
//       return;
//     }
//     setLoading(true);
//     setError("");
//     try {
//       await loginUser({ email: form.email.trim(), password: form.password });
//       navigate(redirectTo, { replace: true });
//     } catch (err) {
//       setError(getErrorMessage(err, "We couldn't sign you in. Check your details and try again."));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const inputClass =
//     "block w-full h-12 rounded-xl border border-stone-200 bg-stone-50 pl-11 pr-4 text-[15px] text-stone-900 placeholder-stone-400 " +
//     "transition focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15";

//   return (
//     <div className="min-h-screen bg-white lg:grid lg:grid-cols-[minmax(0,11fr)_minmax(0,9fr)]">
//       {/* Photo panel */}
//       <section
//         className="relative hidden overflow-hidden lg:block"
//         style={{
//           backgroundImage: `linear-gradient(to top, rgba(12,6,3,0.92) 0%, rgba(12,6,3,0.25) 45%, rgba(12,6,3,0.45) 100%), url('${HERO_IMAGE}'), linear-gradient(135deg, #3a1707, #0b0504)`,
//           backgroundSize: "cover",
//           backgroundPosition: "70% center",
//         }}
//       >
//         {/* Orange corner wedge */}
//         <div
//           aria-hidden="true"
//           className="absolute right-0 top-0 h-40 w-40 bg-orange-500"
//           style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
//         />

//         {/* Logo */}
//         <div className="absolute left-10 top-10 flex items-center gap-3 text-white">
//           <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 shadow-lg shadow-orange-500/30">
//             <Flame size={22} />
//           </span>
//           <span className="text-lg font-bold">Fire &amp; Safety College</span>
//         </div>

//         {/* Message */}
//         <div className="absolute inset-x-10 bottom-12 max-w-xl text-white">
//           <span className="block h-1 w-14 rounded-full bg-orange-500" />
//           <h2 className="mt-5 text-4xl font-bold leading-tight xl:text-[44px]">
//             Trained to protect lives.
//           </h2>
//           <p className="mt-3 max-w-md text-[15px] leading-relaxed text-stone-200">
//             Manage admissions, fees, exams and library for the college from one secure place.
//           </p>
//         </div>
//       </section>

//       {/* Form panel */}
//       <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-12 lg:min-h-0">
//         <div className="w-full max-w-[380px]">
//           {/* Mobile brand */}
//           <div className="mb-10 flex items-center gap-3 lg:hidden">
//             <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 text-white shadow-lg shadow-orange-500/30">
//               <Flame size={22} />
//             </span>
//             <span className="text-lg font-bold text-stone-900">Fire &amp; Safety College</span>
//           </div>

//           <h1 className="text-[32px] font-bold tracking-tight text-stone-900">Sign in</h1>
//           <p className="mt-2 text-stone-500">Welcome back. Enter your details to continue.</p>

//           {error && (
//             <div
//               role="alert"
//               className="mt-6 flex items-start gap-2.5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200"
//             >
//               <AlertCircle size={18} className="mt-0.5 shrink-0" />
//               <span>{error}</span>
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
//             <div>
//               <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-stone-700">
//                 Email
//               </label>
//               <div className="group relative">
//                 <Mail
//                   size={18}
//                   className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 transition-colors group-focus-within:text-orange-500"
//                 />
//                 <input
//                   id="email"
//                   name="email"
//                   type="email"
//                   autoComplete="username"
//                   autoFocus
//                   value={form.email}
//                   onChange={handleChange}
//                   placeholder="you@college.com"
//                   className={inputClass}
//                 />
//               </div>
//             </div>

//             <div>
//               <div className="mb-1.5 flex items-center justify-between">
//                 <label htmlFor="password" className="text-sm font-medium text-stone-700">
//                   Password
//                 </label>
//                 <Link
//                   to="/forgot-password"
//                   className="rounded text-sm font-medium text-orange-600 hover:text-orange-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40"
//                 >
//                   Forgot password?
//                 </Link>
//               </div>
//               <div className="group relative">
//                 <Lock
//                   size={18}
//                   className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 transition-colors group-focus-within:text-orange-500"
//                 />
//                 <input
//                   id="password"
//                   name="password"
//                   type={showPassword ? "text" : "password"}
//                   autoComplete="current-password"
//                   value={form.password}
//                   onChange={handleChange}
//                   placeholder="Enter your password"
//                   className={`${inputClass} pr-12`}
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword((s) => !s)}
//                   className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40"
//                   aria-label={showPassword ? "Hide password" : "Show password"}
//                 >
//                   {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                 </button>
//               </div>
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 text-[15px] font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-500/30 disabled:cursor-not-allowed disabled:opacity-60"
//             >
//               {loading ? (
//                 <>
//                   <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
//                   Signing in
//                 </>
//               ) : (
//                 <>
//                   Sign in
//                   <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
//                 </>
//               )}
//             </button>
//           </form>

//           <p className="mt-8 text-center text-sm text-stone-500">
//             Need an account? Contact the college office.
//           </p>
//         </div>
//       </section>
//     </div>
//   );
// };

// export default Login;


import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Flame } from "lucide-react";
import { loginUser } from "./authService";
import { getErrorMessage } from "../../services/api";

/*
  HERO IMAGE
  File lives in the public folder, so the URL starts with "/" (no "public").
  If the file is missing, a dark green gradient shows instead.
*/
const HERO_IMAGE = "/Firefighters Battling a Blazing Inferno.png";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/dashboard";

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password) {
      setError("Enter your email and password to continue.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await loginUser({ email: form.email.trim(), password: form.password });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "We couldn't sign you in. Check your details and try again."));
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "block w-full h-12 rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-[15px] text-gray-900 placeholder-gray-400 " +
    "transition focus:outline-none focus:bg-white focus:border-sky-600 focus:ring-4 focus:ring-sky-600/15";

  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-[minmax(0,11fr)_minmax(0,9fr)]">
      {/* Photo panel */}
      <section
        className="relative hidden overflow-hidden lg:block"
        style={{
          backgroundImage: `linear-gradient(to top, rgba(3,24,12,0.92) 0%, rgba(3,24,12,0.25) 45%, rgba(3,24,12,0.45) 100%), url('${HERO_IMAGE}'), linear-gradient(135deg, #0b3d22, #04140b)`,
          backgroundSize: "cover",
          backgroundPosition: "70% center",
        }}
      >
        {/* Green corner wedge */}
        <div
          aria-hidden="true"
          className="absolute right-0 top-0 h-40 w-40 bg-sky-600"
          style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
        />

        {/* Logo */}
        <div className="absolute left-10 top-10 flex items-center gap-3 text-white">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-600 shadow-lg shadow-sky-600/30">
            <Flame size={22} />
          </span>
          <span className="text-lg font-bold">Fire &amp; Safety College</span>
        </div>

        {/* Message */}
        <div className="absolute inset-x-10 bottom-12 max-w-xl text-white">
          <span className="block h-1 w-14 rounded-full bg-sky-600" />
          <h2 className="mt-5 text-4xl font-bold leading-tight xl:text-[44px]">
            Trained to protect lives.
          </h2>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-gray-200">
            Manage admissions, fees, exams and library for the college from one secure place.
          </p>
        </div>
      </section>

      {/* Form panel */}
      <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-12 lg:min-h-0">
        <div className="w-full max-w-[380px]">
          {/* Mobile brand */}
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-600 text-white shadow-lg shadow-sky-600/30">
              <Flame size={22} />
            </span>
            <span className="text-lg font-bold text-gray-900">Fire &amp; Safety College</span>
          </div>

          <h1 className="text-[32px] font-bold tracking-tight text-gray-900">Sign in</h1>
          <p className="mt-2 text-gray-500">Welcome back. Enter your details to continue.</p>

          {error && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-2.5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200"
            >
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="group relative">
                <Mail
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-sky-600"
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  autoFocus
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@college.com"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="rounded text-sm font-medium text-sky-700 hover:text-sky-800 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-600/40"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="group relative">
                <Lock
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-sky-600"
                />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`${inputClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-600/40"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-sky-600 text-[15px] font-semibold text-white shadow-lg shadow-sky-600/30 transition hover:bg-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-600/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Signing in
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Need an account? Contact the college office.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Login;
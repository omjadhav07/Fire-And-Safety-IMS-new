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
//     "transition-colors focus:outline-none focus:border-green-700 focus:ring-2 focus:ring-green-700/20";

//   return (
//     <div className="min-h-screen grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] bg-white text-slate-900">
//       {/* Brand panel */}
//       <aside className="relative hidden lg:flex flex-col justify-between bg-[#0E3B2C] text-white px-14 py-12">
//         {/* Hazard-stripe edge: the one signature detail */}
//         <div
//           aria-hidden="true"
//           className="absolute inset-y-0 right-0 w-2"
//           style={{
//             backgroundImage:
//               "repeating-linear-gradient(135deg, #F5B820 0 10px, #0E3B2C 10px 20px)",
//           }}
//         />

//         <div className="flex items-center gap-3">
//           <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-[#0E3B2C]">
//             <Flame size={22} strokeWidth={2.25} />
//           </div>
//           <div className="leading-tight">
//             <p className="text-base font-semibold">Fire &amp; Safety College</p>
//             <p className="text-sm text-green-100/70">Institute Management System</p>
//           </div>
//         </div>

//         <div className="max-w-md">
//           <h2 className="text-[34px] font-semibold leading-[1.2] tracking-tight">
//             Admissions, fees, exams and library in one system.
//           </h2>
//           <p className="mt-4 text-[15px] leading-relaxed text-green-100/80">
//             Sign in with the account issued by the college office. What you see depends on your role.
//           </p>

//           <ul className="mt-8 divide-y divide-white/10 border-y border-white/10 text-[15px]">
//             {ROLES.map((r) => (
//               <li key={r} className="py-3 text-green-50/90">
//                 {r}
//               </li>
//             ))}
//           </ul>
//         </div>

//         <p className="text-sm text-green-100/60">
//           &copy; {new Date().getFullYear()} Fire &amp; Safety College. All rights reserved.
//         </p>
//       </aside>

//       {/* Form panel */}
//       <main className="flex flex-col justify-center px-6 py-12 sm:px-12">
//         <div className="mx-auto w-full max-w-[400px]">
//           {/* Mobile brand */}
//           <div className="mb-10 flex items-center gap-3 lg:hidden">
//             <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#0E3B2C] text-white">
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
//                   className="rounded text-sm font-medium text-green-800 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700/40"
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
//                   className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded text-slate-500 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700/40"
//                   aria-label={showPassword ? "Hide password" : "Show password"}
//                 >
//                   {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                 </button>
//               </div>
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-green-800 text-[15px] font-semibold text-white transition-colors hover:bg-green-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
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

// /* Shield + flame illustration (inline SVG, no external assets) */
// const ShieldFlame = () => (
//   <svg viewBox="0 0 400 400" className="w-full h-full" aria-hidden="true">
//     <defs>
//       <linearGradient id="flameOuter" x1="0" y1="0" x2="0" y2="1">
//         <stop offset="0" stopColor="#FBBF24" />
//         <stop offset="1" stopColor="#F97316" />
//       </linearGradient>
//       <linearGradient id="flameInner" x1="0" y1="0" x2="0" y2="1">
//         <stop offset="0" stopColor="#FEF3C7" />
//         <stop offset="1" stopColor="#FCD34D" />
//       </linearGradient>
//       <linearGradient id="shieldFill" x1="0" y1="0" x2="0" y2="1">
//         <stop offset="0" stopColor="#ffffff" stopOpacity="0.18" />
//         <stop offset="1" stopColor="#ffffff" stopOpacity="0.04" />
//       </linearGradient>
//     </defs>

//     <circle cx="200" cy="200" r="190" fill="none" stroke="#fff" strokeOpacity="0.08" />
//     <circle cx="200" cy="200" r="150" fill="none" stroke="#fff" strokeOpacity="0.1" />

//     <path
//       d="M200 38 L322 86 V196 C322 276 268 332 200 360 C132 332 78 276 78 196 V86 Z"
//       fill="url(#shieldFill)"
//       stroke="#fff"
//       strokeOpacity="0.55"
//       strokeWidth="2"
//     />

//     <g className="ims-flame">
//       <path
//         d="M200 112 C214 146 246 160 246 206 C246 238 226 258 200 258 C174 258 154 238 154 206 C154 184 168 170 178 156 C180 172 188 180 196 180 C190 156 192 134 200 112 Z"
//         fill="url(#flameOuter)"
//       />
//       <path
//         d="M200 176 C208 196 224 204 224 226 C224 242 213 252 200 252 C187 252 176 242 176 226 C176 214 184 206 190 198 C192 206 196 210 199 210 C197 198 197 188 200 176 Z"
//         fill="url(#flameInner)"
//       />
//     </g>
//   </svg>
// );

// const Chip = ({ children, className = "" }) => (
//   <span
//     className={`absolute rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white ring-1 ring-white/25 backdrop-blur ${className}`}
//   >
//     {children}
//   </span>
// );

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
//     "block w-full h-12 rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-[15px] text-slate-900 placeholder-slate-400 " +
//     "transition focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10";

//   return (
//     <div className="min-h-screen bg-emerald-50/50 p-3 sm:p-5">
//       <style>{`
//         @keyframes imsFlicker {
//           0%, 100% { transform: scale(1) translateY(0); }
//           50% { transform: scale(1.03, 1.05) translateY(-3px); }
//         }
//         .ims-flame { transform-origin: 200px 258px; animation: imsFlicker 3.2s ease-in-out infinite; }
//         @media (prefers-reduced-motion: reduce) { .ims-flame { animation: none; } }
//       `}</style>

//       <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] sm:min-h-[calc(100vh-2.5rem)] max-w-[1280px] overflow-hidden rounded-[28px] bg-white shadow-[0_20px_60px_-20px_rgba(6,78,59,0.25)] lg:grid-cols-2">
//         {/* Illustration panel */}
//         <section className="relative m-3 hidden overflow-hidden rounded-3xl bg-gradient-to-b from-emerald-800 to-emerald-950 lg:block">
//           <div className="absolute left-8 top-8 flex items-center gap-2.5 text-white">
//             <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/25">
//               <Flame size={18} />
//             </span>
//             <span className="text-[15px] font-semibold">Fire &amp; Safety College</span>
//           </div>

//           <div className="absolute left-1/2 top-[44%] h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2">
//             <ShieldFlame />
//             <Chip className="-left-16 top-16">Fees &amp; receipts</Chip>
//             <Chip className="-right-14 top-32">Exams</Chip>
//             <Chip className="-left-10 bottom-24">Class schedule</Chip>
//             <Chip className="-right-12 bottom-10">Library</Chip>
//           </div>

//           <div className="absolute inset-x-8 bottom-8 text-white">
//             <h2 className="text-3xl font-semibold leading-tight">Everything your college runs on, in one place.</h2>
//             <p className="mt-2 text-emerald-100/80">Students, fees, exams and books, simply organised.</p>
//           </div>
//         </section>

//         {/* Form panel */}
//         <section className="flex items-center justify-center px-6 py-12 sm:px-12">
//           <div className="w-full max-w-[380px]">
//             <div className="mb-10 flex items-center gap-2.5 lg:hidden">
//               <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-white">
//                 <Flame size={20} />
//               </span>
//               <span className="text-[15px] font-semibold text-slate-900">Fire &amp; Safety College</span>
//             </div>

//             <h1 className="text-[32px] font-bold tracking-tight text-slate-900">Sign in</h1>
//             <p className="mt-2 text-slate-500">Welcome back. Enter your details to continue.</p>

//             {error && (
//               <div
//                 role="alert"
//                 className="mt-6 flex items-start gap-2.5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200"
//               >
//                 <AlertCircle size={18} className="mt-0.5 shrink-0" />
//                 <span>{error}</span>
//               </div>
//             )}

//             <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
//               <div>
//                 <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
//                   Email
//                 </label>
//                 <div className="relative group">
//                   <Mail
//                     size={18}
//                     className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-600"
//                   />
//                   <input
//                     id="email"
//                     name="email"
//                     type="email"
//                     autoComplete="username"
//                     autoFocus
//                     value={form.email}
//                     onChange={handleChange}
//                     placeholder="you@college.com"
//                     className={inputClass}
//                   />
//                 </div>
//               </div>

//               <div>
//                 <div className="mb-1.5 flex items-center justify-between">
//                   <label htmlFor="password" className="text-sm font-medium text-slate-700">
//                     Password
//                   </label>
//                   <Link
//                     to="/forgot-password"
//                     className="rounded text-sm font-medium text-emerald-700 hover:text-emerald-800 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/40"
//                   >
//                     Forgot password?
//                   </Link>
//                 </div>
//                 <div className="relative group">
//                   <Lock
//                     size={18}
//                     className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-600"
//                   />
//                   <input
//                     id="password"
//                     name="password"
//                     type={showPassword ? "text" : "password"}
//                     autoComplete="current-password"
//                     value={form.password}
//                     onChange={handleChange}
//                     placeholder="Enter your password"
//                     className={`${inputClass} pr-12`}
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword((s) => !s)}
//                     className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/40"
//                     aria-label={showPassword ? "Hide password" : "Show password"}
//                   >
//                     {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                   </button>
//                 </div>
//               </div>

//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 text-[15px] font-semibold text-white shadow-lg shadow-emerald-700/25 transition hover:bg-emerald-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-600/30 disabled:cursor-not-allowed disabled:opacity-60"
//               >
//                 {loading ? (
//                   <>
//                     <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
//                     Signing in
//                   </>
//                 ) : (
//                   <>
//                     Sign in
//                     <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
//                   </>
//                 )}
//               </button>
//             </form>

//             <p className="mt-8 text-center text-sm text-slate-500">
//               Need an account? Contact the college office.
//             </p>
//           </div>
//         </section>
//       </div>
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
  If the file is missing, a dark orange-brown gradient shows instead.
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
    "block w-full h-12 rounded-xl border border-stone-200 bg-stone-50 pl-11 pr-4 text-[15px] text-stone-900 placeholder-stone-400 " +
    "transition focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15";

  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-[minmax(0,11fr)_minmax(0,9fr)]">
      {/* Photo panel */}
      <section
        className="relative hidden overflow-hidden lg:block"
        style={{
          backgroundImage: `linear-gradient(to top, rgba(12,6,3,0.92) 0%, rgba(12,6,3,0.25) 45%, rgba(12,6,3,0.45) 100%), url('${HERO_IMAGE}'), linear-gradient(135deg, #3a1707, #0b0504)`,
          backgroundSize: "cover",
          backgroundPosition: "70% center",
        }}
      >
        {/* Orange corner wedge */}
        <div
          aria-hidden="true"
          className="absolute right-0 top-0 h-40 w-40 bg-orange-500"
          style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
        />

        {/* Logo */}
        <div className="absolute left-10 top-10 flex items-center gap-3 text-white">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 shadow-lg shadow-orange-500/30">
            <Flame size={22} />
          </span>
          <span className="text-lg font-bold">Fire &amp; Safety College</span>
        </div>

        {/* Message */}
        <div className="absolute inset-x-10 bottom-12 max-w-xl text-white">
          <span className="block h-1 w-14 rounded-full bg-orange-500" />
          <h2 className="mt-5 text-4xl font-bold leading-tight xl:text-[44px]">
            Trained to protect lives.
          </h2>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-stone-200">
            Manage admissions, fees, exams and library for the college from one secure place.
          </p>
        </div>
      </section>

      {/* Form panel */}
      <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-12 lg:min-h-0">
        <div className="w-full max-w-[380px]">
          {/* Mobile brand */}
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 text-white shadow-lg shadow-orange-500/30">
              <Flame size={22} />
            </span>
            <span className="text-lg font-bold text-stone-900">Fire &amp; Safety College</span>
          </div>

          <h1 className="text-[32px] font-bold tracking-tight text-stone-900">Sign in</h1>
          <p className="mt-2 text-stone-500">Welcome back. Enter your details to continue.</p>

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
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-stone-700">
                Email
              </label>
              <div className="group relative">
                <Mail
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 transition-colors group-focus-within:text-orange-500"
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
                <label htmlFor="password" className="text-sm font-medium text-stone-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="rounded text-sm font-medium text-orange-600 hover:text-orange-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="group relative">
                <Lock
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 transition-colors group-focus-within:text-orange-500"
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
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 text-[15px] font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-500/30 disabled:cursor-not-allowed disabled:opacity-60"
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

          <p className="mt-8 text-center text-sm text-stone-500">
            Need an account? Contact the college office.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Login;
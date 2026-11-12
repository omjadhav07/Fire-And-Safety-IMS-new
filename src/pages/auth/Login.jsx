// import React, { useState } from "react";
// import { useNavigate, useLocation, Link } from "react-router-dom";
// import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
// import { loginUser } from "./authService";
// import { getErrorMessage } from "../../services/api";

// /*
//   HERO IMAGE
//   File lives in the public folder, so the URL starts with "/" (no "public").
//   If the file is missing, a dark green gradient shows instead.
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
//     "block w-full h-12 rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-[15px] text-gray-900 placeholder-gray-400 " +
//     "transition focus:outline-none focus:bg-white focus:border-sky-600 focus:ring-4 focus:ring-sky-600/15";

//   return (
//     <div className="min-h-screen bg-white lg:grid lg:grid-cols-[minmax(0,11fr)_minmax(0,9fr)]">
//       {/* Photo panel */}
//       <section
//         className="relative hidden overflow-hidden lg:block"
//         style={{
//           backgroundImage: `linear-gradient(to top, rgba(3,24,12,0.92) 0%, rgba(3,24,12,0.25) 45%, rgba(3,24,12,0.45) 100%), url('${HERO_IMAGE}'), linear-gradient(135deg, #0b3d22, #04140b)`,
//           backgroundSize: "cover",
//           backgroundPosition: "70% center",
//         }}
//       >
//         {/* Green corner wedge */}
//         <div
//           aria-hidden="true"
//           className="absolute right-0 top-0 h-40 w-40 bg-sky-600"
//           style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
//         />

//         {/* Logo */}
//         <div className="absolute left-10 top-10 rounded-xl bg-white px-4 py-2.5 shadow-lg">
//           <img src="/logo.png" alt="Sahyadri College of Fire Engineering and Safety Management" className="h-14 w-auto" />
//         </div>

//         {/* Message */}
//         <div className="absolute inset-x-10 bottom-12 max-w-xl text-white">
//           <span className="block h-1 w-14 rounded-full bg-sky-600" />
//           <h2 className="mt-5 text-4xl font-bold leading-tight xl:text-[44px]">
//             Trained to protect lives.
//           </h2>
//           <p className="mt-3 max-w-md text-[15px] leading-relaxed text-gray-200">
//             Manage admissions, fees, exams and library for the college from one secure place.
//           </p>
//         </div>
//       </section>

//       {/* Form panel */}
//       <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-12 lg:min-h-0">
//         <div className="w-full max-w-[380px]">
//           {/* Mobile brand */}
//           <div className="mb-10 flex justify-center lg:hidden">
//             <img src="/logo.png" alt="Sahyadri College of Fire Engineering and Safety Management" className="h-14 w-auto max-w-full" />
//           </div>

//           <h1 className="text-[32px] font-bold tracking-tight text-gray-900">Sign in</h1>
//           <p className="mt-2 text-gray-500">Welcome back. Enter your details to continue.</p>

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
//               <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
//                 Email
//               </label>
//               <div className="group relative">
//                 <Mail
//                   size={18}
//                   className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-sky-600"
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
//                 <label htmlFor="password" className="text-sm font-medium text-gray-700">
//                   Password
//                 </label>
//                 <Link
//                   to="/forgot-password"
//                   className="rounded text-sm font-medium text-sky-700 hover:text-sky-800 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-600/40"
//                 >
//                   Forgot password?
//                 </Link>
//               </div>
//               <div className="group relative">
//                 <Lock
//                   size={18}
//                   className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-sky-600"
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
//                   className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-600/40"
//                   aria-label={showPassword ? "Hide password" : "Show password"}
//                 >
//                   {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                 </button>
//               </div>
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-sky-600 text-[15px] font-semibold text-white shadow-lg shadow-sky-600/30 transition hover:bg-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-600/30 disabled:cursor-not-allowed disabled:opacity-60"
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

//           <p className="mt-8 text-center text-sm text-gray-500">
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
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
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
          
          {/* Logo above Sign in */}
          <div className="mb-8 flex justify-start">
            <img src="/logo.png" alt="Sahyadri College of Fire Engineering and Safety Management" className="h-14 w-auto max-w-full" />
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
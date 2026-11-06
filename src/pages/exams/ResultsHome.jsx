// import React, { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Search, RefreshCw, Award } from "lucide-react";
// import api from "../../services/api";
// import { getCourses, getBatches } from "../courses/courseService";
// import { getErrorMessage } from "../../services/api";
// import { getId, fmtDate, titleCase, inputClass } from "../../services/helpers";
// import { pick, relId, relName } from "../schedules/scheduleUtils";

// // GET /exams  - read here so this page does not depend on the exam service file
// const loadExams = async () => {
//   const { data } = await api.get("/exams", { params: { page: 1, limit: 50 } });
//   const payload = data?.data ?? data;
//   if (Array.isArray(payload)) return payload;
//   return payload?.exams || payload?.items || payload?.rows || [];
// };

// // Results: pick an exam to view, publish or unpublish its results.
// const ResultsHome = () => {
//   const navigate = useNavigate();
//   const [exams, setExams] = useState([]);
//   const [courseNames, setCourseNames] = useState({});
//   const [batchNames, setBatchNames] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [reloadKey, setReloadKey] = useState(0);
//   const [query, setQuery] = useState("");
//   const [examId, setExamId] = useState("");
//   const [idError, setIdError] = useState("");

//   // GET /exams
//   useEffect(() => {
//     let cancelled = false;
//     loadExams()
//       .then(async (list) => {
//         const courseIds = [...new Set(list.map((x) => relId(pick(x, "course_id", "course"))).filter(Boolean))];
//         const [courses, ...batchLists] = await Promise.all([
//           getCourses().catch(() => []),
//           ...courseIds.map((id) => getBatches(id).catch(() => [])),
//         ]);
//         if (cancelled) return;
//         setCourseNames(Object.fromEntries(courses.map((c) => [getId(c), c.name])));
//         setBatchNames(Object.fromEntries(batchLists.flat().map((b) => [getId(b), b.name])));
//         setExams(list);
//         setError("");
//       })
//       .catch((err) => !cancelled && setError(getErrorMessage(err, "Could not load the exams")))
//       .finally(() => !cancelled && setLoading(false));
//     return () => {
//       cancelled = true;
//     };
//   }, [reloadKey]);

//   const reload = () => {
//     setLoading(true);
//     setReloadKey((k) => k + 1);
//   };

//   const filtered = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     return q ? exams.filter((x) => [x.title, x.name, x.subject].some((v) => String(v ?? "").toLowerCase().includes(q))) : exams;
//   }, [exams, query]);

//   const open = (id) => navigate(`/exams/${encodeURIComponent(id)}/results`);

//   const openById = (e) => {
//     e.preventDefault();
//     if (!examId.trim()) return setIdError("Enter the exam ID");
//     open(examId.trim());
//   };

//   return (
//     <div>
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Results</h1>
//           <p className="text-sm text-gray-500 mt-1">Pick an exam to view, publish or withdraw its results</p>
//         </div>
//         <button onClick={reload} className="self-start p-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50" aria-label="Refresh">
//           <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
//         </button>
//       </div>

//       <div className="relative mb-4 max-w-md">
//         <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//         <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search exams by title or subject" className={`${inputClass} pl-9 bg-white`} />
//       </div>

//       {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>}

//       <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
//         <table className="w-full text-sm text-left">
//           <thead className="bg-[#0B1437] text-white">
//             <tr>
//               <th className="px-4 py-3 font-medium">Exam</th>
//               <th className="px-4 py-3 font-medium">Course / Batch</th>
//               <th className="px-4 py-3 font-medium">Exam date</th>
//               <th className="px-4 py-3 font-medium">Status</th>
//               <th className="px-4 py-3 font-medium text-right">Results</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-100">
//             {loading ? (
//               <tr>
//                 <td colSpan={5} className="px-4 py-10 text-center text-gray-500">Loading exams...</td>
//               </tr>
//             ) : filtered.length === 0 ? (
//               <tr>
//                 <td colSpan={5} className="px-4 py-10 text-center text-gray-500">{exams.length === 0 ? "No exams found." : "No exams match your search."}</td>
//               </tr>
//             ) : (
//               filtered.map((x) => (
//                 <tr key={getId(x)} className="hover:bg-gray-50">
//                   <td className="px-4 py-3">
//                     <p className="font-medium text-gray-900">{x.title || x.name}</p>
//                     <p className="text-xs text-gray-500">{x.subject}</p>
//                   </td>
//                   <td className="px-4 py-3">
//                     <p className="text-gray-900">{relName(pick(x, "course_id", "course"), courseNames) || "-"}</p>
//                     <p className="text-xs text-gray-500">{relName(pick(x, "batch_id", "batch"), batchNames) || "-"}</p>
//                   </td>
//                   <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmtDate(x.exam_date)}</td>
//                   <td className="px-4 py-3 text-gray-600">{titleCase(x.status || "")}</td>
//                   <td className="px-4 py-3 text-right">
//                     <button
//                       onClick={() => open(getId(x))}
//                       className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sky-700 hover:bg-sky-50 text-xs font-medium"
//                     >
//                       <Award size={15} /> View results
//                     </button>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       <form onSubmit={openById} className="mt-6 max-w-md rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-3" noValidate>
//         <p className="text-sm font-medium text-gray-900">Have an exam ID?</p>
//         {idError && <p className="text-sm text-red-600">{idError}</p>}
//         <div className="flex gap-2">
//           <input
//             value={examId}
//             onChange={(e) => {
//               setExamId(e.target.value);
//               setIdError("");
//             }}
//             placeholder="Paste the exam ID"
//             className={inputClass}
//           />
//           <button type="submit" className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 whitespace-nowrap">
//             Open
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default ResultsHome;


import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, RefreshCw, Award } from "lucide-react";
import api from "../../services/api";
import { getCourses, getBatches } from "../courses/courseService";
import { getErrorMessage } from "../../services/api";
import { getId, fmtDate, titleCase, inputClass } from "../../services/helpers";
import { pick, relId, relName } from "../schedules/scheduleUtils";

// GET /exams  - read here so this page does not depend on the exam service file
const loadExams = async () => {
  const { data } = await api.get("/exams", { params: { page: 1, limit: 50 } });
  const payload = data?.data ?? data;
  if (Array.isArray(payload)) return payload;
  return payload?.exams || payload?.items || payload?.rows || [];
};

// Results: pick an exam to view, publish or unpublish its results.
const ResultsHome = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [courseNames, setCourseNames] = useState({});
  const [batchNames, setBatchNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [query, setQuery] = useState("");

  // GET /exams
  useEffect(() => {
    let cancelled = false;
    loadExams()
      .then(async (list) => {
        const courseIds = [...new Set(list.map((x) => relId(pick(x, "course_id", "course"))).filter(Boolean))];
        const [courses, ...batchLists] = await Promise.all([
          getCourses().catch(() => []),
          ...courseIds.map((id) => getBatches(id).catch(() => [])),
        ]);
        if (cancelled) return;
        setCourseNames(Object.fromEntries(courses.map((c) => [getId(c), c.name])));
        setBatchNames(Object.fromEntries(batchLists.flat().map((b) => [getId(b), b.name])));
        setExams(list);
        setError("");
      })
      .catch((err) => !cancelled && setError(getErrorMessage(err, "Could not load the exams")))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const reload = () => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? exams.filter((x) => [x.title, x.name, x.subject].some((v) => String(v ?? "").toLowerCase().includes(q))) : exams;
  }, [exams, query]);

  const open = (id) => navigate(`/exams/${encodeURIComponent(id)}/results`);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Results</h1>
          <p className="text-sm text-gray-500 mt-1">Pick an exam to view, publish or withdraw its results</p>
        </div>
        <button onClick={reload} className="self-start p-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50" aria-label="Refresh">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="relative mb-4 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search exams by title or subject" className={`${inputClass} pl-9 bg-white`} />
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#0B1437] text-white">
            <tr>
              <th className="px-4 py-3 font-medium">Exam</th>
              <th className="px-4 py-3 font-medium">Course / Batch</th>
              <th className="px-4 py-3 font-medium">Exam date</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Results</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-500">Loading exams...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-500">{exams.length === 0 ? "No exams found." : "No exams match your search."}</td>
              </tr>
            ) : (
              filtered.map((x) => (
                <tr key={getId(x)} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{x.title || x.name}</p>
                    <p className="text-xs text-gray-500">{x.subject}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-900">{relName(pick(x, "course_id", "course"), courseNames) || "-"}</p>
                    <p className="text-xs text-gray-500">{relName(pick(x, "batch_id", "batch"), batchNames) || "-"}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmtDate(x.exam_date)}</td>
                  <td className="px-4 py-3 text-gray-600">{titleCase(x.status || "")}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => open(getId(x))}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sky-700 hover:bg-sky-50 text-xs font-medium"
                    >
                      <Award size={15} /> View results
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsHome;
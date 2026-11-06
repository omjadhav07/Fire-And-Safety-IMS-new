// import React, { useCallback, useEffect, useMemo, useState } from "react";
// import { Link, useLocation, useParams } from "react-router-dom";
// import { ArrowLeft, RefreshCw, Save, History, Trash2, Send, EyeOff } from "lucide-react";
// import {
//   getExamById,
//   getExamResults,
//   getExamMarkHistory,
//   saveExamMarksBulk,
//   updateExamMark,
//   deleteExamMark,
//   publishResults,
//   unpublishResults,
// } from "./examService";
// import { getStudents } from "../students/studentService";
// import { getCourses, getBatches } from "../courses/courseService";
// import { getErrorMessage } from "../../services/api";
// import { getId, fmtDate, titleCase, inputClass } from "../../services/helpers";
// import { pick, relId, relName } from "../schedules/scheduleUtils";
// import { ROLE, getCurrentRole } from "../../config/permissions";
// import { examStatusClass, resultOf } from "./examUtils";
// import MarkHistory from "../classTests/MarkHistory";

// const RESULT_STYLES = { pass: "bg-emerald-100 text-emerald-700", fail: "bg-red-100 text-red-700" };
// const blank = { marks: "", remarks: "", saved: false, dirty: false };

// // Marks the API sends with the exam (if any)
// const marksFromExam = (exam) => {
//   const list = Object.values(exam || {}).find(
//     (v) => Array.isArray(v) && v.length && typeof v[0] === "object" && "marks_obtained" in v[0]
//   );
//   return Object.fromEntries(
//     (list || []).map((m) => [relId(pick(m, "student_id", "student")), { marks: m.marks_obtained ?? "", remarks: m.remarks || "", saved: true, dirty: false }])
//   );
// };

// // Marks already saved, taken from GET /exams/:id/results
// const marksFromResults = (rows) => {
//   const out = {};
//   rows.forEach((r) => {
//     const id = relId(pick(r, "student_id", "student"));
//     const marks = r.marks_obtained ?? r.marks ?? "";
//     if (id && marks !== "" && marks !== null) out[id] = { marks, remarks: r.remarks || "", saved: true, dirty: false };
//   });
//   return out;
// };

// // One exam: enter / correct marks, review the results, publish or unpublish them
// const ExamMarks = () => {
//   const { examId } = useParams();
//   const { pathname } = useLocation();
//   const role = getCurrentRole();
//   const canEdit = role === ROLE.SUPER_ADMIN || role === ROLE.FACULTY; // marks
//   const canPublish = role === ROLE.SUPER_ADMIN; // publish / unpublish

//   const [exam, setExam] = useState(null);
//   const [students, setStudents] = useState([]);
//   const [entries, setEntries] = useState({});
//   const [results, setResults] = useState({ rows: [], published: undefined });
//   const [courseNames, setCourseNames] = useState({});
//   const [batchNames, setBatchNames] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [notice, setNotice] = useState("");
//   const [reloadKey, setReloadKey] = useState(0);

//   const [tab, setTab] = useState(pathname.endsWith("/results") ? "results" : "marks");
//   const [saving, setSaving] = useState(false);
//   const [busyId, setBusyId] = useState(null);
//   const [publishBusy, setPublishBusy] = useState(false);
//   const [historyFor, setHistoryFor] = useState(null);

//   // exam -> students of its batch, names, saved marks and results
//   useEffect(() => {
//     let cancelled = false;
//     (async () => {
//       const ex = await getExamById(examId);
//       const batchId = relId(pick(ex, "batch_id", "batch"));
//       const courseId = relId(pick(ex, "course_id", "course"));
//       const [studentRes, courses, batches, res] = await Promise.all([
//         getStudents({ batch_id: batchId, limit: 100 }),
//         getCourses().catch(() => []),
//         courseId ? getBatches(courseId).catch(() => []) : [],
//         getExamResults(examId).catch(() => ({ rows: [], published: undefined })),
//       ]);
//       // if the API refused the batch filter, apply it here
//       const inBatch = studentRes.clientFilters.includes("batch_id")
//         ? studentRes.list.filter((s) => relId(pick(s, "batch_id", "batch")) === batchId)
//         : studentRes.list;
//       if (cancelled) return;
//       setExam(ex);
//       setStudents(inBatch);
//       setEntries({ ...marksFromExam(ex), ...marksFromResults(res.rows) });
//       setResults({ rows: res.rows, published: res.published });
//       setCourseNames(Object.fromEntries(courses.map((c) => [getId(c), c.name])));
//       setBatchNames(Object.fromEntries(batches.map((b) => [getId(b), b.name])));
//       setError("");
//     })()
//       .catch((err) => !cancelled && setError(getErrorMessage(err, "Could not load this exam")))
//       .finally(() => !cancelled && setLoading(false));
//     return () => {
//       cancelled = true;
//     };
//   }, [examId, reloadKey]);

//   const reload = () => {
//     setLoading(true);
//     setReloadKey((k) => k + 1);
//   };

//   // Results only (after marks change or results are published)
//   const refreshResults = useCallback(
//     () =>
//       getExamResults(examId)
//         .then((res) => setResults({ rows: res.rows, published: res.published }))
//         .catch(() => {}),
//     [examId]
//   );

//   const maxMarks = Number(exam?.max_marks);
//   const passMarks = Number(exam?.passing_marks);
//   const entryOf = (id) => entries[id] || blank;

//   const change = (id, patch) => setEntries((prev) => ({ ...prev, [id]: { ...(prev[id] || blank), ...patch, dirty: true } }));

//   const rowProblem = (id) => {
//     const e = entryOf(id);
//     if (e.marks === "") return "";
//     const n = Number(e.marks);
//     if (!Number.isFinite(n) || n < 0) return "Marks cannot be negative";
//     if (n > maxMarks) return `Marks cannot be more than ${maxMarks}`;
//     return "";
//   };

//   const summary = useMemo(() => {
//     let entered = 0;
//     let passed = 0;
//     students.forEach((s) => {
//       const e = entries[s.id];
//       if (e && e.marks !== "") {
//         entered += 1;
//         if (resultOf(e.marks, passMarks) === "pass") passed += 1;
//       }
//     });
//     return { entered, passed, failed: entered - passed };
//   }, [students, entries, passMarks]);

//   const markSaved = (ids) =>
//     setEntries((prev) => {
//       const next = { ...prev };
//       ids.forEach((id) => {
//         next[id] = { ...(next[id] || blank), saved: true, dirty: false };
//       });
//       return next;
//     });

//   // New marks -> POST .../marks/bulk ; already-saved marks -> PUT .../marks/:studentId
//   const saveRows = async (ids) => {
//     const rows = ids.filter((id) => entryOf(id).dirty && entryOf(id).marks !== "");
//     if (rows.length === 0) return setError("Enter some marks first");
//     const bad = rows.find((id) => rowProblem(id));
//     if (bad) return setError(`${students.find((s) => s.id === bad)?.name}: ${rowProblem(bad)}`);

//     const payload = (id) => ({ marks_obtained: Number(entryOf(id).marks), remarks: entryOf(id).remarks.trim() });
//     const fresh = rows.filter((id) => !entryOf(id).saved);
//     const changed = rows.filter((id) => entryOf(id).saved);

//     setError("");
//     try {
//       if (fresh.length) {
//         await saveExamMarksBulk(
//           examId,
//           fresh.map((id) => ({ student_id: id, marks_obtained: payload(id).marks_obtained, ...(payload(id).remarks ? { remarks: payload(id).remarks } : {}) }))
//         );
//       }
//       if (changed.length) await Promise.all(changed.map((id) => updateExamMark(examId, id, payload(id))));
//       markSaved(rows);
//       refreshResults();
//       setNotice(`${rows.length} mark${rows.length === 1 ? "" : "s"} saved`);
//     } catch (err) {
//       setError(getErrorMessage(err, "Could not save marks"));
//     }
//   };

//   const saveAll = async () => {
//     setSaving(true);
//     await saveRows(students.map((s) => s.id));
//     setSaving(false);
//   };

//   const saveOne = async (id) => {
//     setBusyId(id);
//     await saveRows([id]);
//     setBusyId(null);
//   };

//   // DELETE .../marks/:studentId
//   const removeMark = async (s) => {
//     if (!window.confirm(`Delete ${s.name}'s mark? It stays in the history.`)) return;
//     setBusyId(s.id);
//     setError("");
//     try {
//       await deleteExamMark(examId, s.id);
//       setEntries((prev) => ({ ...prev, [s.id]: { ...blank } }));
//       refreshResults();
//       setNotice(`${s.name}'s mark deleted`);
//     } catch (err) {
//       setError(getErrorMessage(err, "Could not delete mark"));
//     } finally {
//       setBusyId(null);
//     }
//   };

//   const unsaved = students.filter((s) => entryOf(s.id).dirty && entryOf(s.id).marks !== "").length;
//   const unmarked = students.length - summary.entered;

//   // PUT /exams/:id/publish
//   const publish = async () => {
//     if (unsaved > 0) return setError("You have unsaved marks. Save them first, then publish.");
//     const warn = unmarked > 0 ? `\n\n${unmarked} student${unmarked === 1 ? " has" : "s have"} no marks yet.` : "";
//     if (!window.confirm(`Publish these results? Students will be able to see their marks.${warn}`)) return;
//     setPublishBusy(true);
//     setError("");
//     try {
//       const res = await publishResults(examId);
//       setNotice(res.message || "Results published");
//       await refreshResults();
//     } catch (err) {
//       setError(getErrorMessage(err, "Could not publish results"));
//     } finally {
//       setPublishBusy(false);
//     }
//   };

//   // PUT /exams/:id/unpublish
//   const unpublish = async () => {
//     if (!window.confirm("Unpublish these results? Students will no longer see them.")) return;
//     setPublishBusy(true);
//     setError("");
//     try {
//       const res = await unpublishResults(examId);
//       setNotice(res.message || "Results unpublished");
//       await refreshResults();
//     } catch (err) {
//       setError(getErrorMessage(err, "Could not unpublish results"));
//     } finally {
//       setPublishBusy(false);
//     }
//   };

//   const loadHistory = useCallback((studentId) => getExamMarkHistory(examId, studentId), [examId]);

//   // Results tab rows (GET /exams/:id/results)
//   const resultRows = useMemo(() => {
//     const byId = Object.fromEntries(students.map((s) => [s.id, s]));
//     return results.rows
//       .map((r, i) => {
//         const ref = pick(r, "student_id", "student");
//         const id = relId(ref);
//         const obj = ref && typeof ref === "object" ? ref : {};
//         const marks = r.marks_obtained ?? r.marks ?? "";
//         return {
//           key: id || r._id || i,
//           name: obj.full_name || obj.name || r.full_name || r.student_name || byId[id]?.name || "Unknown student",
//           code: obj.student_id || r.roll_no || byId[id]?.rollNo || "",
//           marks,
//           remarks: r.remarks || "",
//           result: String(r.result || r.grade_status || resultOf(marks, passMarks) || "").toLowerCase().replace(/ed$/, ""),
//         };
//       })
//       .filter((r) => r.marks !== "" && r.marks !== null);
//   }, [results.rows, students, passMarks]);

//   const stats = useMemo(() => {
//     const n = resultRows.length;
//     const passed = resultRows.filter((r) => r.result === "pass").length;
//     const avg = n ? resultRows.reduce((sum, r) => sum + Number(r.marks), 0) / n : 0;
//     return { n, passed, failed: n - passed, pct: n ? Math.round((passed / n) * 100) : 0, avg };
//   }, [resultRows]);

//   const status = String(exam?.status || "scheduled").toLowerCase();
//   const published = results.published;
//   const readOnlyHint = !canEdit ? "You can view marks but not change them." : "";

//   return (
//     <div>
//       <Link to="/exam-results" className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-sky-700 mb-3">
//         <ArrowLeft size={16} /> Back to exams
//       </Link>

//       {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>}

//       {loading && !exam ? (
//         <p className="py-10 text-center text-gray-500">Loading exam...</p>
//       ) : (
//         exam && (
//           <>
//             <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
//               <div>
//                 <div className="flex flex-wrap items-center gap-3">
//                   <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>
//                   <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${examStatusClass(status)}`}>{titleCase(status)}</span>
//                   {published !== undefined && (
//                     <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${published ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
//                       {published ? "Results published" : "Results not published"}
//                     </span>
//                   )}
//                 </div>
//                 <p className="text-sm text-gray-500 mt-1">
//                   {exam.subject} · {relName(pick(exam, "course_id", "course"), courseNames) || "-"} ·{" "}
//                   {relName(pick(exam, "batch_id", "batch"), batchNames) || "-"} · {fmtDate(exam.exam_date)}
//                 </p>
//                 <p className="text-sm text-gray-500">
//                   {exam.exam_type ? `${titleCase(exam.exam_type)} · ` : ""}Maximum {exam.max_marks} marks · pass at {exam.passing_marks}
//                   {exam.duration_minutes ? ` · ${exam.duration_minutes} min` : ""}
//                   {exam.form_start_date && exam.form_end_date ? ` · form open ${fmtDate(exam.form_start_date)} – ${fmtDate(exam.form_end_date)}` : ""}
//                 </p>
//                 {exam.description && <p className="text-sm text-gray-600 mt-1">{exam.description}</p>}
//               </div>

//               <div className="flex flex-wrap items-center gap-3">
//                 <button
//                   onClick={reload}
//                   className="p-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
//                   aria-label="Refresh"
//                 >
//                   <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
//                 </button>
//                 {canPublish && published && (
//                   <button
//                     onClick={unpublish}
//                     disabled={publishBusy}
//                     className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
//                   >
//                     <EyeOff size={16} /> Unpublish
//                   </button>
//                 )}
//                 {canPublish && !published && (
//                   <button
//                     onClick={publish}
//                     disabled={publishBusy}
//                     className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0EA5E9] text-white font-medium hover:bg-[#0284C7] disabled:opacity-60"
//                   >
//                     <Send size={16} /> {publishBusy ? "Publishing..." : "Publish results"}
//                   </button>
//                 )}
//               </div>
//             </div>

//             {notice && (
//               <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 flex justify-between">
//                 <span>{notice}</span>
//                 <button onClick={() => setNotice("")} aria-label="Dismiss">×</button>
//               </div>
//             )}

//             <div className="inline-flex p-1 rounded-lg bg-gray-100 mb-4">
//               {[
//                 ["marks", "Marks"],
//                 ["results", "Results"],
//               ].map(([key, label]) => (
//                 <button
//                   key={key}
//                   onClick={() => setTab(key)}
//                   className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
//                     tab === key ? "bg-white text-sky-700 shadow-sm" : "text-gray-600 hover:text-gray-900"
//                   }`}
//                 >
//                   {label}
//                 </button>
//               ))}
//             </div>

//             {tab === "marks" && (
//               <>
//                 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
//                   <p className="text-sm text-gray-600">
//                     {summary.entered} of {students.length} marked ·{" "}
//                     <span className="text-sky-700">{summary.passed} passed</span> ·{" "}
//                     <span className="text-red-600">{summary.failed} failed</span>
//                     {readOnlyHint && <span className="text-gray-400"> · {readOnlyHint}</span>}
//                   </p>
//                   {canEdit && (
//                     <button
//                       onClick={saveAll}
//                       disabled={saving || unsaved === 0}
//                       className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0EA5E9] text-white font-medium hover:bg-[#0284C7] disabled:opacity-50"
//                     >
//                       <Save size={16} /> {saving ? "Saving..." : `Save all${unsaved ? ` (${unsaved})` : ""}`}
//                     </button>
//                   )}
//                 </div>
//                 {published && canEdit && (
//                   <p className="mb-3 text-xs text-amber-700">
//                     These results are published. If the server refuses a change, unpublish the results first.
//                   </p>
//                 )}

//                 <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
//                   <table className="w-full text-sm text-left">
//                     <thead className="bg-[#0B1437] text-white">
//                       <tr>
//                         <th className="px-4 py-3 font-medium">Student</th>
//                         <th className="px-4 py-3 font-medium w-36">Marks (/{exam.max_marks})</th>
//                         <th className="px-4 py-3 font-medium">Remarks</th>
//                         <th className="px-4 py-3 font-medium">Result</th>
//                         {canEdit && <th className="px-4 py-3 font-medium text-right">Actions</th>}
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-100">
//                       {loading ? (
//                         <tr>
//                           <td colSpan={5} className="px-4 py-10 text-center text-gray-500">Loading students...</td>
//                         </tr>
//                       ) : students.length === 0 ? (
//                         <tr>
//                           <td colSpan={5} className="px-4 py-10 text-center text-gray-500">No students found in this batch.</td>
//                         </tr>
//                       ) : (
//                         students.map((s) => {
//                           const e = entryOf(s.id);
//                           const problem = rowProblem(s.id);
//                           const result = resultOf(e.marks, passMarks);
//                           return (
//                             <tr key={s.id} className={e.dirty ? "bg-amber-50/40" : "hover:bg-gray-50"}>
//                               <td className="px-4 py-3">
//                                 <p className="font-medium text-gray-900">{s.name}</p>
//                                 <p className="text-xs text-gray-500 font-mono">{s.rollNo}</p>
//                               </td>
//                               <td className="px-4 py-3">
//                                 <input
//                                   type="number"
//                                   min="0"
//                                   max={maxMarks}
//                                   step="0.5"
//                                   value={e.marks}
//                                   disabled={!canEdit}
//                                   onChange={(ev) => change(s.id, { marks: ev.target.value })}
//                                   aria-label={`Marks for ${s.name}`}
//                                   className={`${inputClass} py-2 disabled:bg-gray-50 ${problem ? "border-red-400" : ""}`}
//                                 />
//                                 {problem && <p className="text-xs text-red-600 mt-1">{problem}</p>}
//                               </td>
//                               <td className="px-4 py-3">
//                                 <input
//                                   value={e.remarks}
//                                   disabled={!canEdit}
//                                   onChange={(ev) => change(s.id, { remarks: ev.target.value })}
//                                   placeholder={canEdit ? "Optional" : ""}
//                                   aria-label={`Remarks for ${s.name}`}
//                                   className={`${inputClass} py-2 disabled:bg-gray-50`}
//                                 />
//                               </td>
//                               <td className="px-4 py-3">
//                                 {result && (
//                                   <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${RESULT_STYLES[result]}`}>{titleCase(result)}</span>
//                                 )}
//                               </td>
//                               {canEdit && (
//                                 <td className="px-4 py-3">
//                                   <div className="flex items-center justify-end gap-1 whitespace-nowrap">
//                                     <button
//                                       onClick={() => saveOne(s.id)}
//                                       disabled={busyId === s.id || !e.dirty || e.marks === ""}
//                                       title="Save this mark"
//                                       className="p-2 rounded-lg text-gray-500 hover:bg-sky-50 hover:text-sky-700 disabled:opacity-30"
//                                     >
//                                       <Save size={16} />
//                                     </button>
//                                     <button
//                                       onClick={() => setHistoryFor(s)}
//                                       disabled={!e.saved}
//                                       title="Mark history"
//                                       className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 disabled:opacity-30"
//                                     >
//                                       <History size={16} />
//                                     </button>
//                                     <button
//                                       onClick={() => removeMark(s)}
//                                       disabled={busyId === s.id || !e.saved}
//                                       title="Delete mark"
//                                       className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
//                                     >
//                                       <Trash2 size={16} />
//                                     </button>
//                                   </div>
//                                 </td>
//                               )}
//                             </tr>
//                           );
//                         })
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               </>
//             )}

//             {tab === "results" && (
//               <>
//                 <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
//                   {[
//                     ["Marked", stats.n],
//                     ["Passed", stats.passed],
//                     ["Failed", stats.failed],
//                     ["Pass %", `${stats.pct}%`],
//                     ["Average", stats.n ? stats.avg.toFixed(1) : "-"],
//                   ].map(([label, value]) => (
//                     <div key={label} className="rounded-xl border border-gray-100 bg-white px-4 py-3">
//                       <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
//                       <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
//                     </div>
//                   ))}
//                 </div>

//                 <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
//                   <table className="w-full text-sm text-left">
//                     <thead className="bg-[#0B1437] text-white">
//                       <tr>
//                         <th className="px-4 py-3 font-medium">Student</th>
//                         <th className="px-4 py-3 font-medium">Marks</th>
//                         <th className="px-4 py-3 font-medium">Result</th>
//                         <th className="px-4 py-3 font-medium">Remarks</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-100">
//                       {resultRows.length === 0 ? (
//                         <tr>
//                           <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
//                             No marks entered yet. Use the Marks tab to enter them.
//                           </td>
//                         </tr>
//                       ) : (
//                         resultRows.map((r) => (
//                           <tr key={r.key} className="hover:bg-gray-50">
//                             <td className="px-4 py-3">
//                               <p className="font-medium text-gray-900">{r.name}</p>
//                               <p className="text-xs text-gray-500 font-mono">{r.code}</p>
//                             </td>
//                             <td className="px-4 py-3 text-gray-900 whitespace-nowrap">
//                               {r.marks}
//                               {Number.isFinite(maxMarks) ? <span className="text-xs text-gray-400"> / {maxMarks}</span> : null}
//                             </td>
//                             <td className="px-4 py-3">
//                               {r.result && (
//                                 <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${RESULT_STYLES[r.result] || "bg-gray-100 text-gray-600"}`}>
//                                   {titleCase(r.result)}
//                                 </span>
//                               )}
//                             </td>
//                             <td className="px-4 py-3 text-gray-600">{r.remarks || "-"}</td>
//                           </tr>
//                         ))
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//                 {!canPublish && <p className="text-xs text-gray-400 mt-3">Only the Super Admin can publish or unpublish results.</p>}
//               </>
//             )}
//           </>
//         )
//       )}

//       {historyFor && <MarkHistory testId={examId} student={historyFor} loadHistory={loadHistory} onClose={() => setHistoryFor(null)} />}
//     </div>
//   );
// };

// export default ExamMarks;


import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ArrowLeft, RefreshCw, Save, History, Trash2, Send, EyeOff, Download } from "lucide-react";
import {
  getExamById,
  getExamResults,
  getExamMarkHistory,
  saveExamMarksBulk,
  updateExamMark,
  deleteExamMark,
  publishResults,
  unpublishResults,
  exportExamMarks, // <-- Added import
} from "./examService";
import { getStudents } from "../students/studentService";
import { getCourses, getBatches } from "../courses/courseService";
import { getErrorMessage } from "../../services/api";
import { ExportMenu } from "../../components/ImportExport"; // <-- Added import
import { getId, fmtDate, titleCase, inputClass } from "../../services/helpers";
import { pick, relId, relName } from "../schedules/scheduleUtils";
import { ROLE, getCurrentRole } from "../../config/permissions";
import { examStatusClass, resultOf } from "./examUtils";
import MarkHistory from "../classTests/MarkHistory";

const RESULT_STYLES = { pass: "bg-emerald-100 text-emerald-700", fail: "bg-red-100 text-red-700" };
const blank = { marks: "", remarks: "", saved: false, dirty: false };

// Marks the API sends with the exam (if any)
const marksFromExam = (exam) => {
  const list = Object.values(exam || {}).find(
    (v) => Array.isArray(v) && v.length && typeof v[0] === "object" && "marks_obtained" in v[0]
  );
  return Object.fromEntries(
    (list || []).map((m) => [relId(pick(m, "student_id", "student")), { marks: m.marks_obtained ?? "", remarks: m.remarks || "", saved: true, dirty: false }])
  );
};

// Marks already saved, taken from GET /exams/:id/results
const marksFromResults = (rows) => {
  const out = {};
  rows.forEach((r) => {
    const id = relId(pick(r, "student_id", "student"));
    const marks = r.marks_obtained ?? r.marks ?? "";
    if (id && marks !== "" && marks !== null) out[id] = { marks, remarks: r.remarks || "", saved: true, dirty: false };
  });
  return out;
};

// One exam: enter / correct marks, review the results, publish or unpublish them
const ExamMarks = () => {
  const { examId } = useParams();
  const { pathname } = useLocation();
  const role = getCurrentRole();
  const canEdit = role === ROLE.SUPER_ADMIN || role === ROLE.FACULTY; // marks
  const canPublish = role === ROLE.SUPER_ADMIN; // publish / unpublish

  const [exam, setExam] = useState(null);
  const [students, setStudents] = useState([]);
  const [entries, setEntries] = useState({});
  const [results, setResults] = useState({ rows: [], published: undefined });
  const [courseNames, setCourseNames] = useState({});
  const [batchNames, setBatchNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [tab, setTab] = useState(pathname.endsWith("/results") ? "results" : "marks");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [publishBusy, setPublishBusy] = useState(false);
  const [historyFor, setHistoryFor] = useState(null);

  // exam -> students of its batch, names, saved marks and results
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ex = await getExamById(examId);
      const batchId = relId(pick(ex, "batch_id", "batch"));
      const courseId = relId(pick(ex, "course_id", "course"));
      const [studentRes, courses, batches, res] = await Promise.all([
        getStudents({ batch_id: batchId, limit: 100 }),
        getCourses().catch(() => []),
        courseId ? getBatches(courseId).catch(() => []) : [],
        getExamResults(examId).catch(() => ({ rows: [], published: undefined })),
      ]);
      // if the API refused the batch filter, apply it here
      const inBatch = studentRes.clientFilters.includes("batch_id")
        ? studentRes.list.filter((s) => relId(pick(s, "batch_id", "batch")) === batchId)
        : studentRes.list;
      if (cancelled) return;
      setExam(ex);
      setStudents(inBatch);
      setEntries({ ...marksFromExam(ex), ...marksFromResults(res.rows) });
      setResults({ rows: res.rows, published: res.published });
      setCourseNames(Object.fromEntries(courses.map((c) => [getId(c), c.name])));
      setBatchNames(Object.fromEntries(batches.map((b) => [getId(b), b.name])));
      setError("");
    })()
      .catch((err) => !cancelled && setError(getErrorMessage(err, "Could not load this exam")))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [examId, reloadKey]);

  const reload = () => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  // Results only (after marks change or results are published)
  const refreshResults = useCallback(
    () =>
      getExamResults(examId)
        .then((res) => setResults({ rows: res.rows, published: res.published }))
        .catch(() => {}),
    [examId]
  );

  const maxMarks = Number(exam?.max_marks);
  const passMarks = Number(exam?.passing_marks);
  const entryOf = (id) => entries[id] || blank;

  const change = (id, patch) => setEntries((prev) => ({ ...prev, [id]: { ...(prev[id] || blank), ...patch, dirty: true } }));

  const rowProblem = (id) => {
    const e = entryOf(id);
    if (e.marks === "") return "";
    const n = Number(e.marks);
    if (!Number.isFinite(n) || n < 0) return "Marks cannot be negative";
    if (n > maxMarks) return `Marks cannot be more than ${maxMarks}`;
    return "";
  };

  const summary = useMemo(() => {
    let entered = 0;
    let passed = 0;
    students.forEach((s) => {
      const e = entries[s.id];
      if (e && e.marks !== "") {
        entered += 1;
        if (resultOf(e.marks, passMarks) === "pass") passed += 1;
      }
    });
    return { entered, passed, failed: entered - passed };
  }, [students, entries, passMarks]);

  const markSaved = (ids) =>
    setEntries((prev) => {
      const next = { ...prev };
      ids.forEach((id) => {
        next[id] = { ...(next[id] || blank), saved: true, dirty: false };
      });
      return next;
    });

  // New marks -> POST .../marks/bulk ; already-saved marks -> PUT .../marks/:studentId
  const saveRows = async (ids) => {
    const rows = ids.filter((id) => entryOf(id).dirty && entryOf(id).marks !== "");
    if (rows.length === 0) return setError("Enter some marks first");
    const bad = rows.find((id) => rowProblem(id));
    if (bad) return setError(`${students.find((s) => s.id === bad)?.name}: ${rowProblem(bad)}`);

    const payload = (id) => ({ marks_obtained: Number(entryOf(id).marks), remarks: entryOf(id).remarks.trim() });
    const fresh = rows.filter((id) => !entryOf(id).saved);
    const changed = rows.filter((id) => entryOf(id).saved);

    setError("");
    try {
      if (fresh.length) {
        await saveExamMarksBulk(
          examId,
          fresh.map((id) => ({ student_id: id, marks_obtained: payload(id).marks_obtained, ...(payload(id).remarks ? { remarks: payload(id).remarks } : {}) }))
        );
      }
      if (changed.length) await Promise.all(changed.map((id) => updateExamMark(examId, id, payload(id))));
      markSaved(rows);
      refreshResults();
      setNotice(`${rows.length} mark${rows.length === 1 ? "" : "s"} saved`);
    } catch (err) {
      setError(getErrorMessage(err, "Could not save marks"));
    }
  };

  const saveAll = async () => {
    setSaving(true);
    await saveRows(students.map((s) => s.id));
    setSaving(false);
  };

  const saveOne = async (id) => {
    setBusyId(id);
    await saveRows([id]);
    setBusyId(null);
  };

  // DELETE .../marks/:studentId
  const removeMark = async (s) => {
    if (!window.confirm(`Delete ${s.name}'s mark? It stays in the history.`)) return;
    setBusyId(s.id);
    setError("");
    try {
      await deleteExamMark(examId, s.id);
      setEntries((prev) => ({ ...prev, [s.id]: { ...blank } }));
      refreshResults();
      setNotice(`${s.name}'s mark deleted`);
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete mark"));
    } finally {
      setBusyId(null);
    }
  };

  const unsaved = students.filter((s) => entryOf(s.id).dirty && entryOf(s.id).marks !== "").length;
  const unmarked = students.length - summary.entered;

  // PUT /exams/:id/publish
  const publish = async () => {
    if (unsaved > 0) return setError("You have unsaved marks. Save them first, then publish.");
    const warn = unmarked > 0 ? `\n\n${unmarked} student${unmarked === 1 ? " has" : "s have"} no marks yet.` : "";
    if (!window.confirm(`Publish these results? Students will be able to see their marks.${warn}`)) return;
    setPublishBusy(true);
    setError("");
    try {
      const res = await publishResults(examId);
      setNotice(res.message || "Results published");
      await refreshResults();
    } catch (err) {
      setError(getErrorMessage(err, "Could not publish results"));
    } finally {
      setPublishBusy(false);
    }
  };

  // PUT /exams/:id/unpublish
  const unpublish = async () => {
    if (!window.confirm("Unpublish these results? Students will no longer see them.")) return;
    setPublishBusy(true);
    setError("");
    try {
      const res = await unpublishResults(examId);
      setNotice(res.message || "Results unpublished");
      await refreshResults();
    } catch (err) {
      setError(getErrorMessage(err, "Could not unpublish results"));
    } finally {
      setPublishBusy(false);
    }
  };

  const loadHistory = useCallback((studentId) => getExamMarkHistory(examId, studentId), [examId]);

  // Results tab rows (GET /exams/:id/results)
  const resultRows = useMemo(() => {
    const byId = Object.fromEntries(students.map((s) => [s.id, s]));
    return results.rows
      .map((r, i) => {
        const ref = pick(r, "student_id", "student");
        const id = relId(ref);
        const obj = ref && typeof ref === "object" ? ref : {};
        const marks = r.marks_obtained ?? r.marks ?? "";
        return {
          key: id || r._id || i,
          name: obj.full_name || obj.name || r.full_name || r.student_name || byId[id]?.name || "Unknown student",
          code: obj.student_id || r.roll_no || byId[id]?.rollNo || "",
          marks,
          remarks: r.remarks || "",
          result: String(r.result || r.grade_status || resultOf(marks, passMarks) || "").toLowerCase().replace(/ed$/, ""),
        };
      })
      .filter((r) => r.marks !== "" && r.marks !== null);
  }, [results.rows, students, passMarks]);

  const stats = useMemo(() => {
    const n = resultRows.length;
    const passed = resultRows.filter((r) => r.result === "pass").length;
    const avg = n ? resultRows.reduce((sum, r) => sum + Number(r.marks), 0) / n : 0;
    return { n, passed, failed: n - passed, pct: n ? Math.round((passed / n) * 100) : 0, avg };
  }, [resultRows]);

  const status = String(exam?.status || "scheduled").toLowerCase();
  const published = results.published;
  const readOnlyHint = !canEdit ? "You can view marks but not change them." : "";

  return (
    <div>
      <Link to="/exam-results" className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-sky-700 mb-3">
        <ArrowLeft size={16} /> Back to exams
      </Link>

      {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>}

      {loading && !exam ? (
        <p className="py-10 text-center text-gray-500">Loading exam...</p>
      ) : (
        exam && (
          <>
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${examStatusClass(status)}`}>{titleCase(status)}</span>
                  {published !== undefined && (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${published ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {published ? "Results published" : "Results not published"}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {exam.subject} · {relName(pick(exam, "course_id", "course"), courseNames) || "-"} ·{" "}
                  {relName(pick(exam, "batch_id", "batch"), batchNames) || "-"} · {fmtDate(exam.exam_date)}
                </p>
                <p className="text-sm text-gray-500">
                  {exam.exam_type ? `${titleCase(exam.exam_type)} · ` : ""}Maximum {exam.max_marks} marks · pass at {exam.passing_marks}
                  {exam.duration_minutes ? ` · ${exam.duration_minutes} min` : ""}
                  {exam.form_start_date && exam.form_end_date ? ` · form open ${fmtDate(exam.form_start_date)} – ${fmtDate(exam.form_end_date)}` : ""}
                </p>
                {exam.description && <p className="text-sm text-gray-600 mt-1">{exam.description}</p>}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={reload}
                  className="p-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                  aria-label="Refresh"
                >
                  <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                </button>
                
                {/* EXPORT BUTTON ADDED HERE */}
                <ExportMenu
                  onError={setError}
                  exportFn={(format) => exportExamMarks(examId, format)}
                  formats={["xlsx", "csv"]}
                  label="marks"
                />

                {canPublish && published && (
                  <button
                    onClick={unpublish}
                    disabled={publishBusy}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                  >
                    <EyeOff size={16} /> Unpublish
                  </button>
                )}
                {canPublish && !published && (
                  <button
                    onClick={publish}
                    disabled={publishBusy}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0EA5E9] text-white font-medium hover:bg-[#0284C7] disabled:opacity-60"
                  >
                    <Send size={16} /> {publishBusy ? "Publishing..." : "Publish results"}
                  </button>
                )}
              </div>
            </div>

            {notice && (
              <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 flex justify-between">
                <span>{notice}</span>
                <button onClick={() => setNotice("")} aria-label="Dismiss">×</button>
              </div>
            )}

            <div className="inline-flex p-1 rounded-lg bg-gray-100 mb-4">
              {[
                ["marks", "Marks"],
                ["results", "Results"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    tab === key ? "bg-white text-sky-700 shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {tab === "marks" && (
              <>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
                  <p className="text-sm text-gray-600">
                    {summary.entered} of {students.length} marked ·{" "}
                    <span className="text-sky-700">{summary.passed} passed</span> ·{" "}
                    <span className="text-red-600">{summary.failed} failed</span>
                    {readOnlyHint && <span className="text-gray-400"> · {readOnlyHint}</span>}
                  </p>
                  {canEdit && (
                    <button
                      onClick={saveAll}
                      disabled={saving || unsaved === 0}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0EA5E9] text-white font-medium hover:bg-[#0284C7] disabled:opacity-50"
                    >
                      <Save size={16} /> {saving ? "Saving..." : `Save all${unsaved ? ` (${unsaved})` : ""}`}
                    </button>
                  )}
                </div>
                {published && canEdit && (
                  <p className="mb-3 text-xs text-amber-700">
                    These results are published. If the server refuses a change, unpublish the results first.
                  </p>
                )}

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-[#0B1437] text-white">
                      <tr>
                        <th className="px-4 py-3 font-medium">Student</th>
                        <th className="px-4 py-3 font-medium w-36">Marks (/{exam.max_marks})</th>
                        <th className="px-4 py-3 font-medium">Remarks</th>
                        <th className="px-4 py-3 font-medium">Result</th>
                        {canEdit && <th className="px-4 py-3 font-medium text-right">Actions</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-10 text-center text-gray-500">Loading students...</td>
                        </tr>
                      ) : students.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-10 text-center text-gray-500">No students found in this batch.</td>
                        </tr>
                      ) : (
                        students.map((s) => {
                          const e = entryOf(s.id);
                          const problem = rowProblem(s.id);
                          const result = resultOf(e.marks, passMarks);
                          return (
                            <tr key={s.id} className={e.dirty ? "bg-amber-50/40" : "hover:bg-gray-50"}>
                              <td className="px-4 py-3">
                                <p className="font-medium text-gray-900">{s.name}</p>
                                <p className="text-xs text-gray-500 font-mono">{s.rollNo}</p>
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="number"
                                  min="0"
                                  max={maxMarks}
                                  step="0.5"
                                  value={e.marks}
                                  disabled={!canEdit}
                                  onChange={(ev) => change(s.id, { marks: ev.target.value })}
                                  aria-label={`Marks for ${s.name}`}
                                  className={`${inputClass} py-2 disabled:bg-gray-50 ${problem ? "border-red-400" : ""}`}
                                />
                                {problem && <p className="text-xs text-red-600 mt-1">{problem}</p>}
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  value={e.remarks}
                                  disabled={!canEdit}
                                  onChange={(ev) => change(s.id, { remarks: ev.target.value })}
                                  placeholder={canEdit ? "Optional" : ""}
                                  aria-label={`Remarks for ${s.name}`}
                                  className={`${inputClass} py-2 disabled:bg-gray-50`}
                                />
                              </td>
                              <td className="px-4 py-3">
                                {result && (
                                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${RESULT_STYLES[result]}`}>{titleCase(result)}</span>
                                )}
                              </td>
                              {canEdit && (
                                <td className="px-4 py-3">
                                  <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                                    <button
                                      onClick={() => saveOne(s.id)}
                                      disabled={busyId === s.id || !e.dirty || e.marks === ""}
                                      title="Save this mark"
                                      className="p-2 rounded-lg text-gray-500 hover:bg-sky-50 hover:text-sky-700 disabled:opacity-30"
                                    >
                                      <Save size={16} />
                                    </button>
                                    <button
                                      onClick={() => setHistoryFor(s)}
                                      disabled={!e.saved}
                                      title="Mark history"
                                      className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 disabled:opacity-30"
                                    >
                                      <History size={16} />
                                    </button>
                                    <button
                                      onClick={() => removeMark(s)}
                                      disabled={busyId === s.id || !e.saved}
                                      title="Delete mark"
                                      className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {tab === "results" && (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
                  {[
                    ["Marked", stats.n],
                    ["Passed", stats.passed],
                    ["Failed", stats.failed],
                    ["Pass %", `${stats.pct}%`],
                    ["Average", stats.n ? stats.avg.toFixed(1) : "-"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-gray-100 bg-white px-4 py-3">
                      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
                      <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-[#0B1437] text-white">
                      <tr>
                        <th className="px-4 py-3 font-medium">Student</th>
                        <th className="px-4 py-3 font-medium">Marks</th>
                        <th className="px-4 py-3 font-medium">Result</th>
                        <th className="px-4 py-3 font-medium">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {resultRows.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
                            No marks entered yet. Use the Marks tab to enter them.
                          </td>
                        </tr>
                      ) : (
                        resultRows.map((r) => (
                          <tr key={r.key} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <p className="font-medium text-gray-900">{r.name}</p>
                              <p className="text-xs text-gray-500 font-mono">{r.code}</p>
                            </td>
                            <td className="px-4 py-3 text-gray-900 whitespace-nowrap">
                              {r.marks}
                              {Number.isFinite(maxMarks) ? <span className="text-xs text-gray-400"> / {maxMarks}</span> : null}
                            </td>
                            <td className="px-4 py-3">
                              {r.result && (
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${RESULT_STYLES[r.result] || "bg-gray-100 text-gray-600"}`}>
                                  {titleCase(r.result)}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-gray-600">{r.remarks || "-"}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {!canPublish && <p className="text-xs text-gray-400 mt-3">Only the Super Admin can publish or unpublish results.</p>}
              </>
            )}
          </>
        )
      )}

      {historyFor && <MarkHistory testId={examId} student={historyFor} loadHistory={loadHistory} onClose={() => setHistoryFor(null)} />}
    </div>
  );
};

export default ExamMarks;


// import React, { useEffect, useMemo, useState } from "react";
// import { Plus, RefreshCw, Eye, Pencil, CalendarX } from "lucide-react";
// import { getSchedules, createSchedule, updateSchedule, cancelSchedule } from "./classScheduleService";
// import { getAssignments } from "../faculty/facultyAssignmentService";
// import { getUsers } from "../users/userService";
// import { getCourses, getBatches } from "../courses/courseService";
// import { getErrorMessage } from "../../services/api";
// import { getId, fmtDate, toDateInput, titleCase, inputClass } from "../../services/helpers";
// import { pick, relId, relName, fmtTime, scheduleStatusClass } from "./scheduleUtils";
// import CreateSchedule from "./CreateSchedule";
// import ScheduleDetails from "./ScheduleDetails";
// import { STATUSES, emptyForm, roleOf, today } from "./scheduleUtils";

// const ManageSchedules = () => {
//   const [schedules, setSchedules] = useState([]);
//   const [faculty, setFaculty] = useState([]);
//   const [courses, setCourses] = useState([]);
//   const [batchNames, setBatchNames] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [notice, setNotice] = useState("");
//   const [reloadKey, setReloadKey] = useState(0);

//   // filters
//   const [courseFilter, setCourseFilter] = useState("");
//   const [batchFilter, setBatchFilter] = useState("");
//   const [facultyFilter, setFacultyFilter] = useState("");
//   const [dateFilter, setDateFilter] = useState("");
//   const [statusFilter, setStatusFilter] = useState("");
//   const [filterBatches, setFilterBatches] = useState([]);

//   // create / edit
//   const [showForm, setShowForm] = useState(false);
//   const [editing, setEditing] = useState(null);
//   const [form, setForm] = useState(emptyForm);
//   const [formBatches, setFormBatches] = useState([]);
//   const [formBatchesLoading, setFormBatchesLoading] = useState(false);
//   const [assignments, setAssignments] = useState([]);
//   const [formError, setFormError] = useState("");
//   const [saving, setSaving] = useState(false);

//   const [viewId, setViewId] = useState(null);
//   const [cancellingId, setCancellingId] = useState(null);

//   // Load faculty users + courses, once
//   useEffect(() => {
//     let cancelled = false;
//     Promise.all([getUsers(), getCourses().catch(() => [])])
//       .then(([usersRes, courseList]) => {
//         if (cancelled) return;
//         const userList = usersRes.list || [];
//         setFaculty(userList.filter((u) => /faculty/i.test(roleOf(u)) && u.is_active !== false));
//         setCourses(Array.isArray(courseList) ? courseList : (courseList?.data || courseList?.list || []));
//       })
//       .catch((err) => !cancelled && setError(getErrorMessage(err, "Could not load faculty list")));
//     return () => { cancelled = true; };
//   }, []);

//   // Load schedules
//   useEffect(() => {
//     let cancelled = false;
//     getSchedules({
//       course_id: courseFilter,
//       batch_id: batchFilter,
//       faculty_id: facultyFilter,
//       date: dateFilter,
//       status: statusFilter,
//     })
//       .then(async (list) => {
//         const courseIds = [...new Set(list.map((s) => relId(pick(s, "course_id", "course"))).filter(Boolean))];
//         const batchLists = await Promise.all(courseIds.map((id) => getBatches(id).catch(() => [])));
//         if (cancelled) return;
//         setBatchNames(Object.fromEntries(batchLists.flat().map((b) => [getId(b), b.name])));
//         setSchedules(list);
//         setError("");
//       })
//       .catch((err) => !cancelled && setError(getErrorMessage(err, "Could not load class schedules")))
//       .finally(() => !cancelled && setLoading(false));
//     return () => { cancelled = true; };
//   }, [courseFilter, batchFilter, facultyFilter, dateFilter, statusFilter, reloadKey]);

//   const reload = () => {
//     setLoading(true);
//     setReloadKey((k) => k + 1);
//   };

//   const applyFilter = (setter) => (value) => {
//     setLoading(true);
//     setter(value);
//   };

//   const changeCourseFilter = (id) => {
//     applyFilter(setCourseFilter)(id);
//     setBatchFilter("");
//     setFilterBatches([]);
//     if (id) getBatches(id).then((res) => setFilterBatches(Array.isArray(res) ? res : res?.list || [])).catch(() => {});
//   };

//   const facultyNames = useMemo(() => Object.fromEntries(faculty.map((f) => [getId(f), f.name || f.email])), [faculty]);
//   const courseNames = useMemo(() => Object.fromEntries(courses.map((c) => [getId(c), c.name])), [courses]);

//   const courseName = (s) => relName(pick(s, "course_id", "course"), courseNames) || "-";
//   const batchName = (s) => relName(pick(s, "batch_id", "batch"), batchNames) || "-";
//   const facultyName = (s) => relName(pick(s, "faculty_id", "faculty"), facultyNames) || "Unknown faculty";

//   const sorted = useMemo(
//     () =>
//       [...schedules].sort((a, b) =>
//         `${String(a.date).slice(0, 10)} ${a.start_time}`.localeCompare(`${String(b.date).slice(0, 10)} ${b.start_time}`)
//       ),
//     [schedules]
//   );

//   /* ───── create / edit form ───── */

//   const loadFormBatches = (courseId) => {
//     setFormBatches([]);
//     if (!courseId) return;
//     setFormBatchesLoading(true);
//     getBatches(courseId)
//       .then((res) => setFormBatches(Array.isArray(res) ? res : res?.list || []))
//       .catch((err) => setFormError(getErrorMessage(err, "Could not load batches")))
//       .finally(() => setFormBatchesLoading(false));
//   };

//   const loadAssignments = () => {
//     getAssignments()
//       .then((res) => setAssignments(res || []))
//       .catch(() => setAssignments([]));
//   };

//   const openCreate = () => {
//     setEditing(null);
//     setForm({ ...emptyForm, course_id: courseFilter, batch_id: batchFilter, faculty_id: facultyFilter, date: dateFilter });
//     setFormBatches([]);
//     if (courseFilter) loadFormBatches(courseFilter);
//     setFormError("");
//     loadAssignments();
//     setShowForm(true);
//   };

//   const openEdit = (s) => {
//     const courseId = relId(pick(s, "course_id", "course"));
//     setEditing(s);
//     setForm({
//       course_id: courseId,
//       batch_id: relId(pick(s, "batch_id", "batch")),
//       faculty_id: relId(pick(s, "faculty_id", "faculty")),
//       subject: s.subject || "",
//       date: toDateInput(s.date),
//       start_time: s.start_time || "",
//       end_time: s.end_time || "",
//     });
//     loadFormBatches(courseId);
//     setFormError("");
//     loadAssignments();
//     setShowForm(true);
//   };

//   const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

//   const changeCourse = (e) => {
//     setForm({ ...form, course_id: e.target.value, batch_id: "", faculty_id: "" });
//     loadFormBatches(e.target.value);
//   };

//   // Filter assignments to match the selected Course and Batch
//   const assignedHere = useMemo(
//     () =>
//       assignments.filter(
//         (a) =>
//           relId(pick(a, "course_id", "course")) === form.course_id &&
//           relId(pick(a, "batch_id", "batch")) === form.batch_id
//       ),
//     [assignments, form.course_id, form.batch_id]
//   );

//   const batchChosen = !!(form.course_id && form.batch_id);

//   // ONLY show faculty that match the selected Course, Batch AND Subject
//   const facultyOptions = useMemo(() => {
//     if (!batchChosen) return faculty;
    
//     return faculty.filter((f) => {
//       const fId = getId(f);
//       // Check if assigned to this batch
//       const isAssignedToBatch = assignedHere.some((a) => relId(pick(a, "faculty_id", "faculty")) === fId);
//       if (!isAssignedToBatch) return false;

//       // Check if assigned to the specific subject (if subject is typed)
//       if (form.subject.trim()) {
//         const isAssignedToSubject = assignedHere.some(
//           (a) => relId(pick(a, "faculty_id", "faculty")) === fId && 
//           String(a.subject).toLowerCase().trim() === form.subject.trim().toLowerCase()
//         );
//         return isAssignedToSubject;
//       }
//       return true;
//     });
//   }, [faculty, assignedHere, batchChosen, form.subject]);

//   // Automatically clear the selected faculty if the subject changes and they are no longer valid
//   useEffect(() => {
//     if (form.faculty_id && batchChosen && form.subject.trim()) {
//       const isValid = facultyOptions.some((f) => getId(f) === form.faculty_id);
//       if (!isValid) {
//         setForm((prev) => ({ ...prev, faculty_id: "" }));
//       }
//     }
//   }, [form.subject, facultyOptions, batchChosen, form.faculty_id]);

//   const noAssignment = batchChosen && assignments.length > 0 && facultyOptions.length === 0;

//   const subjectSuggestions = [
//     ...new Set(
//       assignedHere.map((a) => a.subject).filter(Boolean)
//     ),
//   ];

//   const changeFaculty = (e) => {
//     const faculty_id = e.target.value;
//     const subjects = [
//       ...new Set(
//         assignedHere
//           .filter((a) => relId(pick(a, "faculty_id", "faculty")) === faculty_id)
//           .map((a) => a.subject)
//           .filter(Boolean)
//       ),
//     ];
//     // Auto-fill subject if exactly one exists for this faculty
//     setForm({ ...form, faculty_id, subject: !form.subject && subjects.length === 1 ? subjects[0] : form.subject });
//   };

//   const handleSave = async (e) => {
//     e.preventDefault();
//     const f = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()]));
//     if (!f.course_id) return setFormError("Select a course");
//     if (!f.batch_id) return setFormError("Select a batch");
//     if (!f.faculty_id) return setFormError("Select a faculty member");
//     if (!f.subject) return setFormError("Subject is required");
//     if (!f.date) return setFormError("Select a date");
//     if (!editing && f.date < today()) return setFormError("Date cannot be in the past");
//     if (!f.start_time || !f.end_time) return setFormError("Select the start and end time");
//     if (f.end_time <= f.start_time) return setFormError("End time must be after the start time");

//     setSaving(true);
//     try {
//       if (editing) {
//         const original = {
//           course_id: relId(pick(editing, "course_id", "course")),
//           batch_id: relId(pick(editing, "batch_id", "batch")),
//           faculty_id: relId(pick(editing, "faculty_id", "faculty")),
//           subject: editing.subject || "",
//           date: toDateInput(editing.date),
//           start_time: editing.start_time || "",
//           end_time: editing.end_time || "",
//         };
//         const changes = Object.fromEntries(Object.entries(f).filter(([k, v]) => v !== original[k]));
//         if (Object.keys(changes).length) {
//           const res = await updateSchedule(getId(editing), changes);
//           setNotice(res.message || "Class schedule updated");
//         }
//       } else {
//         const res = await createSchedule(f);
//         setNotice(res.message || `Class scheduled for ${fmtDate(f.date)}`);
//       }
//       setShowForm(false);
//       reload();
//     } catch (err) {
//       setFormError(getErrorMessage(err, editing ? "Could not update schedule" : "Could not create schedule"));
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleCancel = async (s) => {
//     if (!window.confirm(`Cancel "${s.subject}" on ${fmtDate(s.date)}, ${fmtTime(s.start_time)}? This cannot be undone.`)) return;
//     setCancellingId(getId(s));
//     setError("");
//     try {
//       const res = await cancelSchedule(getId(s));
//       setNotice(res.message || "Class cancelled");
//       reload();
//     } catch (err) {
//       setError(getErrorMessage(err, "Could not cancel class"));
//     } finally {
//       setCancellingId(null);
//     }
//   };

//   const hasFilters = courseFilter || batchFilter || facultyFilter || dateFilter || statusFilter;

//   return (
//     <div>
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Class Schedules</h1>
//           <p className="text-sm text-gray-500 mt-1">{schedules.length} classes</p>
//         </div>
//         <div className="flex items-center gap-3">
//           <button
//             onClick={reload}
//             className="p-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
//             aria-label="Refresh"
//           >
//             <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
//           </button>
//           <button
//             onClick={openCreate}
//             className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0EA5E9] text-white font-medium hover:bg-[#0284C7]"
//           >
//             <Plus size={18} /> Schedule class
//           </button>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
//         <select value={courseFilter} onChange={(e) => changeCourseFilter(e.target.value)} className={`${inputClass} bg-white`}>
//           <option value="">All courses</option>
//           {courses.map((c) => (
//             <option key={getId(c)} value={getId(c)}>{c.name}</option>
//           ))}
//         </select>
//         <select
//           value={batchFilter}
//           onChange={(e) => applyFilter(setBatchFilter)(e.target.value)}
//           disabled={!courseFilter}
//           className={`${inputClass} bg-white disabled:bg-gray-50 disabled:text-gray-400`}
//         >
//           <option value="">{courseFilter ? "All batches" : "Pick a course first"}</option>
//           {filterBatches.map((b) => (
//             <option key={getId(b)} value={getId(b)}>{b.name}</option>
//           ))}
//         </select>
//         <select value={facultyFilter} onChange={(e) => applyFilter(setFacultyFilter)(e.target.value)} className={`${inputClass} bg-white`}>
//           <option value="">All faculty</option>
//           {faculty.map((f) => (
//             <option key={getId(f)} value={getId(f)}>{f.name || f.email}</option>
//           ))}
//         </select>
//         <input
//           type="date"
//           value={dateFilter}
//           onChange={(e) => applyFilter(setDateFilter)(e.target.value)}
//           className={`${inputClass} bg-white`}
//         />
//         <select value={statusFilter} onChange={(e) => applyFilter(setStatusFilter)(e.target.value)} className={`${inputClass} bg-white`}>
//           <option value="">All status</option>
//           {STATUSES.map((s) => (
//             <option key={s} value={s}>{titleCase(s)}</option>
//           ))}
//         </select>
//       </div>

//       {notice && (
//         <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 flex justify-between">
//           <span>{notice}</span>
//           <button onClick={() => setNotice("")} aria-label="Dismiss">×</button>
//         </div>
//       )}
//       {error && (
//         <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>
//       )}

//       <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
//         <table className="w-full text-sm text-left">
//           <thead className="bg-[#0B1437] text-white">
//             <tr>
//               <th className="px-4 py-3 font-medium">Date</th>
//               <th className="px-4 py-3 font-medium">Time</th>
//               <th className="px-4 py-3 font-medium">Subject</th>
//               <th className="px-4 py-3 font-medium">Course / Batch</th>
//               <th className="px-4 py-3 font-medium">Faculty</th>
//               <th className="px-4 py-3 font-medium">Status</th>
//               <th className="px-4 py-3 font-medium text-right">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-100">
//             {loading ? (
//               <tr>
//                 <td colSpan={7} className="px-4 py-10 text-center text-gray-500">Loading schedules...</td>
//               </tr>
//             ) : sorted.length === 0 ? (
//               <tr>
//                 <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
//                   {hasFilters ? "No classes match your filters." : "No classes scheduled yet."}
//                 </td>
//               </tr>
//             ) : (
//               sorted.map((s, i) => {
//                 const status = String(s.status || "scheduled").toLowerCase();
//                 const cancelled = status === "cancelled";
//                 return (
//                   <tr key={getId(s) || i} className={`hover:bg-gray-50 ${cancelled ? "opacity-70" : ""}`}>
//                     <td className="px-4 py-3 text-gray-900 whitespace-nowrap">{fmtDate(s.date)}</td>
//                     <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
//                       {fmtTime(s.start_time)} – {fmtTime(s.end_time)}
//                     </td>
//                     <td className="px-4 py-3 font-medium text-gray-900">{s.subject}</td>
//                     <td className="px-4 py-3">
//                       <p className="text-gray-900">{courseName(s)}</p>
//                       <p className="text-xs text-gray-500">{batchName(s)}</p>
//                     </td>
//                     <td className="px-4 py-3 text-gray-600">{facultyName(s)}</td>
//                     <td className="px-4 py-3">
//                       <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${scheduleStatusClass(status)}`}>
//                         {titleCase(status)}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3">
//                       <div className="flex items-center justify-end gap-1 whitespace-nowrap">
//                         <button
//                           onClick={() => setViewId(getId(s))}
//                           title="View details"
//                           className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800"
//                         >
//                           <Eye size={16} />
//                         </button>
//                         {!cancelled && (
//                           <>
//                             <button
//                               onClick={() => openEdit(s)}
//                               title="Edit schedule"
//                               className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800"
//                             >
//                               <Pencil size={16} />
//                             </button>
//                             <button
//                               onClick={() => handleCancel(s)}
//                               disabled={cancellingId === getId(s)}
//                               title="Cancel class"
//                               className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
//                             >
//                               <CalendarX size={16} />
//                             </button>
//                           </>
//                         )}
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })
//             )}
//           </tbody>
//         </table>
//       </div>

//       {showForm && (
//         <CreateSchedule
//           assignedFacultyIds={new Set(facultyOptions.map(f => getId(f)))}
//           batchChosen={batchChosen}
//           changeCourse={changeCourse}
//           changeFaculty={changeFaculty}
//           courses={courses}
//           editing={editing}
//           facultyOptions={facultyOptions}
//           form={form}
//           formBatches={formBatches}
//           formBatchesLoading={formBatchesLoading}
//           formError={formError}
//           handleSave={handleSave}
//           noAssignment={noAssignment}
//           saving={saving}
//           set={set}
//           setForm={setForm}
//           setShowForm={setShowForm}
//           subjectSuggestions={subjectSuggestions}
//         />
//       )}

//       {viewId && (
//         <ScheduleDetails
//           id={viewId}
//           courseName={courseName}
//           batchName={batchName}
//           facultyName={facultyName}
//           onClose={() => setViewId(null)}
//         />
//       )}
//     </div>
//   );
// };

// export default ManageSchedules;



// import React, { useEffect, useMemo, useState } from "react";
// import { Plus, RefreshCw, Eye, Pencil, CalendarX } from "lucide-react";
// import { getSchedules, createSchedule, updateSchedule, cancelSchedule } from "./classScheduleService";
// import { getAssignments } from "../faculty/facultyAssignmentService";
// import { getUsers } from "../users/userService";
// import { getCourses, getBatches } from "../courses/courseService";
// import { getErrorMessage } from "../../services/api";
// import { getId, fmtDate, toDateInput, titleCase, inputClass } from "../../services/helpers";
// import { pick, relId, relName, fmtTime, scheduleStatusClass } from "./scheduleUtils";
// import CreateSchedule from "./CreateSchedule";
// import ScheduleDetails from "./ScheduleDetails";
// import { STATUSES, emptyForm, roleOf, today } from "./scheduleUtils";

// const ManageSchedules = () => {
//   const [schedules, setSchedules] = useState([]);
//   const [faculty, setFaculty] = useState([]);
//   const [courses, setCourses] = useState([]);
//   const [batchNames, setBatchNames] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [notice, setNotice] = useState("");
//   const [reloadKey, setReloadKey] = useState(0);

//   // filters (sent to the API as query params)
//   const [courseFilter, setCourseFilter] = useState("");
//   const [batchFilter, setBatchFilter] = useState("");
//   const [facultyFilter, setFacultyFilter] = useState("");
//   const [dateFilter, setDateFilter] = useState("");
//   const [statusFilter, setStatusFilter] = useState("");
//   const [filterBatches, setFilterBatches] = useState([]);

//   // create / edit
//   const [showForm, setShowForm] = useState(false);
//   const [editing, setEditing] = useState(null);
//   const [form, setForm] = useState(emptyForm);
//   const [formBatches, setFormBatches] = useState([]);
//   const [formBatchesLoading, setFormBatchesLoading] = useState(false);
//   const [assignments, setAssignments] = useState([]);
//   const [formError, setFormError] = useState("");
//   const [saving, setSaving] = useState(false);

//   const [viewId, setViewId] = useState(null);
//   const [cancellingId, setCancellingId] = useState(null);

//   // faculty users + courses, once
//   useEffect(() => {
//     let cancelled = false;
//     Promise.all([getUsers({ limit: 100 }), getCourses().catch(() => [])])
//       .then(([users, courseList]) => {
//         if (cancelled) return;
//         setFaculty(users.list.filter((u) => /faculty/i.test(roleOf(u)) && u.is_active !== false));
//         setCourses(courseList);
//       })
//       .catch((err) => !cancelled && setError(getErrorMessage(err, "Could not load faculty list")));
//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   // GET /classschedules (+ batch names for the courses on screen)
//   useEffect(() => {
//     let cancelled = false;
//     getSchedules({
//       course_id: courseFilter,
//       batch_id: batchFilter,
//       faculty_id: facultyFilter,
//       date: dateFilter,
//       status: statusFilter,
//     })
//       .then(async (list) => {
//         const courseIds = [...new Set(list.map((s) => relId(pick(s, "course_id", "course"))).filter(Boolean))];
//         const batchLists = await Promise.all(courseIds.map((id) => getBatches(id).catch(() => [])));
//         if (cancelled) return;
//         setBatchNames(Object.fromEntries(batchLists.flat().map((b) => [getId(b), b.name])));
//         setSchedules(list);
//         setError("");
//       })
//       .catch((err) => !cancelled && setError(getErrorMessage(err, "Could not load class schedules")))
//       .finally(() => !cancelled && setLoading(false));
//     return () => {
//       cancelled = true;
//     };
//   }, [courseFilter, batchFilter, facultyFilter, dateFilter, statusFilter, reloadKey]);

//   const reload = () => {
//     setLoading(true);
//     setReloadKey((k) => k + 1);
//   };

//   const applyFilter = (setter) => (value) => {
//     setLoading(true);
//     setter(value);
//   };

//   const changeCourseFilter = (id) => {
//     applyFilter(setCourseFilter)(id);
//     setBatchFilter("");
//     setFilterBatches([]);
//     if (id) getBatches(id).then(setFilterBatches).catch(() => {});
//   };

//   const facultyNames = useMemo(() => Object.fromEntries(faculty.map((f) => [getId(f), f.name || f.email])), [faculty]);
//   const courseNames = useMemo(() => Object.fromEntries(courses.map((c) => [getId(c), c.name])), [courses]);

//   const courseName = (s) => relName(pick(s, "course_id", "course"), courseNames) || "-";
//   const batchName = (s) => relName(pick(s, "batch_id", "batch"), batchNames) || "-";
//   const facultyName = (s) => relName(pick(s, "faculty_id", "faculty"), facultyNames) || "Unknown faculty";

//   const sorted = useMemo(
//     () =>
//       [...schedules].sort((a, b) =>
//         `${String(a.date).slice(0, 10)} ${a.start_time}`.localeCompare(`${String(b.date).slice(0, 10)} ${b.start_time}`)
//       ),
//     [schedules]
//   );

//   /* ───── create / edit form ───── */

//   const loadFormBatches = (courseId) => {
//     setFormBatches([]);
//     if (!courseId) return;
//     setFormBatchesLoading(true);
//     getBatches(courseId)
//       .then(setFormBatches)
//       .catch((err) => setFormError(getErrorMessage(err, "Could not load batches")))
//       .finally(() => setFormBatchesLoading(false));
//   };

//   const loadAssignments = () => {
//     getAssignments()
//       .then(setAssignments)
//       .catch(() => setAssignments([]));
//   };

//   const openCreate = () => {
//     setEditing(null);
//     setForm({ ...emptyForm, course_id: courseFilter, batch_id: batchFilter, faculty_id: facultyFilter, date: dateFilter });
//     setFormBatches([]);
//     if (courseFilter) loadFormBatches(courseFilter);
//     setFormError("");
//     loadAssignments();
//     setShowForm(true);
//   };

//   const openEdit = (s) => {
//     const courseId = relId(pick(s, "course_id", "course"));
//     setEditing(s);
//     setForm({
//       course_id: courseId,
//       batch_id: relId(pick(s, "batch_id", "batch")),
//       faculty_id: relId(pick(s, "faculty_id", "faculty")),
//       subject: s.subject || "",
//       date: toDateInput(s.date),
//       start_time: s.start_time || "",
//       end_time: s.end_time || "",
//     });
//     loadFormBatches(courseId);
//     setFormError("");
//     loadAssignments();
//     setShowForm(true);
//   };

//   const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

//   const changeCourse = (e) => {
//     setForm({ ...form, course_id: e.target.value, batch_id: "", faculty_id: "" });
//     loadFormBatches(e.target.value);
//   };

//   // Faculty actually assigned to the chosen course + batch (from Faculty Assignments)
//   const assignedHere = useMemo(
//     () =>
//       assignments.filter(
//         (a) =>
//           relId(pick(a, "course_id", "course")) === form.course_id && relId(pick(a, "batch_id", "batch")) === form.batch_id
//       ),
//     [assignments, form.course_id, form.batch_id]
//   );
//   const assignedFacultyIds = useMemo(
//     () => new Set(assignedHere.map((a) => relId(pick(a, "faculty_id", "faculty")))),
//     [assignedHere]
//   );
//   const batchChosen = !!(form.course_id && form.batch_id);
//   const facultyOptions = batchChosen && assignedFacultyIds.size ? faculty.filter((f) => assignedFacultyIds.has(getId(f))) : faculty;
//   const noAssignment = batchChosen && assignments.length > 0 && assignedFacultyIds.size === 0;
//   const subjectSuggestions = [
//     ...new Set(
//       assignedHere
//         .filter((a) => relId(pick(a, "faculty_id", "faculty")) === form.faculty_id)
//         .map((a) => a.subject)
//         .filter(Boolean)
//     ),
//   ];

//   const changeFaculty = (e) => {
//     const faculty_id = e.target.value;
//     const subjects = [
//       ...new Set(
//         assignedHere
//           .filter((a) => relId(pick(a, "faculty_id", "faculty")) === faculty_id)
//           .map((a) => a.subject)
//           .filter(Boolean)
//       ),
//     ];
//     setForm({ ...form, faculty_id, subject: !form.subject && subjects.length === 1 ? subjects[0] : form.subject });
//   };

//   // POST /classschedules   or   PUT /classschedules/:id (changed fields only)
//   const handleSave = async (e) => {
//     e.preventDefault();
//     const f = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()]));
//     if (!f.course_id) return setFormError("Select a course");
//     if (!f.batch_id) return setFormError("Select a batch");
//     if (!f.faculty_id) return setFormError("Select a faculty member");
//     if (!f.subject) return setFormError("Subject is required");
//     if (!f.date) return setFormError("Select a date");
//     if (!editing && f.date < today()) return setFormError("Date cannot be in the past");
//     if (!f.start_time || !f.end_time) return setFormError("Select the start and end time");
//     if (f.end_time <= f.start_time) return setFormError("End time must be after the start time");

//     setSaving(true);
//     try {
//       if (editing) {
//         const original = {
//           course_id: relId(pick(editing, "course_id", "course")),
//           batch_id: relId(pick(editing, "batch_id", "batch")),
//           faculty_id: relId(pick(editing, "faculty_id", "faculty")),
//           subject: editing.subject || "",
//           date: toDateInput(editing.date),
//           start_time: editing.start_time || "",
//           end_time: editing.end_time || "",
//         };
//         const changes = Object.fromEntries(Object.entries(f).filter(([k, v]) => v !== original[k]));
//         if (Object.keys(changes).length) {
//           const res = await updateSchedule(getId(editing), changes);
//           setNotice(res.message || "Class schedule updated");
//         }
//       } else {
//         const res = await createSchedule(f);
//         setNotice(res.message || `Class scheduled for ${fmtDate(f.date)}`);
//       }
//       setShowForm(false);
//       reload();
//     } catch (err) {
//       setFormError(getErrorMessage(err, editing ? "Could not update schedule" : "Could not create schedule"));
//     } finally {
//       setSaving(false);
//     }
//   };

//   // PATCH /classschedules/:id/cancel
//   const handleCancel = async (s) => {
//     if (!window.confirm(`Cancel "${s.subject}" on ${fmtDate(s.date)}, ${fmtTime(s.start_time)}? This cannot be undone.`)) return;
//     setCancellingId(getId(s));
//     setError("");
//     try {
//       const res = await cancelSchedule(getId(s));
//       setNotice(res.message || "Class cancelled");
//       reload();
//     } catch (err) {
//       setError(getErrorMessage(err, "Could not cancel class"));
//     } finally {
//       setCancellingId(null);
//     }
//   };

//   const hasFilters = courseFilter || batchFilter || facultyFilter || dateFilter || statusFilter;

//   return (
//     <div>
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Class Schedules</h1>
//           <p className="text-sm text-gray-500 mt-1">{schedules.length} classes</p>
//         </div>
//         <div className="flex items-center gap-3">
//           <button
//             onClick={reload}
//             className="p-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
//             aria-label="Refresh"
//           >
//             <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
//           </button>
//           <button
//             onClick={openCreate}
//             className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0EA5E9] text-white font-medium hover:bg-[#0284C7]"
//           >
//             <Plus size={18} /> Schedule class
//           </button>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
//         <select value={courseFilter} onChange={(e) => changeCourseFilter(e.target.value)} className={`${inputClass} bg-white`}>
//           <option value="">All courses</option>
//           {courses.map((c) => (
//             <option key={getId(c)} value={getId(c)}>{c.name}</option>
//           ))}
//         </select>
//         <select
//           value={batchFilter}
//           onChange={(e) => applyFilter(setBatchFilter)(e.target.value)}
//           disabled={!courseFilter}
//           className={`${inputClass} bg-white disabled:bg-gray-50 disabled:text-gray-400`}
//         >
//           <option value="">{courseFilter ? "All batches" : "Pick a course first"}</option>
//           {filterBatches.map((b) => (
//             <option key={getId(b)} value={getId(b)}>{b.name}</option>
//           ))}
//         </select>
//         <select value={facultyFilter} onChange={(e) => applyFilter(setFacultyFilter)(e.target.value)} className={`${inputClass} bg-white`}>
//           <option value="">All faculty</option>
//           {faculty.map((f) => (
//             <option key={getId(f)} value={getId(f)}>{f.name || f.email}</option>
//           ))}
//         </select>
//         <input
//           type="date"
//           value={dateFilter}
//           onChange={(e) => applyFilter(setDateFilter)(e.target.value)}
//           className={`${inputClass} bg-white`}
//         />
//         <select value={statusFilter} onChange={(e) => applyFilter(setStatusFilter)(e.target.value)} className={`${inputClass} bg-white`}>
//           <option value="">All status</option>
//           {STATUSES.map((s) => (
//             <option key={s} value={s}>{titleCase(s)}</option>
//           ))}
//         </select>
//       </div>

//       {notice && (
//         <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 flex justify-between">
//           <span>{notice}</span>
//           <button onClick={() => setNotice("")} aria-label="Dismiss">×</button>
//         </div>
//       )}
//       {error && (
//         <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>
//       )}

//       <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
//         <table className="w-full text-sm text-left">
//           <thead className="bg-[#0B1437] text-white">
//             <tr>
//               <th className="px-4 py-3 font-medium">Date</th>
//               <th className="px-4 py-3 font-medium">Time</th>
//               <th className="px-4 py-3 font-medium">Subject</th>
//               <th className="px-4 py-3 font-medium">Course / Batch</th>
//               <th className="px-4 py-3 font-medium">Faculty</th>
//               <th className="px-4 py-3 font-medium">Status</th>
//               <th className="px-4 py-3 font-medium text-right">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-100">
//             {loading ? (
//               <tr>
//                 <td colSpan={7} className="px-4 py-10 text-center text-gray-500">Loading schedules...</td>
//               </tr>
//             ) : sorted.length === 0 ? (
//               <tr>
//                 <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
//                   {hasFilters ? "No classes match your filters." : "No classes scheduled yet."}
//                 </td>
//               </tr>
//             ) : (
//               sorted.map((s, i) => {
//                 const status = String(s.status || "scheduled").toLowerCase();
//                 const cancelled = status === "cancelled";
//                 return (
//                   <tr key={getId(s) || i} className={`hover:bg-gray-50 ${cancelled ? "opacity-70" : ""}`}>
//                     <td className="px-4 py-3 text-gray-900 whitespace-nowrap">{fmtDate(s.date)}</td>
//                     <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
//                       {fmtTime(s.start_time)} – {fmtTime(s.end_time)}
//                     </td>
//                     <td className="px-4 py-3 font-medium text-gray-900">{s.subject}</td>
//                     <td className="px-4 py-3">
//                       <p className="text-gray-900">{courseName(s)}</p>
//                       <p className="text-xs text-gray-500">{batchName(s)}</p>
//                     </td>
//                     <td className="px-4 py-3 text-gray-600">{facultyName(s)}</td>
//                     <td className="px-4 py-3">
//                       <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${scheduleStatusClass(status)}`}>
//                         {titleCase(status)}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3">
//                       <div className="flex items-center justify-end gap-1 whitespace-nowrap">
//                         <button
//                           onClick={() => setViewId(getId(s))}
//                           title="View details"
//                           className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800"
//                         >
//                           <Eye size={16} />
//                         </button>
//                         {!cancelled && (
//                           <>
//                             <button
//                               onClick={() => openEdit(s)}
//                               title="Edit schedule"
//                               className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800"
//                             >
//                               <Pencil size={16} />
//                             </button>
//                             <button
//                               onClick={() => handleCancel(s)}
//                               disabled={cancellingId === getId(s)}
//                               title="Cancel class"
//                               className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
//                             >
//                               <CalendarX size={16} />
//                             </button>
//                           </>
//                         )}
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })
//             )}
//           </tbody>
//         </table>
//       </div>

//       {showForm && (
//         <CreateSchedule
//           assignedFacultyIds={assignedFacultyIds}
//           batchChosen={batchChosen}
//           changeCourse={changeCourse}
//           changeFaculty={changeFaculty}
//           courses={courses}
//           editing={editing}
//           facultyOptions={facultyOptions}
//           form={form}
//           formBatches={formBatches}
//           formBatchesLoading={formBatchesLoading}
//           formError={formError}
//           handleSave={handleSave}
//           noAssignment={noAssignment}
//           saving={saving}
//           set={set}
//           setForm={setForm}
//           setShowForm={setShowForm}
//           subjectSuggestions={subjectSuggestions}
//         />
//       )}

//       {viewId && (
//         <ScheduleDetails
//           id={viewId}
//           courseName={courseName}
//           batchName={batchName}
//           facultyName={facultyName}
//           onClose={() => setViewId(null)}
//         />
//       )}
//     </div>
//   );
// };

// export default ManageSchedules;


import React, { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, Eye, Pencil, CalendarX } from "lucide-react";
import { getSchedules, createSchedule, updateSchedule, cancelSchedule, importSchedules, downloadScheduleTemplate } from "./classScheduleService";
import { getAssignments } from "../faculty/facultyAssignmentService";
import { getUsers } from "../users/userService";
import { getCourses, getBatches } from "../courses/courseService";
import { getErrorMessage } from "../../services/api";
import { getId, fmtDate, toDateInput, titleCase, inputClass } from "../../services/helpers";
import { pick, relId, relName, fmtTime, scheduleStatusClass } from "./scheduleUtils";
import CreateSchedule from "./CreateSchedule";
import ScheduleDetails from "./ScheduleDetails";
import { STATUSES, emptyForm, roleOf, today } from "./scheduleUtils";
import { ImportModal } from "../../components/ImportExport";
import { ImportButton } from "../../components/ui";
import { ROLE, getCurrentRole, getCurrentUser } from "../../config/permissions";

const ManageSchedules = () => {
  // Backend rules: create / edit / cancel = super_admin + faculty (own); bulk import = super_admin + office_staff
  const role = getCurrentRole();
  const me = getCurrentUser();
  const myId = me?.id || me?._id || "";
  const canManage = role === ROLE.SUPER_ADMIN || role === ROLE.FACULTY;
  const canImport = role === ROLE.SUPER_ADMIN || role === ROLE.OFFICE_STAFF;
  const [showImport, setShowImport] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batchNames, setBatchNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // filters
  const [courseFilter, setCourseFilter] = useState("");
  const [batchFilter, setBatchFilter] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [filterBatches, setFilterBatches] = useState([]);

  // create / edit
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formBatches, setFormBatches] = useState([]);
  const [formBatchesLoading, setFormBatchesLoading] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [viewId, setViewId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  // Load faculty users + courses, once
  useEffect(() => {
    let cancelled = false;
    const usersReq =
      role === ROLE.SUPER_ADMIN ? getUsers() : Promise.resolve({ list: [] }); // /users is super_admin only
    Promise.all([usersReq, getCourses().catch(() => [])])
      .then(([usersRes, courseList]) => {
        if (cancelled) return;
        const userList = usersRes.list || [];
        const facultyUsers = userList.filter((u) => /faculty/i.test(roleOf(u)) && u.is_active !== false);
        // A faculty user can only schedule for themselves
        setFaculty(role === ROLE.FACULTY && myId ? [{ id: myId, name: me?.name, email: me?.email }] : facultyUsers);
        setCourses(Array.isArray(courseList) ? courseList : (courseList?.data || courseList?.list || []));
      })
      .catch((err) => !cancelled && setError(getErrorMessage(err, "Could not load faculty list")));
    return () => { cancelled = true; };
  }, [role]);

  // Load schedules
  useEffect(() => {
    let cancelled = false;
    getSchedules({
      course_id: courseFilter,
      batch_id: batchFilter,
      faculty_id: facultyFilter,
      date: dateFilter,
      status: statusFilter,
    })
      .then(async (list) => {
        const courseIds = [...new Set(list.map((s) => relId(pick(s, "course_id", "course"))).filter(Boolean))];
        const batchLists = await Promise.all(courseIds.map((id) => getBatches(id).catch(() => [])));
        if (cancelled) return;
        setBatchNames(Object.fromEntries(batchLists.flat().map((b) => [getId(b), b.name])));
        setSchedules(list);
        setError("");
      })
      .catch((err) => !cancelled && setError(getErrorMessage(err, "Could not load class schedules")))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [courseFilter, batchFilter, facultyFilter, dateFilter, statusFilter, reloadKey]);

  const reload = () => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  const applyFilter = (setter) => (value) => {
    setLoading(true);
    setter(value);
  };

  const changeCourseFilter = (id) => {
    applyFilter(setCourseFilter)(id);
    setBatchFilter("");
    setFilterBatches([]);
    if (id) getBatches(id).then((res) => setFilterBatches(Array.isArray(res) ? res : res?.list || [])).catch(() => {});
  };

  const facultyNames = useMemo(() => Object.fromEntries(faculty.map((f) => [getId(f), f.name || f.email])), [faculty]);
  const courseNames = useMemo(() => Object.fromEntries(courses.map((c) => [getId(c), c.name])), [courses]);

  const courseName = (s) => relName(pick(s, "course_id", "course"), courseNames) || "-";
  const batchName = (s) => relName(pick(s, "batch_id", "batch"), batchNames) || "-";
  const facultyName = (s) => relName(pick(s, "faculty_id", "faculty"), facultyNames) || "Unknown faculty";

  const sorted = useMemo(
    () =>
      [...schedules].sort((a, b) =>
        `${String(a.date).slice(0, 10)} ${a.start_time}`.localeCompare(`${String(b.date).slice(0, 10)} ${b.start_time}`)
      ),
    [schedules]
  );

  /* ───── create / edit form ───── */

  const loadFormBatches = (courseId) => {
    setFormBatches([]);
    if (!courseId) return;
    setFormBatchesLoading(true);
    getBatches(courseId)
      .then((res) => setFormBatches(Array.isArray(res) ? res : res?.list || []))
      .catch((err) => setFormError(getErrorMessage(err, "Could not load batches")))
      .finally(() => setFormBatchesLoading(false));
  };

  const loadAssignments = () => {
    getAssignments()
      .then((res) => setAssignments(res || []))
      .catch(() => setAssignments([]));
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, course_id: courseFilter, batch_id: batchFilter, faculty_id: role === ROLE.FACULTY ? myId : facultyFilter, date: dateFilter });
    setFormBatches([]);
    if (courseFilter) loadFormBatches(courseFilter);
    setFormError("");
    loadAssignments();
    setShowForm(true);
  };

  const openEdit = (s) => {
    const courseId = relId(pick(s, "course_id", "course"));
    setEditing(s);
    setForm({
      course_id: courseId,
      batch_id: relId(pick(s, "batch_id", "batch")),
      faculty_id: relId(pick(s, "faculty_id", "faculty")),
      subject: s.subject || "",
      date: toDateInput(s.date),
      start_time: s.start_time || "",
      end_time: s.end_time || "",
    });
    loadFormBatches(courseId);
    setFormError("");
    loadAssignments();
    setShowForm(true);
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const changeCourse = (e) => {
    setForm({ ...form, course_id: e.target.value, batch_id: "", faculty_id: role === ROLE.FACULTY ? myId : "" });
    loadFormBatches(e.target.value);
  };

  // Filter assignments to match the selected Course and Batch
  const assignedHere = useMemo(
    () =>
      assignments.filter(
        (a) =>
          relId(pick(a, "course_id", "course")) === form.course_id &&
          relId(pick(a, "batch_id", "batch")) === form.batch_id
      ),
    [assignments, form.course_id, form.batch_id]
  );

  const batchChosen = !!(form.course_id && form.batch_id);

  // ONLY show faculty that match the selected Course, Batch AND Subject
  const facultyOptions = useMemo(() => {
    if (!batchChosen) return faculty;
    
    return faculty.filter((f) => {
      const fId = getId(f);
      // Check if assigned to this batch
      const isAssignedToBatch = assignedHere.some((a) => relId(pick(a, "faculty_id", "faculty")) === fId);
      if (!isAssignedToBatch) return false;

      // Check if assigned to the specific subject (if subject is typed)
      if (form.subject.trim()) {
        const isAssignedToSubject = assignedHere.some(
          (a) => relId(pick(a, "faculty_id", "faculty")) === fId && 
          String(a.subject).toLowerCase().trim() === form.subject.trim().toLowerCase()
        );
        return isAssignedToSubject;
      }
      return true;
    });
  }, [faculty, assignedHere, batchChosen, form.subject]);

  // Automatically clear the selected faculty if the subject changes and they are no longer valid
  useEffect(() => {
    if (form.faculty_id && batchChosen && form.subject.trim()) {
      const isValid = facultyOptions.some((f) => getId(f) === form.faculty_id);
      if (!isValid) {
        setForm((prev) => ({ ...prev, faculty_id: "" }));
      }
    }
  }, [form.subject, facultyOptions, batchChosen, form.faculty_id]);

  const noAssignment = batchChosen && assignments.length > 0 && facultyOptions.length === 0;

  const subjectSuggestions = [
    ...new Set(
      assignedHere.map((a) => a.subject).filter(Boolean)
    ),
  ];

  const changeFaculty = (e) => {
    const faculty_id = e.target.value;
    const subjects = [
      ...new Set(
        assignedHere
          .filter((a) => relId(pick(a, "faculty_id", "faculty")) === faculty_id)
          .map((a) => a.subject)
          .filter(Boolean)
      ),
    ];
    // Auto-fill subject if exactly one exists for this faculty
    setForm({ ...form, faculty_id, subject: !form.subject && subjects.length === 1 ? subjects[0] : form.subject });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const f = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()]));
    if (!f.course_id) return setFormError("Select a course");
    if (!f.batch_id) return setFormError("Select a batch");
    if (!f.faculty_id) return setFormError("Select a faculty member");
    if (!f.subject) return setFormError("Subject is required");
    if (!f.date) return setFormError("Select a date");
    if (!editing && f.date < today()) return setFormError("Date cannot be in the past");
    if (!f.start_time || !f.end_time) return setFormError("Select the start and end time");
    if (f.end_time <= f.start_time) return setFormError("End time must be after the start time");

    setSaving(true);
    try {
      if (editing) {
        const original = {
          course_id: relId(pick(editing, "course_id", "course")),
          batch_id: relId(pick(editing, "batch_id", "batch")),
          faculty_id: relId(pick(editing, "faculty_id", "faculty")),
          subject: editing.subject || "",
          date: toDateInput(editing.date),
          start_time: editing.start_time || "",
          end_time: editing.end_time || "",
        };
        const changes = Object.fromEntries(Object.entries(f).filter(([k, v]) => v !== original[k]));
        if (Object.keys(changes).length) {
          const res = await updateSchedule(getId(editing), changes);
          setNotice(res.message || "Class schedule updated");
        }
      } else {
        const res = await createSchedule(f);
        setNotice(res.message || `Class scheduled for ${fmtDate(f.date)}`);
      }
      setShowForm(false);
      reload();
    } catch (err) {
      setFormError(getErrorMessage(err, editing ? "Could not update schedule" : "Could not create schedule"));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (s) => {
    if (!window.confirm(`Cancel "${s.subject}" on ${fmtDate(s.date)}, ${fmtTime(s.start_time)}? This cannot be undone.`)) return;
    setCancellingId(getId(s));
    setError("");
    try {
      const res = await cancelSchedule(getId(s));
      setNotice(res.message || "Class cancelled");
      reload();
    } catch (err) {
      setError(getErrorMessage(err, "Could not cancel class"));
    } finally {
      setCancellingId(null);
    }
  };

  const hasFilters = courseFilter || batchFilter || facultyFilter || dateFilter || statusFilter;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Class Schedules</h1>
          <p className="text-sm text-gray-500 mt-1">{schedules.length} classes</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={reload}
            className="p-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
            aria-label="Refresh"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          {canImport && <ImportButton onClick={() => setShowImport(true)} />}
          {canManage && (
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0EA5E9] text-white font-medium hover:bg-[#0284C7]"
            >
              <Plus size={18} /> Schedule class
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
        <select value={courseFilter} onChange={(e) => changeCourseFilter(e.target.value)} className={`${inputClass} bg-white`}>
          <option value="">All courses</option>
          {courses.map((c) => (
            <option key={getId(c)} value={getId(c)}>{c.name}</option>
          ))}
        </select>
        <select
          value={batchFilter}
          onChange={(e) => applyFilter(setBatchFilter)(e.target.value)}
          disabled={!courseFilter}
          className={`${inputClass} bg-white disabled:bg-gray-50 disabled:text-gray-400`}
        >
          <option value="">{courseFilter ? "All batches" : "Pick a course first"}</option>
          {filterBatches.map((b) => (
            <option key={getId(b)} value={getId(b)}>{b.name}</option>
          ))}
        </select>
        {role === ROLE.SUPER_ADMIN ? (
          <select value={facultyFilter} onChange={(e) => applyFilter(setFacultyFilter)(e.target.value)} className={`${inputClass} bg-white`}>
            <option value="">All faculty</option>
            {faculty.map((f) => (
              <option key={getId(f)} value={getId(f)}>{f.name || f.email}</option>
            ))}
          </select>
        ) : (
          <div />
        )}
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => applyFilter(setDateFilter)(e.target.value)}
          className={`${inputClass} bg-white`}
        />
        <select value={statusFilter} onChange={(e) => applyFilter(setStatusFilter)(e.target.value)} className={`${inputClass} bg-white`}>
          <option value="">All status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{titleCase(s)}</option>
          ))}
        </select>
      </div>

      {notice && (
        <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 flex justify-between">
          <span>{notice}</span>
          <button onClick={() => setNotice("")} aria-label="Dismiss">×</button>
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#0B1437] text-white">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium">Subject</th>
              <th className="px-4 py-3 font-medium">Course / Batch</th>
              <th className="px-4 py-3 font-medium">Faculty</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-500">Loading schedules...</td>
              </tr>
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                  {hasFilters ? "No classes match your filters." : "No classes scheduled yet."}
                </td>
              </tr>
            ) : (
              sorted.map((s, i) => {
                const status = String(s.status || "scheduled").toLowerCase();
                const cancelled = status === "cancelled";
                return (
                  <tr key={getId(s) || i} className={`hover:bg-gray-50 ${cancelled ? "opacity-70" : ""}`}>
                    <td className="px-4 py-3 text-gray-900 whitespace-nowrap">{fmtDate(s.date)}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {fmtTime(s.start_time)} – {fmtTime(s.end_time)}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{s.subject}</td>
                    <td className="px-4 py-3">
                      <p className="text-gray-900">{courseName(s)}</p>
                      <p className="text-xs text-gray-500">{batchName(s)}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{facultyName(s)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${scheduleStatusClass(status)}`}>
                        {titleCase(status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                        <button
                          onClick={() => setViewId(getId(s))}
                          title="View details"
                          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                        >
                          <Eye size={16} />
                        </button>
                        {!cancelled && canManage && (
                          <>
                            <button
                              onClick={() => openEdit(s)}
                              title="Edit schedule"
                              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => handleCancel(s)}
                              disabled={cancellingId === getId(s)}
                              title="Cancel class"
                              className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                            >
                              <CalendarX size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <CreateSchedule
          assignedFacultyIds={new Set(facultyOptions.map(f => getId(f)))}
          batchChosen={batchChosen}
          changeCourse={changeCourse}
          changeFaculty={changeFaculty}
          courses={courses}
          editing={editing}
          facultyOptions={facultyOptions}
          form={form}
          formBatches={formBatches}
          formBatchesLoading={formBatchesLoading}
          formError={formError}
          handleSave={handleSave}
          noAssignment={noAssignment}
          saving={saving}
          set={set}
          setForm={setForm}
          setShowForm={setShowForm}
          subjectSuggestions={subjectSuggestions}
        />
      )}

      {showImport && (
        <ImportModal
          title="Import class schedules"
          entity="schedules"
          importFn={importSchedules}
          templateFn={downloadScheduleTemplate}
          templateFormats={["xlsx"]}
          accept=".xlsx,.csv"
          fileTypesLabel=".xlsx or .csv"
          invalidMessage="Only Excel (.xlsx) or CSV files are allowed"
          description="One row per weekly class. Course, batch, subject and faculty must already exist, and the faculty must be assigned to that subject. Use Repeat Weeks to create the class for several weeks. Classes that clash with an existing one are skipped and listed."
          onClose={() => setShowImport(false)}
          onImported={reload}
        />
      )}

      {viewId && (
        <ScheduleDetails
          id={viewId}
          courseName={courseName}
          batchName={batchName}
          facultyName={facultyName}
          onClose={() => setViewId(null)}
        />
      )}
    </div>
  );
};

export default ManageSchedules;
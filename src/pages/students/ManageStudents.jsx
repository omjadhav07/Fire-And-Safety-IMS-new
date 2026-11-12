
// import React, { useEffect, useMemo, useState } from "react";
// import { PageHeader, AddButton, TableCard, Notice, Avatar, RowMenu, btnOutline } from "../../components/ui";
// import {
//   Search,
//   Plus,
//   RefreshCw,
//   Eye,
//   Pencil,
//   Upload,
//   UserCog,
//   ChevronLeft,
//   ChevronRight,
//   FileText,
//   Download,
// } from "lucide-react";
// import {
//   getStudents,
//   createStudent,
//   updateStudent,
//   setStudentStatus,
//   exportStudents,
//   downloadStudentTemplate,
//   importStudents,
// } from "./studentService";
// import { getCourses, getBatches } from "../courses/courseService";
// import { getErrorMessage } from "../../services/api";
// import { ExportMenu, ImportModal } from "../../components/ImportExport";
// import { getId, fmtDate, toDateInput, titleCase } from "../../services/helpers";
// import CreateStudent from "./CreateStudent";
// import StudentStatus from "./StudentStatus";
// import StudentDocuments from "./StudentDocuments";
// import StudentProfile from "./StudentProfile";
// import { STATUSES, emptyForm, EDITABLE, statusClass } from "./studentUtils";

// const LIMIT = 20;

// // A relation can come back as an id or as a populated object, under several key names
// const pick = (o, ...keys) => {
//   for (const k of keys) if (o[k] !== undefined && o[k] !== null) return o[k];
//   return undefined;
// };
// const relId = (v) => (v && typeof v === "object" ? v.id || v._id : v) || "";

// const ManageStudents = () => {
//   const [students, setStudents] = useState([]);
//   const [clientFilters, setClientFilters] = useState([]); // filters the API refused, applied here instead
//   const [courses, setCourses] = useState([]);
//   const [batchNames, setBatchNames] = useState({});
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [notice, setNotice] = useState("");
//   const [reloadKey, setReloadKey] = useState(0);

//   // filters
//   const [searchInput, setSearchInput] = useState("");
//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState("");
//   const [courseFilter, setCourseFilter] = useState("");
//   const [batchFilter, setBatchFilter] = useState("");
//   const [filterBatches, setFilterBatches] = useState([]);

//   // create / edit
//   const [showForm, setShowForm] = useState(false);
//   const [editing, setEditing] = useState(null);
//   const [form, setForm] = useState(emptyForm());
//   const [formBatches, setFormBatches] = useState([]);
//   const [formBatchesLoading, setFormBatchesLoading] = useState(false);
//   const [formError, setFormError] = useState("");
//   const [saving, setSaving] = useState(false);

//   const [showImport, setShowImport] = useState(false);
//   const [viewId, setViewId] = useState(null);
//   const [docsStudent, setDocsStudent] = useState(null);
//   const [statusStudent, setStatusStudent] = useState(null);
//   const [newStatus, setNewStatus] = useState("active");
//   const [statusSaving, setStatusSaving] = useState(false);

//   // courses once
//   useEffect(() => {
//     let cancelled = false;
//     getCourses()
//       .then((list) => !cancelled && setCourses(list))
//       .catch(() => {});
//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   // debounce the search box
//   useEffect(() => {
//     const t = setTimeout(() => {
//       if (searchInput.trim() !== search) {
//         setLoading(true);
//         setPage(1);
//         setSearch(searchInput.trim());
//       }
//     }, 400);
//     return () => clearTimeout(t);
//   }, [searchInput, search]);

//   // GET /students  (+ batch names for the courses on this page)
//   useEffect(() => {
//     let cancelled = false;
//     getStudents({ page, limit: LIMIT, search, status: statusFilter, course_id: courseFilter, batch_id: batchFilter })
//       .then(async (res) => {
//         const courseIds = [...new Set(res.list.map((s) => relId(pick(s, "course_id", "course"))).filter(Boolean))];
//         const batchLists = await Promise.all(courseIds.map((id) => getBatches(id).catch(() => [])));
//         if (cancelled) return;
//         setBatchNames(Object.fromEntries(batchLists.flat().map((b) => [getId(b), b.name])));
//         setStudents(res.list);
//         setClientFilters(res.clientFilters || []);
//         setTotalPages(res.totalPages);
//         setError("");
//       })
//       .catch((err) => !cancelled && setError(getErrorMessage(err, "Could not load students")))
//       .finally(() => !cancelled && setLoading(false));
//     return () => {
//       cancelled = true;
//     };
//   }, [page, search, statusFilter, courseFilter, batchFilter, reloadKey]);

//   const reload = () => {
//     setLoading(true);
//     setReloadKey((k) => k + 1);
//   };

//   const applyFilter = (setter) => (value) => {
//     setLoading(true);
//     setPage(1);
//     setter(value);
//   };

//   const changeCourseFilter = (id) => {
//     applyFilter(setCourseFilter)(id);
//     setBatchFilter("");
//     setFilterBatches([]);
//     if (id) getBatches(id).then(setFilterBatches).catch(() => {});
//   };

//   const goToPage = (p) => {
//     setLoading(true);
//     setPage(p);
//   };

//   // Apply locally any filter the API does not accept
//   const visibleStudents = useMemo(() => {
//     const q = search.toLowerCase();
//     return students.filter((s) => {
//       if (clientFilters.includes("course_id") && relId(pick(s, "course_id", "course")) !== courseFilter) return false;
//       if (clientFilters.includes("batch_id") && relId(pick(s, "batch_id", "batch")) !== batchFilter) return false;
//       if (clientFilters.includes("status") && String(s.status || "active").toLowerCase() !== statusFilter) return false;
//       if (clientFilters.includes("search")) {
//         return [s.name, s.rollNo, s.phone, s.email].some((v) => String(v ?? "").toLowerCase().includes(q));
//       }
//       return true;
//     });
//   }, [students, clientFilters, courseFilter, batchFilter, statusFilter, search]);

//   const hasNext = clientFilters.length ? false : totalPages ? page < totalPages : students.length === LIMIT;

//   const courseNames = useMemo(() => Object.fromEntries(courses.map((c) => [getId(c), c.name])), [courses]);
//   const nameOf = (v, map) => (v && typeof v === "object" ? v.name || v.title : map[v]) || "-";
//   const courseName = (s) => nameOf(pick(s, "course_id", "course"), courseNames);
//   const batchName = (s) => nameOf(pick(s, "batch_id", "batch"), batchNames);

//   /* ───── create / edit ───── */

//   const loadFormBatches = (courseId) => {
//     setFormBatches([]);
//     if (!courseId) return;
//     setFormBatchesLoading(true);
//     getBatches(courseId)
//       .then(setFormBatches)
//       .catch((err) => setFormError(getErrorMessage(err, "Could not load batches")))
//       .finally(() => setFormBatchesLoading(false));
//   };

//   const openCreate = () => {
//     setEditing(null);
//     setForm(emptyForm());
//     setFormBatches([]);
//     setFormError("");
//     setShowForm(true);
//   };

//   const openEdit = (s) => {
//     setEditing(s);
//     setForm({
//       ...emptyForm(),
//       full_name: s.full_name || s.name || "",
//       dob: toDateInput(s.dob),
//       gender: s.gender || "",
//       phone: s.phone || "",
//       email: s.email || "",
//       address: s.address || "",
//       guardian_name: s.guardian_name || "",
//       guardian_phone: s.guardian_phone || "",
//       qualification: s.qualification || "",
//     });
//     setFormError("");
//     setShowForm(true);
//   };

//   const changeCourse = (e) => {
//     setForm({ ...form, course_id: e.target.value, batch_id: "" });
//     loadFormBatches(e.target.value);
//   };

//   const validate = () => {
//     const f = form;
//     if (!f.full_name.trim()) return "Full name is required";
//     if (!f.phone.trim()) return "Phone number is required";
//     if (!/^\d{10}$/.test(f.phone.trim())) return "Enter a 10-digit phone number";
//     if (f.guardian_phone.trim() && !/^\d{10}$/.test(f.guardian_phone.trim())) return "Guardian phone must be 10 digits";
//     if (f.email.trim() && !/^\S+@\S+\.\S+$/.test(f.email.trim())) return "Enter a valid email address";
//     if (!editing) {
//       if (!f.course_id) return "Select a course";
//       if (!f.admitted_on) return "Admission date is required";
//     }
//     return "";
//   };

//   // POST /students   or   PUT /students/:id (changed fields only)
//   const handleSave = async (e) => {
//     e.preventDefault();
//     const problem = validate();
//     if (problem) return setFormError(problem);

//     const trimmed = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v]));

//     setSaving(true);
//     try {
//       if (editing) {
//         const original = {
//           full_name: editing.full_name || editing.name || "",
//           dob: toDateInput(editing.dob),
//           gender: editing.gender || "",
//           phone: editing.phone || "",
//           email: editing.email || "",
//           address: editing.address || "",
//           guardian_name: editing.guardian_name || "",
//           guardian_phone: editing.guardian_phone || "",
//           qualification: editing.qualification || "",
//         };
//         const changes = Object.fromEntries(EDITABLE.filter((k) => trimmed[k] !== original[k]).map((k) => [k, trimmed[k]]));
//         if (Object.keys(changes).length) {
//           await updateStudent(getId(editing), changes);
//           setNotice(`${trimmed.full_name} updated`);
//         }
//       } else {
//         // send required fields always, optional fields only when filled
//         const body = Object.fromEntries(Object.entries(trimmed).filter(([, v]) => v !== ""));
//         await createStudent(body);
//         setNotice(`${trimmed.full_name} admitted`);
//       }
//       setShowForm(false);
//       if (!editing && page !== 1) goToPage(1);
//       else reload();
//     } catch (err) {
//       setFormError(getErrorMessage(err, editing ? "Could not update student" : "Could not create student"));
//     } finally {
//       setSaving(false);
//     }
//   };

//   /* ───── status ───── */

//   const openStatus = (s) => {
//     setStatusStudent(s);
//     setNewStatus(String(s.status || "active").toLowerCase());
//   };

//   // PATCH /students/:id/status
//   const handleStatus = async (e) => {
//     e.preventDefault();
//     setStatusSaving(true);
//     setError("");
//     try {
//       await setStudentStatus(getId(statusStudent), newStatus);
//       setNotice(`${statusStudent.name} marked as ${newStatus}`);
//       setStatusStudent(null);
//       reload();
//     } catch (err) {
//       setError(getErrorMessage(err, "Could not change student status"));
//       setStatusStudent(null);
//     } finally {
//       setStatusSaving(false);
//     }
//   };

//   return (
//     <div>
//       <PageHeader title="Student Management" subtitle="Admissions, profiles, documents and lifecycle stages" />

//       <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 mb-4 flex flex-col lg:flex-row lg:items-center gap-3">
//         <div className="relative flex-1 min-w-[220px]">
//           <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//           <input
//             value={searchInput}
//             onChange={(e) => setSearchInput(e.target.value)}
//             placeholder="Search by name, student ID, phone or email"
//             className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9]"
//           />
//         </div>
//         <select
//           value={courseFilter}
//           onChange={(e) => changeCourseFilter(e.target.value)}
//           className="lg:w-44 px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white"
//         >
//           <option value="">All courses</option>
//           {courses.map((c) => (
//             <option key={getId(c)} value={getId(c)}>{c.name}</option>
//           ))}
//         </select>
//         <select
//           value={batchFilter}
//           onChange={(e) => applyFilter(setBatchFilter)(e.target.value)}
//           disabled={!courseFilter}
//           className="lg:w-48 px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white disabled:bg-slate-50 disabled:text-slate-400"
//         >
//           <option value="">{courseFilter ? "All batches" : "Pick a course first"}</option>
//           {filterBatches.map((b) => (
//             <option key={getId(b)} value={getId(b)}>{b.name}</option>
//           ))}
//         </select>
//         <select
//           value={statusFilter}
//           onChange={(e) => applyFilter(setStatusFilter)(e.target.value)}
//           className="lg:w-36 px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white"
//         >
//           <option value="">All status</option>
//           {STATUSES.map((s) => (
//             <option key={s} value={s}>{titleCase(s)}</option>
//           ))}
//         </select>
//               <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
//           <button onClick={reload} className={btnOutline} aria-label="Refresh">
//             <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
//           </button>
//           <ExportMenu onError={setError} exportFn={() => exportStudents()} formats={["xlsx"]} label="students" />
//           <button onClick={() => setShowImport(true)} className={btnOutline}>
//             <Upload size={15} /> Import
//           </button>
//           <AddButton onClick={openCreate}>Add Student</AddButton>
//         </div>
// </div>

//       {notice && <Notice onClose={() => setNotice("")}>{notice}</Notice>}
//       {error && <Notice tone="error">{error}</Notice>}

//       <TableCard>
//         <table className="w-full text-sm text-left">
//           <thead className="bg-[#0B1437] text-white">
//             <tr>
//               <th className="px-4 py-3 font-medium">Student ID</th>
//               <th className="px-4 py-3 font-medium">Name</th>
//               <th className="px-4 py-3 font-medium">Phone</th>
//               <th className="px-4 py-3 font-medium">Course</th>
//               <th className="px-4 py-3 font-medium">Batch</th>
//               <th className="px-4 py-3 font-medium">Admitted</th>
//               <th className="px-4 py-3 font-medium">Status</th>
//               <th className="px-4 py-3 font-medium text-right">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-100">
//             {loading ? (
//               <tr>
//                 <td colSpan={8} className="px-4 py-10 text-center text-gray-500">Loading students...</td>
//               </tr>
//             ) : visibleStudents.length === 0 ? (
//               <tr>
//                 <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
//                   {search || statusFilter || courseFilter ? "No students match your filters." : "No students yet. Add the first one."}
//                 </td>
//               </tr>
//             ) : (
//               visibleStudents.map((s, i) => {
//                 const status = String(s.status || "active").toLowerCase();
//                 return (
//                   <tr key={getId(s) || i}>
//                     <td className="px-4 py-3 font-mono text-xs text-gray-700 whitespace-nowrap">{s.rollNo || "-"}</td>
//                     <td className="px-4 py-3">
//                       <div className="flex items-center gap-3">
//                         <Avatar name={s.name} />
//                         <div>
//                           <p className="font-medium text-gray-900">{s.name || "-"}</p>
//                           {s.email && <p className="text-xs text-gray-500">{s.email}</p>}
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{s.phone || "-"}</td>
//                     <td className="px-4 py-3 text-gray-600">{courseName(s)}</td>
//                     <td className="px-4 py-3 text-gray-600">{batchName(s)}</td>
//                     <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmtDate(s.admitted_on)}</td>
//                     <td className="px-4 py-3">
//                       <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusClass(status)}`}>
//                         {titleCase(status)}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3 text-right">
//                       <RowMenu
//                         items={[
//                           { label: "View profile", icon: Eye, onClick: () => setViewId(getId(s)) },
//                           { label: "Documents", icon: FileText, onClick: () => setDocsStudent(s) },
//                           { label: "Edit profile", icon: Pencil, onClick: () => openEdit(s) },
//                           { label: "Change status", icon: UserCog, onClick: () => openStatus(s) },
//                         ]}
//                       />
//                     </td>
//                   </tr>
//                 );
//               })
//             )}
//           </tbody>
//         </table>
//       </TableCard>

//       {!clientFilters.length && (page > 1 || hasNext) && (
//         <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
//           <span>
//             Page {page}
//             {totalPages ? ` of ${totalPages}` : ""}
//           </span>
//           <div className="flex gap-2">
//             <button
//               onClick={() => goToPage(page - 1)}
//               disabled={page === 1 || loading}
//               className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
//             >
//               <ChevronLeft size={16} /> Prev
//             </button>
//             <button
//               onClick={() => goToPage(page + 1)}
//               disabled={!hasNext || loading}
//               className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
//             >
//               Next <ChevronRight size={16} />
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Bulk import (Excel) */}
//       {showImport && (
//         <ImportModal
//           title="Import students"
//           entity="students"
//           description="Upload an Excel file with your students. Download the template first so the columns match. Rows with a duplicate Student ID or an unknown course are skipped and listed in the report."
//           importFn={importStudents}
//           templateFn={() => downloadStudentTemplate()}
//           templateFormats={["xlsx"]}
//           accept=".xlsx"
//           fileTypesLabel=".xlsx"
//           invalidMessage="Only Excel (.xlsx) files are allowed"
//           onClose={() => setShowImport(false)}
//           onImported={() => {
//             setNotice("Students import finished");
//             if (page !== 1) goToPage(1);
//             else reload();
//           }}
//         />
//       )}

//       {showForm && (
//         <CreateStudent
//           editing={editing}
//           form={form}
//           setForm={setForm}
//           courses={courses}
//           batches={formBatches}
//           batchesLoading={formBatchesLoading}
//           error={formError}
//           saving={saving}
//           onCourseChange={changeCourse}
//           onSubmit={handleSave}
//           onClose={() => setShowForm(false)}
//         />
//       )}

//       {statusStudent && (
//         <StudentStatus
//           student={statusStudent}
//           status={newStatus}
//           onStatusChange={setNewStatus}
//           saving={statusSaving}
//           onSubmit={handleStatus}
//           onClose={() => setStatusStudent(null)}
//         />
//       )}

//       {docsStudent && <StudentDocuments student={docsStudent} onClose={() => setDocsStudent(null)} />}

//       {viewId && <StudentProfile id={viewId} courseName={courseName} batchName={batchName} onClose={() => setViewId(null)} />}
//     </div>
//   );
// };

// export default ManageStudents;

import React, { useEffect, useMemo, useState } from "react";
import { PageHeader, AddButton, TableCard, Notice, Avatar, RowMenu, btnOutline } from "../../components/ui";
import {
  RefreshCw,
  Eye,
  Pencil,
  Upload,
  UserCog,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";
import {
  getStudents,
  createStudent,
  updateStudent,
  setStudentStatus,
  exportStudents,
  downloadStudentTemplate,
  importStudents,
} from "../students/studentService";
import { getCourses, getBatches } from "../courses/courseService";
import { getErrorMessage } from "../../services/api";
import { ExportMenu, ImportModal } from "../../components/ImportExport";
import { getId, fmtDate, toDateInput, titleCase } from "../../services/helpers";
import CreateStudent from "../students/CreateStudent";
import StudentStatus from "../students/StudentStatus";
import StudentDocuments from "../students/StudentDocuments";
import StudentProfile from "../students/StudentProfile";
import { STATUSES, emptyForm, EDITABLE, statusClass } from "../students/studentUtils";

const LIMIT = 20;

// A relation can come back as an id or as a populated object, under several key names
const pick = (o, ...keys) => {
  for (const k of keys) if (o[k] !== undefined && o[k] !== null) return o[k];
  return undefined;
};
const relId = (v) => (v && typeof v === "object" ? v.id || v._id : v) || "";

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [clientFilters, setClientFilters] = useState([]); // filters the API refused, applied here instead
  const [courses, setCourses] = useState([]);
  const [batchNames, setBatchNames] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // filters
  const [statusFilter, setStatusFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [batchFilter, setBatchFilter] = useState("");
  const [filterBatches, setFilterBatches] = useState([]);

  // create / edit
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [formBatches, setFormBatches] = useState([]);
  const [formBatchesLoading, setFormBatchesLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [showImport, setShowImport] = useState(false);
  const [viewId, setViewId] = useState(null);
  const [docsStudent, setDocsStudent] = useState(null);
  const [statusStudent, setStatusStudent] = useState(null);
  const [newStatus, setNewStatus] = useState("active");
  const [statusSaving, setStatusSaving] = useState(false);

  // courses once
  useEffect(() => {
    let cancelled = false;
    getCourses()
      .then((list) => !cancelled && setCourses(list))
      .catch(() => { });
    return () => {
      cancelled = true;
    };
  }, []);

  // GET /students  (+ batch names for the courses on this page)
  useEffect(() => {
    let cancelled = false;
    getStudents({ page, limit: LIMIT, status: statusFilter, course_id: courseFilter, batch_id: batchFilter })
      .then(async (res) => {
        const courseIds = [...new Set(res.list.map((s) => relId(pick(s, "course_id", "course"))).filter(Boolean))];
        const batchLists = await Promise.all(courseIds.map((id) => getBatches(id).catch(() => [])));
        if (cancelled) return;
        setBatchNames(Object.fromEntries(batchLists.flat().map((b) => [getId(b), b.name])));
        setStudents(res.list);
        setClientFilters(res.clientFilters || []);
        setTotalPages(res.totalPages);
        setError("");
      })
      .catch((err) => !cancelled && setError(getErrorMessage(err, "Could not load students")))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [page, statusFilter, courseFilter, batchFilter, reloadKey]);

  const reload = () => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  const applyFilter = (setter) => (value) => {
    setLoading(true);
    setPage(1);
    setter(value);
  };

  const changeCourseFilter = (id) => {
    applyFilter(setCourseFilter)(id);
    setBatchFilter("");
    setFilterBatches([]);
    if (id) getBatches(id).then(setFilterBatches).catch(() => { });
  };

  const goToPage = (p) => {
    setLoading(true);
    setPage(p);
  };

  // Apply locally any filter the API does not accept
  const visibleStudents = useMemo(() => {
    return students.filter((s) => {
      if (clientFilters.includes("course_id") && relId(pick(s, "course_id", "course")) !== courseFilter) return false;
      if (clientFilters.includes("batch_id") && relId(pick(s, "batch_id", "batch")) !== batchFilter) return false;
      if (clientFilters.includes("status") && String(s.status || "active").toLowerCase() !== statusFilter) return false;
      return true;
    });
  }, [students, clientFilters, courseFilter, batchFilter, statusFilter]);

  const hasNext = clientFilters.length ? false : totalPages ? page < totalPages : students.length === LIMIT;

  const courseNames = useMemo(() => Object.fromEntries(courses.map((c) => [getId(c), c.name])), [courses]);
  const nameOf = (v, map) => (v && typeof v === "object" ? v.name || v.title : map[v]) || "-";
  const courseName = (s) => nameOf(pick(s, "course_id", "course"), courseNames);
  const batchName = (s) => nameOf(pick(s, "batch_id", "batch"), batchNames);

  /* ───── create / edit ───── */

  const loadFormBatches = (courseId) => {
    setFormBatches([]);
    if (!courseId) return;
    setFormBatchesLoading(true);
    getBatches(courseId)
      .then(setFormBatches)
      .catch((err) => setFormError(getErrorMessage(err, "Could not load batches")))
      .finally(() => setFormBatchesLoading(false));
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setFormBatches([]);
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({
      ...emptyForm(),
      full_name: s.full_name || s.name || "",
      dob: toDateInput(s.dob),
      gender: s.gender || "",
      phone: s.phone || "",
      email: s.email || "",
      address: s.address || "",
      guardian_name: s.guardian_name || "",
      guardian_phone: s.guardian_phone || "",
      qualification: s.qualification || "",
    });
    setFormError("");
    setShowForm(true);
  };

  const changeCourse = (e) => {
    setForm({ ...form, course_id: e.target.value, batch_id: "" });
    loadFormBatches(e.target.value);
  };

  const validate = () => {
    const f = form;
    if (!f.full_name.trim()) return "Full name is required";
    if (!f.phone.trim()) return "Phone number is required";
    if (!/^\d{10}$/.test(f.phone.trim())) return "Enter a 10-digit phone number";
    if (f.guardian_phone.trim() && !/^\d{10}$/.test(f.guardian_phone.trim())) return "Guardian phone must be 10 digits";
    if (f.email.trim() && !/^\S+@\S+\.\S+$/.test(f.email.trim())) return "Enter a valid email address";
    if (!editing) {
      if (!f.course_id) return "Select a course";
      if (!f.admitted_on) return "Admission date is required";
    }
    return "";
  };

  // POST /students   or   PUT /students/:id (changed fields only)
  const handleSave = async (e) => {
    e.preventDefault();
    const problem = validate();
    if (problem) return setFormError(problem);

    const trimmed = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v]));

    setSaving(true);
    try {
      if (editing) {
        const original = {
          full_name: editing.full_name || editing.name || "",
          dob: toDateInput(editing.dob),
          gender: editing.gender || "",
          phone: editing.phone || "",
          email: editing.email || "",
          address: editing.address || "",
          guardian_name: editing.guardian_name || "",
          guardian_phone: editing.guardian_phone || "",
          qualification: editing.qualification || "",
        };
        const changes = Object.fromEntries(EDITABLE.filter((k) => trimmed[k] !== original[k]).map((k) => [k, trimmed[k]]));
        if (Object.keys(changes).length) {
          await updateStudent(getId(editing), changes);
          setNotice(`${trimmed.full_name} updated`);
        }
      } else {
        // send required fields always, optional fields only when filled
        const body = Object.fromEntries(Object.entries(trimmed).filter(([, v]) => v !== ""));
        await createStudent(body);
        setNotice(`${trimmed.full_name} admitted`);
      }
      setShowForm(false);
      if (!editing && page !== 1) goToPage(1);
      else reload();
    } catch (err) {
      setFormError(getErrorMessage(err, editing ? "Could not update student" : "Could not create student"));
    } finally {
      setSaving(false);
    }
  };

  /* ───── status ───── */

  const openStatus = (s) => {
    setStatusStudent(s);
    setNewStatus(String(s.status || "active").toLowerCase());
  };

  // PATCH /students/:id/status
  const handleStatus = async (e) => {
    e.preventDefault();
    setStatusSaving(true);
    setError("");
    try {
      await setStudentStatus(getId(statusStudent), newStatus);
      setNotice(`${statusStudent.name} marked as ${newStatus}`);
      setStatusStudent(null);
      reload();
    } catch (err) {
      setError(getErrorMessage(err, "Could not change student status"));
      setStatusStudent(null);
    } finally {
      setStatusSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="Students" subtitle="Admissions and student profiles" />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 mb-4 flex flex-col lg:flex-row lg:items-center gap-3">

        <select
          value={courseFilter}
          onChange={(e) => changeCourseFilter(e.target.value)}
          className="lg:w-44 px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white"
        >
          <option value="">All courses</option>
          {courses.map((c) => (
            <option key={getId(c)} value={getId(c)}>{c.name}</option>
          ))}
        </select>
        <select
          value={batchFilter}
          onChange={(e) => applyFilter(setBatchFilter)(e.target.value)}
          disabled={!courseFilter}
          className="lg:w-48 px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white disabled:bg-slate-50 disabled:text-slate-400"
        >
          <option value="">{courseFilter ? "All batches" : "Pick a course first"}</option>
          {filterBatches.map((b) => (
            <option key={getId(b)} value={getId(b)}>{b.name}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => applyFilter(setStatusFilter)(e.target.value)}
          className="lg:w-36 px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white"
        >
          <option value="">All status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{titleCase(s)}</option>
          ))}
        </select>

        <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
          <button onClick={reload} className={btnOutline} aria-label="Refresh">
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <ExportMenu onError={setError} exportFn={() => exportStudents()} formats={["xlsx"]} label="students" />
          <button onClick={() => setShowImport(true)} className={btnOutline}>
            <Upload size={15} /> Import
          </button>
          <AddButton onClick={openCreate}>Add Student</AddButton>
        </div>
      </div>

      {notice && <Notice onClose={() => setNotice("")}>{notice}</Notice>}
      {error && <Notice tone="error">{error}</Notice>}

      <TableCard>
        <table className="w-full text-sm text-left">
          <thead className="bg-[#0B1437] text-white">
            <tr>
              <th className="px-4 py-3 font-medium">Student ID</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Course</th>
              <th className="px-4 py-3 font-medium">Batch</th>
              <th className="px-4 py-3 font-medium">Admitted</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-gray-500">Loading students...</td>
              </tr>
            ) : visibleStudents.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                  {statusFilter || courseFilter ? "No students match your filters." : "No students yet. Add the first one."}
                </td>
              </tr>
            ) : (
              visibleStudents.map((s, i) => {
                const status = String(s.status || "active").toLowerCase();
                return (
                  <tr key={getId(s) || i}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700 whitespace-nowrap">{s.rollNo || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={s.name} />
                        <div>
                          <p className="font-medium text-gray-900">{s.name || "-"}</p>
                          {s.email && <p className="text-xs text-gray-500">{s.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{s.phone || "-"}</td>
                    <td className="px-4 py-3 text-gray-600">{courseName(s)}</td>
                    <td className="px-4 py-3 text-gray-600">{batchName(s)}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmtDate(s.admitted_on)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusClass(status)}`}>
                        {titleCase(status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <RowMenu
                        items={[
                          { label: "View profile", icon: Eye, onClick: () => setViewId(getId(s)) },
                          { label: "Documents", icon: FileText, onClick: () => setDocsStudent(s) },
                          { label: "Edit profile", icon: Pencil, onClick: () => openEdit(s) },
                          { label: "Change status", icon: UserCog, onClick: () => openStatus(s) },
                        ]}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </TableCard>

      {!clientFilters.length && (page > 1 || hasNext) && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
          <span>
            Page {page}
            {totalPages ? ` of ${totalPages}` : ""}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page === 1 || loading}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <button
              onClick={() => goToPage(page + 1)}
              disabled={!hasNext || loading}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Bulk import (Excel) */}
      {showImport && (
        <ImportModal
          title="Import students"
          entity="students"
          description="Upload an Excel file with your students. Download the template first so the columns match. Rows with a duplicate Student ID or an unknown course are skipped and listed in the report."
          importFn={importStudents}
          templateFn={() => downloadStudentTemplate()}
          templateFormats={["xlsx"]}
          accept=".xlsx"
          fileTypesLabel=".xlsx"
          invalidMessage="Only Excel (.xlsx) files are allowed"
          onClose={() => setShowImport(false)}
          onImported={() => {
            setNotice("Students import finished");
            if (page !== 1) goToPage(1);
            else reload();
          }}
        />
      )}

      {showForm && (
        <CreateStudent
          editing={editing}
          form={form}
          setForm={setForm}
          courses={courses}
          batches={formBatches}
          batchesLoading={formBatchesLoading}
          error={formError}
          saving={saving}
          onCourseChange={changeCourse}
          onSubmit={handleSave}
          onClose={() => setShowForm(false)}
        />
      )}

      {statusStudent && (
        <StudentStatus
          student={statusStudent}
          status={newStatus}
          onStatusChange={setNewStatus}
          saving={statusSaving}
          onSubmit={handleStatus}
          onClose={() => setStatusStudent(null)}
        />
      )}

      {docsStudent && <StudentDocuments student={docsStudent} onClose={() => setDocsStudent(null)} />}

      {viewId && <StudentProfile id={viewId} courseName={courseName} batchName={batchName} onClose={() => setViewId(null)} />}
    </div>
  );
};

export default ManageStudents;
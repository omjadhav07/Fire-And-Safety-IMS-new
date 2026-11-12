// import React, { useEffect, useMemo, useState } from "react";
// import { RefreshCw, Eye, FilePlus2 } from "lucide-react";
// import { getExamForms, getExamFormById, submitExamForm } from "./examFormService";
// import { getExams } from "../exams/examService";
// import { getErrorMessage } from "../../services/api";
// import Modal from "../../components/Modal";
// import Field from "../../components/Field";
// import { fmtDate, titleCase, inputClass } from "../../services/helpers";
// import { pick, relId, relName } from "../schedules/scheduleUtils";
// import { ROLE, getCurrentRole } from "../../config/permissions";
// import { PageHeader, Toolbar, AddButton, TableCard, Notice, Avatar, StatusPill, RowMenu, btnOutline, btnPrimary } from "../../components/ui";

// const getId = (o) => (o && typeof o === "object" ? o.id || o._id : o) || "";
// const examOf = (f) => pick(f, "exam_id", "exam");
// const studentOf = (f) => pick(f, "student_id", "student", "user_id", "user");
// const examTitle = (f, map) => relName(examOf(f), map) || f.exam_title || "-";
// const examSubject = (f, map) => {
//   const e = examOf(f);
//   return (e && typeof e === "object" ? e.subject : map?.[relId(e)]?.subject) || "";
// };
// const studentName = (f) => {
//   const s = studentOf(f);
//   return (s && typeof s === "object" ? s.name || s.full_name : "") || f.student_name || "-";
// };
// const statusOf = (f) => String(f.status || "submitted").toLowerCase();
// const statusTone = (s) => (["approved", "accepted", "verified", "paid"].includes(s) ? "green" : ["rejected", "cancelled"].includes(s) ? "red" : s === "pending" ? "amber" : "blue");
// const submittedAt = (f) => f.submitted_at || f.created_at || f.createdAt;

// // An exam accepts forms between its form start and end date (when both are set)
// const formsOpen = (e) => {
//   const today = new Date().toISOString().slice(0, 10);
//   const start = String(e.form_start_date || "").slice(0, 10);
//   const end = String(e.form_end_date || "").slice(0, 10);
//   if (start && today < start) return false;
//   if (end && today > end) return false;
//   return !["cancelled", "completed"].includes(String(e.status || "").toLowerCase());
// };

// const ManageExamForms = () => {
//   const isStudent = getCurrentRole() === ROLE.STUDENT;

//   const [forms, setForms] = useState([]);
//   const [exams, setExams] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [notice, setNotice] = useState("");
//   const [reloadKey, setReloadKey] = useState(0);
//   const [filters, setFilters] = useState({ exam: "", status: "", q: "" });

//   const [detail, setDetail] = useState(null); // form being viewed
//   const [detailLoading, setDetailLoading] = useState(false);
//   const [applying, setApplying] = useState(false);
//   const [applyExam, setApplyExam] = useState("");
//   const [applyError, setApplyError] = useState("");
//   const [saving, setSaving] = useState(false);

//   // GET /exam-forms (staff) or /student/exam-forms (student), plus the exams for names and the apply list
//   useEffect(() => {
//     let cancelled = false;
//     Promise.all([getExamForms({ student: isStudent }), getExams({ limit: 100 }).catch(() => [])])
//       .then(([list, examList]) => {
//         if (cancelled) return;
//         setForms(list);
//         setExams(examList.list || examList);
//         setError("");
//       })
//       .catch((err) => !cancelled && setError(getErrorMessage(err, "Could not load exam forms")))
//       .finally(() => !cancelled && setLoading(false));
//     return () => {
//       cancelled = true;
//     };
//   }, [reloadKey, isStudent]);

//   const reload = () => {
//     setLoading(true);
//     setReloadKey((k) => k + 1);
//   };

//   const examMap = useMemo(() => Object.fromEntries(exams.map((e) => [getId(e), e])), [exams]);
//   const examNames = useMemo(() => Object.fromEntries(exams.map((e) => [getId(e), e.title || e.name])), [exams]);

//   const statuses = useMemo(() => [...new Set(forms.map(statusOf))].sort(), [forms]);

//   const shown = useMemo(() => {
//     const q = filters.q.trim().toLowerCase();
//     return forms.filter((f) => {
//       if (filters.exam && relId(examOf(f)) !== filters.exam) return false;
//       if (filters.status && statusOf(f) !== filters.status) return false;
//       if (!q) return true;
//       return [studentName(f), examTitle(f, examNames), examSubject(f, examMap), f.roll_no, f.form_no].some((v) =>
//         String(v ?? "").toLowerCase().includes(q)
//       );
//     });
//   }, [forms, filters, examNames, examMap]);

//   // Exams the student can still apply for
//   const appliedIds = useMemo(() => new Set(forms.map((f) => relId(examOf(f)))), [forms]);
//   const applyable = useMemo(() => exams.filter((e) => formsOpen(e) && !appliedIds.has(getId(e))), [exams, appliedIds]);

//   const openDetail = async (f) => {
//     setDetail(f);
//     if (isStudent) return; // students have no single-form endpoint; the row already has the details
//     setDetailLoading(true);
//     try {
//       setDetail(await getExamFormById(getId(f)));
//     } catch (err) {
//       setError(getErrorMessage(err, "Could not load the exam form"));
//     } finally {
//       setDetailLoading(false);
//     }
//   };

//   // POST /student/exam-forms  { exam_id }
//   const handleApply = async (e) => {
//     e.preventDefault();
//     if (!applyExam) return setApplyError("Select an exam");
//     setSaving(true);
//     setApplyError("");
//     try {
//       await submitExamForm(applyExam);
//       setApplying(false);
//       setApplyExam("");
//       setNotice("Exam form submitted");
//       reload();
//     } catch (err) {
//       setApplyError(getErrorMessage(err, "Could not submit the exam form"));
//     } finally {
//       setSaving(false);
//     }
//   };

//   const colSpan = isStudent ? 6 : 7;
//   const hasFilter = !!(filters.exam || filters.status || filters.q);

//   return (
//     <div>
//       <PageHeader
//         title="Exam Forms"
//         subtitle={isStudent ? "Apply for exams and track your forms" : "Exam forms submitted by students"}
//       />

//       {notice && <Notice onClose={() => setNotice("")}>{notice}</Notice>}
//       {error && <Notice tone="error">{error}</Notice>}

//       <Toolbar value={filters.q} onChange={(v) => setFilters((f) => ({ ...f, q: v }))} placeholder={isStudent ? "Search exam or subject" : "Search student, exam or subject"}>
//         <select
//           value={filters.exam}
//           onChange={(e) => setFilters((f) => ({ ...f, exam: e.target.value }))}
//           className="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white max-w-[14rem]"
//         >
//           <option value="">All exams</option>
//           {exams.map((e) => (
//             <option key={getId(e)} value={getId(e)}>{e.title || e.name}</option>
//           ))}
//         </select>
//         <select
//           value={filters.status}
//           onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
//           className="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white"
//         >
//           <option value="">All status</option>
//           {statuses.map((s) => (
//             <option key={s} value={s}>{titleCase(s)}</option>
//           ))}
//         </select>
//         <button onClick={reload} className={btnOutline} aria-label="Refresh">
//           <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
//         </button>
//         {isStudent && <AddButton onClick={() => setApplying(true)}>Apply for exam</AddButton>}
//       </Toolbar>

//       <TableCard>
//         <table className="w-full text-sm text-left">
//           <thead className="bg-[#0B1437] text-white">
//             <tr>
//               {!isStudent && <th className="px-4 py-3">Student</th>}
//               <th className="px-4 py-3">Exam</th>
//               <th className="px-4 py-3">Subject</th>
//               <th className="px-4 py-3">Exam date</th>
//               <th className="px-4 py-3">Submitted</th>
//               <th className="px-4 py-3">Status</th>
//               <th className="px-4 py-3 text-right">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-slate-100">
//             {loading ? (
//               <tr><td colSpan={colSpan + 1} className="px-4 py-10 text-center text-slate-500">Loading exam forms...</td></tr>
//             ) : shown.length === 0 ? (
//               <tr>
//                 <td colSpan={colSpan + 1} className="px-4 py-10 text-center text-slate-500">
//                   {hasFilter ? "No exam forms match your filters." : isStudent ? "You have not submitted any exam form yet." : "No exam forms yet."}
//                 </td>
//               </tr>
//             ) : (
//               shown.map((f, i) => {
//                 const examObj = examOf(f);
//                 const examDate = (examObj && typeof examObj === "object" ? examObj.exam_date : examMap[relId(examObj)]?.exam_date) || f.exam_date;
//                 return (
//                   <tr key={getId(f) || i}>
//                     {!isStudent && (
//                       <td className="px-4 py-3">
//                         <div className="flex items-center gap-3">
//                           <Avatar name={studentName(f)} />
//                           <p className="font-medium text-slate-900">{studentName(f)}</p>
//                         </div>
//                       </td>
//                     )}
//                     <td className="px-4 py-3 font-medium text-slate-900">{examTitle(f, examNames)}</td>
//                     <td className="px-4 py-3 text-slate-600">{examSubject(f, examMap) || "-"}</td>
//                     <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{fmtDate(examDate)}</td>
//                     <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{fmtDate(submittedAt(f))}</td>
//                     <td className="px-4 py-3"><StatusPill tone={statusTone(statusOf(f))}>{titleCase(statusOf(f))}</StatusPill></td>
//                     <td className="px-4 py-3 text-right">
//                       <RowMenu items={[{ label: "View form", icon: Eye, onClick: () => openDetail(f) }]} />
//                     </td>
//                   </tr>
//                 );
//               })
//             )}
//           </tbody>
//         </table>
//       </TableCard>

//       {/* View one form */}
//       {detail && (
//         <Modal title="Exam form" onClose={() => setDetail(null)} maxWidth="max-w-lg">
//           {detailLoading ? (
//             <p className="text-sm text-slate-500">Loading...</p>
//           ) : (
//             <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
//               {[
//                 ["Student", studentName(detail)],
//                 ["Exam", examTitle(detail, examNames)],
//                 ["Subject", examSubject(detail, examMap) || "-"],
//                 ["Submitted", fmtDate(submittedAt(detail))],
//                 ["Status", titleCase(statusOf(detail))],
//                 ["Form no.", detail.form_no || detail.formNo || getId(detail)],
//               ].map(([k, v]) => (
//                 <div key={k}>
//                   <dt className="text-xs uppercase tracking-wide text-slate-500">{k}</dt>
//                   <dd className="mt-0.5 font-medium text-slate-900 break-words">{v}</dd>
//                 </div>
//               ))}
//             </dl>
//           )}
//           <div className="flex justify-end pt-5">
//             <button onClick={() => setDetail(null)} className={btnOutline}>Close</button>
//           </div>
//         </Modal>
//       )}

//       {/* Student: submit a form */}
//       {applying && (
//         <Modal title="Apply for exam" onClose={() => setApplying(false)}>
//           <form onSubmit={handleApply} className="space-y-4" noValidate>
//             {applyError && <p className="text-sm text-red-600">{applyError}</p>}
//             <Field label="Exam">
//               <select value={applyExam} onChange={(e) => setApplyExam(e.target.value)} className={inputClass}>
//                 <option value="">{applyable.length ? "Select exam" : "No exam is open for forms"}</option>
//                 {applyable.map((e) => (
//                   <option key={getId(e)} value={getId(e)}>
//                     {e.title || e.name}{e.subject ? ` - ${e.subject}` : ""}{e.exam_date ? ` (${fmtDate(e.exam_date)})` : ""}
//                   </option>
//                 ))}
//               </select>
//               <p className="text-xs text-slate-500 mt-1">Only exams whose form window is open are listed.</p>
//             </Field>
//             <div className="flex justify-end gap-3 pt-2">
//               <button type="button" onClick={() => setApplying(false)} className={btnOutline}>Cancel</button>
//               <button type="submit" disabled={saving || !applyable.length} className={btnPrimary}>
//                 <FilePlus2 size={16} /> {saving ? "Submitting..." : "Submit form"}
//               </button>
//             </div>
//           </form>
//         </Modal>
//       )}
//     </div>
//   );
// };

// export default ManageExamForms;




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
} from "../students/studentService"; // ✅ FIXED: Points to src/pages/students/studentService.js
import { getCourses, getBatches } from "../courses/courseService"; // ✅ FIXED: Points to src/pages/courses/courseService.js
import { getErrorMessage } from "../../services/api";
import { ExportMenu, ImportModal } from "../../components/ImportExport";
import { getId, fmtDate, toDateInput, titleCase } from "../../services/helpers";
import CreateStudent from "../students/CreateStudent"; // ✅ FIXED
import StudentStatus from "../students/StudentStatus"; // ✅ FIXED
import StudentDocuments from "../students/StudentDocuments"; // ✅ FIXED
import StudentProfile from "../students/StudentProfile"; // ✅ FIXED
import { STATUSES, emptyForm, EDITABLE, statusClass } from "../students/studentUtils"; // ✅ FIXED

const LIMIT = 20;

const pick = (o, ...keys) => {
  for (const k of keys) if (o[k] !== undefined && o[k] !== null) return o[k];
  return undefined;
};
const relId = (v) => (v && typeof v === "object" ? v.id || v._id : v) || "";

const ManageExamForms = () => {
  const [students, setStudents] = useState([]);
  const [clientFilters, setClientFilters] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batchNames, setBatchNames] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [statusFilter, setStatusFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [batchFilter, setBatchFilter] = useState("");
  const [filterBatches, setFilterBatches] = useState([]);

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

  useEffect(() => {
    let cancelled = false;
    getCourses()
      .then((list) => !cancelled && setCourses(list))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

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
    if (id) getBatches(id).then(setFilterBatches).catch(() => {});
  };

  const goToPage = (p) => {
    setLoading(true);
    setPage(p);
  };

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

  const openStatus = (s) => {
    setStatusStudent(s);
    setNewStatus(String(s.status || "active").toLowerCase());
  };

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
      <PageHeader title="Exam Forms" subtitle="Manage student exam forms and applications" />

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

export default ManageExamForms;
import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  RefreshCw,
  Eye,
  Pencil,
  Upload,
  UserCog,
  Workflow,
  ChevronLeft,
  ChevronRight,
  FileText,
  Download,
} from "lucide-react";
import {
  getStudents,
  createStudent,
  updateStudent,
  setStudentStatus,
  exportStudents,
  downloadStudentTemplate,
  importStudents,
} from "./studentService";
import { getCourses, getBatches } from "../courses/courseService";
import { getErrorMessage } from "../../services/api";
import StageModal from "./StudentStage";
import { ExportMenu, ImportModal } from "../../components/ImportExport";
import { stageStatusClass } from "./studentUtils";
import { getId, fmtDate, toDateInput, titleCase, inputClass } from "../../services/helpers";
import CreateStudent from "./CreateStudent";
import StudentStatus from "./StudentStatus";
import StudentDocuments from "./StudentDocuments";
import StudentProfile from "./StudentProfile";
import { STATUSES, emptyForm, EDITABLE, statusClass } from "./studentUtils";

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
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
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
  const [stageStudent, setStageStudent] = useState(null);
  const [newStatus, setNewStatus] = useState("active");
  const [statusSaving, setStatusSaving] = useState(false);

  // courses once
  useEffect(() => {
    let cancelled = false;
    getCourses()
      .then((list) => !cancelled && setCourses(list))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // debounce the search box
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput.trim() !== search) {
        setLoading(true);
        setPage(1);
        setSearch(searchInput.trim());
      }
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput, search]);

  // GET /students  (+ batch names for the courses on this page)
  useEffect(() => {
    let cancelled = false;
    getStudents({ page, limit: LIMIT, search, status: statusFilter, course_id: courseFilter, batch_id: batchFilter })
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
  }, [page, search, statusFilter, courseFilter, batchFilter, reloadKey]);

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

  // Apply locally any filter the API does not accept
  const visibleStudents = useMemo(() => {
    const q = search.toLowerCase();
    return students.filter((s) => {
      if (clientFilters.includes("course_id") && relId(pick(s, "course_id", "course")) !== courseFilter) return false;
      if (clientFilters.includes("batch_id") && relId(pick(s, "batch_id", "batch")) !== batchFilter) return false;
      if (clientFilters.includes("status") && String(s.status || "active").toLowerCase() !== statusFilter) return false;
      if (clientFilters.includes("search")) {
        return [s.name, s.rollNo, s.phone, s.email].some((v) => String(v ?? "").toLowerCase().includes(q));
      }
      return true;
    });
  }, [students, clientFilters, courseFilter, batchFilter, statusFilter, search]);

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
    if (!editing && !f.student_id.trim()) return "Student ID is required";
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
        setNotice(`${trimmed.full_name} admitted (${trimmed.student_id})`);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-sm text-gray-500 mt-1">Admissions and student profiles</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={reload}
            className="p-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
            aria-label="Refresh"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <ExportMenu onError={setError} exportFn={() => exportStudents()} formats={["xlsx"]} label="students" />
          <button
            onClick={() => setShowImport(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Upload size={16} /> Import
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#16A34A] text-white font-medium hover:bg-[#15803D]"
          >
            <Plus size={18} /> Add student
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, student ID, phone or email"
            className={`${inputClass} pl-9 bg-white`}
          />
        </div>
        <select
          value={courseFilter}
          onChange={(e) => changeCourseFilter(e.target.value)}
          className={`${inputClass} lg:w-52 bg-white`}
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
          className={`${inputClass} lg:w-44 bg-white disabled:bg-gray-50 disabled:text-gray-400`}
        >
          <option value="">{courseFilter ? "All batches" : "Pick a course first"}</option>
          {filterBatches.map((b) => (
            <option key={getId(b)} value={getId(b)}>{b.name}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => applyFilter(setStatusFilter)(e.target.value)}
          className={`${inputClass} lg:w-40 bg-white`}
        >
          <option value="">All status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{titleCase(s)}</option>
          ))}
        </select>
      </div>

      {notice && (
        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 flex justify-between">
          <span>{notice}</span>
          <button onClick={() => setNotice("")} aria-label="Dismiss">×</button>
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 font-medium">Student ID</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Course</th>
              <th className="px-4 py-3 font-medium">Batch</th>
              <th className="px-4 py-3 font-medium">Admitted</th>
              <th className="px-4 py-3 font-medium">Stage</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-gray-500">Loading students...</td>
              </tr>
            ) : visibleStudents.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-gray-500">
                  {search || statusFilter || courseFilter ? "No students match your filters." : "No students yet. Add the first one."}
                </td>
              </tr>
            ) : (
              visibleStudents.map((s, i) => {
                const status = String(s.status || "active").toLowerCase();
                return (
                  <tr key={getId(s) || i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-700 whitespace-nowrap">{s.rollNo || "-"}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{s.name || "-"}</p>
                      {s.email && <p className="text-xs text-gray-500">{s.email}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{s.phone || "-"}</td>
                    <td className="px-4 py-3 text-gray-600">{courseName(s)}</td>
                    <td className="px-4 py-3 text-gray-600">{batchName(s)}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmtDate(s.admitted_on)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-gray-900">{titleCase(s.lifecycle_stage || "admission")}</p>
                      <span className={`mt-0.5 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${stageStatusClass(s.stage_status || "pending")}`}>
                        {titleCase(s.stage_status || "pending")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusClass(status)}`}>
                        {titleCase(status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                        <button
                          onClick={() => setViewId(getId(s))}
                          title="View profile"
                          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => setDocsStudent(s)}
                          title="Documents"
                          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-blue-600"
                        >
                          <FileText size={16} />
                        </button>
                        <button
                          onClick={() => openEdit(s)}
                          title="Edit profile"
                          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setStageStudent(s)}
                          title="Lifecycle stage"
                          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-green-700"
                        >
                          <Workflow size={16} />
                        </button>
                        <button
                          onClick={() => openStatus(s)}
                          title="Change status"
                          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-amber-600"
                        >
                          <UserCog size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

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

      {stageStudent && (
        <StageModal
          student={stageStudent}
          onClose={() => setStageStudent(null)}
          onUpdated={(msg) => {
            setNotice(msg);
            reload();
          }}
        />
      )}

      {docsStudent && <StudentDocuments student={docsStudent} onClose={() => setDocsStudent(null)} />}

      {viewId && <StudentProfile id={viewId} courseName={courseName} batchName={batchName} onClose={() => setViewId(null)} />}
    </div>
  );
};

export default ManageStudents;

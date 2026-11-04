import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, RefreshCw, ClipboardCheck, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { getExams, deleteExam } from "./examService";
import { getCourses, getBatches } from "../courses/courseService";
import { getUsers } from "../users/userService";
import { getErrorMessage } from "../../services/api";
import { getId, fmtDate, titleCase, inputClass } from "../../services/helpers";
import { pick, relId, relName, roleOf } from "../schedules/scheduleUtils";
import { ROLE, getCurrentRole } from "../../config/permissions";
import { EXAM_TYPES, EXAM_STATUSES, examStatusClass, formWindowState } from "./examUtils";
import CreateExam from "./CreateExam";

const LIMIT = 10;
const WINDOW_STYLES = {
  open: "bg-green-100 text-green-700",
  upcoming: "bg-blue-100 text-blue-700",
  closed: "bg-gray-100 text-gray-600",
};

// All exams: filter, create, edit, delete, and open one to enter marks / publish results
const ManageExams = () => {
  const navigate = useNavigate();
  const role = getCurrentRole();
  // Create / edit / delete: Super Admin and Faculty. Office staff can view the list.
  const canManage = role === ROLE.SUPER_ADMIN || role === ROLE.FACULTY;
  const canFilterFaculty = role === ROLE.SUPER_ADMIN || role === ROLE.OFFICE_STAFF;

  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [filterBatches, setFilterBatches] = useState([]);
  const [batchNames, setBatchNames] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // filters sent to GET /exams
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    course_id: "",
    batch_id: "",
    faculty_id: "",
    exam_type: "",
    status: "",
    start_date: "",
    end_date: "",
  });

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getCourses()
      .then((c) => !cancelled && setCourses(c))
      .catch(() => {});
    if (canFilterFaculty) {
      getUsers({ limit: 100 })
        .then((u) => !cancelled && setFacultyList(u.list.filter((x) => /faculty/i.test(roleOf(x)))))
        .catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, [canFilterFaculty]);

  // Search runs a moment after typing stops
  useEffect(() => {
    const t = setTimeout(() => {
      const value = searchInput.trim();
      if (value !== filters.search) {
        setLoading(true);
        setPage(1);
        setFilters((f) => ({ ...f, search: value }));
      }
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput, filters.search]);

  // GET /exams?page&limit&filters  (+ batch names for the courses on this page)
  useEffect(() => {
    let cancelled = false;
    getExams({ page, limit: LIMIT, ...filters })
      .then(async (res) => {
        const courseIds = [...new Set(res.list.map((x) => relId(pick(x, "course_id", "course"))).filter(Boolean))];
        const batchLists = await Promise.all(courseIds.map((id) => getBatches(id).catch(() => [])));
        if (cancelled) return;
        setBatchNames(Object.fromEntries(batchLists.flat().map((b) => [getId(b), b.name])));
        setExams(res.list);
        setTotalPages(res.totalPages);
        setError("");
      })
      .catch((err) => !cancelled && setError(getErrorMessage(err, "Could not load exams")))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [page, filters, reloadKey]);

  const reload = () => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  const goToPage = (p) => {
    setLoading(true);
    setPage(p);
  };

  const setFilter = (key) => (e) => {
    setLoading(true);
    setPage(1);
    setFilters((f) => ({ ...f, [key]: e.target.value }));
  };

  const changeCourse = (e) => {
    const id = e.target.value;
    setLoading(true);
    setPage(1);
    setFilters((f) => ({ ...f, course_id: id, batch_id: "" }));
    setFilterBatches([]);
    if (id) getBatches(id).then(setFilterBatches).catch(() => {});
  };

  const clearFilters = () => {
    setSearchInput("");
    setLoading(true);
    setPage(1);
    setFilterBatches([]);
    setFilters({ search: "", course_id: "", batch_id: "", faculty_id: "", exam_type: "", status: "", start_date: "", end_date: "" });
  };

  const hasFilters = Object.values(filters).some(Boolean) || searchInput.trim() !== "";
  const hasNext = totalPages ? page < totalPages : exams.length === LIMIT;

  const courseNames = useMemo(() => Object.fromEntries(courses.map((c) => [getId(c), c.name])), [courses]);
  const courseName = (x) => relName(pick(x, "course_id", "course"), courseNames) || "-";
  const batchName = (x) => relName(pick(x, "batch_id", "batch"), batchNames) || "-";
  const facultyName = (x) => relName(pick(x, "faculty_id", "faculty")) || "";

  // DELETE /exams/:id
  const handleDelete = async (x) => {
    if (!window.confirm(`Delete "${x.title}" and all its marks? This cannot be undone.`)) return;
    setBusyId(getId(x));
    setError("");
    try {
      const res = await deleteExam(getId(x));
      setNotice(res.message || `"${x.title}" deleted`);
      if (exams.length === 1 && page > 1) goToPage(page - 1);
      else reload();
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete exam"));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exams</h1>
          <p className="text-sm text-gray-500 mt-1">Schedule exams, enter marks and publish the results</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={reload}
            className="p-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
            aria-label="Refresh"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          {canManage && (
            <button
              onClick={() => {
                setEditing(null);
                setShowForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#16A34A] text-white font-medium hover:bg-[#15803D]"
            >
              <Plus size={18} /> New exam
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search exams by title or subject"
              className={`${inputClass} pl-9 bg-white`}
            />
          </div>
          <select value={filters.course_id} onChange={changeCourse} className={`${inputClass} md:w-48 bg-white`}>
            <option value="">All courses</option>
            {courses.map((c) => (
              <option key={getId(c)} value={getId(c)}>{c.name}</option>
            ))}
          </select>
          <select
            value={filters.batch_id}
            onChange={setFilter("batch_id")}
            disabled={!filters.course_id}
            className={`${inputClass} md:w-44 bg-white disabled:bg-gray-50 disabled:text-gray-400`}
          >
            <option value="">{filters.course_id ? "All batches" : "Pick a course first"}</option>
            {filterBatches.map((b) => (
              <option key={getId(b)} value={getId(b)}>{b.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {canFilterFaculty && (
            <select value={filters.faculty_id} onChange={setFilter("faculty_id")} className={`${inputClass} md:w-48 bg-white`}>
              <option value="">All faculty</option>
              {facultyList.map((f) => (
                <option key={getId(f)} value={getId(f)}>{f.name || f.email}</option>
              ))}
            </select>
          )}
          <select value={filters.exam_type} onChange={setFilter("exam_type")} className={`${inputClass} md:w-40 bg-white`}>
            <option value="">All types</option>
            {EXAM_TYPES.map((t) => (
              <option key={t} value={t}>{titleCase(t)}</option>
            ))}
          </select>
          <select value={filters.status} onChange={setFilter("status")} className={`${inputClass} md:w-40 bg-white`}>
            <option value="">All status</option>
            {EXAM_STATUSES.map((s) => (
              <option key={s} value={s}>{titleCase(s)}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            From
            <input type="date" value={filters.start_date} onChange={setFilter("start_date")} className={`${inputClass} bg-white`} />
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            To
            <input type="date" value={filters.end_date} onChange={setFilter("end_date")} className={`${inputClass} bg-white`} />
          </label>
          {hasFilters && (
            <button onClick={clearFilters} className="text-sm text-green-700 hover:underline whitespace-nowrap">
              Clear filters
            </button>
          )}
        </div>
      </div>

      {notice && (
        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 flex justify-between">
          <span>{notice}</span>
          <button onClick={() => setNotice("")} aria-label="Dismiss">×</button>
        </div>
      )}
      {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 font-medium">Exam</th>
              <th className="px-4 py-3 font-medium">Course / Batch</th>
              <th className="px-4 py-3 font-medium">Exam date</th>
              <th className="px-4 py-3 font-medium">Exam form</th>
              <th className="px-4 py-3 font-medium">Marks</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-500">Loading exams...</td>
              </tr>
            ) : exams.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                  {hasFilters ? "No exams match your filters." : canManage ? "No exams yet. Create the first one." : "No exams yet."}
                </td>
              </tr>
            ) : (
              exams.map((x, i) => {
                const status = String(x.status || "scheduled").toLowerCase();
                const win = formWindowState(x);
                const published = x.result_published ?? x.results_published ?? x.is_published ?? x.published;
                return (
                  <tr key={getId(x) || i} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <button onClick={() => navigate(`/exams/${getId(x)}`)} className="text-left font-medium text-gray-900 hover:text-green-700">
                        {x.title}
                      </button>
                      <p className="text-xs text-gray-500">
                        {[x.subject, x.exam_type && titleCase(x.exam_type), facultyName(x)].filter(Boolean).join(" · ")}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-900">{courseName(x)}</p>
                      <p className="text-xs text-gray-500">{batchName(x)}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmtDate(x.exam_date)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {win ? (
                        <>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${WINDOW_STYLES[win]}`}>{titleCase(win)}</span>
                          <p className="text-xs text-gray-500 mt-1">
                            {fmtDate(x.form_start_date)} – {fmtDate(x.form_end_date)}
                          </p>
                        </>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {x.max_marks} <span className="text-xs text-gray-400">(pass {x.passing_marks})</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${examStatusClass(status)}`}>{titleCase(status)}</span>
                      {published === true && (
                        <span className="ml-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-100 text-green-700">Results published</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/exams/${getId(x)}`)}
                          title={canManage ? "Enter marks, review and publish results" : "View marks and results"}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-green-700 hover:bg-green-50 text-xs font-medium"
                        >
                          <ClipboardCheck size={15} /> {canManage ? "Marks" : "View"}
                        </button>
                        {canManage && (
                          <>
                            <button
                              onClick={() => {
                                setEditing(x);
                                setShowForm(true);
                              }}
                              title="Edit exam"
                              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(x)}
                              disabled={busyId === getId(x)}
                              title="Delete exam"
                              className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                            >
                              <Trash2 size={16} />
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

      {(page > 1 || hasNext) && (
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

      {showForm && (
        <CreateExam
          editing={editing}
          courses={courses}
          courseName={courseName}
          batchName={batchName}
          onClose={() => setShowForm(false)}
          onSaved={(msg) => {
            setShowForm(false);
            setNotice(msg);
            if (!editing && page !== 1) goToPage(1);
            else reload();
          }}
        />
      )}
    </div>
  );
};

export default ManageExams;

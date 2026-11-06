import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, RefreshCw, ClipboardCheck, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { getClassTests, deleteClassTest } from "./classTestService";
import { getCourses, getBatches } from "../courses/courseService";
import { getErrorMessage } from "../../services/api";
import { getId, fmtDate, titleCase, inputClass } from "../../services/helpers";
import { pick, relId, relName } from "../schedules/scheduleUtils";
import { TEST_STATUSES, testStatusClass } from "./classTestUtils";
import CreateClassTest from "./CreateClassTest";

const LIMIT = 10;

const ManageClassTests = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batchNames, setBatchNames] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getCourses()
      .then((c) => !cancelled && setCourses(c))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // GET /class-tests?page&limit  (+ batch names for the courses on this page)
  useEffect(() => {
    let cancelled = false;
    getClassTests({ page, limit: LIMIT })
      .then(async (res) => {
        const courseIds = [...new Set(res.list.map((t) => relId(pick(t, "course_id", "course"))).filter(Boolean))];
        const batchLists = await Promise.all(courseIds.map((id) => getBatches(id).catch(() => [])));
        if (cancelled) return;
        setBatchNames(Object.fromEntries(batchLists.flat().map((b) => [getId(b), b.name])));
        setTests(res.list);
        setTotalPages(res.totalPages);
        setError("");
      })
      .catch((err) => !cancelled && setError(getErrorMessage(err, "Could not load class tests")))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [page, reloadKey]);

  const reload = () => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  const goToPage = (p) => {
    setLoading(true);
    setPage(p);
  };

  const hasNext = totalPages ? page < totalPages : tests.length === LIMIT;

  const courseNames = useMemo(() => Object.fromEntries(courses.map((c) => [getId(c), c.name])), [courses]);
  const courseName = (t) => relName(pick(t, "course_id", "course"), courseNames) || "-";
  const batchName = (t) => relName(pick(t, "batch_id", "batch"), batchNames) || "-";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tests.filter((t) => {
      if (statusFilter && String(t.status || "").toLowerCase() !== statusFilter) return false;
      if (courseFilter && relId(pick(t, "course_id", "course")) !== courseFilter) return false;
      if (!q) return true;
      return [t.title, t.subject].some((v) => String(v ?? "").toLowerCase().includes(q));
    });
  }, [tests, query, statusFilter, courseFilter]);

  const openCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  // DELETE /class-tests/:id
  const handleDelete = async (t) => {
    if (!window.confirm(`Delete "${t.title}" and all its marks? This cannot be undone.`)) return;
    setBusyId(getId(t));
    setError("");
    try {
      const res = await deleteClassTest(getId(t));
      setNotice(res.message || `"${t.title}" deleted`);
      reload();
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete class test"));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Class Tests</h1>
          <p className="text-sm text-gray-500 mt-1">Create tests, enter marks and see how the class performed</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={reload}
            className="p-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
            aria-label="Refresh"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0EA5E9] text-white font-medium hover:bg-[#0284C7]"
          >
            <Plus size={18} /> New class test
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tests on this page by title or subject"
            className={`${inputClass} pl-9 bg-white`}
          />
        </div>
        <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} className={`${inputClass} md:w-52 bg-white`}>
          <option value="">All courses</option>
          {courses.map((c) => (
            <option key={getId(c)} value={getId(c)}>{c.name}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={`${inputClass} md:w-44 bg-white`}>
          <option value="">All status</option>
          {TEST_STATUSES.map((s) => (
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
      {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#0B1437] text-white">
            <tr>
              <th className="px-4 py-3 font-medium">Test</th>
              <th className="px-4 py-3 font-medium">Course / Batch</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Marks</th>
              <th className="px-4 py-3 font-medium">Duration</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-500">Loading class tests...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                  {tests.length === 0 ? "No class tests yet. Create the first one." : "No tests match your filters."}
                </td>
              </tr>
            ) : (
              filtered.map((t, i) => {
                const status = String(t.status || "scheduled").toLowerCase();
                return (
                  <tr key={getId(t) || i} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <button onClick={() => navigate(`/class-tests/${getId(t)}`)} className="text-left font-medium text-gray-900 hover:text-sky-700">
                        {t.title}
                      </button>
                      <p className="text-xs text-gray-500">{t.subject}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-900">{courseName(t)}</p>
                      <p className="text-xs text-gray-500">{batchName(t)}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmtDate(t.test_date)}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {t.max_marks} <span className="text-xs text-gray-400">(pass {t.passing_marks})</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{t.duration_minutes ? `${t.duration_minutes} min` : "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${testStatusClass(status)}`}>{titleCase(status)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/class-tests/${getId(t)}`)}
                          title="Enter marks and view insights"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sky-700 hover:bg-sky-50 text-xs font-medium"
                        >
                          <ClipboardCheck size={15} /> Marks
                        </button>
                        <button
                          onClick={() => {
                            setEditing(t);
                            setShowForm(true);
                          }}
                          title="Edit test"
                          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(t)}
                          disabled={busyId === getId(t)}
                          title="Delete test"
                          className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        >
                          <Trash2 size={16} />
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
        <CreateClassTest
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

export default ManageClassTests;

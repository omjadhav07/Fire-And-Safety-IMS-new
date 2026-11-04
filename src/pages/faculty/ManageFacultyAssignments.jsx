import React, { useEffect, useMemo, useState } from "react";
import { Search, Plus, RefreshCw, Trash2 } from "lucide-react";
import { getAssignments, createAssignment, deleteAssignment } from "./facultyAssignmentService";
import { getUsers } from "../users/userService";
import { getCourses, getBatches } from "../courses/courseService";
import { getErrorMessage } from "../../services/api";
import { getId, fmtDate, inputClass } from "../../services/helpers";
import AssignFaculty from "./AssignFaculty";
import { initialForm, roleOf, pick } from "./facultyUtils";

const ManageFacultyAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [facultyFilter, setFacultyFilter] = useState("");
  const [query, setQuery] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [batches, setBatches] = useState([]);
  const [batchesLoading, setBatchesLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Load Users & Courses
  useEffect(() => {
    let cancelled = false;
    Promise.all([getUsers(), getCourses()])
      .then(([usersRes, courseRes]) => {
        if (cancelled) return;
        
        const userList = usersRes.list || [];
        const courseList = Array.isArray(courseRes) ? courseRes : (courseRes?.data || courseRes?.list || courseRes?.courses || []);

        // Filter for active faculty (case insensitive, checking string or object roles)
        const activeFaculty = userList.filter((u) => {
            const r = typeof u.role === 'string' ? u.role : u.role?.name || "";
            return r.toLowerCase().includes("faculty") && u.is_active !== false;
        });
        
        setFaculty(activeFaculty.length > 0 ? activeFaculty : userList);
        setCourses(courseList);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, "Could not load faculty or courses"));
      });
    return () => { cancelled = true; };
  }, []);

  // Load Assignments
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(""); // Clear previous errors
    
    getAssignments({ faculty_id: facultyFilter })
      .then((list) => {
        if (cancelled) return;
        setAssignments(list); // list is guaranteed to be an array now
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, "Could not load faculty assignments"));
      })
      .finally(() => {
        // THIS IS THE FIX: Always turn off loading, even if the response was empty or threw an error
        if (!cancelled) setLoading(false); 
      });

    return () => { cancelled = true; };
  }, [facultyFilter, reloadKey]);

  const reload = () => setReloadKey((k) => k + 1);
  const changeFilter = (id) => setFacultyFilter(id);

  // Format rows for the table based on your populated JSON response
  const rows = useMemo(
    () =>
      assignments.map((a) => {
        const facObj = pick(a, "faculty_id", "faculty", "facultyId");
        const courObj = pick(a, "course_id", "course", "courseId");
        const batObj = pick(a, "batch_id", "batch", "batchId");

        return {
          raw: a,
          id: a._id || a.id, // MongoDB uses _id
          faculty: facObj?.name || "Unknown faculty",
          course: courObj?.name || "-",
          batch: batObj?.name || "-",
          subject: a.subject || "-",
          date: a.createdAt || a.assignedAt,
        };
      }),
    [assignments]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => [r.faculty, r.course, r.batch, r.subject].some((v) => String(v).toLowerCase().includes(q)));
  }, [rows, query]);

  /* ───── form handlers ───── */

  const loadBatches = (courseId) => {
    setBatches([]);
    if (!courseId) return;
    setBatchesLoading(true);
    getBatches(courseId)
      .then((res) => {
          const list = Array.isArray(res) ? res : (res?.list || res?.data || []);
          setBatches(list);
      })
      .catch((err) => setFormError(getErrorMessage(err, "Could not load batches")))
      .finally(() => setBatchesLoading(false));
  };

  const openCreate = () => {
    setForm({ ...initialForm, faculty_id: facultyFilter });
    setBatches([]);
    setFormError("");
    setShowForm(true);
  };

  const changeCourse = (course_id) => {
    setForm({ ...form, course_id, batch_id: "" });
    loadBatches(course_id);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.faculty_id) return setFormError("Select a faculty member");
    if (!form.course_id) return setFormError("Select a course");
    if (!form.batch_id) return setFormError("Select a batch");
    if (!form.subject.trim()) return setFormError("Subject is required");

    setSaving(true);
    try {
      await createAssignment({
        faculty_id: form.faculty_id,
        course_id: form.course_id,
        batch_id: form.batch_id,
        subject: form.subject.trim(),
      });
      setNotice(`Assigned faculty successfully`);
      setShowForm(false);
      reload(); // Refresh the table
    } catch (err) {
      setFormError(getErrorMessage(err, "Could not create assignment"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this assignment?")) return;
    setDeletingId(id);
    try {
      await deleteAssignment(id);
      setNotice("Assignment removed successfully.");
      reload();
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete assignment"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Faculty Assignments</h1>
          <p className="text-sm text-gray-500 mt-1">{rows.length} assignments</p>
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
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#16A34A] text-white font-medium hover:bg-[#15803D]"
          >
            <Plus size={18} /> Assign faculty
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search faculty, course, batch or subject"
            className={`${inputClass} pl-9 bg-white`}
          />
        </div>
        <select
          value={facultyFilter}
          onChange={(e) => changeFilter(e.target.value)}
          className={`${inputClass} md:w-64 bg-white`}
        >
          <option value="">All faculty</option>
          {faculty.map((f) => (
            <option key={getId(f)} value={getId(f)}>{f.name || f.email}</option>
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
              <th className="px-4 py-3 font-medium">Faculty</th>
              <th className="px-4 py-3 font-medium">Course</th>
              <th className="px-4 py-3 font-medium">Batch</th>
              <th className="px-4 py-3 font-medium">Subject</th>
              <th className="px-4 py-3 font-medium">Assigned on</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-500">Loading assignments...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                  {rows.length === 0 ? "No assignments yet." : "No assignments match your search."}
                </td>
              </tr>
            ) : (
              filtered.map((r, i) => (
                <tr key={r.id || i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{r.faculty}</td>
                  <td className="px-4 py-3 text-gray-600">{r.course}</td>
                  <td className="px-4 py-3 text-gray-600">{r.batch}</td>
                  <td className="px-4 py-3 text-gray-900">{r.subject}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmtDate(r.date)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(r.id)}
                      disabled={deletingId === r.id}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                      title="Remove assignment"
                    >
                      <Trash2 size={16} className={deletingId === r.id ? "animate-pulse" : ""} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <AssignFaculty
          batches={batches}
          batchesLoading={batchesLoading}
          changeCourse={changeCourse}
          courses={courses}
          faculty={faculty}
          form={form}
          formError={formError}
          handleSave={handleSave}
          saving={saving}
          setForm={setForm}
          setShowForm={setShowForm}
        />
      )}
    </div>
  );
};

export default ManageFacultyAssignments;
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, RefreshCw, IndianRupee, CalendarDays, Pencil, Power } from "lucide-react";
import {
  getCourses,
  createCourse,
  updateCourse,
  setCourseStatus,
  getFeeComponents,
} from "./courseService";
import { getErrorMessage } from "../../services/api";
import CreateCourse from "./CreateCourse";
import { initialForm, getId, isActive } from "./courseUtils";

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // editing: null = create mode, course object = edit mode
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getCourses()
      .then((list) => {
        if (cancelled) return;
        setCourses(list);
        setError("");

        // GET /courses does not return total_fee, so fill it from each course's fee components
        // (same total shown on the Fee components page). The table shows first, totals appear as they load.
        const missing = list.filter((c) => c.total_fee === undefined || c.total_fee === null);
        Promise.all(
          missing.map((c) =>
            getFeeComponents(getId(c))
              .then((r) => [getId(c), r.total])
              .catch(() => null)
          )
        ).then((pairs) => {
          if (cancelled) return;
          const totals = Object.fromEntries(pairs.filter(Boolean));
          setCourses((prev) => prev.map((c) => (getId(c) in totals ? { ...c, total_fee: totals[getId(c)] } : c)));
        });
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, "Could not load courses"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const reload = () => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (course) => {
    setEditing(course);
    setForm({
      name: course.name || "",
      duration: course.duration || "",
      description: course.description || "",
    });
    setFormError("");
    setShowForm(true);
  };

  // POST /courses  or  PUT /courses/:id
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setFormError("Course name is required");
    if (!form.duration.trim()) return setFormError("Duration is required");
    const body = {
      name: form.name.trim(),
      duration: form.duration.trim(),
      description: form.description.trim(),
    };
    setSaving(true);
    try {
      if (editing) {
        await updateCourse(getId(editing), body);
        setNotice(`Course "${body.name}" updated`);
      } else {
        await createCourse(body);
        setNotice(`Course "${body.name}" created. Use "Fees" and "Batches" to set it up.`);
      }
      setShowForm(false);
      reload();
    } catch (err) {
      setFormError(getErrorMessage(err, editing ? "Could not update course" : "Could not create course"));
    } finally {
      setSaving(false);
    }
  };

  // PATCH /courses/:id/status  (soft delete / restore)
  const handleToggleStatus = async (course) => {
    const activate = !isActive(course);
    const message = activate
      ? `Activate "${course.name}"?`
      : `Deactivate "${course.name}"? It will not accept new admissions.`;
    if (!window.confirm(message)) return;
    setBusyId(getId(course));
    setError("");
    try {
      await setCourseStatus(getId(course), activate ? "active" : "inactive");
      setNotice(`"${course.name}" ${activate ? "activated" : "deactivated"}`);
      reload();
    } catch (err) {
      setError(getErrorMessage(err, "Could not change course status"));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
          <p className="text-sm text-gray-500 mt-1">{courses.length} courses</p>
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
            <Plus size={18} /> Create course
          </button>
        </div>
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
              <th className="px-4 py-3 font-medium">Course</th>
              <th className="px-4 py-3 font-medium">Duration</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Total fee</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-500">Loading courses...</td>
              </tr>
            ) : courses.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-500">No courses yet. Create the first one.</td>
              </tr>
            ) : (
              courses.map((c, i) => {
                const active = isActive(c);
                return (
                  <tr key={getId(c) || i} className={`hover:bg-gray-50 ${active ? "" : "opacity-70"}`}>
                    <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                    <td className="px-4 py-3 text-gray-600">{c.duration || "-"}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{c.description || "-"}</td>
                    <td className="px-4 py-3 text-gray-900">
                      {c.total_fee !== undefined && c.total_fee !== null
                        ? `₹${Number(c.total_fee).toLocaleString("en-IN")}`
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                        <Link
                          to={`/courses/${getId(c)}/batches`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          <CalendarDays size={14} /> Batches
                        </Link>
                        <Link
                          to={`/courses/${getId(c)}/fees`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          <IndianRupee size={14} /> Fees
                        </Link>
                        <button
                          onClick={() => openEdit(c)}
                          title="Edit course"
                          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(c)}
                          disabled={busyId === getId(c)}
                          title={active ? "Deactivate" : "Activate"}
                          className={`p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 ${
                            active ? "text-green-600" : "text-gray-400"
                          }`}
                        >
                          <Power size={16} />
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

      {showForm && (
        <CreateCourse
          editing={editing}
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

export default ManageCourses;

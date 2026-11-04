import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  RefreshCw,
  Eye,
  Pencil,
  Send,
  Undo2,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  getNotices,
  createNotice,
  updateNotice,
  publishNotice,
  withdrawNotice,
  deleteNotice,
} from "./noticeService";
import { getCourses, getBatches } from "../courses/courseService";
import { getErrorMessage } from "../../services/api";
import { getId, fmtDate, titleCase, inputClass } from "../../services/helpers";
import CreateNotice from "./CreateNotice";
import NoticeDetails from "./NoticeDetails";
import { LIMIT, STATUS_STYLES, statusClass, initialForm } from "./noticeUtils";

const ManageNotices = () => {
  const [notices, setNotices] = useState([]);
  const [courses, setCourses] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // create / edit
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [batches, setBatches] = useState([]);
  const [batchesLoading, setBatchesLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [viewId, setViewId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  // GET /notices?page&limit  (+ courses for the audience names / form)
  useEffect(() => {
    let cancelled = false;
    Promise.all([getNotices({ page, limit: LIMIT }), getCourses().catch(() => [])])
      .then(([res, courseList]) => {
        if (cancelled) return;
        setNotices(res.list);
        setTotalPages(res.totalPages);
        setCourses(courseList);
        setError("");
      })
      .catch((err) => !cancelled && setError(getErrorMessage(err, "Could not load notices")))
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

  const hasNext = totalPages ? page < totalPages : notices.length === LIMIT;

  const audience = (n) => {
    if (n.targetType === "course") {
      const c = n.targetCourse;
      const name = c && typeof c === "object" ? c.name : courses.find((x) => getId(x) === c)?.name;
      return `Course: ${name || "-"}`;
    }
    if (n.targetType === "batch") {
      const b = n.targetBatch;
      return `Batch: ${b && typeof b === "object" ? b.name || "-" : "-"}`;
    }
    return "Everyone";
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return notices.filter((n) => {
      if (statusFilter && String(n.status || "").toLowerCase() !== statusFilter) return false;
      if (!q) return true;
      return [n.title, n.description].some((v) => String(v ?? "").toLowerCase().includes(q));
    });
  }, [notices, query, statusFilter]);

  /* ───── form helpers ───── */

  const loadBatches = (courseId) => {
    setBatches([]);
    if (!courseId) return;
    setBatchesLoading(true);
    getBatches(courseId)
      .then(setBatches)
      .catch((err) => setFormError(getErrorMessage(err, "Could not load batches")))
      .finally(() => setBatchesLoading(false));
  };

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setBatches([]);
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (n) => {
    setEditing(n);
    setForm({ ...initialForm, title: n.title || "", description: n.description || "" });
    setFormError("");
    setShowForm(true);
  };

  const changeTargetType = (targetType) => {
    setForm({ ...form, targetType, batchId: "", courseId: targetType === "all" ? "" : form.courseId });
    if (targetType === "batch" && form.courseId) loadBatches(form.courseId);
  };

  const changeCourse = (courseId) => {
    setForm({ ...form, courseId, batchId: "" });
    if (form.targetType === "batch") loadBatches(courseId);
  };

  // POST /notices   or   PUT /notices/:id (changed fields only)
  const handleSave = async (e) => {
    e.preventDefault();
    const title = form.title.trim();
    const description = form.description.trim();
    if (!title) return setFormError("Title is required");
    if (!description) return setFormError("Description is required");

    setSaving(true);
    try {
      if (editing) {
        const changes = {};
        if (title !== editing.title) changes.title = title;
        if (description !== editing.description) changes.description = description;
        if (Object.keys(changes).length) {
          await updateNotice(getId(editing), changes);
          setNotice(`"${title}" updated`);
        }
      } else {
        if (form.targetType !== "all" && !form.courseId) {
          setSaving(false);
          return setFormError("Select a course");
        }
        if (form.targetType === "batch" && !form.batchId) {
          setSaving(false);
          return setFormError("Select a batch");
        }
        const body = { title, description, targetType: form.targetType };
        if (form.targetType === "course") body.targetCourse = form.courseId;
        if (form.targetType === "batch") body.targetBatch = form.batchId;

        const created = await createNotice(body);
        const newId = getId(created);
        if (form.publishNow) {
          if (newId) {
            await publishNotice(newId);
            setNotice(`"${title}" published`);
          } else {
            setNotice(`"${title}" created. Publish it from the list.`);
          }
        } else {
          setNotice(`"${title}" created`);
        }
      }
      setShowForm(false);
      if (page !== 1 && !editing) goToPage(1);
      else reload();
    } catch (err) {
      setFormError(getErrorMessage(err, editing ? "Could not update notice" : "Could not create notice"));
    } finally {
      setSaving(false);
    }
  };

  /* ───── row actions ───── */

  const runAction = async (n, fn, successMsg, failMsg) => {
    setBusyId(getId(n));
    setError("");
    try {
      await fn(getId(n));
      setNotice(successMsg);
      reload();
    } catch (err) {
      setError(getErrorMessage(err, failMsg));
    } finally {
      setBusyId(null);
    }
  };

  const handlePublish = (n) => {
    if (!window.confirm(`Publish "${n.title}"? It becomes visible to its audience.`)) return;
    runAction(n, publishNotice, `"${n.title}" published`, "Could not publish notice");
  };

  const handleWithdraw = (n) => {
    if (!window.confirm(`Withdraw "${n.title}"? It will no longer be visible to its audience.`)) return;
    runAction(n, withdrawNotice, `"${n.title}" withdrawn`, "Could not withdraw notice");
  };

  const handleDelete = (n) => {
    if (!window.confirm(`Delete "${n.title}" permanently? This cannot be undone.`)) return;
    runAction(n, deleteNotice, `"${n.title}" deleted`, "Could not delete notice");
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notices</h1>
          <p className="text-sm text-gray-500 mt-1">Announcements for everyone, a course or a batch</p>
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
            <Plus size={18} /> New notice
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notices on this page"
            className={`${inputClass} pl-9 bg-white`}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`${inputClass} md:w-44 bg-white`}
        >
          <option value="">All status</option>
          {Object.keys(STATUS_STYLES).map((s) => (
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
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Audience</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-500">Loading notices...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                  {notices.length === 0 ? "No notices yet. Create the first one." : "No notices match your filters."}
                </td>
              </tr>
            ) : (
              filtered.map((n, i) => {
                const status = String(n.status || "draft").toLowerCase();
                const busy = busyId === getId(n);
                return (
                  <tr key={getId(n) || i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 max-w-xs">
                      <p className="font-medium text-gray-900 truncate">{n.title}</p>
                      <p className="text-xs text-gray-500 truncate">{n.description}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{audience(n)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusClass(status)}`}>
                        {titleCase(status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmtDate(n.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                        <button
                          onClick={() => setViewId(getId(n))}
                          title="View"
                          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => openEdit(n)}
                          title="Edit"
                          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                        >
                          <Pencil size={16} />
                        </button>
                        {status !== "published" && (
                          <button
                            onClick={() => handlePublish(n)}
                            disabled={busy}
                            title={status === "withdrawn" ? "Publish again" : "Publish"}
                            className="p-2 rounded-lg text-gray-500 hover:bg-green-50 hover:text-green-700 disabled:opacity-50"
                          >
                            <Send size={16} />
                          </button>
                        )}
                        {status === "published" && (
                          <button
                            onClick={() => handleWithdraw(n)}
                            disabled={busy}
                            title="Withdraw"
                            className="p-2 rounded-lg text-gray-500 hover:bg-amber-50 hover:text-amber-600 disabled:opacity-50"
                          >
                            <Undo2 size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(n)}
                          disabled={busy}
                          title="Delete"
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
        <CreateNotice
          batches={batches}
          batchesLoading={batchesLoading}
          changeCourse={changeCourse}
          changeTargetType={changeTargetType}
          courses={courses}
          editing={editing}
          form={form}
          formError={formError}
          handleSave={handleSave}
          saving={saving}
          setForm={setForm}
          setShowForm={setShowForm}
        />
      )}

      {viewId && <NoticeDetails id={viewId} audience={audience} onClose={() => setViewId(null)} />}
    </div>
  );
};

export default ManageNotices;

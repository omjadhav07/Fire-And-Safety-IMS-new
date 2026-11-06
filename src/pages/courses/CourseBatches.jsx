import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Power } from "lucide-react";
import { getBatches, createBatch, updateBatch, setBatchStatus } from "./courseService";
import { getErrorMessage } from "../../services/api";
import Modal from "../../components/Modal";

const inputClass =
  "w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/40 focus:border-[#0EA5E9]";

const initialForm = { name: "", start_date: "", end_date: "" };
const getId = (b) => b.id || b._id;
const isOpen = (b) => (b.status || "active") === "active";
const toInputDate = (v) => (v ? String(v).slice(0, 10) : "");

const formatDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const CourseBatches = () => {
  const { id } = useParams();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // editing: null = create mode, batch object = edit mode
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  // GET /courses/:id/batches
  useEffect(() => {
    let cancelled = false;
    getBatches(id)
      .then((list) => {
        if (cancelled) return;
        setBatches(list);
        setError("");
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, "Could not load batches"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

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

  const openEdit = (batch) => {
    setEditing(batch);
    setForm({
      name: batch.name || "",
      start_date: toInputDate(batch.start_date),
      end_date: toInputDate(batch.end_date),
    });
    setFormError("");
    setShowForm(true);
  };

  // POST /courses/:id/batches  or  PUT /courses/:id/batches/:batchId
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setFormError("Batch name is required");
    if (!form.start_date) return setFormError("Start date is required");
    if (form.end_date && form.end_date < form.start_date) {
      return setFormError("End date cannot be before the start date");
    }
    const body = { name: form.name.trim(), start_date: form.start_date };
    if (form.end_date) body.end_date = form.end_date;

    setSaving(true);
    setFormError("");
    try {
      if (editing) {
        await updateBatch(id, getId(editing), body);
        setNotice(`Batch "${body.name}" updated`);
      } else {
        await createBatch(id, body);
        setNotice(`Batch "${body.name}" created`);
      }
      setShowForm(false);
      reload();
    } catch (err) {
      setFormError(getErrorMessage(err, editing ? "Could not update batch" : "Could not create batch"));
    } finally {
      setSaving(false);
    }
  };

  // PATCH /courses/:id/batches/:batchId/status  (close / reopen)
  const handleToggleStatus = async (batch) => {
    const reopen = !isOpen(batch);
    const message = reopen ? `Reopen "${batch.name}"?` : `Close "${batch.name}"?`;
    if (!window.confirm(message)) return;
    setBusyId(getId(batch));
    setError("");
    try {
      await setBatchStatus(id, getId(batch), reopen ? "active" : "closed");
      setNotice(`"${batch.name}" ${reopen ? "reopened" : "closed"}`);
      reload();
    } catch (err) {
      setError(getErrorMessage(err, "Could not change batch status"));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <Link to="/courses" className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#0EA5E9] mb-4">
        <ArrowLeft size={16} /> Back to courses
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Batches</h1>
          <p className="text-sm text-gray-500 mt-1">{batches.length} batches in this course</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0EA5E9] text-white font-medium hover:bg-[#0284C7]"
        >
          <Plus size={18} /> Create batch
        </button>
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
              <th className="px-4 py-3 font-medium">Batch name</th>
              <th className="px-4 py-3 font-medium">Start date</th>
              <th className="px-4 py-3 font-medium">End date</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-500">Loading batches...</td>
              </tr>
            ) : batches.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                  No batches yet. Create the first one.
                </td>
              </tr>
            ) : (
              batches.map((b, i) => {
                const open = isOpen(b);
                return (
                  <tr key={getId(b) || i} className={`hover:bg-gray-50 ${open ? "" : "opacity-70"}`}>
                    <td className="px-4 py-3 font-medium text-gray-900">{b.name}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(b.start_date)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(b.end_date)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                          open ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {b.status || "active"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(b)}
                          title="Edit batch"
                          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(b)}
                          disabled={busyId === getId(b)}
                          title={open ? "Close batch" : "Reopen batch"}
                          className={`p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 ${
                            open ? "text-sky-600" : "text-gray-400"
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
        <Modal title={editing ? "Edit batch" : "Create batch"} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSave} className="space-y-4" noValidate>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Batch name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Jan 2026 Morning Batch"
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Start date</label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">End date</label>
                <input
                  type="date"
                  value={form.end_date}
                  min={form.start_date || undefined}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-lg bg-[#0EA5E9] text-white font-medium hover:bg-[#0284C7] disabled:opacity-60"
              >
                {saving ? "Saving..." : editing ? "Save changes" : "Create batch"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default CourseBatches;
import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Save } from "lucide-react";
import { getFeeComponents, addFeeComponent, updateFeeComponent } from "./courseService";
import { getErrorMessage } from "../../services/api";

const inputClass =
  "w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/40 focus:border-[#0EA5E9]";

const initialForm = { name: "", amount: "", required_for_exam: false };
const getId = (f) => f.id || f._id;
const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const CourseFees = () => {
  const { id } = useParams();
  const [components, setComponents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null); // null = add mode, component object = edit mode
  const [notice, setNotice] = useState("");
  const formRef = useRef(null);

  // GET /courses/:id/fee-components
  useEffect(() => {
    let cancelled = false;
    getFeeComponents(id)
      .then(({ list, total }) => {
        if (cancelled) return;
        setComponents(list);
        setTotal(total);
        setError("");
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, "Could not load fee components"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  const startEdit = (f) => {
    setEditing(f);
    setForm({ name: f.name || "", amount: String(f.amount ?? ""), required_for_exam: !!f.required_for_exam });
    setFormError("");
    setNotice("");
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm(initialForm);
    setFormError("");
  };

  // POST /courses/:id/fee-components   or   PUT /courses/fee-components/:componentId
  const handleSave = async (e) => {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!form.name.trim()) return setFormError("Fee name is required");
    if (!form.amount || Number.isNaN(amount) || amount <= 0) return setFormError("Enter a valid amount");
    setSaving(true);
    setFormError("");
    try {
      const body = { name: form.name.trim(), amount, required_for_exam: form.required_for_exam };
      if (editing) {
        await updateFeeComponent(getId(editing), body);
        setNotice(`"${body.name}" updated`);
      } else {
        await addFeeComponent(id, body);
        setNotice(`"${body.name}" added`);
      }
      setEditing(null);
      setForm(initialForm);
      setLoading(true);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setFormError(getErrorMessage(err, editing ? "Could not update fee component" : "Could not add fee component"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <Link to="/courses" className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#0EA5E9] mb-4">
        <ArrowLeft size={16} /> Back to courses
      </Link>

      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee components</h1>
          <p className="text-sm text-gray-500 mt-1">Fees that make up the total course fee</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-gray-500">Total fee</p>
          <p className="text-2xl font-bold text-gray-900">{money(total)}</p>
        </div>
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

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto mb-6">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#0B1437] text-white">
            <tr>
              <th className="px-4 py-3 font-medium">Component</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Required for exam</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">Loading...</td>
              </tr>
            ) : components.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">No fee components added yet</td>
              </tr>
            ) : (
              components.map((f, i) => (
                <tr key={getId(f) || i} className={`hover:bg-gray-50 ${editing && getId(editing) === getId(f) ? "bg-red-50/40" : ""}`}>
                  <td className="px-4 py-3 font-medium text-gray-900">{f.name}</td>
                  <td className="px-4 py-3 text-gray-900">{money(f.amount)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        f.required_for_exam ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {f.required_for_exam ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <button
                        onClick={() => startEdit(f)}
                        title="Edit fee component"
                        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                      >
                        <Pencil size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div ref={formRef} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{editing ? `Edit fee component: ${editing.name}` : "Add fee component"}</h2>
        {formError && <p className="text-sm text-red-600 mb-3">{formError}</p>}
        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Tuition Fee"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount (₹)</label>
            <input
              type="number"
              min="0"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="15000"
              className={inputClass}
            />
          </div>
          <label className="sm:col-span-2 flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.required_for_exam}
              onChange={(e) => setForm({ ...form, required_for_exam: e.target.checked })}
              className="h-4 w-4 accent-[#0EA5E9]"
            />
            Must be paid before the exam form can be submitted
          </label>
          <div className="sm:col-span-2 flex justify-end gap-3">
            {editing && (
              <button
                type="button"
                onClick={cancelEdit}
                disabled={saving}
                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0EA5E9] text-white font-medium hover:bg-[#0284C7] disabled:opacity-60"
            >
              {editing ? <Save size={18} /> : <Plus size={18} />}
              {editing ? (saving ? "Saving..." : "Save changes") : saving ? "Adding..." : "Add fee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseFees;
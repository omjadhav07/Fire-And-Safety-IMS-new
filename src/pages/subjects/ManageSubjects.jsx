import React, { useEffect, useMemo, useState } from "react";
import { RefreshCw, Eye, Pencil, Trash2 } from "lucide-react";
import { getSubjects, getSubjectById, createSubject, updateSubject, deleteSubject } from "./subjectService";
import { getCourses } from "../courses/courseService";
import { getErrorMessage } from "../../services/api";
import { getId, fmtDate, inputClass } from "../../services/helpers";
import { pick, relId, relName } from "../schedules/scheduleUtils";
import Modal from "../../components/Modal";
import Field from "../../components/Field";
import { PageHeader, Toolbar, AddButton, TableCard, Notice, RowMenu, btnOutline } from "../../components/ui";

const emptyForm = { name: "", course_id: "", description: "" };

// Subject master: add, view, edit and delete the subjects of each course
const ManageSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [busyId, setBusyId] = useState(null);

  const [query, setQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("");

  // modal: { type: "form", editing? } | { type: "view", id }
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState({ loading: false, data: null, error: "" });

  useEffect(() => {
    let cancelled = false;
    getCourses()
      .then((c) => !cancelled && setCourses(c))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // GET /subjects
  useEffect(() => {
    let cancelled = false;
    getSubjects()
      .then((list) => {
        if (cancelled) return;
        setSubjects(list);
        setError("");
      })
      .catch((err) => !cancelled && setError(getErrorMessage(err, "Could not load subjects")))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const reload = () => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  const courseNames = useMemo(() => Object.fromEntries(courses.map((c) => [getId(c), c.name])), [courses]);
  const courseOf = (s) => relName(pick(s, "course_id", "course"), courseNames) || "-";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return subjects.filter((s) => {
      if (courseFilter && relId(pick(s, "course_id", "course")) !== courseFilter) return false;
      if (!q) return true;
      return [s.name, s.description, courseOf(s)].some((v) => String(v ?? "").toLowerCase().includes(q));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjects, query, courseFilter, courseNames]);

  const closeModal = () => setModal(null);

  const openForm = (subject = null) => {
    setForm(
      subject
        ? { name: subject.name || "", course_id: relId(pick(subject, "course_id", "course")), description: subject.description || "" }
        : emptyForm
    );
    setFormError("");
    setModal({ type: "form", editing: subject });
  };

  // GET /subjects/:id
  const openView = (subject) => {
    setDetail({ loading: true, data: null, error: "" });
    setModal({ type: "view", id: getId(subject) });
    getSubjectById(getId(subject))
      .then((data) => setDetail({ loading: false, data, error: "" }))
      .catch((err) => setDetail({ loading: false, data: null, error: getErrorMessage(err, "Could not load the subject") }));
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  // POST /subjects   or   PUT /subjects/:id
  const handleSave = async (e) => {
    e.preventDefault();
    const body = { name: form.name.trim(), course_id: form.course_id, description: form.description.trim() };
    if (!body.name) return setFormError("Subject name is required");
    if (!body.course_id) return setFormError("Select a course");
    setSaving(true);
    setFormError("");
    try {
      const editing = modal.editing;
      const res = editing ? await updateSubject(getId(editing), body) : await createSubject(body);
      setNotice(res.message || (editing ? `"${body.name}" updated` : `"${body.name}" added`));
      closeModal();
      reload();
    } catch (err) {
      setFormError(getErrorMessage(err, "Could not save the subject"));
    } finally {
      setSaving(false);
    }
  };

  // DELETE /subjects/:id
  const handleDelete = async (s) => {
    if (!window.confirm(`Delete the subject "${s.name}"? This cannot be undone.`)) return;
    setBusyId(getId(s));
    setError("");
    try {
      const res = await deleteSubject(getId(s));
      setNotice(res.message || `"${s.name}" deleted`);
      reload();
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete the subject"));
    } finally {
      setBusyId(null);
    }
  };

  const view = detail.data;

  return (
    <div>
      <PageHeader title="Subjects" subtitle="Subject master: the subjects taught in each course" />

      {notice && <Notice onClose={() => setNotice("")}>{notice}</Notice>}
      {error && <Notice tone="error">{error}</Notice>}

      <Toolbar value={query} onChange={setQuery} placeholder="Search subjects">
        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white"
        >
          <option value="">All courses</option>
          {courses.map((c) => (
            <option key={getId(c)} value={getId(c)}>{c.name}</option>
          ))}
        </select>
        <button onClick={reload} className={btnOutline} aria-label="Refresh">
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
        <AddButton onClick={() => openForm()}>Add subject</AddButton>
      </Toolbar>

      <TableCard>
        <table className="w-full text-sm text-left">
          <thead className="bg-[#0B1437] text-white">
            <tr>
              <th className="px-4 py-3">Subject</th>
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Added on</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-500">Loading subjects...</td></tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  {subjects.length === 0 ? "No subjects yet. Add the first one." : "No subjects match your filters."}
                </td>
              </tr>
            ) : (
              filtered.map((s, i) => (
                <tr key={getId(s) || i}>
                  <td className="px-4 py-3 font-medium text-slate-900">{s.name}</td>
                  <td className="px-4 py-3 text-slate-600">{courseOf(s)}</td>
                  <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{s.description || "-"}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{fmtDate(s.createdAt || s.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <RowMenu
                      items={[
                        { label: "View", icon: Eye, onClick: () => openView(s) },
                        { label: "Edit", icon: Pencil, onClick: () => openForm(s) },
                        { label: "Delete", icon: Trash2, danger: true, disabled: busyId === getId(s), onClick: () => handleDelete(s) },
                      ]}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </TableCard>

      {/* Add / edit */}
      {modal?.type === "form" && (
        <Modal title={modal.editing ? "Edit subject" : "Add subject"} onClose={closeModal}>
          <form onSubmit={handleSave} className="space-y-4" noValidate>
            {formError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{formError}</p>}
            <Field label="Subject name">
              <input value={form.name} onChange={set("name")} placeholder="Introduction to Fire Extinguishers" className={inputClass} autoFocus />
            </Field>
            <Field label="Course">
              <select value={form.course_id} onChange={set("course_id")} className={inputClass}>
                <option value="">Select course</option>
                {courses.map((c) => (
                  <option key={getId(c)} value={getId(c)}>{c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Description">
              <textarea
                rows={3}
                value={form.description}
                onChange={set("description")}
                placeholder="Practical guide to using different types of extinguishers."
                className={inputClass}
              />
            </Field>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={closeModal} className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-lg bg-[#0EA5E9] text-white font-medium hover:bg-[#0284C7] disabled:opacity-60">
                {saving ? "Saving..." : modal.editing ? "Save changes" : "Add subject"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* View one subject */}
      {modal?.type === "view" && (
        <Modal title="Subject details" onClose={closeModal}>
          {detail.loading && <p className="text-sm text-gray-500">Loading...</p>}
          {detail.error && <p className="text-sm text-red-600">{detail.error}</p>}
          {view && (
            <dl className="divide-y divide-gray-100 text-sm border-t border-b border-gray-100">
              {[
                ["Subject", view.name],
                ["Course", relName(pick(view, "course_id", "course"), courseNames)],
                ["Description", view.description],
                ["Added on", fmtDate(view.createdAt || view.created_at)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-2.5">
                  <dt className="text-gray-500 shrink-0">{k}</dt>
                  <dd className="font-medium text-gray-900 text-right">{v || "-"}</dd>
                </div>
              ))}
            </dl>
          )}
          <div className="flex justify-end pt-4">
            <button onClick={closeModal} className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ManageSubjects;

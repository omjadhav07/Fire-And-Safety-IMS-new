import React, { useEffect, useState } from "react";
import { createClassTest, updateClassTest } from "./classTestService";
import { getBatches } from "../courses/courseService";
import { getErrorMessage } from "../../services/api";
import Modal from "../../components/Modal";
import Field from "../../components/Field";
import { getId, toDateInput, titleCase, inputClass } from "../../services/helpers";
import { TEST_STATUSES, emptyTest } from "./classTestUtils";

// Create / edit a class test (opens as a popup).
// While editing, only the fields the API allows to change are editable.
const CreateClassTest = ({ editing, courses, courseName, batchName, onSaved, onClose }) => {
  const [form, setForm] = useState(
    editing
      ? {
          ...emptyTest,
          title: editing.title || "",
          description: editing.description || "",
          subject: editing.subject || "",
          test_date: toDateInput(editing.test_date),
          max_marks: editing.max_marks ?? "",
          passing_marks: editing.passing_marks ?? "",
          duration_minutes: editing.duration_minutes ?? "",
          status: editing.status || "scheduled",
        }
      : emptyTest
  );
  const [batches, setBatches] = useState([]);
  const [batchesLoading, setBatchesLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  // Batches of the chosen course (create mode only)
  useEffect(() => {
    if (editing || !form.course_id) return undefined;
    let cancelled = false;
    getBatches(form.course_id)
      .then((list) => !cancelled && (setBatches(list), setBatchesLoading(false)))
      .catch((err) => !cancelled && (setError(getErrorMessage(err, "Could not load batches")), setBatchesLoading(false)));
    return () => {
      cancelled = true;
    };
  }, [editing, form.course_id]);

  const changeCourse = (e) => {
    setBatches([]);
    setBatchesLoading(!!e.target.value);
    setForm({ ...form, course_id: e.target.value, batch_id: "" });
  };

  const validate = () => {
    const max = Number(form.max_marks);
    const pass = Number(form.passing_marks);
    const mins = Number(form.duration_minutes);
    if (!form.title.trim()) return "Title is required";
    if (!editing) {
      if (!form.course_id) return "Select a course";
      if (!form.batch_id) return "Select a batch";
      if (!form.subject.trim()) return "Subject is required";
    }
    if (!form.test_date) return "Select the test date";
    if (!Number.isFinite(max) || max <= 0) return "Maximum marks must be greater than 0";
    if (form.passing_marks === "" || !Number.isFinite(pass) || pass < 0) return "Enter the passing marks";
    if (pass > max) return "Passing marks cannot be more than the maximum marks";
    if (!Number.isFinite(mins) || mins <= 0) return "Duration must be greater than 0 minutes";
    return "";
  };

  // POST /class-tests   or   PUT /class-tests/:id (changed fields only)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const problem = validate();
    if (problem) return setError(problem);

    const values = {
      title: form.title.trim(),
      description: form.description.trim(),
      test_date: form.test_date,
      max_marks: Number(form.max_marks),
      passing_marks: Number(form.passing_marks),
      duration_minutes: Number(form.duration_minutes),
      status: form.status,
    };

    setSaving(true);
    setError("");
    try {
      if (editing) {
        const original = {
          title: editing.title || "",
          description: editing.description || "",
          test_date: toDateInput(editing.test_date),
          max_marks: Number(editing.max_marks),
          passing_marks: Number(editing.passing_marks),
          duration_minutes: Number(editing.duration_minutes),
          status: editing.status || "scheduled",
        };
        const changes = Object.fromEntries(Object.entries(values).filter(([k, v]) => v !== original[k]));
        if (Object.keys(changes).length === 0) return onClose();
        const res = await updateClassTest(getId(editing), changes);
        onSaved(res.message || `"${values.title}" updated`);
      } else {
        const body = { ...values, course_id: form.course_id, batch_id: form.batch_id, subject: form.subject.trim() };
        if (!body.description) delete body.description;
        const res = await createClassTest(body);
        onSaved(res.message || `"${values.title}" created`);
      }
    } catch (err) {
      setError(getErrorMessage(err, editing ? "Could not update class test" : "Could not create class test"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={editing ? "Edit class test" : "New class test"} onClose={onClose} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Title" className="sm:col-span-2">
            <input value={form.title} onChange={set("title")} placeholder="Unit Test 1 - Fire Safety" className={inputClass} />
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <textarea rows={2} value={form.description} onChange={set("description")} placeholder="First internal class test" className={inputClass} />
          </Field>

          {editing ? (
            <div className="sm:col-span-2 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2 text-sm text-gray-600">
              {courseName(editing)} · {batchName(editing)} · <span className="font-medium text-gray-800">{editing.subject}</span>
              <span className="block text-xs text-gray-400 mt-0.5">Course, batch and subject cannot be changed after the test is created.</span>
            </div>
          ) : (
            <>
              <Field label="Course">
                <select value={form.course_id} onChange={changeCourse} className={inputClass}>
                  <option value="">Select course</option>
                  {courses.map((c) => (
                    <option key={getId(c)} value={getId(c)}>{c.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Batch">
                <select
                  value={form.batch_id}
                  onChange={set("batch_id")}
                  disabled={!form.course_id || batchesLoading}
                  className={`${inputClass} disabled:bg-gray-50 disabled:text-gray-400`}
                >
                  <option value="">
                    {!form.course_id ? "Select a course first" : batchesLoading ? "Loading batches..." : "Select batch"}
                  </option>
                  {batches.map((b) => (
                    <option key={getId(b)} value={getId(b)}>{b.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Subject" className="sm:col-span-2">
                <input value={form.subject} onChange={set("subject")} placeholder="Fire Safety Basics" className={inputClass} />
              </Field>
            </>
          )}

          <Field label="Test date">
            <input type="date" value={form.test_date} onChange={set("test_date")} className={inputClass} />
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={set("status")} className={inputClass}>
              {(TEST_STATUSES.includes(form.status) ? TEST_STATUSES : [form.status, ...TEST_STATUSES]).map((s) => (
                <option key={s} value={s}>{titleCase(s)}</option>
              ))}
            </select>
          </Field>
          <Field label="Maximum marks">
            <input type="number" min="1" value={form.max_marks} onChange={set("max_marks")} placeholder="50" className={inputClass} />
          </Field>
          <Field label="Passing marks">
            <input type="number" min="0" value={form.passing_marks} onChange={set("passing_marks")} placeholder="20" className={inputClass} />
          </Field>
          <Field label="Duration (minutes)" className="sm:col-span-2">
            <input type="number" min="1" value={form.duration_minutes} onChange={set("duration_minutes")} placeholder="60" className={inputClass} />
          </Field>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-lg bg-[#16A34A] text-white font-medium hover:bg-[#15803D] disabled:opacity-60"
          >
            {saving ? "Saving..." : editing ? "Save changes" : "Create test"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateClassTest;

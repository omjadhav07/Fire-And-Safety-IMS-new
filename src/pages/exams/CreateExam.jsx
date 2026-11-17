import React, { useEffect, useState } from "react";
import { createExam, updateExam } from "./examService";
import { getBatches } from "../courses/courseService";
import { getUsers } from "../users/userService";
import { getAssignments } from "../faculty/facultyAssignmentService";
import { getErrorMessage } from "../../services/api";
import Modal from "../../components/Modal";
import Field from "../../components/Field";
import { getId, toDateInput, titleCase, inputClass } from "../../services/helpers";
import { pick, relId, roleOf } from "../schedules/scheduleUtils";
import { ROLE, getCurrentUser, getCurrentRole } from "../../config/permissions";
import { EXAM_TYPES, EXAM_STATUSES, emptyExam } from "./examUtils";

// Options plus the current value (in case the backend has a value this list does not)
const withCurrent = (list, current) => (!current || list.includes(current) ? list : [current, ...list]);

// Create / edit an exam (opens as a popup).
// While editing, only the fields the API allows to change are editable.
const CreateExam = ({ editing, courses, courseName, batchName, onSaved, onClose }) => {
  const role = getCurrentRole();
  const me = getCurrentUser();
  const myId = me?._id || me?.id || "";
  // A faculty member creates exams for themselves; an admin chooses the faculty
  const needsFaculty = !editing && role !== ROLE.FACULTY;

  const [form, setForm] = useState(
    editing
      ? {
          ...emptyExam,
          title: editing.title || "",
          description: editing.description || "",
          subject: editing.subject || "",
          exam_type: editing.exam_type || "written",
          exam_date: toDateInput(editing.exam_date),
          form_start_date: toDateInput(editing.form_start_date),
          form_end_date: toDateInput(editing.form_end_date),
          max_marks: editing.max_marks ?? "",
          passing_marks: editing.passing_marks ?? "",
          duration_minutes: editing.duration_minutes ?? "",
          status: editing.status || "scheduled",
        }
      : emptyExam
  );
  const [faculty, setFaculty] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [batchesLoading, setBatchesLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  // Faculty list + who teaches which batch (only when an admin is creating the exam)
  useEffect(() => {
    if (!needsFaculty) return undefined;
    let cancelled = false;
    Promise.all([getUsers({ limit: 100 }), getAssignments().catch(() => [])])
      .then(([users, assigned]) => {
        if (cancelled) return;
        setFaculty(users.list.filter((u) => /faculty/i.test(roleOf(u)) && u.is_active !== false));
        setAssignments(assigned);
      })
      .catch((err) => !cancelled && setError(getErrorMessage(err, "Could not load the faculty list")));
    return () => {
      cancelled = true;
    };
  }, [needsFaculty]);

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
    setForm({ ...form, course_id: e.target.value, batch_id: "", faculty_id: "" });
  };

  // Faculty assigned to the chosen course + batch (from Faculty Assignments)
  const assignedHere = assignments.filter(
    (a) => relId(pick(a, "course_id", "course")) === form.course_id && relId(pick(a, "batch_id", "batch")) === form.batch_id
  );
  const assignedIds = new Set(assignedHere.map((a) => relId(pick(a, "faculty_id", "faculty"))));
  const batchChosen = !!(form.course_id && form.batch_id);
  const facultyOptions = batchChosen && assignedIds.size ? faculty.filter((f) => assignedIds.has(getId(f))) : faculty;
  const noAssignment = batchChosen && assignments.length > 0 && assignedIds.size === 0;

  const changeFaculty = (e) => {
    const faculty_id = e.target.value;
    const subjects = [
      ...new Set(
        assignedHere
          .filter((a) => relId(pick(a, "faculty_id", "faculty")) === faculty_id)
          .map((a) => a.subject)
          .filter(Boolean)
      ),
    ];
    setForm({ ...form, faculty_id, subject: !form.subject && subjects.length === 1 ? subjects[0] : form.subject });
  };

  const validate = () => {
    const max = Number(form.max_marks);
    const pass = Number(form.passing_marks);
    const mins = Number(form.duration_minutes);
    if (!form.title.trim()) return "Title is required";
    if (!editing) {
      if (!form.course_id) return "Select a course";
      if (!form.batch_id) return "Select a batch";
      if (needsFaculty && !form.faculty_id) return "Select the faculty who will take this exam";
      if (!form.subject.trim()) return "Subject is required";
    }
    if (!form.exam_type) return "Select the exam type";
    if (!form.exam_date) return "Select the exam date";
    if (!!form.form_start_date !== !!form.form_end_date) return "Enter both the form start date and the form end date";
    if (form.form_start_date && form.form_end_date) {
      if (form.form_start_date > form.form_end_date) return "The form end date must be after the form start date";
      if (form.form_end_date > form.exam_date) return "The exam form must close on or before the exam date";
    }
    if (!Number.isFinite(max) || max <= 0) return "Maximum marks must be greater than 0";
    if (form.passing_marks === "" || !Number.isFinite(pass) || pass < 0) return "Enter the passing marks";
    if (pass > max) return "Passing marks cannot be more than the maximum marks";
    if (!Number.isFinite(mins) || mins <= 0) return "Duration must be greater than 0 minutes";
    return "";
  };

  // POST /exams   or   PUT /exams/:id (changed fields only)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const problem = validate();
    if (problem) return setError(problem);

    const values = {
      title: form.title.trim(),
      description: form.description.trim(),
      exam_type: form.exam_type,
      exam_date: form.exam_date,
      form_start_date: form.form_start_date,
      form_end_date: form.form_end_date,
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
          exam_type: editing.exam_type || "written",
          exam_date: toDateInput(editing.exam_date),
          form_start_date: toDateInput(editing.form_start_date),
          form_end_date: toDateInput(editing.form_end_date),
          max_marks: Number(editing.max_marks),
          passing_marks: Number(editing.passing_marks),
          duration_minutes: Number(editing.duration_minutes),
          status: editing.status || "scheduled",
        };
        const changes = Object.fromEntries(Object.entries(values).filter(([k, v]) => v !== original[k]));
        if (Object.keys(changes).length === 0) return onClose();
        const res = await updateExam(getId(editing), changes);
        onSaved(res.message || `"${values.title}" updated`);
      } else {
        const body = {
          ...values,
          course_id: form.course_id,
          batch_id: form.batch_id,
          faculty_id: needsFaculty ? form.faculty_id : myId,
          subject: form.subject.trim(),
        };
        if (!body.description) delete body.description;
        if (!body.form_start_date) {
          delete body.form_start_date;
          delete body.form_end_date;
        }
        if (!body.faculty_id) delete body.faculty_id;
        const res = await createExam(body);
        onSaved(res.message || `"${values.title}" created`);
      }
    } catch (err) {
      setError(getErrorMessage(err, editing ? "Could not update exam" : "Could not create exam"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={editing ? "Edit exam" : "New exam"} onClose={onClose} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Title" className="sm:col-span-2">
            <input value={form.title} onChange={set("title")} placeholder="Mid Term Examination 2026" className={inputClass} />
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <textarea rows={2} value={form.description} onChange={set("description")} placeholder="First semester mid-term exam" className={inputClass} />
          </Field>

          {editing ? (
            <div className="sm:col-span-2 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2 text-sm text-gray-600">
              {courseName(editing)} · {batchName(editing)} · <span className="font-medium text-gray-800">{editing.subject}</span>
              <span className="block text-xs text-gray-400 mt-0.5">Course, batch, faculty and subject cannot be changed after the exam is created.</span>
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
                  onChange={(e) => setForm({ ...form, batch_id: e.target.value, faculty_id: "" })}
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
              {needsFaculty && (
                <Field label="Faculty" className="sm:col-span-2">
                  <select value={form.faculty_id} onChange={changeFaculty} className={inputClass}>
                    <option value="">Select faculty</option>
                    {facultyOptions.map((f) => (
                      <option key={getId(f)} value={getId(f)}>{f.name || f.email}</option>
                    ))}
                  </select>
                  {batchChosen && assignedIds.size > 0 && <p className="text-xs text-gray-500 mt-1">Showing faculty assigned to this batch.</p>}
                  {noAssignment && (
                    <p className="text-xs text-amber-700 mt-1">
                      No faculty is assigned to this batch yet, so all faculty are listed. The server may reject the exam unless the faculty is assigned.
                    </p>
                  )}
                </Field>
              )}
              <Field label="Subject" className="sm:col-span-2">
                <input value={form.subject} onChange={set("subject")} placeholder="Fire Safety Fundamentals" className={inputClass} />
              </Field>
            </>
          )}

          <Field label="Exam type">
            <select value={form.exam_type} onChange={set("exam_type")} className={inputClass}>
              {withCurrent(EXAM_TYPES, form.exam_type).map((t) => (
                <option key={t} value={t}>{titleCase(t)}</option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            {/* A new exam is always "scheduled" (shown as text); the status can be changed only when editing */}
            {editing ? (
              <select value={form.status} onChange={set("status")} className={inputClass}>
                {withCurrent(EXAM_STATUSES, form.status).map((s) => (
                  <option key={s} value={s}>{titleCase(s)}</option>
                ))}
              </select>
            ) : (
              <div className={`${inputClass} bg-gray-50 text-gray-700`}>Scheduled</div>
            )}
          </Field>

          <Field label="Exam date">
            <input type="date" value={form.exam_date} onChange={set("exam_date")} className={inputClass} />
          </Field>
          <Field label="Duration (minutes)">
            <input type="number" min="1" value={form.duration_minutes} onChange={set("duration_minutes")} placeholder="120" className={inputClass} />
          </Field>

          <Field label="Exam form opens">
            <input type="date" value={form.form_start_date} onChange={set("form_start_date")} className={inputClass} />
          </Field>
          <Field label="Exam form closes">
            <input type="date" value={form.form_end_date} onChange={set("form_end_date")} className={inputClass} />
          </Field>

          <Field label="Maximum marks">
            <input type="number" min="1" value={form.max_marks} onChange={set("max_marks")} placeholder="100" className={inputClass} />
          </Field>
          <Field label="Passing marks">
            <input type="number" min="0" value={form.passing_marks} onChange={set("passing_marks")} placeholder="40" className={inputClass} />
          </Field>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-lg bg-[#0EA5E9] text-white font-medium hover:bg-[#0284C7] disabled:opacity-60"
          >
            {saving ? "Saving..." : editing ? "Save changes" : "Create exam"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateExam;
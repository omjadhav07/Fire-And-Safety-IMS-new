import React from "react";
import Modal from "../../components/Modal";
import { getId, titleCase, inputClass } from "../../services/helpers";
import Field from "../../components/Field";
import { GENDERS, today } from "./studentUtils";

// Add / edit student form (opens as a popup)
const CreateStudent = ({ editing, form, setForm, courses, batches, batchesLoading, error, saving, onCourseChange, onSubmit, onClose }) => {
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <Modal title={editing ? `Edit ${editing.name}` : "Add student"} onClose={onClose} maxWidth="max-w-2xl">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {!editing && (
            <Field label="Student ID">
              <input value={form.student_id} onChange={set("student_id")} placeholder="FSC-2026-0003" className={inputClass} />
            </Field>
          )}
          <Field label="Full name" className={editing ? "sm:col-span-2" : ""}>
            <input value={form.full_name} onChange={set("full_name")} placeholder="Amit Patel" className={inputClass} />
          </Field>
          <Field label="Date of birth">
            <input type="date" value={form.dob} max={today()} onChange={set("dob")} className={inputClass} />
          </Field>
          <Field label="Gender">
            <select value={form.gender} onChange={set("gender")} className={inputClass}>
              <option value="">Select gender</option>
              {GENDERS.map((g) => (
                <option key={g} value={g}>{titleCase(g)}</option>
              ))}
            </select>
          </Field>
          <Field label="Phone">
            <input value={form.phone} onChange={set("phone")} inputMode="numeric" maxLength={10} placeholder="9876543211" className={inputClass} />
          </Field>
          <Field label="Email">
            <input type="email" value={form.email} onChange={set("email")} placeholder="amitpatel@gmail.com" className={inputClass} />
          </Field>
          <Field label="Address" className="sm:col-span-2">
            <textarea rows={2} value={form.address} onChange={set("address")} placeholder="123 Main Street, Mumbai" className={inputClass} />
          </Field>
          <Field label="Guardian name">
            <input value={form.guardian_name} onChange={set("guardian_name")} placeholder="Suresh Sharma" className={inputClass} />
          </Field>
          <Field label="Guardian phone">
            <input value={form.guardian_phone} onChange={set("guardian_phone")} inputMode="numeric" maxLength={10} placeholder="9876543211" className={inputClass} />
          </Field>
          <Field label="Qualification" className="sm:col-span-2">
            <input value={form.qualification} onChange={set("qualification")} placeholder="12th Pass" className={inputClass} />
          </Field>

          {!editing && (
            <>
              <Field label="Course">
                <select value={form.course_id} onChange={onCourseChange} className={inputClass}>
                  <option value="">Select course</option>
                  {courses.map((c) => (
                    <option key={getId(c)} value={getId(c)}>{c.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Batch (optional)">
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
                {form.course_id && !batchesLoading && batches.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">This course has no batches yet.</p>
                )}
              </Field>
              <Field label="Admission date">
                <input type="date" value={form.admitted_on} onChange={set("admitted_on")} className={inputClass} />
              </Field>
            </>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-lg bg-[#16A34A] text-white font-medium hover:bg-[#15803D] disabled:opacity-60"
          >
            {saving ? "Saving..." : editing ? "Save changes" : "Add student"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateStudent;

import React from "react";
import Modal from "../../components/Modal";
import { getId, inputClass } from "../../services/helpers";

// AssignFaculty (popup)
const AssignFaculty = ({ batches, batchesLoading, changeCourse, courses, faculty, form, formError, handleSave, saving, setForm, setShowForm }) => (
  <Modal title="Assign faculty" onClose={() => setShowForm(false)}>
    <form onSubmit={handleSave} className="space-y-4" noValidate>
      {formError && <p className="text-sm text-red-600">{formError}</p>}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Faculty</label>
        <select
          value={form.faculty_id}
          onChange={(e) => setForm({ ...form, faculty_id: e.target.value })}
          className={inputClass}
        >
          <option value="">Select faculty</option>
          {faculty.map((f) => (
            <option key={getId(f)} value={getId(f)}>{f.name || f.email}</option>
          ))}
        </select>
        {faculty.length === 0 && <p className="text-xs text-amber-600 mt-1">No active faculty users found.</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Course</label>
        <select value={form.course_id} onChange={(e) => changeCourse(e.target.value)} className={inputClass}>
          <option value="">Select course</option>
          {courses.map((c) => (
            <option key={getId(c)} value={getId(c)}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Batch</label>
        <select
          value={form.batch_id}
          onChange={(e) => setForm({ ...form, batch_id: e.target.value })}
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
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
        <input
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          placeholder="Fire Safety Basics"
          className={inputClass}
        />
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
          {saving ? "Assigning..." : "Assign faculty"}
        </button>
      </div>
    </form>
  </Modal>
);

export default AssignFaculty;

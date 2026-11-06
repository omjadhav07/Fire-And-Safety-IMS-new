import React from "react";
import Modal from "../../components/Modal";
import { inputClass } from "./courseUtils";

// CreateCourse (popup)
const CreateCourse = ({ editing, form, formError, handleSave, saving, setForm, setShowForm }) => (
  <Modal title={editing ? "Edit course" : "Create course"} onClose={() => setShowForm(false)}>
    <form onSubmit={handleSave} className="space-y-4" noValidate>
      {formError && <p className="text-sm text-red-600">{formError}</p>}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Course name</label>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Fire Safety Basics"
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration</label>
        <input
          value={form.duration}
          onChange={(e) => setForm({ ...form, duration: e.target.value })}
          placeholder="6 months"
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Basic fire safety certification"
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
          {saving ? "Saving..." : editing ? "Save changes" : "Create course"}
        </button>
      </div>
    </form>
  </Modal>
);

export default CreateCourse;

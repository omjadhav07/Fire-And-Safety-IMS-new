import React from "react";
import Modal from "../../components/Modal";
import { inputClass } from "../../services/helpers";

// CreateCategory (popup)
const CreateCategory = ({ editing, form, formError, handleSave, saving, setForm, setShowForm }) => (
  <Modal title={editing ? "Edit category" : "Add category"} onClose={() => setShowForm(false)}>
    <form onSubmit={handleSave} className="space-y-4" noValidate>
      {formError && <p className="text-sm text-red-600">{formError}</p>}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Category name</label>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Safety Inspection Manual"
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Fire prevention books"
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
          {saving ? "Saving..." : editing ? "Save changes" : "Add category"}
        </button>
      </div>
    </form>
  </Modal>
);

export default CreateCategory;

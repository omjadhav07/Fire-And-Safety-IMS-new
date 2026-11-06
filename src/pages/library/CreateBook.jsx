import React from "react";
import Modal from "../../components/Modal";
import { getId, inputClass } from "../../services/helpers";

// CreateBook (popup)
const CreateBook = ({ categories, editing, form, formError, handleSave, saving, setForm, setShowForm }) => (
  <Modal title={editing ? "Edit book" : "Add book"} onClose={() => setShowForm(false)} maxWidth="max-w-lg">
    <form onSubmit={handleSave} className="space-y-4" noValidate>
      {formError && <p className="text-sm text-red-600">{formError}</p>}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className={inputClass}
        >
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={getId(c)} value={getId(c)}>{c.name}</option>
          ))}
        </select>
        {categories.length === 0 && (
          <p className="text-xs text-amber-600 mt-1">No categories found. Create a category first.</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Fire and Safety Manual"
          className={inputClass}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Author</label>
          <input
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
            placeholder="Diyaa"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Book code</label>
          <input
            value={form.bookCode}
            onChange={(e) => setForm({ ...form, bookCode: e.target.value })}
            placeholder="FS-004"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Total quantity</label>
          <input
            type="number"
            min="1"
            value={form.totalQty}
            onChange={(e) => setForm({ ...form, totalQty: e.target.value })}
            placeholder="10"
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
          {saving ? "Saving..." : editing ? "Save changes" : "Add book"}
        </button>
      </div>
    </form>
  </Modal>
);

export default CreateBook;

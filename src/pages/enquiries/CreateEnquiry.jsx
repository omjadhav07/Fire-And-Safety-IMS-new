import React from "react";
import Modal from "../../components/Modal";
import { getId, titleCase, inputClass } from "../../services/helpers";
import { SOURCES } from "./enquiryUtils";
import Field from "../../components/Field";

// CreateEnquiry (popup)
const CreateEnquiry = ({ courses, form, formError, handleCreate, saving, set, setShowCreate }) => (
  <Modal title="New enquiry" onClose={() => setShowCreate(false)} maxWidth="max-w-lg">
    <form onSubmit={handleCreate} className="space-y-4" noValidate>
      {formError && <p className="text-sm text-red-600">{formError}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Name" className="sm:col-span-2">
          <input value={form.name} onChange={set("name")} placeholder="Full name" className={inputClass} />
        </Field>
        <Field label="Phone">
          <input value={form.phone} onChange={set("phone")} inputMode="numeric" maxLength={10} placeholder="9876543210" className={inputClass} />
        </Field>
        <Field label="Email">
          <input type="email" value={form.email} onChange={set("email")} placeholder="name@example.com" className={inputClass} />
        </Field>
        <Field label="Address" className="sm:col-span-2">
          <input value={form.address} onChange={set("address")} placeholder="Nashik, Maharashtra" className={inputClass} />
        </Field>
        <Field label="Course of interest">
          <select value={form.course_interest_id} onChange={set("course_interest_id")} className={inputClass}>
            <option value="">Select course</option>
            {courses.map((c) => (
              <option key={getId(c)} value={getId(c)}>{c.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Source">
          <select value={form.source} onChange={set("source")} className={inputClass}>
            {SOURCES.map((s) => (
              <option key={s} value={s}>{titleCase(s)}</option>
            ))}
          </select>
        </Field>
        <Field label="Notes" className="sm:col-span-2">
          <textarea rows={2} value={form.notes} onChange={set("notes")} placeholder="Anything worth remembering" className={inputClass} />
        </Field>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => setShowCreate(false)}
          className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 rounded-lg bg-[#0EA5E9] text-white font-medium hover:bg-[#0284C7] disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save enquiry"}
        </button>
      </div>
    </form>
  </Modal>
);

export default CreateEnquiry;

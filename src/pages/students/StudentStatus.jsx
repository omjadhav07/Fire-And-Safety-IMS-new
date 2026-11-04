import React from "react";
import Modal from "../../components/Modal";
import { titleCase, inputClass } from "../../services/helpers";
import { STATUSES } from "./studentUtils";

// Change a student's status (active / completed / left)
const StudentStatus = ({ student, status, onStatusChange, saving, onSubmit, onClose }) => (
  <Modal title="Change student status" onClose={onClose}>
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="text-sm text-gray-600">
        <span className="font-medium text-gray-900">{student.name}</span>
        {student.rollNo ? ` · ${student.rollNo}` : ""}
      </p>
      <select value={status} onChange={(e) => onStatusChange(e.target.value)} className={inputClass}>
        {STATUSES.map((s) => (
          <option key={s} value={s}>{titleCase(s)}</option>
        ))}
      </select>
      <p className="text-xs text-gray-500">The status is also synced with this student&apos;s user login.</p>
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
          {saving ? "Updating..." : "Update status"}
        </button>
      </div>
    </form>
  </Modal>
);

export default StudentStatus;

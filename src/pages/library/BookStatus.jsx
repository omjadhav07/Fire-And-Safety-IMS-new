import React from "react";
import Modal from "../../components/Modal";
import { getId, inputClass, titleCase } from "../../services/helpers";
import { STATUS_OPTIONS } from "./bookUtils";

// BookStatus (popup)
const BookStatus = ({ busyId, handleStatus, newStatus, setNewStatus, setStatusBook, statusBook }) => (
  <Modal title="Change book status" onClose={() => setStatusBook(null)}>
    <form onSubmit={handleStatus} className="space-y-4">
      <p className="text-sm text-gray-600">
        <span className="font-medium text-gray-900">{statusBook.title}</span>
      </p>
      <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className={inputClass}>
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>{titleCase(s)}</option>
        ))}
      </select>
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => setStatusBook(null)}
          className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={busyId === getId(statusBook)}
          className="px-5 py-2.5 rounded-lg bg-[#0EA5E9] text-white font-medium hover:bg-[#0284C7] disabled:opacity-60"
        >
          Update status
        </button>
      </div>
    </form>
  </Modal>
);

export default BookStatus;

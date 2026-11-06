import React, { useState } from "react";
import { rejectTcLc } from "./tcLcService";
import { getErrorMessage } from "../../services/api";
import Modal from "../../components/Modal";
import Field from "../../components/Field";
import { inputClass } from "../../services/helpers";

// Reject a request with a reason (PUT /tc-lc/:id/reject)
const RejectTcLc = ({ request, onClose, onRejected }) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (reason.trim().length < 3) return setError("Enter the reason for rejecting");
    setSaving(true);
    setError("");
    try {
      const res = await rejectTcLc(request.id, reason.trim());
      onRejected(res.message || `${request.type} request rejected`);
    } catch (err) {
      setError(getErrorMessage(err, "Could not reject the request"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Reject request" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <p className="text-sm text-gray-600">
          {request.type} request of <span className="font-medium text-gray-900">{request.name}</span>
        </p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Field label="Reason for rejecting">
          <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Pending fees, incomplete documents..." className={inputClass} />
        </Field>
        <div className="flex justify-end gap-3 pt-1">
          <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-60"
          >
            {saving ? "Rejecting..." : "Reject request"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RejectTcLc;

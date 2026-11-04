import React, { useEffect, useState } from "react";
import { getMarkHistory } from "./classTestService";
import { getErrorMessage } from "../../services/api";
import Modal from "../../components/Modal";
import { flattenRows, fmtDateTime } from "../fees/feeUtils";

// GET /class-tests/:id/marks/:studentId/history  - every change made to one student's mark
// loadHistory(studentId) can be passed to use another endpoint (exams use /exams/:id/marks/:studentId/history)
const MarkHistory = ({ testId, student, onClose, loadHistory }) => {
  const [state, setState] = useState({ loading: true, history: [], error: "" });

  useEffect(() => {
    let cancelled = false;
    (loadHistory ? loadHistory(student.id) : getMarkHistory(testId, student.id))
      .then((list) => {
        if (cancelled) return;
        const sorted = [...list].sort((a, b) => new Date(b.changed_at || b.createdAt) - new Date(a.changed_at || a.createdAt));
        setState({ loading: false, history: sorted, error: "" });
      })
      .catch((err) => !cancelled && setState({ loading: false, history: [], error: getErrorMessage(err, "Could not load mark history") }));
    return () => {
      cancelled = true;
    };
  }, [testId, student.id, loadHistory]);

  const { loading, history, error } = state;

  return (
    <Modal title="Mark history" onClose={onClose} maxWidth="max-w-lg">
      <p className="text-sm font-medium text-gray-900 mb-3">
        {student.name}
        {student.rollNo ? <span className="text-gray-500 font-normal"> · {student.rollNo}</span> : null}
      </p>

      {loading && <p className="text-sm text-gray-500 py-6 text-center">Loading history...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !error && history.length === 0 && (
        <p className="text-sm text-gray-500 py-6 text-center">No changes recorded for this student yet.</p>
      )}

      {history.length > 0 && (
        <ol className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {history.map((h, i) => {
            const rows = flattenRows(
              Object.fromEntries(Object.entries(h).filter(([k]) => !["changed_at", "createdAt", "updatedAt", "changed_by"].includes(k)))
            );
            return (
              <li key={h._id || i} className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                <p className="text-xs text-gray-500">
                  {h.changed_by?.name ? `${h.changed_by.name} · ` : ""}
                  {fmtDateTime(h.changed_at || h.createdAt)}
                </p>
                <dl className="mt-1.5 text-sm space-y-1">
                  {rows.map(([label, value], k) => (
                    <div key={`${label}-${k}`} className="flex justify-between gap-4">
                      <dt className="text-gray-500">{label}</dt>
                      <dd className="font-medium text-gray-900 text-right">{value}</dd>
                    </div>
                  ))}
                </dl>
              </li>
            );
          })}
        </ol>
      )}

      <div className="flex justify-end pt-4">
        <button onClick={onClose} className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
          Close
        </button>
      </div>
    </Modal>
  );
};

export default MarkHistory;

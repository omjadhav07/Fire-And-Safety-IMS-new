import React, { useEffect, useState } from "react";
import { getEligibility, feeStudentId } from "./feeService";
import { getErrorMessage } from "../../services/api";
import Modal from "../../components/Modal";
import StudentSearch from "../../components/StudentSearch";
import { KeyValueList } from "../../components/DataViews";
import { flattenRows } from "./feeUtils";

const FLAG_KEYS = ["eligible", "isEligible", "is_eligible", "exam_eligible", "eligible_for_exam", "examEligible"];
const MESSAGE_KEYS = ["message", "reason", "remarks"];

// GET /fees/:studentId/eligibility
const EligibilityModal = ({ student = null, onClose }) => {
  const [picked, setPicked] = useState(null);
  const target = student || picked;
  const [state, setState] = useState({ loading: !!student, result: null, error: "" });

  useEffect(() => {
    if (!target) return undefined;
    let cancelled = false;
    getEligibility(feeStudentId(target))
      .then((result) => !cancelled && setState({ loading: false, result, error: "" }))
      .catch((err) => !cancelled && setState({ loading: false, result: null, error: getErrorMessage(err, "Could not check eligibility") }));
    return () => {
      cancelled = true;
    };
  }, [target]);

  const choose = (s) => {
    setPicked(s);
    setState({ loading: !!s, result: null, error: "" });
  };

  const { loading, result, error } = state;
  const data = result?.data && typeof result.data === "object" ? result.data : {};
  const flagKey = FLAG_KEYS.find((k) => typeof data[k] === "boolean");
  const eligible = flagKey ? data[flagKey] : undefined;
  const messageKey = MESSAGE_KEYS.find((k) => typeof data[k] === "string" && data[k]);
  const message = (messageKey && data[messageKey]) || result?.message || "";

  const shown = [...(flagKey ? [flagKey] : []), ...(messageKey ? [messageKey] : [])];
  const extra = Object.fromEntries(Object.entries(data).filter(([k]) => !shown.includes(k)));
  const extraRows = flattenRows(extra);

  return (
    <Modal title="Exam eligibility" onClose={onClose}>
      <div className="space-y-4">
        {student ? (
          <p className="text-sm font-medium text-gray-900">{student.name}</p>
        ) : (
          <StudentSearch value={picked} onChange={choose} placeholder="Search student to check" />
        )}

        {loading && <p className="text-sm text-gray-500">Checking...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {result && (
          <>
            {eligible !== undefined && (
              <div
                className={`rounded-lg border px-4 py-3 text-sm font-medium ${
                  eligible ? "border-sky-200 bg-sky-50 text-sky-800" : "border-red-200 bg-red-50 text-red-800"
                }`}
              >
                {eligible ? "Eligible for the exam" : "Not eligible for the exam"}
              </div>
            )}
            {message && <p className="text-sm text-gray-700">{message}</p>}
            {extraRows.length > 0 && <KeyValueList data={extra} />}
          </>
        )}

        <div className="flex justify-end pt-1">
          <button onClick={onClose} className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EligibilityModal;

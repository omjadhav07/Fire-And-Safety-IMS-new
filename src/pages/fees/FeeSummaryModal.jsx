import React, { useEffect, useState } from "react";
import { Download, Printer } from "lucide-react";
import { getFeeSummary, feeStudentId } from "./feeService";
import { getErrorMessage } from "../../services/api";
import Modal from "../../components/Modal";
import StudentSearch from "../../components/StudentSearch";
import LedgerTable from "./LedgerTable";
import { inr, ledgerLine, buildFeeDetail, downloadFeeDetailCsv, printFeeDetail } from "./feeUtils";

const Stat = ({ label, value, tone = "text-gray-900" }) => (
  <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
    <p className="text-xs text-gray-500">{label}</p>
    <p className={`mt-0.5 text-xl font-bold ${tone}`}>{inr(value)}</p>
  </div>
);

// GET /fees/:studentId/summary
const FeeSummaryModal = ({ student = null, onClose }) => {
  const [picked, setPicked] = useState(null);
  const target = student || picked;
  const [state, setState] = useState({ loading: !!student, summary: null, error: "" });

  useEffect(() => {
    if (!target) return undefined;
    let cancelled = false;
    getFeeSummary(feeStudentId(target))
      .then((summary) => !cancelled && setState({ loading: false, summary, error: "" }))
      .catch((err) => !cancelled && setState({ loading: false, summary: null, error: getErrorMessage(err, "Could not load fee summary") }));
    return () => {
      cancelled = true;
    };
  }, [target]);

  const choose = (s) => {
    setPicked(s);
    setState({ loading: !!s, summary: null, error: "" });
  };

  const { loading, summary, error } = state;

  const detail = () => {
    const lines = summary.ledger.map(ledgerLine);
    return buildFeeDetail({
      student: target,
      course: lines.find((l) => l.course)?.course || "",
      components: lines.map((l) => ({ name: l.name, amount: l.due, required_for_exam: l.exam })),
      total: summary.totalDue,
      paid: summary.totalPaid,
      pending: summary.balance,
    });
  };

  return (
    <Modal title="Fee summary" onClose={onClose} maxWidth="max-w-3xl">
      <div className="space-y-4">
        {student ? (
          <p className="text-sm font-medium text-gray-900">{student.name}</p>
        ) : (
          <StudentSearch value={picked} onChange={choose} placeholder="Search student to view fees" />
        )}

        {loading && <p className="text-sm text-gray-500">Loading...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {summary && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Stat label="Total due" value={summary.totalDue} />
              <Stat label="Paid" value={summary.totalPaid} tone="text-sky-700" />
              <Stat label="Balance" value={summary.balance} tone={summary.balance > 0 ? "text-red-600" : "text-gray-900"} />
            </div>

            <div className="rounded-xl border border-gray-100 overflow-hidden">
              <LedgerTable ledger={summary.ledger} />
            </div>

            {summary.ledger.length > 0 && (
              <div className="flex flex-wrap justify-end gap-3">
                <button
                  onClick={() => printFeeDetail(detail())}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Printer size={16} /> Print / Save PDF
                </button>
                <button
                  onClick={() => downloadFeeDetailCsv(detail())}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Download size={16} /> Download Excel
                </button>
              </div>
            )}
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

export default FeeSummaryModal;

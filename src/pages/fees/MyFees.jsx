import React, { useEffect, useState } from "react";
import { RefreshCw, Receipt } from "lucide-react";
import { getMyFees, getMyPayments } from "./feeService";
import { getErrorMessage } from "../../services/api";
import { getId, titleCase } from "../../services/helpers";
import { inr, num, fmtDateTime, paymentStatusClass } from "./feeUtils";
import { KeyValueList } from "../../components/DataViews";
import LedgerTable from "./LedgerTable";
import ReceiptModal from "./ReceiptModal";

const Stat = ({ label, value, tone = "text-gray-900" }) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
    <p className="text-sm text-gray-500">{label}</p>
    <p className={`mt-1 text-2xl font-bold ${tone}`}>{inr(value)}</p>
  </div>
);

// GET /fees/my/fees  +  GET /fees/my/payments
const MyFees = () => {
  const [summary, setSummary] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [receiptId, setReceiptId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getMyFees(), getMyPayments().catch(() => [])])
      .then(([s, p]) => {
        if (cancelled) return;
        setSummary(s);
        setPayments(p);
        setError("");
      })
      .catch((err) => !cancelled && setError(getErrorMessage(err, "Could not load your fees")))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const reload = () => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  const data = summary && typeof summary === "object" && !Array.isArray(summary) ? summary : {};
  const total = num(data, "totalDue", "total_fee", "totalFee", "total", "total_amount", "totalAmount");
  const paid = num(data, "paid", "paid_amount", "paidAmount", "total_paid", "totalPaid");
  const pending = num(data, "pending", "pending_amount", "pendingAmount", "balance", "due", "due_amount", "dueAmount");
  const hasStats = [total, paid, pending].some((v) => v !== undefined);

  // First array of objects in the summary (fee components / ledger lines)
  const lines = Array.isArray(data.ledger) ? data.ledger : Object.values(data).find((v) => Array.isArray(v) && v.length && typeof v[0] === "object");
  const scalarData = Object.fromEntries(Object.entries(data).filter(([, v]) => !Array.isArray(v)));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Fees</h1>
          <p className="text-sm text-gray-500 mt-1">Your fee summary and payment history</p>
        </div>
        <button
          onClick={reload}
          className="p-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
          aria-label="Refresh"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>
      )}

      {loading ? (
        <p className="py-10 text-center text-gray-500">Loading your fees...</p>
      ) : (
        <div className="space-y-6">
          {hasStats && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Stat label="Total fee" value={total} />
              <Stat label="Paid" value={paid} tone="text-sky-700" />
              <Stat label="Pending" value={pending} tone={pending > 0 ? "text-red-600" : "text-gray-900"} />
            </div>
          )}

          {!hasStats && summary && (
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <KeyValueList data={scalarData} />
            </div>
          )}

          {lines?.length > 0 && (
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
              <h2 className="px-5 py-4 font-semibold text-gray-900">Fee details</h2>
              <LedgerTable ledger={lines} />
            </div>
          )}

          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <h2 className="px-5 py-4 font-semibold text-gray-900">Payment history</h2>
            {payments.length === 0 ? (
              <p className="px-5 pb-6 text-sm text-gray-500">No payments yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#0B1437] text-white">
                    <tr>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium text-right">Amount</th>
                      <th className="px-4 py-3 font-medium">Mode</th>
                      <th className="px-4 py-3 font-medium">Reference</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {payments.map((p, i) => {
                      const status = String(p.status || "paid").toLowerCase();
                      return (
                        <tr key={getId(p) || i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                            {fmtDateTime(p.paid_on || p.payment_date || p.date || p.createdAt)}
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap font-medium">{inr(p.amount)}</td>
                          <td className="px-4 py-3 text-gray-600">{titleCase(p.mode)}</td>
                          <td className="px-4 py-3 text-gray-600">{p.reference_no || "-"}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${paymentStatusClass(status)}`}>
                              {titleCase(status)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {getId(p) && (
                              <button
                                onClick={() => setReceiptId(getId(p))}
                                title="View receipt"
                                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                              >
                                <Receipt size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {receiptId && <ReceiptModal paymentId={receiptId} onClose={() => setReceiptId(null)} />}
    </div>
  );
};

export default MyFees;

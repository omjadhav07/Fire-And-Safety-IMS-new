import React from "react";
import { ledgerLine, ledgerTotals, ledgerStatusClass, inr, fmtDateTime } from "./feeUtils";
import { titleCase } from "../../services/helpers";

// Fee ledger lines: what is due, paid and still pending for each fee
const LedgerTable = ({ ledger }) => {
  const lines = (ledger || []).map(ledgerLine);
  if (lines.length === 0) return <p className="px-5 pb-6 text-sm text-gray-500">No fee ledger yet.</p>;
  const totals = ledgerTotals(ledger);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-4 py-3 font-medium">Fee</th>
            <th className="px-4 py-3 font-medium text-right">Due</th>
            <th className="px-4 py-3 font-medium text-right">Paid</th>
            <th className="px-4 py-3 font-medium text-right">Balance</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Due date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {lines.map((l, i) => (
            <tr key={l.id || i} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <p className="font-medium text-gray-900">{l.name}</p>
                {l.exam && <span className="text-xs text-amber-700">Required for exam</span>}
              </td>
              <td className="px-4 py-3 text-right whitespace-nowrap">{inr(l.due)}</td>
              <td className="px-4 py-3 text-right whitespace-nowrap text-green-700">{inr(l.paid)}</td>
              <td className={`px-4 py-3 text-right whitespace-nowrap font-medium ${l.balance > 0 ? "text-red-600" : "text-gray-500"}`}>
                {inr(l.balance)}
              </td>
              <td className="px-4 py-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${ledgerStatusClass(l.status)}`}>
                  {titleCase(l.status)}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{l.dueDate ? fmtDateTime(l.dueDate) : "-"}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-100 font-semibold text-gray-900">
            <td className="px-4 py-3">Total</td>
            <td className="px-4 py-3 text-right">{inr(totals.due)}</td>
            <td className="px-4 py-3 text-right text-green-700">{inr(totals.paid)}</td>
            <td className="px-4 py-3 text-right text-red-600">{inr(totals.balance)}</td>
            <td colSpan={2} />
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default LedgerTable;

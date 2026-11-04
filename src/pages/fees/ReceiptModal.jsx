// import React, { useEffect, useState } from "react";
// import { Printer, Download } from "lucide-react";
// import { getReceipt, saveBlob } from "./feeService";
// import { getErrorMessage } from "../../services/api";
// import Modal from "../../components/Modal";
// import { KeyValueList } from "../../components/DataViews";
// import { flattenRows } from "./feeUtils";

// const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// // GET /fees/payments/:id/receipt
// const ReceiptModal = ({ paymentId, onClose }) => {
//   const [state, setState] = useState({ loading: true, receipt: null, error: "" });

//   useEffect(() => {
//     let cancelled = false;
//     getReceipt(paymentId)
//       .then((receipt) => {
//         if (cancelled) return;
//         if (receipt.kind === "file") saveBlob(receipt.blob, receipt.filename); // PDF: download straight away
//         setState({ loading: false, receipt, error: "" });
//       })
//       .catch((err) => !cancelled && setState({ loading: false, receipt: null, error: getErrorMessage(err, "Could not load receipt") }));
//     return () => {
//       cancelled = true;
//     };
//   }, [paymentId]);

//   const { loading, receipt, error } = state;

//   const print = () => {
//     const rows = flattenRows(receipt.data);
//     const w = window.open("", "_blank", "width=720,height=900");
//     if (!w) return;
//     w.document.write(`<!doctype html><html><head><title>Fee receipt</title>
//       <style>body{font-family:Arial,sans-serif;padding:32px;color:#111}h1{font-size:20px;margin:0 0 4px}
//       p{color:#555;margin:0 0 20px;font-size:13px}table{width:100%;border-collapse:collapse}
//       td{padding:9px 6px;border-bottom:1px solid #e5e7eb;font-size:14px}td:first-child{color:#555;width:42%}</style></head>
//       <body><h1>Fire &amp; Safety College</h1><p>Fee receipt</p>
//       <table>${rows.map(([k, v]) => `<tr><td>${esc(k)}</td><td><b>${esc(v)}</b></td></tr>`).join("")}</table>
//       </body></html>`);
//     w.document.close();
//     w.focus();
//     w.print();
//   };

//   return (
//     <Modal title="Payment receipt" onClose={onClose} maxWidth="max-w-lg">
//       {loading && <p className="text-sm text-gray-500 py-6 text-center">Loading receipt...</p>}
//       {error && <p className="text-sm text-red-600">{error}</p>}

//       {receipt?.kind === "json" && (
//         <>
//           <KeyValueList data={receipt.data} />
//           <div className="flex justify-end pt-4">
//             <button
//               onClick={print}
//               className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
//             >
//               <Printer size={16} /> Print
//             </button>
//           </div>
//         </>
//       )}

//       {receipt?.kind === "file" && (
//         <div className="py-4 text-center space-y-3">
//           <p className="text-sm text-gray-600">The receipt was downloaded as <span className="font-medium">{receipt.filename}</span>.</p>
//           <button
//             onClick={() => saveBlob(receipt.blob, receipt.filename)}
//             className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
//           >
//             <Download size={16} /> Download again
//           </button>
//         </div>
//       )}
//     </Modal>
//   );
// };

// export default ReceiptModal;



import React, { useEffect, useState } from "react";
import { Printer, Download } from "lucide-react";
import { getReceipt, saveBlob } from "./feeService";
import { getErrorMessage } from "../../services/api";
import Modal from "../../components/Modal";
import { KeyValueList } from "../../components/DataViews";
import { inr, fmtDateTime } from "./feeUtils";
import { titleCase } from "../../services/helpers";

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const nameOf = (v) => (v && typeof v === "object" ? v.name || v.title || "" : v || "");

// The receipt JSON -> plain fields (course / batch can be a name or an object, batch may be null)
const readReceipt = (d) => {
  const s = d?.student && typeof d.student === "object" ? d.student : {};
  return {
    receiptNo: d?.receipt_no,
    date: d?.payment_date || d?.createdAt,
    studentName: s.full_name || s.name || "",
    studentCode: s.student_id || "",
    email: s.email || "",
    course: nameOf(d?.course),
    batch: nameOf(d?.batch),
    amount: d?.amount,
    mode: d?.mode,
    reference: d?.reference_no,
    balanceAfter: d?.balance_after,
    status: d?.status,
    allocations: Array.isArray(d?.allocations) ? d.allocations : [],
  };
};

// GET /fees/payments/:id/receipt
const ReceiptModal = ({ paymentId, onClose }) => {
  const [state, setState] = useState({ loading: true, receipt: null, error: "" });

  useEffect(() => {
    let cancelled = false;
    getReceipt(paymentId)
      .then((receipt) => {
        if (cancelled) return;
        if (receipt.kind === "file") saveBlob(receipt.blob, receipt.filename); // PDF: download straight away
        setState({ loading: false, receipt, error: "" });
      })
      .catch((err) => !cancelled && setState({ loading: false, receipt: null, error: getErrorMessage(err, "Could not load receipt") }));
    return () => {
      cancelled = true;
    };
  }, [paymentId]);

  const { loading, receipt, error } = state;
  const r = receipt?.kind === "json" ? readReceipt(receipt.data) : null;
  const structured = !!(r && (r.receiptNo || r.amount !== undefined));

  const details = r
    ? [
        ["Student", r.studentName],
        ["Student ID", r.studentCode],
        ["Email", r.email],
        ["Course", r.course],
        ["Batch", r.batch],
        ["Payment mode", r.mode ? titleCase(r.mode) : ""],
        ["Reference no.", r.reference],
      ].filter(([, v]) => v)
    : [];

  const print = () => {
    const w = window.open("", "_blank", "width=720,height=900");
    if (!w) return;
    w.document.write(`<!doctype html><html><head><title>Receipt ${esc(r.receiptNo)}</title>
      <style>
        body{font-family:Arial,sans-serif;padding:32px;color:#111;max-width:640px;margin:auto}
        h1{font-size:20px;margin:0}.sub{color:#555;font-size:13px;margin:2px 0 18px}
        .row{display:flex;justify-content:space-between;font-size:14px;margin:4px 0}.muted{color:#666}
        table{width:100%;border-collapse:collapse;margin-top:12px}
        th,td{padding:8px 6px;border-bottom:1px solid #e5e7eb;font-size:14px;text-align:left}
        th:last-child,td:last-child{text-align:right}
        .total{display:flex;justify-content:space-between;font-size:18px;font-weight:bold;margin-top:14px}
        hr{border:none;border-top:1px solid #ddd;margin:16px 0}
      </style></head><body>
      <h1>Fire &amp; Safety College</h1><p class="sub">Fee receipt</p>
      <div class="row"><span class="muted">Receipt no.</span><b>${esc(r.receiptNo)}</b></div>
      <div class="row"><span class="muted">Date</span><b>${esc(fmtDateTime(r.date))}</b></div>
      <hr/>
      ${details.map(([k, v]) => `<div class="row"><span class="muted">${esc(k)}</span><b>${esc(v)}</b></div>`).join("")}
      ${
        r.allocations.length
          ? `<table><thead><tr><th>Fee</th><th>Amount</th></tr></thead><tbody>${r.allocations
              .map((a) => `<tr><td>${esc(a.fee_name || a.name)}</td><td>${esc(inr(a.amount))}</td></tr>`)
              .join("")}</tbody></table>`
          : ""
      }
      <div class="total"><span>Amount paid</span><span>${esc(inr(r.amount))}</span></div>
      ${r.balanceAfter !== null && r.balanceAfter !== undefined ? `<div class="row"><span class="muted">Balance after payment</span><b>${esc(inr(r.balanceAfter))}</b></div>` : ""}
      </body></html>`);
    w.document.close();
    w.focus();
    w.print();
  };

  return (
    <Modal title="Payment receipt" onClose={onClose} maxWidth="max-w-lg">
      {loading && <p className="text-sm text-gray-500 py-6 text-center">Loading receipt...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {receipt?.kind === "json" && !structured && <KeyValueList data={receipt.data} />}

      {structured && (
        <div>
          <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
            <div>
              <p className="text-xs text-gray-500">Receipt no.</p>
              <p className="font-semibold text-gray-900">{r.receiptNo || "-"}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Date</p>
              <p className="font-medium text-gray-900">{fmtDateTime(r.date)}</p>
            </div>
          </div>

          <dl className="divide-y divide-gray-100 text-sm">
            {details.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 py-2.5">
                <dt className="text-gray-500 shrink-0">{label}</dt>
                <dd className="font-medium text-gray-900 text-right break-words">{value}</dd>
              </div>
            ))}
          </dl>

          {r.allocations.length > 0 && (
            <div className="mt-3 rounded-xl border border-gray-100 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Paid towards</th>
                    <th className="px-4 py-2.5 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {r.allocations.map((a, i) => (
                    <tr key={i}>
                      <td className="px-4 py-2.5 text-gray-900">{a.fee_name || a.name || "-"}</td>
                      <td className="px-4 py-2.5 text-right whitespace-nowrap">{inr(a.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between rounded-xl bg-green-50 px-4 py-3">
            <span className="text-sm font-medium text-green-800">Amount paid</span>
            <span className="text-xl font-bold text-green-800">{inr(r.amount)}</span>
          </div>
          {r.balanceAfter !== null && r.balanceAfter !== undefined && (
            <p className="mt-2 text-sm text-gray-600 text-right">
              Balance after payment: <span className="font-medium text-gray-900">{inr(r.balanceAfter)}</span>
            </p>
          )}

          <div className="flex justify-end pt-4">
            <button
              onClick={print}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Printer size={16} /> Print
            </button>
          </div>
        </div>
      )}

      {receipt?.kind === "file" && (
        <div className="py-4 text-center space-y-3">
          <p className="text-sm text-gray-600">The receipt was downloaded as <span className="font-medium">{receipt.filename}</span>.</p>
          <button
            onClick={() => saveBlob(receipt.blob, receipt.filename)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Download size={16} /> Download again
          </button>
        </div>
      )}
    </Modal>
  );
};

export default ReceiptModal;
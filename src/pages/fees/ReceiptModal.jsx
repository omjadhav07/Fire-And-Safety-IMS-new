import React, { useEffect, useState } from "react";
import { Printer, Download } from "lucide-react";
import { getReceipt, saveBlob } from "./feeService";
import { getErrorMessage } from "../../services/api";
import Modal from "../../components/Modal";
import { KeyValueList } from "../../components/DataViews";
import { flattenRows } from "./feeUtils";

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

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

  const print = () => {
    const rows = flattenRows(receipt.data);
    const w = window.open("", "_blank", "width=720,height=900");
    if (!w) return;
    w.document.write(`<!doctype html><html><head><title>Fee receipt</title>
      <style>body{font-family:Arial,sans-serif;padding:32px;color:#111}h1{font-size:20px;margin:0 0 4px}
      p{color:#555;margin:0 0 20px;font-size:13px}table{width:100%;border-collapse:collapse}
      td{padding:9px 6px;border-bottom:1px solid #e5e7eb;font-size:14px}td:first-child{color:#555;width:42%}</style></head>
      <body><h1>Fire &amp; Safety College</h1><p>Fee receipt</p>
      <table>${rows.map(([k, v]) => `<tr><td>${esc(k)}</td><td><b>${esc(v)}</b></td></tr>`).join("")}</table>
      </body></html>`);
    w.document.close();
    w.focus();
    w.print();
  };

  return (
    <Modal title="Payment receipt" onClose={onClose} maxWidth="max-w-lg">
      {loading && <p className="text-sm text-gray-500 py-6 text-center">Loading receipt...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {receipt?.kind === "json" && (
        <>
          <KeyValueList data={receipt.data} />
          <div className="flex justify-end pt-4">
            <button
              onClick={print}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Printer size={16} /> Print
            </button>
          </div>
        </>
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

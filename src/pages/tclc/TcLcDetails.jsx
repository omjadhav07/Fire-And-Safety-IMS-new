import React, { useEffect, useState } from "react";
import { ShieldCheck, CheckCircle2, XCircle, Download } from "lucide-react";
import { getTcLcById, checkRequestEligibility, approveTcLc, downloadTcLcPdf } from "./tcLcService";
import { getErrorMessage } from "../../services/api";
import Modal from "../../components/Modal";
import { btnPrimary, btnOutline, StatusPill } from "../../components/ui";
import { fmtDateTime } from "../fees/feeUtils";
import { fmtDate, titleCase } from "../../services/helpers";
import { readRequest, pdfName } from "./tcLcUtils";
import EligibilityPanel from "./EligibilityPanel";

const TONES = { requested: "amber", pending: "amber", approved: "green", rejected: "red" };

// GET /tc-lc/:id  (+ GET /tc-lc/:id/eligibility on demand)
// Approve and Reject are here while the request is waiting; the PDF once it is approved.
const TcLcDetails = ({ id, names, onClose, onChanged, onReject }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [elig, setElig] = useState(null); // { loading, result, error }
  const [busy, setBusy] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getTcLcById(id)
      .then((d) => !cancelled && setData(d))
      .catch((err) => !cancelled && setError(getErrorMessage(err, "Could not load the request")));
    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  const check = async () => {
    setElig({ loading: true, result: null, error: "" });
    try {
      setElig({ loading: false, result: await checkRequestEligibility(id), error: "" });
    } catch (err) {
      setElig({ loading: false, result: null, error: getErrorMessage(err, "Could not check eligibility") });
    }
  };

  const r = data ? readRequest(data, names) : null;
  const notEligible = elig?.result && (elig.result.data?.isEligible ?? elig.result.data?.eligible ?? elig.result.data?.is_eligible) === false;

  // PUT /tc-lc/:id/approve
  const approve = async () => {
    if (!window.confirm(`Approve the ${r.type} request of ${r.name}? The certificate will be issued.`)) return;
    setBusy("approve");
    setError("");
    try {
      const res = await approveTcLc(id);
      setReloadKey((k) => k + 1);
      onChanged(res.message || `${r.type} request approved`);
    } catch (err) {
      setError(getErrorMessage(err, "Could not approve the request"));
    } finally {
      setBusy("");
    }
  };

  // GET /tc-lc/:id/pdf
  const downloadPdf = async () => {
    setBusy("pdf");
    setError("");
    try {
      await downloadTcLcPdf(id, pdfName(r));
    } catch (err) {
      setError(getErrorMessage(err, "Could not download the certificate"));
    } finally {
      setBusy("");
    }
  };

  const rows = r && [
    ["Student", r.name],
    ["Student ID", r.code],
    ["Certificate", r.type],
    ["Reason", r.reason],
    ["Requested on", r.date ? fmtDateTime(r.date) : ""],
    ["Certificate no.", r.certificateNo],
    ["Issue date", r.issueDate ? fmtDate(r.issueDate) : ""],
    ["Eligibility note", r.eligibilityNote],
    ["Rejection reason", r.rejectReason],
  ].filter(([, v]) => v);

  return (
    <Modal title="TC / LC request" onClose={onClose} maxWidth="max-w-lg">
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      {!data && !error && <p className="text-sm text-slate-500">Loading...</p>}
      {r && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-slate-900">{r.type} · {r.name}</h3>
            <StatusPill tone={TONES[r.status]}>{titleCase(r.status)}</StatusPill>
          </div>
          <dl className="divide-y divide-slate-100 text-sm border-t border-slate-100">
            {rows.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 py-2.5">
                <dt className="text-slate-500 shrink-0">{label}</dt>
                <dd className="font-medium text-slate-900 text-right break-words">{value}</dd>
              </div>
            ))}
          </dl>

          {r.open && (
            <>
              <div>
                <button onClick={check} disabled={elig?.loading} className={btnOutline}>
                  <ShieldCheck size={16} /> Check eligibility
                </button>
                {elig && (
                  <div className="mt-3">
                    <EligibilityPanel loading={elig.loading} result={elig.result} error={elig.error} />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-1">
                <button
                  onClick={() => onReject(r)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-300 bg-white text-red-700 text-sm font-medium hover:bg-red-50"
                >
                  <XCircle size={16} /> Reject
                </button>
                <button
                  onClick={approve}
                  disabled={busy === "approve" || notEligible}
                  title={notEligible ? "This student is not eligible yet" : ""}
                  className={btnPrimary}
                >
                  <CheckCircle2 size={16} /> {busy === "approve" ? "Approving..." : "Approve"}
                </button>
              </div>
            </>
          )}

          {r.canDownload && (
            <div className="flex justify-end pt-1">
              <button onClick={downloadPdf} disabled={busy === "pdf"} className={btnPrimary}>
                <Download size={16} /> {busy === "pdf" ? "Downloading..." : "Download PDF"}
              </button>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default TcLcDetails;

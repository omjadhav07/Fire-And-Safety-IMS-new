import React, { useEffect, useMemo, useState } from "react";
import { RefreshCw, Download } from "lucide-react";
import { getMyTcLcRequests, downloadTcLcPdf } from "./tcLcService";
import { getErrorMessage } from "../../services/api";
import { titleCase } from "../../services/helpers";
import { fmtDateTime } from "../fees/feeUtils";
import { readRequest, statusClass } from "./tcLcUtils";

// Student view: GET /tc-lc/my-requests  +  download the approved certificate
const MyTcLc = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getMyTcLcRequests()
      .then((list) => {
        if (cancelled) return;
        setRequests(list);
        setError("");
      })
      .catch((err) => !cancelled && setError(getErrorMessage(err, "Could not load your requests")))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const rows = useMemo(() => requests.map((r) => readRequest(r)), [requests]);

  const reload = () => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  const download = async (r) => {
    setBusyId(r.id);
    setError("");
    try {
      await downloadTcLcPdf(r.id);
    } catch (err) {
      setError(getErrorMessage(err, "Could not download the certificate"));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My TC / LC</h1>
          <p className="text-sm text-gray-500 mt-1">Your transfer / leaving certificate requests. To raise a request, contact the college office.</p>
        </div>
        <button onClick={reload} className="p-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50" aria-label="Refresh">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#0B1437] text-white">
            <tr>
              <th className="px-4 py-3 font-medium">Certificate</th>
              <th className="px-4 py-3 font-medium">Reason</th>
              <th className="px-4 py-3 font-medium">Requested</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Certificate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-500">Loading...</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-500">You have no TC / LC requests.</td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-semibold">{r.type || "-"}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {r.reason || "-"}
                    {r.rejectReason && <p className="text-xs text-red-600 mt-0.5">Rejected: {r.rejectReason}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{r.date ? fmtDateTime(r.date) : "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusClass(r.status)}`}>{titleCase(r.status)}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {r.status === "approved" && (
                      <button
                        onClick={() => download(r)}
                        disabled={busyId === r.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <Download size={14} /> {busyId === r.id ? "Downloading..." : "Download PDF"}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyTcLc;

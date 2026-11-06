import React, { useEffect, useMemo, useState } from "react";
import { RefreshCw, Eye, CheckCircle2, XCircle, Download } from "lucide-react";
import { getTcLcRequests, approveTcLc, downloadTcLcPdf } from "./tcLcService";
import { getStudentNameMap } from "../students/studentService";
import { getErrorMessage } from "../../services/api";
import { titleCase } from "../../services/helpers";
import { fmtDateTime } from "../fees/feeUtils";
import { PageHeader, Toolbar, AddButton, TableCard, Notice, Avatar, StatusPill, btnOutline } from "../../components/ui";
import { TYPES, STATUSES, readRequest, pdfName } from "./tcLcUtils";
import CreateTcLc from "./CreateTcLc";
import RejectTcLc from "./RejectTcLc";
import TcLcDetails from "./TcLcDetails";

const TONES = { requested: "amber", pending: "amber", approved: "green", rejected: "red" };
const selectClass = "px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white";

// TC / LC requests: list, create, approve, reject, download the certificate
const ManageTcLc = () => {
  const [requests, setRequests] = useState([]);
  const [names, setNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [rejecting, setRejecting] = useState(null);
  const [viewId, setViewId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  // GET /tc-lc?status=&type=
  useEffect(() => {
    let cancelled = false;
    Promise.all([getTcLcRequests({ status: statusFilter, type: typeFilter }), getStudentNameMap().catch(() => ({}))])
      .then(([list, nameMap]) => {
        if (cancelled) return;
        setRequests(list);
        setNames(nameMap);
        setError("");
      })
      .catch((err) => !cancelled && setError(getErrorMessage(err, "Could not load TC / LC requests")))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [statusFilter, typeFilter, reloadKey]);

  const reload = () => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  const applyFilter = (setter) => (value) => {
    setLoading(true);
    setter(value);
  };

  const changed = (message) => {
    if (message) setNotice(message);
    reload();
  };

  const rows = useMemo(
    () => requests.map((r) => readRequest(r, names)).sort((a, b) => String(b.date || "").localeCompare(String(a.date || ""))),
    [requests, names]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? rows.filter((r) => [r.name, r.code, r.certificateNo].some((v) => String(v).toLowerCase().includes(q))) : rows;
  }, [rows, query]);

  // PUT /tc-lc/:id/approve
  const approve = async (r) => {
    if (!window.confirm(`Approve the ${r.type} request of ${r.name}? The certificate will be issued.`)) return;
    setBusyId(r.id);
    setError("");
    try {
      const res = await approveTcLc(r.id);
      changed(res.message || `${r.type} request approved`);
    } catch (err) {
      setError(getErrorMessage(err, "Could not approve the request"));
    } finally {
      setBusyId(null);
    }
  };

  // GET /tc-lc/:id/pdf
  const downloadPdf = async (r) => {
    setBusyId(r.id);
    setError("");
    try {
      await downloadTcLcPdf(r.id, pdfName(r));
    } catch (err) {
      setError(getErrorMessage(err, "Could not download the certificate"));
    } finally {
      setBusyId(null);
    }
  };

  const iconBtn = "p-2 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50";

  return (
    <div>
      <PageHeader title="TC / LC Requests" subtitle="Transfer and leaving certificates: check eligibility, approve and download" />

      <Toolbar value={query} onChange={setQuery} placeholder="Search by student name or ID">
        <select value={typeFilter} onChange={(e) => applyFilter(setTypeFilter)(e.target.value)} className={`${selectClass} md:w-36`}>
          <option value="">TC and LC</option>
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.value}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => applyFilter(setStatusFilter)(e.target.value)} className={`${selectClass} md:w-36`}>
          <option value="">All status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{titleCase(s)}</option>
          ))}
        </select>
        <button onClick={reload} className={btnOutline} aria-label="Refresh">
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
        <AddButton onClick={() => setShowCreate(true)}>New request</AddButton>
      </Toolbar>

      {notice && <Notice onClose={() => setNotice("")}>{notice}</Notice>}
      {error && <Notice tone="error">{error}</Notice>}

      <TableCard>
        <table className="w-full text-sm text-left">
          <thead className="bg-[#0B1437] text-white">
            <tr>
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium">Certificate</th>
              <th className="px-4 py-3 font-medium">Reason</th>
              <th className="px-4 py-3 font-medium">Requested</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">Loading requests...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  {rows.length === 0 ? "No TC / LC requests yet." : "No requests match your search."}
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={r.name} />
                      <div>
                        <p className="font-medium text-slate-900">{r.name}</p>
                        <p className="text-xs text-slate-500 font-mono">{r.code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">{r.type || "-"}</span>
                    {r.certificateNo && <p className="text-xs text-slate-500 font-mono mt-1">{r.certificateNo}</p>}
                  </td>
                  <td className="px-4 py-3 text-slate-600 max-w-xs truncate" title={r.reason}>{r.reason || "-"}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{r.date ? fmtDateTime(r.date) : "-"}</td>
                  <td className="px-4 py-3">
                    <StatusPill tone={TONES[r.status]}>{titleCase(r.status)}</StatusPill>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                      <button onClick={() => setViewId(r.id)} title="View request" className={`${iconBtn} hover:text-slate-800`}>
                        <Eye size={16} />
                      </button>
                      {r.open && (
                        <>
                          <button onClick={() => approve(r)} disabled={busyId === r.id} title="Approve" className={`${iconBtn} hover:bg-sky-50 hover:text-sky-700`}>
                            <CheckCircle2 size={16} />
                          </button>
                          <button onClick={() => setRejecting(r)} title="Reject" className={`${iconBtn} hover:bg-red-50 hover:text-red-600`}>
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                      {r.canDownload && (
                        <button onClick={() => downloadPdf(r)} disabled={busyId === r.id} title="Download certificate (PDF)" className={`${iconBtn} hover:text-slate-800`}>
                          <Download size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </TableCard>

      {showCreate && (
        <CreateTcLc
          onClose={() => setShowCreate(false)}
          onSaved={(msg) => {
            setShowCreate(false);
            changed(msg);
          }}
        />
      )}
      {rejecting && (
        <RejectTcLc
          request={rejecting}
          onClose={() => setRejecting(null)}
          onRejected={(msg) => {
            setRejecting(null);
            changed(msg);
          }}
        />
      )}
      {viewId && (
        <TcLcDetails
          id={viewId}
          names={names}
          onClose={() => setViewId(null)}
          onChanged={changed}
          onReject={(r) => {
            setViewId(null);
            setRejecting(r);
          }}
        />
      )}
    </div>
  );
};

export default ManageTcLc;

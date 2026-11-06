import React, { useEffect, useState } from "react";
import { RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { getAuditLogs } from "./auditService";
import { getErrorMessage } from "../../services/api";

const LIMIT = 20;
const inputClass =
  "px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/40 focus:border-[#0EA5E9]";

const getId = (l) => l.id || l._id;
const getUser = (l) => {
  const u = l.user || l.user_id;
  if (u && typeof u === "object") return u.name || u.email || u.id || u._id;
  return l.user_name || l.userName || u || "System";
};
const getTime = (l) => l.created_at || l.createdAt || l.timestamp;
const formatDate = (v) => {
  if (!v) return "-";
  const d = new Date(v);
  return Number.isNaN(d.getTime())
    ? v
    : d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });
};

const actionStyle = (a) => {
  const x = String(a || "").toLowerCase();
  if (["create", "login", "publish"].includes(x)) return "bg-emerald-100 text-emerald-700";
  if (["update", "override"].includes(x)) return "bg-blue-100 text-blue-700";
  if (["cancel", "delete"].includes(x)) return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-700";
};

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ entity: "", action: "", from: "", to: "" });
  const [applied, setApplied] = useState(filters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [openId, setOpenId] = useState(null);

  // GET /audit-logs
  useEffect(() => {
    let cancelled = false;
    getAuditLogs({ page, limit: LIMIT, ...applied })
      .then(({ list, meta }) => {
        if (cancelled) return;
        setLogs(list);
        setTotal(meta?.total ?? null);
        setError("");
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, "Could not load audit logs"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, applied, reloadKey]);

  const reload = () => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  const applyFilters = (e) => {
    e.preventDefault();
    setLoading(true);
    setPage(1);
    setApplied(filters);
  };

  const clearFilters = () => {
    const empty = { entity: "", action: "", from: "", to: "" };
    setFilters(empty);
    setLoading(true);
    setPage(1);
    setApplied(empty);
  };

  const goPage = (p) => {
    setLoading(true);
    setPage(p);
  };

  const totalPages = total ? Math.max(1, Math.ceil(total / LIMIT)) : null;
  const hasNext = totalPages ? page < totalPages : logs.length === LIMIT;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-sm text-gray-500 mt-1">Record of important changes made in the system</p>
        </div>
        <button
          onClick={reload}
          className="p-2.5 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
          aria-label="Refresh"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Filters */}
      <form onSubmit={applyFilters} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Entity</label>
          <input
            value={filters.entity}
            onChange={(e) => setFilters({ ...filters, entity: e.target.value })}
            placeholder="e.g. payments"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Action</label>
          <select value={filters.action} onChange={(e) => setFilters({ ...filters, action: e.target.value })} className={inputClass}>
            <option value="">All</option>
            {["create", "update", "cancel", "override", "publish", "login"].map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">From</label>
          <input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">To</label>
          <input type="date" value={filters.to} min={filters.from || undefined} onChange={(e) => setFilters({ ...filters, to: e.target.value })} className={inputClass} />
        </div>
        <button type="submit" className="px-4 py-2 rounded-lg bg-[#0EA5E9] text-white text-sm font-medium hover:bg-[#0284C7]">
          Apply
        </button>
        <button type="button" onClick={clearFilters} className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50">
          Clear
        </button>
      </form>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#0B1437] text-white">
            <tr>
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Entity</th>
              <th className="px-4 py-3 font-medium">IP address</th>
              <th className="px-4 py-3 font-medium text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-500">Loading audit logs...</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-500">No audit entries found</td>
              </tr>
            ) : (
              logs.map((l, i) => {
                const id = getId(l) || i;
                const oldV = l.old_values ?? l.oldValues;
                const newV = l.new_values ?? l.newValues;
                const hasDetails = oldV || newV;
                return (
                  <React.Fragment key={id}>
                    <tr className="hover:bg-gray-50 align-top">
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(getTime(l))}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{getUser(l)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${actionStyle(l.action)}`}>
                          {l.action || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {l.entity || "-"}
                        {(l.entity_id || l.entityId) && (
                          <span className="block text-xs text-gray-400 font-mono">{l.entity_id || l.entityId}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{l.ip_address || l.ipAddress || "-"}</td>
                      <td className="px-4 py-3 text-right">
                        {hasDetails ? (
                          <button onClick={() => setOpenId(openId === id ? null : id)} className="text-sky-700 hover:underline">
                            {openId === id ? "Hide" : "View"}
                          </button>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                    </tr>
                    {openId === id && (
                      <tr className="bg-gray-50">
                        <td colSpan={6} className="px-4 py-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[["Old values", oldV], ["New values", newV]].map(([label, val]) => (
                              <div key={label}>
                                <p className="text-xs font-semibold text-gray-500 mb-1">{label}</p>
                                <pre className="text-xs bg-white border border-gray-200 rounded-lg p-3 overflow-auto max-h-56">
                                  {val ? JSON.stringify(val, null, 2) : "-"}
                                </pre>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
        <span>
          Page {page}
          {totalPages ? ` of ${totalPages}` : ""}
          {total !== null ? ` · ${total} entries` : ""}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => goPage(page - 1)}
            disabled={page <= 1 || loading}
            className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => goPage(page + 1)}
            disabled={!hasNext || loading}
            className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;

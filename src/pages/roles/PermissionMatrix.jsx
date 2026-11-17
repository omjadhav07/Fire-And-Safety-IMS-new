import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

const getId = (o) => o?._id || o?.id || "";
const resourceLabel = (r) =>
  String(r)
    .split("_")
    .map((w) => (w.length <= 2 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)))
    .join(" ");

// Shared permission matrix (module -> resource -> action checkboxes). Same look as Roles & Permissions.
const PermissionMatrix = ({ matrix, selected, onToggle, onToggleRow, readOnly, cellClass }) => {
  const [collapsed, setCollapsed] = useState(new Set());
  const toggleCollapse = (name) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  const colSpan = matrix.actions.length + 1;

  return (
    <div className="rounded-lg overflow-hidden border border-slate-200">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#0B1437] text-white">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold">Pages / Modules</th>
              {matrix.actions.map((a) => (
                <th key={a} className="px-4 py-3 text-center text-xs font-semibold uppercase w-28">{a.replace(/_/g, " ")}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.modules.map((mod) => (
              <React.Fragment key={mod.name}>
                <tr className="bg-sky-50 cursor-pointer" onClick={() => toggleCollapse(mod.name)}>
                  <td colSpan={colSpan} className="px-4 py-2 text-xs font-semibold text-sky-600">
                    <span className="inline-flex items-center gap-2">
                      {collapsed.has(mod.name) ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                      {mod.name}
                    </span>
                  </td>
                </tr>
                {!collapsed.has(mod.name) &&
                  mod.rows.map((row) => {
                    const list = Object.values(row.perms);
                    const rowAll = list.every((p) => selected.has(getId(p)));
                    return (
                      <tr key={row.resource} className="border-t border-slate-100">
                        <td className="px-4 py-3 border-r border-slate-100">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-slate-800">{resourceLabel(row.resource)}</p>
                              <p className="text-[11px] uppercase tracking-wide text-slate-400">{row.resource}</p>
                            </div>
                            <input
                              type="checkbox"
                              style={{ accentColor: "#0EA5E9" }}
                              className="w-4 h-4"
                              checked={rowAll}
                              disabled={readOnly}
                              onChange={() => onToggleRow(list)}
                              aria-label={`Select all for ${resourceLabel(row.resource)}`}
                            />
                          </div>
                        </td>
                        {matrix.actions.map((a) => {
                          const p = row.perms[a];
                          return (
                            <td key={a} className={`px-4 py-3 text-center ${p && cellClass ? cellClass(p) : ""}`}>
                              {p ? (
                                <input
                                  type="checkbox"
                                  style={{ accentColor: "#0EA5E9" }}
                                  className="w-4 h-4"
                                  title={p.description || p.code}
                                  checked={selected.has(getId(p))}
                                  disabled={readOnly}
                                  onChange={() => onToggle(getId(p))}
                                />
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


export default PermissionMatrix;

import React from "react";
import { flattenRows, formatValue, isHidden, labelOf } from "../pages/fees/feeUtils";

// Label / value list for an object whose exact fields are not known in advance
export const KeyValueList = ({ data, exclude = [] }) => {
  const rows = flattenRows(Object.fromEntries(Object.entries(data || {}).filter(([k]) => !exclude.includes(k))));
  if (rows.length === 0) return <p className="text-sm text-gray-500">No details available.</p>;
  return (
    <dl className="divide-y divide-gray-100 text-sm border-t border-gray-100">
      {rows.map(([label, value], i) => (
        <div key={`${label}-${i}`} className="flex justify-between gap-4 py-2.5">
          <dt className="text-gray-500 shrink-0">{label}</dt>
          <dd className="font-medium text-gray-900 text-right break-words">{value}</dd>
        </div>
      ))}
    </dl>
  );
};

const PREFERRED = ["receipt_no", "receiptNo", "date", "paid_on", "payment_date", "createdAt", "amount", "mode", "reference_no", "status"];

// Table for an array of flat-ish objects; columns come from the data itself
export const ObjectTable = ({ rows, maxColumns = 7 }) => {
  if (!rows?.length) return null;
  const keys = [];
  rows.slice(0, 20).forEach((r) =>
    Object.entries(r).forEach(([k, v]) => {
      if (v && typeof v === "object") return;
      if (isHidden(k, v) || keys.includes(k)) return;
      keys.push(k);
    })
  );
  keys.sort((a, b) => {
    const ia = PREFERRED.indexOf(a);
    const ib = PREFERRED.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
  const cols = keys.slice(0, maxColumns);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-[#0B1437] text-white">
          <tr>
            {cols.map((k) => (
              <th key={k} className="px-4 py-3 font-medium whitespace-nowrap">{labelOf(k)}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((r, i) => (
            <tr key={r._id || r.id || i} className="hover:bg-gray-50">
              {cols.map((k) => (
                <td key={k} className="px-4 py-3 text-gray-700 whitespace-nowrap">
                  {r[k] === undefined || r[k] === null || r[k] === "" ? "-" : formatValue(k, r[k])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

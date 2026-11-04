import React, { useEffect, useState } from "react";
import { getInsights } from "./classTestService";
import { getErrorMessage } from "../../services/api";
import { KeyValueList, ObjectTable } from "../../components/DataViews";
import { labelOf } from "../fees/feeUtils";

// GET /class-tests/:id/insights  - summary figures and any tables the API returns
const ClassTestInsights = ({ testId, refreshKey }) => {
  const [state, setState] = useState({ loading: true, data: null, error: "" });

  useEffect(() => {
    let cancelled = false;
    getInsights(testId)
      .then((data) => !cancelled && setState({ loading: false, data, error: "" }))
      .catch((err) => !cancelled && setState({ loading: false, data: null, error: getErrorMessage(err, "Could not load insights") }));
    return () => {
      cancelled = true;
    };
  }, [testId, refreshKey]);

  const { loading, data, error } = state;
  if (loading) return <p className="py-10 text-center text-gray-500">Loading insights...</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  const obj = data && typeof data === "object" && !Array.isArray(data) ? data : {};
  const tables = Object.entries(obj).filter(([, v]) => Array.isArray(v) && v.length > 0 && typeof v[0] === "object");
  const scalars = Object.fromEntries(Object.entries(obj).filter(([, v]) => !Array.isArray(v)));

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <KeyValueList data={scalars} />
      </div>
      {tables.map(([key, rows]) => (
        <div key={key} className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <h2 className="px-5 py-4 font-semibold text-gray-900">{labelOf(key)}</h2>
          <ObjectTable rows={rows} />
        </div>
      ))}
    </div>
  );
};

export default ClassTestInsights;

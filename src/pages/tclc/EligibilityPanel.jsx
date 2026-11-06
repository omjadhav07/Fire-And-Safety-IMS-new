import React from "react";
import { KeyValueList } from "../../components/DataViews";
import { flattenRows } from "../fees/feeUtils";
import { readEligibility } from "./tcLcUtils";

// Shows an eligibility result: blue / red banner, the reasons from the API and any extra details
const EligibilityPanel = ({ loading, result, error }) => {
  if (loading) return <p className="text-sm text-slate-500">Checking eligibility...</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!result) return null;

  const { eligible, message, reasons, extra } = readEligibility(result);
  const courseStatus = eligible === false && reasons.some((x) => /course status|status is/i.test(x));

  return (
    <div className="space-y-3">
      {eligible !== undefined && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            eligible ? "border-sky-200 bg-sky-50 text-sky-800" : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          <p className="font-semibold">{eligible ? "Eligible" : "Not eligible"}</p>
          {!eligible && reasons.length > 0 ? (
            <ul className="mt-1.5 list-disc pl-5 space-y-0.5">
              {reasons.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          ) : (
            message && <p className="mt-0.5">{message}</p>
          )}
          {courseStatus && (
            <p className="mt-2 text-xs text-red-700/80">
              This is about the course status, not fees. Open Students, use the Status action and set the student to Completed, then check again.
            </p>
          )}
        </div>
      )}
      {eligible === undefined && message && <p className="text-sm text-slate-700">{message}</p>}
      {flattenRows(extra).length > 0 && <KeyValueList data={extra} />}
    </div>
  );
};

export default EligibilityPanel;

import React from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

// Reads the eligibility response however it is shaped:
//   { isEligible: false, reasons: ["Course status is \"active\". Must be \"completed\" for TC/LC."] }
const FLAG_KEYS = ["isEligible", "eligible", "is_eligible"];
const REASON_KEYS = ["reasons", "blockers", "issues", "messages", "pending_items", "pendingItems", "failed_checks"];
const textOf = (item) => (typeof item === "string" ? item : item?.message || item?.reason || item?.name || item?.label || "");
const labelOf = (k) => k.replace(/_/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^\w/, (c) => c.toUpperCase());

const readEligibility = (payload) => {
  const p = payload && typeof payload === "object" ? payload : {};
  const flagKey = FLAG_KEYS.find((k) => typeof p[k] === "boolean");
  const eligible = flagKey ? p[flagKey] : undefined;

  const reasons = REASON_KEYS.flatMap((k) => (Array.isArray(p[k]) ? p[k].map(textOf) : [])).filter(Boolean);
  if (!reasons.length && eligible === false && typeof p.message === "string") reasons.push(p.message);

  // optional per-item checks: an array of { name, passed } or an object / loose fields of booleans
  const checks = [];
  if (Array.isArray(p.checks)) {
    p.checks.forEach((c) => {
      const ok = c.passed ?? c.ok ?? c.eligible ?? c.cleared ?? ["pass", "passed", "ok", "cleared"].includes(String(c.status).toLowerCase());
      checks.push({ label: c.name || c.label || c.check || "Check", ok: !!ok, note: c.message || c.reason || "" });
    });
  } else if (p.checks && typeof p.checks === "object") {
    Object.entries(p.checks).forEach(([k, v]) => typeof v === "boolean" && checks.push({ label: labelOf(k), ok: v, note: "" }));
  }
  Object.entries(p).forEach(([k, v]) => {
    if (typeof v === "boolean" && !FLAG_KEYS.includes(k) && k !== "success") checks.push({ label: labelOf(k), ok: v, note: "" });
  });
  return { eligible, reasons, checks };
};

// Shows Eligible / Not eligible AND why. data = the "data" part of the eligibility response.
const TcLcEligibility = ({ data, loading = false, error = "" }) => {
  if (loading) {
    return <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">Checking eligibility...</div>;
  }
  if (error) {
    return <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>;
  }
  if (!data) return null;

  const { eligible, reasons, checks } = readEligibility(data);
  const unknown = eligible === undefined;
  const tone = unknown
    ? "border-gray-200 bg-gray-50 text-gray-700"
    : eligible
      ? "border-green-200 bg-green-50 text-green-800"
      : "border-red-200 bg-red-50 text-red-800";
  const courseStatusBlocks = reasons.some((r) => /course status|status is/i.test(r));

  return (
    <div className={`rounded-lg border px-4 py-3 ${tone}`} role="status">
      <p className="flex items-center gap-2 font-semibold">
        {eligible ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
        {unknown ? "Eligibility could not be read" : eligible ? "Eligible" : "Not eligible"}
      </p>

      {eligible && reasons.length > 0 && <p className="mt-1 text-sm">{reasons.join(" ")}</p>}

      {!eligible && reasons.length > 0 && (
        <ul className="mt-2 list-disc pl-6 text-sm space-y-1">
          {reasons.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      )}

      {courseStatusBlocks && (
        <p className="mt-2 text-xs text-red-700/80">
          This is not about fees. Open Students, use the Status action for this student and set it to Completed, then check again.
        </p>
      )}

      {checks.length > 0 && (
        <ul className="mt-2 text-sm space-y-0.5">
          {checks.map((c, i) => (
            <li key={i} className={c.ok ? "text-green-700" : "text-red-700"}>
              {c.ok ? "✓" : "✗"} {c.label}
              {c.note ? <span className="text-gray-500"> · {c.note}</span> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TcLcEligibility;

import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { updateStudentStage, getStudentStageHistory } from "./studentService";
import { getErrorMessage } from "../../services/api";
import Modal from "../../components/Modal";
import { getId, titleCase, inputClass } from "../../services/helpers";
import { LIFECYCLE_STAGES, STAGE_STATUSES, stageStatusClass, stageLabel } from "./studentUtils";

const fmtDateTime = (v) => {
  const d = v ? new Date(v) : null;
  return d && !Number.isNaN(d.getTime())
    ? d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "-";
};

const StageModal = ({ student, onClose, onUpdated }) => {
  const id = getId(student);
  const [tab, setTab] = useState("update");
  const [current, setCurrent] = useState({
    stage: student.lifecycle_stage || "admission",
    status: student.stage_status || "pending",
  });
  const [form, setForm] = useState({ lifecycle_stage: current.stage, stage_status: current.status, remarks: "" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [historyKey, setHistoryKey] = useState(0);

  // GET /students/:id/stage-history
  useEffect(() => {
    let cancelled = false;
    getStudentStageHistory(id)
      .then((list) => {
        if (cancelled) return;
        setHistory([...list].sort((a, b) => new Date(b.changed_at || b.createdAt) - new Date(a.changed_at || a.createdAt)));
        setHistoryError("");
      })
      .catch((err) => !cancelled && setHistoryError(getErrorMessage(err, "Could not load stage history")))
      .finally(() => !cancelled && setHistoryLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id, historyKey]);

  // Make sure the current value is always selectable, even if it is not in our list
  const stageOptions = LIFECYCLE_STAGES.includes(current.stage) ? LIFECYCLE_STAGES : [current.stage, ...LIFECYCLE_STAGES];
  const statusOptions = STAGE_STATUSES.includes(current.status) ? STAGE_STATUSES : [current.status, ...STAGE_STATUSES];

  // PUT /students/:id/stage
  const handleSave = async (e) => {
    e.preventDefault();
    setSuccess("");
    const remarks = form.remarks.trim();
    if (form.lifecycle_stage === current.stage && form.stage_status === current.status && !remarks) {
      return setFormError("Change the stage or status, or add remarks");
    }
    setSaving(true);
    setFormError("");
    try {
      const res = await updateStudentStage(id, {
        lifecycle_stage: form.lifecycle_stage,
        stage_status: form.stage_status,
        ...(remarks ? { remarks } : {}),
      });
      const next = {
        stage: res.student?.lifecycle_stage || form.lifecycle_stage,
        status: res.student?.stage_status || form.stage_status,
      };
      setCurrent(next);
      setForm({ lifecycle_stage: next.stage, stage_status: next.status, remarks: "" });
      setSuccess(res.message || "Stage updated");
      setHistoryLoading(true);
      setHistoryKey((k) => k + 1);
      setTab("history");
      onUpdated(`${student.name}: stage set to ${stageLabel(next.stage)} (${titleCase(next.status)})`);
    } catch (err) {
      setFormError(getErrorMessage(err, "Could not update stage"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Lifecycle stage" onClose={onClose} maxWidth="max-w-lg">
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-900">
          {student.name}
          {student.rollNo ? <span className="text-gray-500 font-normal"> · {student.rollNo}</span> : null}
        </p>
        <div className="mt-2 flex items-center gap-2 text-sm">
          <span className="text-gray-500">Current:</span>
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">{stageLabel(current.stage)}</span>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${stageStatusClass(current.status)}`}>
            {titleCase(current.status)}
          </span>
        </div>
      </div>

      <div className="inline-flex p-1 rounded-lg bg-gray-100 mb-4">
        {[
          ["update", "Update stage"],
          ["history", "History"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === key ? "bg-white text-sky-700 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "update" && (
        <form onSubmit={handleSave} className="space-y-4" noValidate>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Stage</label>
              <select
                value={form.lifecycle_stage}
                onChange={(e) => setForm({ ...form, lifecycle_stage: e.target.value })}
                className={inputClass}
              >
                {stageOptions.map((s) => (
                  <option key={s} value={s}>{stageLabel(s)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Stage status</label>
              <select
                value={form.stage_status}
                onChange={(e) => setForm({ ...form, stage_status: e.target.value })}
                className={inputClass}
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{titleCase(s)}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Remarks</label>
            <textarea
              rows={3}
              value={form.remarks}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
              placeholder="Document verification started"
              className={inputClass}
            />
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
              Close
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-lg bg-[#0EA5E9] text-white font-medium hover:bg-[#0284C7] disabled:opacity-60"
            >
              {saving ? "Updating..." : "Update stage"}
            </button>
          </div>
        </form>
      )}

      {tab === "history" && (
        <div>
          {success && (
            <div className="mb-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-3 py-2">{success}</div>
          )}
          {historyError && <p className="text-sm text-red-600">{historyError}</p>}
          {historyLoading ? (
            <p className="text-sm text-gray-500 py-6 text-center">Loading history...</p>
          ) : history.length === 0 && !historyError ? (
            <p className="text-sm text-gray-500 py-6 text-center">No stage changes recorded yet.</p>
          ) : (
            <div className="max-h-80 overflow-y-auto pl-3 pr-1 py-1">
            <ol className="relative border-l-2 border-gray-100 ml-2 space-y-5">
              {history.map((h, i) => (
                <li key={getId(h) || i} className="ml-5 relative">
                  <span className="absolute -left-[27px] top-1.5 w-3 h-3 rounded-full bg-[#0EA5E9] ring-4 ring-white" />
                  <div className="flex flex-wrap items-center gap-1.5 text-sm">
                    <span className="text-gray-500">{stageLabel(h.from_stage)}</span>
                    <ArrowRight size={14} className="text-gray-400" />
                    <span className="font-semibold text-gray-900">{stageLabel(h.to_stage)}</span>
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${stageStatusClass(h.stage_status)}`}>
                      {titleCase(h.stage_status)}
                    </span>
                  </div>
                  {h.remarks && <p className="mt-1 text-sm text-gray-700">{h.remarks}</p>}
                  <p className="mt-1 text-xs text-gray-500">
                    {h.changed_by?.name ? `${h.changed_by.name} · ` : ""}
                    {fmtDateTime(h.changed_at || h.createdAt)}
                  </p>
                </li>
              ))}
            </ol>
          </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default StageModal;

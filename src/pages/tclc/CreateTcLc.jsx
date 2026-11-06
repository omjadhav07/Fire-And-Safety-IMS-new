import React, { useEffect, useState } from "react";
import { checkStudentEligibility, createTcLcRequest } from "./tcLcService";
import { getErrorMessage } from "../../services/api";
import Modal from "../../components/Modal";
import Field from "../../components/Field";
import StudentSearch from "../../components/StudentSearch";
import { inputClass } from "../../services/helpers";
import { TYPES, readEligibility } from "./tcLcUtils";
import EligibilityPanel from "./EligibilityPanel";

// New TC / LC request (opens as a popup). The student's eligibility is checked as soon as they are picked.
const CreateTcLc = ({ onSaved, onClose }) => {
  const [student, setStudent] = useState(null);
  const [type, setType] = useState("TC");
  const [reason, setReason] = useState("");
  const [elig, setElig] = useState({ loading: false, result: null, error: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // GET /tc-lc/students/:studentId/eligibility
  useEffect(() => {
    if (!student) return undefined;
    let cancelled = false;
    checkStudentEligibility(student.id)
      .then((result) => !cancelled && setElig({ loading: false, result, error: "" }))
      .catch((err) => !cancelled && setElig({ loading: false, result: null, error: getErrorMessage(err, "Could not check eligibility") }));
    return () => {
      cancelled = true;
    };
  }, [student]);

  const chooseStudent = (s) => {
    setStudent(s);
    setError("");
    setElig({ loading: !!s, result: null, error: "" });
  };

  const notEligible = readEligibility(elig.result).eligible === false;

  // POST /tc-lc
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!student) return setError("Select a student");
    if (notEligible) return setError("This student is not eligible for a TC / LC");
    if (reason.trim().length < 3) return setError("Enter the reason for the request");
    setSaving(true);
    setError("");
    try {
      const res = await createTcLcRequest({ studentId: student.id, type, reason: reason.trim() });
      onSaved(res.message || `${type} request created for ${student.name}`);
    } catch (err) {
      setError(getErrorMessage(err, "Could not create the request"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="New TC / LC request" onClose={onClose} maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">{error}</div>}

        <Field label="Student">
          <StudentSearch value={student} onChange={chooseStudent} />
        </Field>

        {student && <EligibilityPanel loading={elig.loading} result={elig.result} error={elig.error} />}

        <Field label="Certificate">
          <div className="grid grid-cols-2 gap-2">
            {TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                  type === t.value ? "border-[#0EA5E9] bg-sky-50 text-sky-700" : "border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Reason">
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why is the student leaving / transferring?"
            className={inputClass}
          />
        </Field>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || elig.loading || notEligible}
            className="px-5 py-2.5 rounded-lg bg-[#0EA5E9] text-white font-medium hover:bg-[#0284C7] disabled:opacity-60"
          >
            {saving ? "Saving..." : "Create request"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTcLc;

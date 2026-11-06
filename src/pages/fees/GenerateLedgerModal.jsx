import React, { useEffect, useState } from "react";
import { CheckCircle2, Download, Printer } from "lucide-react";
import { generateLedger, feeStudentId } from "./feeService";
import { getCourses } from "../courses/courseService";
import { getErrorMessage } from "../../services/api";
import Modal from "../../components/Modal";
import StudentSearch from "../../components/StudentSearch";
import { getId, inputClass } from "../../services/helpers";
import { buildFeeDetail, downloadFeeDetailCsv, printFeeDetail, inr, ledgerLine, ledgerTotals } from "./feeUtils";

// POST /fees/generate  { studentId, courseId }
const GenerateLedgerModal = ({ onClose, onGenerated }) => {
  const [student, setStudent] = useState(null);
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(null); // { message, detail } once the ledger is generated

  useEffect(() => {
    let cancelled = false;
    getCourses()
      .then((c) => !cancelled && setCourses(c))
      .catch((err) => !cancelled && setError(getErrorMessage(err, "Could not load courses")));
    return () => {
      cancelled = true;
    };
  }, []);

  // Pre-select the student's own course
  const pickStudent = (s) => {
    setStudent(s);
    const c = s?.course_id;
    const id = c && typeof c === "object" ? c._id || c.id : c;
    if (id) setCourseId(id);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!student) return setError("Select a student");
    if (!courseId) return setError("Select a course");
    setSaving(true);
    setError("");
    try {
      const res = await generateLedger({ studentId: feeStudentId(student), courseId });
      const message = res.message || `Fee ledger generated for ${student.name}`;

      // The API returns the ledger lines it created: use them for the breakdown and totals
      const ledger = Array.isArray(res.data) ? res.data : [];
      const lines = ledger.map(ledgerLine);
      const totals = ledgerTotals(ledger);
      const courseName = courses.find((c) => getId(c) === courseId)?.name || "";
      const detail = buildFeeDetail({
        student,
        course: courseName,
        components: lines.map((l) => ({ name: l.name, amount: l.due, required_for_exam: l.exam })),
        total: lines.length ? totals.due : undefined,
        paid: lines.length ? totals.paid : undefined,
        pending: lines.length ? totals.balance : undefined,
      });

      onGenerated(message); // refreshes the Fees page behind
      setDone({ message, detail });
    } catch (err) {
      setError(getErrorMessage(err, "Could not generate ledger"));
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    const { detail } = done;
    return (
      <Modal title="Fee ledger generated" onClose={onClose} maxWidth="max-w-lg">
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <CheckCircle2 size={36} className="mx-auto text-[#0EA5E9]" />
            <p className="text-sm text-gray-700">{done.message}</p>
          </div>

          <dl className="divide-y divide-gray-100 text-sm border-t border-b border-gray-100">
            {detail.info.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-2">
                <dt className="text-gray-500">{k}</dt>
                <dd className="text-gray-900 font-medium text-right">{v}</dd>
              </div>
            ))}
          </dl>

          {detail.components.length > 0 && (
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                {detail.components.map(([n, a]) => (
                  <tr key={n}>
                    <td className="py-1.5 text-gray-600">{n}</td>
                    <td className="py-1.5 text-right text-gray-900">{inr(a)}</td>
                  </tr>
                ))}
                {detail.summary.map(([k, v]) => (
                  <tr key={k}>
                    <td className="py-2 font-semibold text-gray-900">{k}</td>
                    <td className="py-2 text-right font-semibold text-gray-900">{inr(v)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="flex flex-wrap justify-end gap-3 pt-1">
            <button
              onClick={() => printFeeDetail(detail)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Printer size={16} /> Print / Save PDF
            </button>
            <button
              onClick={() => downloadFeeDetailCsv(detail)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Download size={16} /> Download Excel
            </button>
            <button onClick={onClose} className="px-5 py-2.5 rounded-lg bg-[#0EA5E9] text-white font-medium hover:bg-[#0284C7]">
              Done
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="Generate fee ledger" onClose={onClose}>
      <form onSubmit={handleSave} className="space-y-4" noValidate>
        <p className="text-sm text-gray-500">Creates the fee ledger for a student from the course fee components.</p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Student</label>
          <StudentSearch value={student} onChange={pickStudent} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Course</label>
          <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className={inputClass}>
            <option value="">Select course</option>
            {courses.map((c) => (
              <option key={getId(c)} value={getId(c)}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-lg bg-[#0EA5E9] text-white font-medium hover:bg-[#0284C7] disabled:opacity-60"
          >
            {saving ? "Generating..." : "Generate ledger"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default GenerateLedgerModal;
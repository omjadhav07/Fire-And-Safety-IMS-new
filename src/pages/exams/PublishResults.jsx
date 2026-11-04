import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { publishResults } from "./examService";
import { getErrorMessage } from "../../services/api";
import Modal from "../../components/Modal";
import StudentSearch from "../../components/StudentSearch";
import { inputClass } from "../../services/helpers";

// Enter / confirm the marks and publish the results (PUT /exams/:examId/publish)
const PublishResults = ({ examId, rows, maxMarks, onClose, onPublished }) => {
  const [entries, setEntries] = useState(rows.map((r) => ({ id: r.id, name: r.name, code: r.code, marks: r.marks ?? "", remarks: r.remarks || "" })));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const patch = (id, change) => setEntries((list) => list.map((e) => (e.id === id ? { ...e, ...change } : e)));

  const addStudent = (s) => {
    if (!s) return;
    setEntries((list) => (list.some((e) => e.id === s.id) ? list : [...list, { id: s.id, name: s.name, code: s.rollNo, marks: "", remarks: "" }]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const filled = entries.filter((x) => x.marks !== "");
    if (filled.length === 0) return setError("Enter the marks of at least one student");
    for (const x of filled) {
      const n = Number(x.marks);
      if (!Number.isFinite(n) || n < 0) return setError(`${x.name}: marks cannot be negative`);
      if (Number.isFinite(maxMarks) && n > maxMarks) return setError(`${x.name}: marks cannot be more than ${maxMarks}`);
    }
    setSaving(true);
    setError("");
    try {
      const res = await publishResults(
        examId,
        filled.map((x) => ({
          student_id: x.id,
          marks_obtained: Number(x.marks),
          ...(x.remarks.trim() ? { remarks: x.remarks.trim() } : {}),
        }))
      );
      onPublished(res.message || "Results published");
    } catch (err) {
      setError(getErrorMessage(err, "Could not publish results"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Publish results" onClose={onClose} maxWidth="max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <p className="text-sm text-gray-500">
          Check the marks below. Publishing makes the results visible to the students
          {Number.isFinite(maxMarks) ? ` (maximum ${maxMarks} marks)` : ""}.
        </p>
        {error && <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">{error}</div>}

        <div className="max-h-80 overflow-y-auto rounded-xl border border-gray-100">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 sticky top-0">
              <tr>
                <th className="px-4 py-2.5 font-medium">Student</th>
                <th className="px-4 py-2.5 font-medium w-32">Marks</th>
                <th className="px-4 py-2.5 font-medium">Remarks</th>
                <th className="px-2 py-2.5 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">No students yet. Add students below.</td>
                </tr>
              ) : (
                entries.map((x) => (
                  <tr key={x.id}>
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-gray-900">{x.name}</p>
                      <p className="text-xs text-gray-500 font-mono">{x.code}</p>
                    </td>
                    <td className="px-4 py-2.5">
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={x.marks}
                        onChange={(e) => patch(x.id, { marks: e.target.value })}
                        className={`${inputClass} py-2`}
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <input
                        value={x.remarks}
                        onChange={(e) => patch(x.id, { remarks: e.target.value })}
                        placeholder="Optional"
                        className={`${inputClass} py-2`}
                      />
                    </td>
                    <td className="px-2 py-2.5">
                      <button
                        type="button"
                        onClick={() => setEntries((list) => list.filter((y) => y.id !== x.id))}
                        title="Remove from this list"
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Add a student</label>
          <StudentSearch value={null} onChange={addStudent} autoClear placeholder="Search a student to add" />
        </div>

        <div className="flex justify-end gap-3 pt-1">
          <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-lg bg-[#16A34A] text-white font-medium hover:bg-[#15803D] disabled:opacity-60"
          >
            {saving ? "Publishing..." : "Publish results"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PublishResults;

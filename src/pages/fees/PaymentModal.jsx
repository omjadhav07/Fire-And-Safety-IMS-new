import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { createPayment, feeStudentId } from "./feeService";
import { getErrorMessage } from "../../services/api";
import Modal from "../../components/Modal";
import StudentSearch from "../../components/StudentSearch";
import { inputClass, getId, titleCase } from "../../services/helpers";
import { PAYMENT_MODES, inr } from "./feeUtils";

// POST /fees/payments
const PaymentModal = ({ initialStudent = null, onClose, onCreated, onViewReceipt }) => {
  const [student, setStudent] = useState(initialStudent);
  const [form, setForm] = useState({ amount: "", mode: "cash", reference_no: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!student) return setError("Select a student");
    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) return setError("Enter an amount greater than 0");
    const studentId = feeStudentId(student);
    if (!studentId) return setError("This student has no linked login account");

    setSaving(true);
    setError("");
    try {
      const body = { studentId, amount, mode: form.mode };
      if (form.reference_no.trim()) body.reference_no = form.reference_no.trim();
      const res = await createPayment(body);
      const entry = {
        id: getId(res.payment) || getId(res.payment?.payment) || "",
        student,
        amount,
        mode: form.mode,
        reference_no: form.reference_no.trim(),
        at: new Date().toISOString(),
        status: "paid",
      };
      setDone({ entry, message: res.message });
      onCreated(entry);
    } catch (err) {
      setError(getErrorMessage(err, "Could not record payment"));
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <Modal title="Payment recorded" onClose={onClose}>
        <div className="text-center space-y-3 py-2">
          <CheckCircle2 size={40} className="mx-auto text-[#16A34A]" />
          <p className="text-sm text-gray-700">
            {done.message || "Payment recorded"} · <span className="font-semibold">{inr(done.entry.amount)}</span> from{" "}
            <span className="font-semibold">{done.entry.student.name}</span>
          </p>
          <div className="flex justify-center gap-3 pt-2">
            {done.entry.id && (
              <button
                onClick={() => {
                  onClose();
                  onViewReceipt(done.entry.id);
                }}
                className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                View receipt
              </button>
            )}
            <button onClick={onClose} className="px-5 py-2.5 rounded-lg bg-[#16A34A] text-white font-medium hover:bg-[#15803D]">
              Done
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="Record payment" onClose={onClose}>
      <form onSubmit={handleSave} className="space-y-4" noValidate>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Student</label>
          <StudentSearch value={student} onChange={setStudent} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount (₹)</label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="5000"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment mode</label>
            <select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })} className={inputClass}>
              {PAYMENT_MODES.map((m) => (
                <option key={m} value={m}>{titleCase(m)}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Reference no. (optional)</label>
          <input
            value={form.reference_no}
            onChange={(e) => setForm({ ...form, reference_no: e.target.value })}
            placeholder="UPI / cheque / transaction number"
            className={inputClass}
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-lg bg-[#16A34A] text-white font-medium hover:bg-[#15803D] disabled:opacity-60"
          >
            {saving ? "Saving..." : "Record payment"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PaymentModal;

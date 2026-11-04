import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Award } from "lucide-react";
import { inputClass } from "../../services/helpers";

// Entry page: there is no exam list API yet, so the exam is opened by its ID
const OpenExam = () => {
  const navigate = useNavigate();
  const [examId, setExamId] = useState("");
  const [error, setError] = useState("");

  const open = (e) => {
    e.preventDefault();
    const id = examId.trim();
    if (!id) return setError("Enter the exam ID");
    navigate(`/exams/${encodeURIComponent(id)}/results`);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Exam Results</h1>
      <p className="text-sm text-gray-500 mt-1 mb-6">View, publish or withdraw the results of an exam</p>

      <form onSubmit={open} className="max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4" noValidate>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-50 text-green-700 flex items-center justify-center">
            <Award size={20} />
          </div>
          <p className="font-semibold text-gray-900">Open an exam</p>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Exam ID</label>
          <input
            value={examId}
            onChange={(e) => {
              setExamId(e.target.value);
              setError("");
            }}
            placeholder="Paste the exam ID"
            className={inputClass}
          />
        </div>
        <button type="submit" className="w-full px-5 py-2.5 rounded-lg bg-[#16A34A] text-white font-medium hover:bg-[#15803D]">
          Open results
        </button>
      </form>
    </div>
  );
};

export default OpenExam;

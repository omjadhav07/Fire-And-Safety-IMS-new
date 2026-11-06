import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, RefreshCw, Send, EyeOff } from "lucide-react";
import { getExamResults, unpublishResults } from "./examService";
import { getStudentNameMap } from "../students/studentService";
import { getErrorMessage } from "../../services/api";
import { titleCase } from "../../services/helpers";
import { pick, relId } from "../schedules/scheduleUtils";
import PublishResults from "./PublishResults";

const RESULT_STYLES = { pass: "bg-emerald-100 text-emerald-700", passed: "bg-emerald-100 text-emerald-700", fail: "bg-red-100 text-red-700", failed: "bg-red-100 text-red-700" };

// GET /exams/:examId/results  ·  publish / unpublish
const ExamResults = () => {
  const { examId } = useParams();
  const [data, setData] = useState({ rows: [], published: undefined, exam: null });
  const [names, setNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [showPublish, setShowPublish] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getExamResults(examId), getStudentNameMap().catch(() => ({}))])
      .then(([res, nameMap]) => {
        if (cancelled) return;
        setData(res);
        setNames(nameMap);
        setError("");
      })
      .catch((err) => !cancelled && setError(getErrorMessage(err, "Could not load the exam results")))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [examId, reloadKey]);

  const reload = () => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  const rows = useMemo(
    () =>
      data.rows.map((r, i) => {
        const ref = pick(r, "student_id", "student");
        const id = relId(ref);
        const obj = ref && typeof ref === "object" ? ref : {};
        return {
          key: id || r._id || i,
          id,
          name: obj.full_name || obj.name || r.full_name || r.student_name || names[id] || "Unknown student",
          code: obj.student_id || r.roll_no || "",
          marks: r.marks_obtained ?? r.marks ?? "",
          remarks: r.remarks || "",
          result: String(r.result || r.grade_status || "").toLowerCase(),
        };
      }),
    [data.rows, names]
  );

  const maxMarks = Number(data.exam?.max_marks ?? data.exam?.total_marks ?? data.rows[0]?.max_marks);
  const examTitle = data.exam?.title || data.exam?.name;

  // PUT /exams/:examId/unpublish
  const unpublish = async () => {
    if (!window.confirm("Unpublish these results? Students will no longer see them.")) return;
    setBusy(true);
    setError("");
    try {
      const res = await unpublishResults(examId);
      setNotice(res.message || "Results unpublished");
      reload();
    } catch (err) {
      setError(getErrorMessage(err, "Could not unpublish results"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <Link to="/exam-results" className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-sky-700 mb-3">
        <ArrowLeft size={16} /> Open another exam
      </Link>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{examTitle ? `${examTitle} · Results` : "Exam results"}</h1>
            {data.published !== undefined && (
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  data.published ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                }`}
              >
                {data.published ? "Published" : "Not published"}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Exam <span className="font-mono text-xs">{examId}</span> · {rows.length} students
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={reload} className="p-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50" aria-label="Refresh">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          {data.published !== false && (
            <button
              onClick={unpublish}
              disabled={busy}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              <EyeOff size={16} /> Unpublish
            </button>
          )}
          <button
            onClick={() => setShowPublish(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0EA5E9] text-white font-medium hover:bg-[#0284C7]"
          >
            <Send size={16} /> {data.published ? "Update & publish" : "Publish results"}
          </button>
        </div>
      </div>

      {notice && (
        <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 flex justify-between">
          <span>{notice}</span>
          <button onClick={() => setNotice("")} aria-label="Dismiss">×</button>
        </div>
      )}
      {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#0B1437] text-white">
            <tr>
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium">Marks</th>
              <th className="px-4 py-3 font-medium">Result</th>
              <th className="px-4 py-3 font-medium">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-gray-500">Loading results...</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
                  No results yet. Use Publish results to enter the marks.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.key} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{r.name}</p>
                    <p className="text-xs text-gray-500 font-mono">{r.code}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-900 whitespace-nowrap">
                    {r.marks === "" ? "-" : r.marks}
                    {Number.isFinite(maxMarks) && r.marks !== "" ? <span className="text-xs text-gray-400"> / {maxMarks}</span> : null}
                  </td>
                  <td className="px-4 py-3">
                    {r.result && (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${RESULT_STYLES[r.result] || "bg-gray-100 text-gray-600"}`}>
                        {titleCase(r.result)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.remarks || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showPublish && (
        <PublishResults
          examId={examId}
          rows={rows}
          maxMarks={maxMarks}
          onClose={() => setShowPublish(false)}
          onPublished={(msg) => {
            setShowPublish(false);
            setNotice(msg);
            reload();
          }}
        />
      )}
    </div>
  );
};

export default ExamResults;

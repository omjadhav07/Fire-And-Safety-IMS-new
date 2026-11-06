import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, RefreshCw, Save, History, Trash2, Upload } from "lucide-react";
import {
  getClassTestById,
  saveMarksBulk,
  updateMark,
  deleteMark,
  downloadMarksTemplate,
  exportMarks,
  importMarks,
} from "./classTestService";
import { getStudents } from "../students/studentService";
import { getCourses, getBatches } from "../courses/courseService";
import { getErrorMessage } from "../../services/api";
import { ExportMenu, ImportModal } from "../../components/ImportExport";
import { getId, fmtDate, titleCase, inputClass } from "../../services/helpers";
import { pick, relId, relName } from "../schedules/scheduleUtils";
import { testStatusClass, resultOf } from "./classTestUtils";
import MarkHistory from "./MarkHistory";
import ClassTestInsights from "./ClassTestInsights";

const TABS = [
  ["marks", "Marks"],
  ["insights", "Insights"],
];

// Marks the API already holds for this test (if it sends them with the test)
const existingMarks = (test) => {
  const list = Object.values(test || {}).find(
    (v) => Array.isArray(v) && v.length && typeof v[0] === "object" && "marks_obtained" in v[0]
  );
  return Object.fromEntries(
    (list || []).map((m) => [
      relId(pick(m, "student_id", "student")),
      { marks: m.marks_obtained ?? "", remarks: m.remarks || "", saved: true, dirty: false },
    ])
  );
};

const blank = { marks: "", remarks: "", saved: false, dirty: false };

// One class test: enter / correct marks, import & export, history, insights
const ClassTestMarks = () => {
  const { testId } = useParams();
  const [test, setTest] = useState(null);
  const [students, setStudents] = useState([]);
  const [entries, setEntries] = useState({});
  const [courseNames, setCourseNames] = useState({});
  const [batchNames, setBatchNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [insightsKey, setInsightsKey] = useState(0);

  const [tab, setTab] = useState("marks");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [historyFor, setHistoryFor] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [includeRemarks, setIncludeRemarks] = useState(true);

  // test -> students of its batch (+ course / batch names)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const t = await getClassTestById(testId);
      const batchId = relId(pick(t, "batch_id", "batch"));
      const courseId = relId(pick(t, "course_id", "course"));
      const [res, courses, batches] = await Promise.all([
        getStudents({ batch_id: batchId, limit: 100 }),
        getCourses().catch(() => []),
        courseId ? getBatches(courseId).catch(() => []) : [],
      ]);
      // if the API refused the batch filter, apply it here
      const inBatch = res.clientFilters.includes("batch_id")
        ? res.list.filter((s) => relId(pick(s, "batch_id", "batch")) === batchId)
        : res.list;
      if (cancelled) return;
      setTest(t);
      setStudents(inBatch);
      setEntries(existingMarks(t));
      setCourseNames(Object.fromEntries(courses.map((c) => [getId(c), c.name])));
      setBatchNames(Object.fromEntries(batches.map((b) => [getId(b), b.name])));
      setError("");
    })()
      .catch((err) => !cancelled && setError(getErrorMessage(err, "Could not load this class test")))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [testId, reloadKey]);

  const reload = () => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  const maxMarks = Number(test?.max_marks);
  const passMarks = Number(test?.passing_marks);
  const entryOf = (id) => entries[id] || blank;

  const change = (id, patch) =>
    setEntries((prev) => ({ ...prev, [id]: { ...(prev[id] || blank), ...patch, dirty: true } }));

  const rowProblem = (id) => {
    const e = entryOf(id);
    if (e.marks === "") return "";
    const n = Number(e.marks);
    if (!Number.isFinite(n) || n < 0) return "Marks cannot be negative";
    if (n > maxMarks) return `Marks cannot be more than ${maxMarks}`;
    return "";
  };

  const summary = useMemo(() => {
    let entered = 0;
    let passed = 0;
    students.forEach((s) => {
      const e = entries[s.id];
      if (e && e.marks !== "") {
        entered += 1;
        if (resultOf(e.marks, passMarks) === "pass") passed += 1;
      }
    });
    return { entered, passed, failed: entered - passed };
  }, [students, entries, passMarks]);

  const markSaved = (ids) =>
    setEntries((prev) => {
      const next = { ...prev };
      ids.forEach((id) => {
        next[id] = { ...(next[id] || blank), saved: true, dirty: false };
      });
      return next;
    });

  // New marks -> POST .../marks/bulk ; already-saved marks -> PUT .../marks/:studentId
  const saveRows = async (ids) => {
    const rows = ids.filter((id) => entryOf(id).dirty && entryOf(id).marks !== "");
    if (rows.length === 0) return setError("Enter some marks first");
    const bad = rows.find((id) => rowProblem(id));
    if (bad) return setError(`${students.find((s) => s.id === bad)?.name}: ${rowProblem(bad)}`);

    const payload = (id) => ({ marks_obtained: Number(entryOf(id).marks), remarks: entryOf(id).remarks.trim() });
    const fresh = rows.filter((id) => !entryOf(id).saved);
    const changed = rows.filter((id) => entryOf(id).saved);

    setError("");
    try {
      if (fresh.length) await saveMarksBulk(testId, fresh.map((id) => ({ student_id: id, ...payload(id) })));
      if (changed.length) await Promise.all(changed.map((id) => updateMark(testId, id, payload(id))));
      markSaved(rows);
      setInsightsKey((k) => k + 1);
      setNotice(`${rows.length} mark${rows.length === 1 ? "" : "s"} saved`);
    } catch (err) {
      setError(getErrorMessage(err, "Could not save marks"));
    }
  };

  const saveAll = async () => {
    setSaving(true);
    await saveRows(students.map((s) => s.id));
    setSaving(false);
  };

  const saveOne = async (id) => {
    setBusyId(id);
    await saveRows([id]);
    setBusyId(null);
  };

  // DELETE .../marks/:studentId
  const removeMark = async (s) => {
    if (!window.confirm(`Delete ${s.name}'s mark? It stays in the history.`)) return;
    setBusyId(s.id);
    setError("");
    try {
      await deleteMark(testId, s.id);
      setEntries((prev) => ({ ...prev, [s.id]: { ...blank } }));
      setInsightsKey((k) => k + 1);
      setNotice(`${s.name}'s mark deleted`);
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete mark"));
    } finally {
      setBusyId(null);
    }
  };

  const unsaved = students.filter((s) => entryOf(s.id).dirty && entryOf(s.id).marks !== "").length;
  const status = String(test?.status || "scheduled").toLowerCase();

  return (
    <div>
      <Link to="/class-tests" className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-sky-700 mb-3">
        <ArrowLeft size={16} /> Back to class tests
      </Link>

      {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>}

      {loading && !test ? (
        <p className="py-10 text-center text-gray-500">Loading class test...</p>
      ) : (
        test && (
          <>
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">{test.title}</h1>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${testStatusClass(status)}`}>{titleCase(status)}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {test.subject} · {relName(pick(test, "course_id", "course"), courseNames) || "-"} ·{" "}
                  {relName(pick(test, "batch_id", "batch"), batchNames) || "-"} · {fmtDate(test.test_date)}
                </p>
                <p className="text-sm text-gray-500">
                  Maximum {test.max_marks} marks · pass at {test.passing_marks}
                  {test.duration_minutes ? ` · ${test.duration_minutes} min` : ""}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={reload}
                  className="p-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                  aria-label="Refresh"
                >
                  <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                </button>
                <ExportMenu
                  onError={setError}
                  exportFn={(format) => exportMarks(testId, { format, includeRemarks })}
                  formats={["xlsx", "csv"]}
                  label="marks"
                />
                <button
                  onClick={() => setShowImport(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Upload size={16} /> Import
                </button>
              </div>
            </div>

            {notice && (
              <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 flex justify-between">
                <span>{notice}</span>
                <button onClick={() => setNotice("")} aria-label="Dismiss">×</button>
              </div>
            )}

            <div className="inline-flex p-1 rounded-lg bg-gray-100 mb-4">
              {TABS.map(([key, label]) => (
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

            {tab === "marks" && (
              <>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
                  <p className="text-sm text-gray-600">
                    {summary.entered} of {students.length} marked ·{" "}
                    <span className="text-sky-700">{summary.passed} passed</span> ·{" "}
                    <span className="text-red-600">{summary.failed} failed</span>
                  </p>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeRemarks}
                        onChange={(e) => setIncludeRemarks(e.target.checked)}
                        className="w-4 h-4 accent-[#0EA5E9]"
                      />
                      Include remarks in export
                    </label>
                    <button
                      onClick={saveAll}
                      disabled={saving || unsaved === 0}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0EA5E9] text-white font-medium hover:bg-[#0284C7] disabled:opacity-50"
                    >
                      <Save size={16} /> {saving ? "Saving..." : `Save all${unsaved ? ` (${unsaved})` : ""}`}
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-[#0B1437] text-white">
                      <tr>
                        <th className="px-4 py-3 font-medium">Student</th>
                        <th className="px-4 py-3 font-medium w-36">Marks (/{test.max_marks})</th>
                        <th className="px-4 py-3 font-medium">Remarks</th>
                        <th className="px-4 py-3 font-medium">Result</th>
                        <th className="px-4 py-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-10 text-center text-gray-500">Loading students...</td>
                        </tr>
                      ) : students.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-10 text-center text-gray-500">No students found in this batch.</td>
                        </tr>
                      ) : (
                        students.map((s) => {
                          const e = entryOf(s.id);
                          const problem = rowProblem(s.id);
                          const result = resultOf(e.marks, passMarks);
                          return (
                            <tr key={s.id} className={e.dirty ? "bg-amber-50/40" : "hover:bg-gray-50"}>
                              <td className="px-4 py-3">
                                <p className="font-medium text-gray-900">{s.name}</p>
                                <p className="text-xs text-gray-500 font-mono">{s.rollNo}</p>
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="number"
                                  min="0"
                                  max={maxMarks}
                                  step="0.5"
                                  value={e.marks}
                                  onChange={(ev) => change(s.id, { marks: ev.target.value })}
                                  className={`${inputClass} py-2 ${problem ? "border-red-400" : ""}`}
                                />
                                {problem && <p className="text-xs text-red-600 mt-1">{problem}</p>}
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  value={e.remarks}
                                  onChange={(ev) => change(s.id, { remarks: ev.target.value })}
                                  placeholder="Optional"
                                  className={`${inputClass} py-2`}
                                />
                              </td>
                              <td className="px-4 py-3">
                                {result && (
                                  <span
                                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                      result === "pass" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                    }`}
                                  >
                                    {titleCase(result)}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                                  <button
                                    onClick={() => saveOne(s.id)}
                                    disabled={busyId === s.id || !e.dirty || e.marks === ""}
                                    title="Save this mark"
                                    className="p-2 rounded-lg text-gray-500 hover:bg-sky-50 hover:text-sky-700 disabled:opacity-30"
                                  >
                                    <Save size={16} />
                                  </button>
                                  <button
                                    onClick={() => setHistoryFor(s)}
                                    disabled={!e.saved}
                                    title="Mark history"
                                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 disabled:opacity-30"
                                  >
                                    <History size={16} />
                                  </button>
                                  <button
                                    onClick={() => removeMark(s)}
                                    disabled={busyId === s.id || !e.saved}
                                    title="Delete mark"
                                    className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {tab === "insights" && <ClassTestInsights testId={testId} refreshKey={insightsKey} />}
          </>
        )
      )}

      {historyFor && <MarkHistory testId={testId} student={historyFor} onClose={() => setHistoryFor(null)} />}

      {showImport && (
        <ImportModal
          title="Import marks"
          entity="marks"
          description="Download the template, fill in the marks and upload it here. Rows with an unknown student or marks above the maximum are skipped and listed in the report."
          importFn={(file, onProgress) => importMarks(testId, file, onProgress)}
          templateFn={() => downloadMarksTemplate(testId, "xlsx")}
          templateFormats={["xlsx"]}
          accept=".xlsx,.xls"
          fileTypesLabel=".xlsx or .xls"
          invalidMessage="Only Excel (.xlsx, .xls) files are allowed"
          onClose={() => setShowImport(false)}
          onImported={() => {
            setNotice("Marks import finished");
            setInsightsKey((k) => k + 1);
            reload();
          }}
        />
      )}
    </div>
  );
};

export default ClassTestMarks;
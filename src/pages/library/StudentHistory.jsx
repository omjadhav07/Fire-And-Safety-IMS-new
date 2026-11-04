import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getStudentHistory, getBooks } from "./libraryService";
import { getStudentNameMap } from "../students/studentService";
import { getErrorMessage } from "../../services/api";
import { getId, fmtDate, daysOverdue, badgeClass, titleCase, issueBookTitle, issueStudentName } from "../../services/helpers";

// GET /library/students/:studentId/history
const StudentHistory = () => {
  const { studentId } = useParams();
  const [history, setHistory] = useState([]);
  const [books, setBooks] = useState([]);
  const [names, setNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([getStudentHistory(studentId), getBooks(), getStudentNameMap().catch(() => ({}))])
      .then(([h, b, n]) => {
        if (cancelled) return;
        setHistory(h);
        setBooks(b);
        setNames(n);
        setError("");
      })
      .catch((err) => !cancelled && setError(getErrorMessage(err, "Could not load student history")))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [studentId]);

  const booksById = useMemo(() => Object.fromEntries(books.map((b) => [getId(b), b])), [books]);
  const studentName = history.map(issueStudentName).find(Boolean) || names[studentId];

  return (
    <div>
      <Link to="/library/issues" className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-green-700 mb-3">
        <ArrowLeft size={16} /> Back to book issues
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Student Library History</h1>
        <p className="text-sm text-gray-500 mt-1">
          {studentName || "Unknown student"} · {history.length} records
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 font-medium">Book</th>
              <th className="px-4 py-3 font-medium">Issued on</th>
              <th className="px-4 py-3 font-medium">Due date</th>
              <th className="px-4 py-3 font-medium">Returned on</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-500">Loading history...</td>
              </tr>
            ) : history.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-500">No library history for this student.</td>
              </tr>
            ) : (
              history.map((h, idx) => {
                const returned = h.returnedAt || h.returnDate;
                const status = h.status || (returned ? "returned" : daysOverdue(h.dueDate) > 0 ? "overdue" : "issued");
                return (
                  <tr key={getId(h) || idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{issueBookTitle(h, booksById)}</td>
                    <td className="px-4 py-3 text-gray-600">{fmtDate(h.issuedAt || h.issueDate || h.createdAt)}</td>
                    <td className="px-4 py-3 text-gray-600">{fmtDate(h.dueDate)}</td>
                    <td className="px-4 py-3 text-gray-600">{fmtDate(returned)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${badgeClass(status)}`}>
                        {titleCase(status)}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentHistory;

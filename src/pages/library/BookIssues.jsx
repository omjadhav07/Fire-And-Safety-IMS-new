git add -A
git commit -m "Update IMS modules and exam management"
git push -u origin mastergit add -A
git commit -m "Update IMS modules and exam management"
git push -u origin masterimport React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, RefreshCw } from "lucide-react";
import { getIssues, getOverdueBooks, getBooks, issueBook } from "./libraryService";
import { getStudentNameMap } from "../students/studentService";
import { getErrorMessage } from "../../services/api";
import Modal from "../../components/Modal";
import StudentSearch from "../../components/StudentSearch";
import {
  getId,
  fmtDate,
  daysOverdue,
  inputClass,
  badgeClass,
  titleCase,
  availableOf,
  issueBookTitle,
  issueStudentId,
  issueStudentName,
} from "../../services/helpers";

const TABS = [
  { key: "all", label: "All issues" },
  { key: "overdue", label: "Overdue" },
];

const initialForm = { bookId: "", student: null, dueDate: "" };

const Issues = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("all");
  const [issues, setIssues] = useState([]);
  const [books, setBooks] = useState([]);
  const [studentNames, setStudentNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);


  // GET /library/issues  or  GET /library/overdue  (+ books for titles and the issue form)
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      tab === "overdue" ? getOverdueBooks() : getIssues(),
      getBooks(),
      getStudentNameMap().catch(() => ({})), // names are optional; never block the table
    ])
      .then(([list, bookList, names]) => {
        if (cancelled) return;
        setIssues(list);
        setBooks(bookList);
        setStudentNames(names);
        setError("");
      })
      .catch((err) => !cancelled && setError(getErrorMessage(err, "Could not load issued books")))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [tab, reloadKey]);

  const reload = () => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  const switchTab = (key) => {
    if (key === tab) return;
    setLoading(true);
    setIssues([]);
    setTab(key);
  };

  const booksById = useMemo(() => Object.fromEntries(books.map((b) => [getId(b), b])), [books]);

  // Only books that can actually be issued
  const issuableBooks = useMemo(
    () =>
      books.filter((b) => {
        if (String(b.status || "active").toLowerCase() !== "active") return false;
        const avail = availableOf(b);
        return avail === undefined || avail === null || Number(avail) > 0;
      }),
    [books]
  );

  const openIssue = () => {
    setForm(initialForm);
    setFormError("");
    setShowForm(true);
  };

  // POST /library/issues  { bookId, studentId, dueDate }
  const handleIssue = async (e) => {
    e.preventDefault();
    if (!form.bookId) return setFormError("Select a book");
    if (!form.student) return setFormError("Search and select a student");
    if (!form.dueDate) return setFormError("Select a due date");
    const due = new Date(`${form.dueDate}T00:00:00.000Z`);
    if (due.getTime() < new Date().setHours(0, 0, 0, 0)) return setFormError("Due date cannot be in the past");

    setSaving(true);
    try {
      await issueBook({
        bookId: form.bookId,
        studentId: getId(form.student),
        dueDate: due.toISOString(),
      });
      setNotice("Book issued successfully");
      setShowForm(false);
      reload();
    } catch (err) {
      setFormError(getErrorMessage(err, "Could not issue book"));
    } finally {
      setSaving(false);
    }
  };

  const goHistory = (student) => {
    if (student) navigate(`/library/students/${getId(student)}/history`);
  };

  const isOverdueRow = (i) =>
    tab === "overdue" || (String(i.status || "").toLowerCase() !== "returned" && daysOverdue(i.dueDate) > 0);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Book Issues</h1>
          <p className="text-sm text-gray-500 mt-1">
            {issues.length} {tab === "overdue" ? "overdue" : "issued"} records
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={reload}
            className="p-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
            aria-label="Refresh"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={openIssue}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#16A34A] text-white font-medium hover:bg-[#15803D]"
          >
            <Plus size={18} /> Issue book
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div className="inline-flex p-1 rounded-lg bg-gray-100 self-start">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => switchTab(t.key)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                tab === t.key ? "bg-white text-green-700 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="md:w-72">
          <StudentSearch value={null} onChange={goHistory} autoClear placeholder="Student history: search name" />
        </div>
      </div>

      {notice && (
        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 flex justify-between">
          <span>{notice}</span>
          <button onClick={() => setNotice("")} aria-label="Dismiss">×</button>
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 font-medium">Book</th>
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium">Issued on</th>
              <th className="px-4 py-3 font-medium">Due date</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-500">Loading...</td>
              </tr>
            ) : issues.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                  {tab === "overdue" ? "No overdue books." : "No books issued yet."}
                </td>
              </tr>
            ) : (
              issues.map((i, idx) => {
                const sid = issueStudentId(i);
                const overdueDays = daysOverdue(i.dueDate);
                const showOverdue = isOverdueRow(i) && overdueDays > 0;
                const status = tab === "overdue" ? "overdue" : i.status || "issued";
                return (
                  <tr key={getId(i) || idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{issueBookTitle(i, booksById)}</td>
                    <td className="px-4 py-3">
                      {sid ? (
                        <Link
                          to={`/library/students/${sid}/history`}
                          className="text-green-700 hover:underline"
                          title="View student history"
                        >
                          {issueStudentName(i) || studentNames[sid] || "Unknown student"}
                        </Link>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{fmtDate(i.issuedAt || i.issueDate || i.createdAt)}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {fmtDate(i.dueDate)}
                      {showOverdue && <span className="ml-2 text-xs text-red-600">{overdueDays}d late</span>}
                    </td>
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

      {showForm && (
        <Modal title="Issue book" onClose={() => setShowForm(false)}>
          <form onSubmit={handleIssue} className="space-y-4" noValidate>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Book</label>
              <select
                value={form.bookId}
                onChange={(e) => setForm({ ...form, bookId: e.target.value })}
                className={inputClass}
              >
                <option value="">Select book</option>
                {issuableBooks.map((b) => (
                  <option key={getId(b)} value={getId(b)}>
                    {b.bookCode ? `${b.bookCode} - ` : ""}{b.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Student</label>
              <StudentSearch value={form.student} onChange={(student) => setForm({ ...form, student })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Due date</label>
              <input
                type="date"
                value={form.dueDate}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-lg bg-[#16A34A] text-white font-medium hover:bg-[#15803D] disabled:opacity-60"
              >
                {saving ? "Issuing..." : "Issue book"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Issues;

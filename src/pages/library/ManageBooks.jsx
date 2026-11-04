import React, { useEffect, useMemo, useState } from "react";
import { Search, Plus, RefreshCw, Eye, Pencil, Archive, Trash2, Upload } from "lucide-react";
import {
  getBooks,
  getCategories,
  createBook,
  updateBook,
  setBookStatus,
  deleteBook,
} from "./libraryService";
import { getErrorMessage } from "../../services/api";
import { ExportMenu, ImportModal } from "../../components/ImportExport";
import { getId, refId, inputClass, badgeClass, titleCase, availableOf } from "../../services/helpers";
import CreateBook from "./CreateBook";
import BookStatus from "./BookStatus";
import BookDetails from "./BookDetails";
import { STATUS_OPTIONS, initialForm } from "./bookUtils";

const ManageBooks = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // create / edit
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // view / status
  const [showImport, setShowImport] = useState(false);
  const [viewId, setViewId] = useState(null);
  const [statusBook, setStatusBook] = useState(null);
  const [newStatus, setNewStatus] = useState("retired");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getBooks(), getCategories()])
      .then(([b, c]) => {
        if (cancelled) return;
        setBooks(b);
        setCategories(c);
        setError("");
      })
      .catch((err) => !cancelled && setError(getErrorMessage(err, "Could not load books")))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const reload = () => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  const categoryName = (book) => {
    if (book.category && typeof book.category === "object") return book.category.name || "-";
    return categories.find((c) => getId(c) === book.category)?.name || "-";
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return books.filter((b) => {
      if (categoryFilter && refId(b.category) !== categoryFilter) return false;
      if (statusFilter && String(b.status || "").toLowerCase() !== statusFilter) return false;
      if (!q) return true;
      return [b.title, b.author, b.bookCode].some((v) => String(v ?? "").toLowerCase().includes(q));
    });
  }, [books, query, categoryFilter, statusFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (book) => {
    setEditing(book);
    setForm({
      category: refId(book.category),
      title: book.title || "",
      author: book.author || "",
      bookCode: book.bookCode || "",
      totalQty: book.totalQty ?? "",
    });
    setFormError("");
    setShowForm(true);
  };

  // POST /library/books   or   PUT /library/books/:id (only changed fields)
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.category) return setFormError("Select a category");
    if (!form.title.trim()) return setFormError("Title is required");
    if (!form.author.trim()) return setFormError("Author is required");
    if (!form.bookCode.trim()) return setFormError("Book code is required");
    const qty = Number(form.totalQty);
    if (!Number.isInteger(qty) || qty < 1) return setFormError("Total quantity must be a whole number, 1 or more");

    const body = {
      category: form.category,
      title: form.title.trim(),
      author: form.author.trim(),
      bookCode: form.bookCode.trim(),
      totalQty: qty,
    };

    setSaving(true);
    try {
      if (editing) {
        const original = {
          category: refId(editing.category),
          title: editing.title,
          author: editing.author,
          bookCode: editing.bookCode,
          totalQty: editing.totalQty,
        };
        const changes = Object.fromEntries(Object.entries(body).filter(([k, v]) => v !== original[k]));
        if (Object.keys(changes).length === 0) {
          setShowForm(false);
          return;
        }
        await updateBook(getId(editing), changes);
        setNotice(`"${body.title}" updated`);
      } else {
        await createBook(body);
        setNotice(`"${body.title}" added to the library`);
      }
      setShowForm(false);
      reload();
    } catch (err) {
      setFormError(getErrorMessage(err, editing ? "Could not update book" : "Could not add book"));
    } finally {
      setSaving(false);
    }
  };

  // PUT /library/books/:id/status
  const handleStatus = async (e) => {
    e.preventDefault();
    setBusyId(getId(statusBook));
    setError("");
    try {
      await setBookStatus(getId(statusBook), newStatus);
      setNotice(`"${statusBook.title}" marked as ${newStatus}`);
      setStatusBook(null);
      reload();
    } catch (err) {
      setError(getErrorMessage(err, "Could not change book status"));
      setStatusBook(null);
    } finally {
      setBusyId(null);
    }
  };

  // DELETE /library/books/:id
  const handleDelete = async (book) => {
    if (!window.confirm(`Delete "${book.title}" permanently? This cannot be undone.`)) return;
    setBusyId(getId(book));
    setError("");
    try {
      await deleteBook(getId(book));
      setNotice(`"${book.title}" deleted`);
      reload();
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete book"));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Books</h1>
          <p className="text-sm text-gray-500 mt-1">{books.length} books in the library</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={reload}
            className="p-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
            aria-label="Refresh"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <ExportMenu onError={setError} />
          <button
            onClick={() => setShowImport(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Upload size={16} /> Import
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#16A34A] text-white font-medium hover:bg-[#15803D]"
          >
            <Plus size={18} /> Add book
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, author or code"
            className={`${inputClass} pl-9 bg-white`}
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className={`${inputClass} md:w-52 bg-white`}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={getId(c)} value={getId(c)}>{c.name}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`${inputClass} md:w-40 bg-white`}
        >
          <option value="">All status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{titleCase(s)}</option>
          ))}
        </select>
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
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Author</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Copies</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-500">Loading books...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                  {books.length === 0 ? "No books yet. Add the first one." : "No books match your filters."}
                </td>
              </tr>
            ) : (
              filtered.map((b, i) => {
                const avail = availableOf(b);
                const retired = String(b.status || "").toLowerCase() === "retired";
                return (
                  <tr key={getId(b) || i} className={`hover:bg-gray-50 ${retired ? "opacity-70" : ""}`}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{b.bookCode || "-"}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{b.title}</td>
                    <td className="px-4 py-3 text-gray-600">{b.author || "-"}</td>
                    <td className="px-4 py-3 text-gray-600">{categoryName(b)}</td>
                    <td className="px-4 py-3 text-gray-900 whitespace-nowrap">
                      {avail !== undefined && avail !== null ? `${avail} / ${b.totalQty}` : b.totalQty ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${badgeClass(b.status || "active")}`}>
                        {titleCase(b.status || "active")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                        <button
                          onClick={() => setViewId(getId(b))}
                          title="View details"
                          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => openEdit(b)}
                          title="Edit book"
                          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setStatusBook(b);
                            setNewStatus(retired ? "active" : "retired");
                          }}
                          title="Change status"
                          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-amber-600"
                        >
                          <Archive size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(b)}
                          disabled={busyId === getId(b)}
                          title="Delete book"
                          className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
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

      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onImported={() => {
            setNotice("Books imported");
            reload();
          }}
        />
      )}

      {showForm && (
        <CreateBook
          categories={categories}
          editing={editing}
          form={form}
          formError={formError}
          handleSave={handleSave}
          saving={saving}
          setForm={setForm}
          setShowForm={setShowForm}
        />
      )}

      {statusBook && (
        <BookStatus
          busyId={busyId}
          handleStatus={handleStatus}
          newStatus={newStatus}
          setNewStatus={setNewStatus}
          setStatusBook={setStatusBook}
          statusBook={statusBook}
        />
      )}

      {viewId && <BookDetails id={viewId} categoryName={categoryName} onClose={() => setViewId(null)} />}
    </div>
  );
};

export default ManageBooks;

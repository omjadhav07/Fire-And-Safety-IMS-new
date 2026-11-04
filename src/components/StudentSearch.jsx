import React, { useEffect, useRef, useState } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { searchStudents } from "../pages/students/studentService";
import { getId } from "../services/helpers";

// Searchable student picker. Shows names, never asks the admin to type an internal ID.
// value: selected student object (or null) · onChange(student | null)
const StudentSearch = ({ value, onChange, placeholder = "Search by name, email or phone", autoClear = false }) => {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const boxRef = useRef(null);

  // debounced search
  useEffect(() => {
    if (term.trim().length < 2) return undefined; // dropdown stays hidden below 2 characters
    let cancelled = false;
    const t = setTimeout(() => {
      setLoading(true);
      searchStudents(term)
        .then((list) => !cancelled && (setResults(list), setError("")))
        .catch(() => !cancelled && setError("Could not search students"))
        .finally(() => !cancelled && setLoading(false));
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [term]);

  // close on outside click
  useEffect(() => {
    const onDown = (e) => boxRef.current && !boxRef.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const pick = (s) => {
    onChange(s);
    setOpen(false);
    setTerm("");
    setResults([]);
  };

  if (value && !autoClear) {
    return (
      <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border border-green-300 bg-green-50">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{value.name || value.email}</p>
          <p className="text-xs text-gray-500 truncate">{[value.email, value.phone].filter(Boolean).join(" · ")}</p>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="p-1 rounded-md text-gray-500 hover:bg-white hover:text-red-600"
          aria-label="Clear student"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div ref={boxRef} className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        value={term}
        onChange={(e) => {
          setTerm(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full pl-9 pr-9 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#16A34A]/40 focus:border-[#16A34A]"
      />
      {loading && <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />}

      {open && term.trim().length >= 2 && (
        <ul className="absolute z-20 mt-1 w-full max-h-60 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {error ? (
            <li className="px-3 py-3 text-sm text-red-600">{error}</li>
          ) : results.length === 0 && !loading ? (
            <li className="px-3 py-3 text-sm text-gray-500">No students found</li>
          ) : (
            results.map((s) => (
              <li key={getId(s)}>
                <button
                  type="button"
                  onClick={() => pick(s)}
                  className="w-full text-left px-3 py-2.5 hover:bg-green-50"
                >
                  <p className="text-sm font-medium text-gray-900">{s.name || s.email}</p>
                  <p className="text-xs text-gray-500">{[s.email, s.phone].filter(Boolean).join(" · ")}</p>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default StudentSearch;

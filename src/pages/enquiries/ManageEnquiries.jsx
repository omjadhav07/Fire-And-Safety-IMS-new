import React, { useEffect, useMemo, useState } from "react";
import { Search, Plus, RefreshCw, Eye, UserPlus } from "lucide-react";
import { getEnquiries, createEnquiry, convertEnquiry } from "./enquiryService";
import { getCourses } from "../courses/courseService";
import { getErrorMessage } from "../../services/api";
import { getId, fmtDate, titleCase, inputClass } from "../../services/helpers";
import CreateEnquiry from "./CreateEnquiry";
import ConvertEnquiry from "./ConvertEnquiry";
import EnquiryResult from "./EnquiryResult";
import EnquiryDetails from "./EnquiryDetails";
import { statusClass, emptyEnquiry, emptyConvert, relName } from "./enquiryUtils";

const ManageEnquiries = () => {
  const [list, setList] = useState([]);
  const [listAvailable, setListAvailable] = useState(true);
  const [sessionItems, setSessionItems] = useState([]); // enquiries created in this session
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // create
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyEnquiry);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // convert
  const [convertTarget, setConvertTarget] = useState(null);
  const [convertForm, setConvertForm] = useState(emptyConvert);
  const [convertError, setConvertError] = useState("");
  const [converting, setConverting] = useState(false);
  const [result, setResult] = useState(null); // conversion result incl. temporary password (memory only)
  const [copied, setCopied] = useState(false);

  const [viewId, setViewId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getCourses()
      .then((c) => !cancelled && setCourses(c))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    getEnquiries()
      .then((items) => {
        if (cancelled) return;
        setList(items);
        setListAvailable(true);
        setError("");
      })
      .catch((err) => {
        if (cancelled) return;
        if (err?.response?.status === 404) setListAvailable(false);
        else setError(getErrorMessage(err, "Could not load enquiries"));
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const reload = () => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  const courseNames = useMemo(() => Object.fromEntries(courses.map((c) => [getId(c), c.name])), [courses]);

  const rows = listAvailable ? list : sessionItems;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((e) => {
      if (statusFilter && String(e.status || "new").toLowerCase() !== statusFilter) return false;
      if (!q) return true;
      return [e.name, e.phone, e.email].some((v) => String(v ?? "").toLowerCase().includes(q));
    });
  }, [rows, query, statusFilter]);

  /* ───── create ───── */

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const openCreate = () => {
    setForm(emptyEnquiry);
    setFormError("");
    setShowCreate(true);
  };

  // POST /enquiries
  const handleCreate = async (e) => {
    e.preventDefault();
    const f = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()]));
    if (!f.name) return setFormError("Name is required");
    if (!/^\d{10}$/.test(f.phone)) return setFormError("Enter a 10-digit phone number");
    if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) return setFormError("Enter a valid email address");
    if (!f.course_interest_id) return setFormError("Select the course of interest");

    setSaving(true);
    try {
      const created = await createEnquiry(Object.fromEntries(Object.entries(f).filter(([, v]) => v !== "")));
      setSessionItems((items) => [created, ...items]);
      setNotice(`Enquiry from ${f.name} saved`);
      setShowCreate(false);
      reload();
    } catch (err) {
      setFormError(getErrorMessage(err, "Could not save enquiry"));
    } finally {
      setSaving(false);
    }
  };

  /* ───── convert ───── */

  const openConvert = (enquiry) => {
    setConvertTarget(enquiry);
    setConvertForm({ ...emptyConvert, address: enquiry.address || "" });
    setConvertError("");
  };

  const setC = (key) => (e) => setConvertForm({ ...convertForm, [key]: e.target.value });

  // POST /enquiries/:id/convert
  const handleConvert = async (e) => {
    e.preventDefault();
    const f = Object.fromEntries(Object.entries(convertForm).map(([k, v]) => [k, v.trim()]));
    if (!f.dob) return setConvertError("Date of birth is required");
    if (!f.gender) return setConvertError("Select a gender");
    if (!f.qualification) return setConvertError("Qualification is required");
    if (!f.guardian_name) return setConvertError("Guardian name is required");
    if (!/^\d{10}$/.test(f.guardian_phone)) return setConvertError("Guardian phone must be 10 digits");

    setConverting(true);
    try {
      const res = await convertEnquiry(getId(convertTarget), f);
      setResult({ ...res, enquiryName: convertTarget.name });
      setSessionItems((items) =>
        items.map((x) => (getId(x) === getId(convertTarget) ? { ...x, status: "converted" } : x))
      );
      setConvertTarget(null);
      reload();
    } catch (err) {
      setConvertError(getErrorMessage(err, "Could not convert enquiry"));
    } finally {
      setConverting(false);
    }
  };

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(result.account.temporary_password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy. Select the password and copy it manually.");
    }
  };

  const closeResult = () => {
    setResult(null); // the temporary password is dropped from memory here
    setCopied(false);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enquiries</h1>
          <p className="text-sm text-gray-500 mt-1">Capture walk-in enquiries and convert them to admissions</p>
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
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#16A34A] text-white font-medium hover:bg-[#15803D]"
          >
            <Plus size={18} /> New enquiry
          </button>
        </div>
      </div>

      {!listAvailable && (
        <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3">
          The enquiry list API is not available yet, so only enquiries created in this session are shown.
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, phone or email"
            className={`${inputClass} pl-9 bg-white`}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`${inputClass} md:w-44 bg-white`}
        >
          <option value="">All status</option>
          <option value="new">New</option>
          <option value="converted">Converted</option>
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
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Course of interest</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-500">Loading enquiries...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                  {rows.length === 0 ? "No enquiries yet. Add the first one." : "No enquiries match your filters."}
                </td>
              </tr>
            ) : (
              filtered.map((en, i) => {
                const status = String(en.status || "new").toLowerCase();
                return (
                  <tr key={getId(en) || i} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{en.name}</p>
                      {en.email && <p className="text-xs text-gray-500">{en.email}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{en.phone}</td>
                    <td className="px-4 py-3 text-gray-600">{relName(en.course_interest_id, courseNames)}</td>
                    <td className="px-4 py-3 text-gray-600">{titleCase(en.source)}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmtDate(en.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusClass(status)}`}>
                        {titleCase(status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                        <button
                          onClick={() => setViewId(getId(en))}
                          title="View enquiry"
                          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                        >
                          <Eye size={16} />
                        </button>
                        {status !== "converted" && (
                          <button
                            onClick={() => openConvert(en)}
                            title="Convert to admission"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-green-700 hover:bg-green-50 text-xs font-medium"
                          >
                            <UserPlus size={15} /> Convert
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <CreateEnquiry
          courses={courses}
          form={form}
          formError={formError}
          handleCreate={handleCreate}
          saving={saving}
          set={set}
          setShowCreate={setShowCreate}
        />
      )}

      {convertTarget && (
        <ConvertEnquiry
          convertError={convertError}
          convertForm={convertForm}
          convertTarget={convertTarget}
          converting={converting}
          handleConvert={handleConvert}
          setC={setC}
          setConvertTarget={setConvertTarget}
        />
      )}

      {result && (
        <EnquiryResult
          closeResult={closeResult}
          copied={copied}
          copyPassword={copyPassword}
          result={result}
        />
      )}

      {viewId && <EnquiryDetails id={viewId} onClose={() => setViewId(null)} />}
    </div>
  );
};

export default ManageEnquiries;

import React, { useRef, useState } from "react";
import { Download, ChevronDown, UploadCloud, FileSpreadsheet, RefreshCw } from "lucide-react";
import { exportBooks, downloadBookTemplate, importBooks } from "../pages/library/bookImportExportService";
import { getErrorMessage } from "../services/api";
import Modal from "./Modal";

const ACCEPT = ".xlsx,.xls,.csv";
const isAllowed = (file, accept = ACCEPT) =>
  accept.split(",").some((ext) => file.name.toLowerCase().endsWith(ext.trim()));
const FORMAT_LABEL = { xlsx: "Excel (.xlsx)", csv: "CSV (.csv)" };
const MAX_LISTED = 50;

const labelOf = (key) =>
  String(key)
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^\w/, (c) => c.toUpperCase());

// One row/problem from the backend report -> readable line
const formatItem = (item) => {
  if (typeof item === "string") return item;
  if (!item || typeof item !== "object") return String(item);
  const row = item.row ?? item.rowNumber ?? item.line;
  const code = item.bookCode ?? item.code ?? item.student_id ?? item.studentId;
  const msg = item.message ?? item.error ?? item.reason ?? (Array.isArray(item.errors) ? item.errors.join(", ") : "");
  const parts = [row !== undefined ? `Row ${row}` : "", code, msg].filter(Boolean);
  return parts.length ? parts.join(" - ") : JSON.stringify(item);
};

// Split an import response into numbers (summary) and lists (errors, duplicates, ...)
const summarise = (res) => {
  const body = res?.data && typeof res.data === "object" && !Array.isArray(res.data) ? { ...res, ...res.data } : res || {};
  const flat = body.summary && typeof body.summary === "object" ? { ...body, ...body.summary } : body;
  const counts = Object.entries(flat).filter(([, v]) => typeof v === "number");
  const lists = Object.entries(flat).filter(([, v]) => Array.isArray(v) && v.length > 0);
  return { message: typeof res?.message === "string" ? res.message : "", counts, lists };
};

const errorDetails = (err) => {
  const d = err?.response?.data;
  const list = d?.errors || d?.details || d?.data?.errors;
  return Array.isArray(list) ? list : [];
};

/* ───────────── Export dropdown ───────────── */

// Defaults are for Books. Other pages pass their own exportFn / formats / label.
export const ExportMenu = ({ onError, exportFn = exportBooks, formats = ["xlsx", "csv"], label = "books" }) => {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const run = async (format) => {
    setOpen(false);
    setBusy(true);
    try {
      await exportFn(format);
    } catch (err) {
      onError(getErrorMessage(err, `Could not export ${label}`));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => (formats.length === 1 ? run(formats[0]) : setOpen((o) => !o))}
        disabled={busy}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-60"
      >
        {busy ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
        {busy ? "Exporting..." : "Export"}
        {formats.length > 1 && <ChevronDown size={14} />}
      </button>
      {open && (
        <>
          <button className="fixed inset-0 z-10 cursor-default" onClick={() => setOpen(false)} aria-label="Close menu" />
          <div className="absolute right-0 z-20 mt-1 w-44 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
            {formats.map((f) => (
              <button key={f} onClick={() => run(f)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                {FORMAT_LABEL[f] || f}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

/* ───────────── Import modal ───────────── */

// Defaults are for Books. Other pages pass their own importFn / templateFn / texts.
export const ImportModal = ({
  onClose,
  onImported,
  title = "Import books",
  entity = "books",
  importFn = importBooks,
  templateFn = downloadBookTemplate,
  templateFormats = ["xlsx", "csv"],
  accept = ACCEPT,
  fileTypesLabel = ".xlsx, .xls or .csv",
  invalidMessage = "Only Excel (.xlsx, .xls) or CSV files are allowed",
  description = "Upload an Excel or CSV file with your books. Rows are validated and duplicate records are detected.",
}) => {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [details, setDetails] = useState([]);
  const [report, setReport] = useState(null);
  const [templateBusy, setTemplateBusy] = useState("");

  const choose = (f) => {
    setError("");
    setDetails([]);
    setReport(null);
    if (!f) return;
    if (!isAllowed(f, accept)) {
      setFile(null);
      return setError(invalidMessage);
    }
    setFile(f);
  };

  const template = async (format) => {
    setTemplateBusy(format);
    setError("");
    try {
      await templateFn(format);
    } catch (err) {
      setError(getErrorMessage(err, "Could not download template"));
    } finally {
      setTemplateBusy("");
    }
  };

  // POST /import-export/library/books/import
  const handleImport = async () => {
    if (!file) return setError("Choose a file first");
    setUploading(true);
    setProgress(0);
    setError("");
    setDetails([]);
    try {
      const res = await importFn(file, setProgress);
      setReport(summarise(res));
      onImported();
    } catch (err) {
      setError(getErrorMessage(err, "Import failed"));
      setDetails(errorDetails(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal title={title} onClose={uploading ? () => {} : onClose} maxWidth="max-w-xl">
      <div className="space-y-4">
        {!report && (
          <>
            <p className="text-sm text-gray-500">{description}</p>

            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-gray-600">Need the format?</span>
              {templateFormats.map((f) => (
                <button
                  key={f}
                  onClick={() => template(f)}
                  disabled={!!templateBusy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                >
                  <FileSpreadsheet size={14} />
                  {templateBusy === f ? "Downloading..." : `Template .${f}`}
                </button>
              ))}
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                choose(e.dataTransfer.files?.[0]);
              }}
              onClick={() => !uploading && inputRef.current?.click()}
              className={`cursor-pointer rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
                dragOver ? "border-[#0EA5E9] bg-sky-50" : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              <UploadCloud size={28} className="mx-auto text-gray-400" />
              {file ? (
                <p className="mt-2 text-sm font-medium text-gray-900">
                  {file.name} <span className="text-gray-500 font-normal">({(file.size / 1024).toFixed(1)} KB)</span>
                </p>
              ) : (
                <p className="mt-2 text-sm text-gray-600">Drop a file here or click to browse</p>
              )}
              <p className="text-xs text-gray-400 mt-1">{fileTypesLabel}</p>
              <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => {
                  choose(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </div>

            {uploading && (
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-[#0EA5E9] transition-all" style={{ width: `${progress}%` }} />
              </div>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}
            {details.length > 0 && (
              <ul className="max-h-48 overflow-y-auto rounded-lg border border-red-100 bg-red-50 p-3 text-xs text-red-700 space-y-1">
                {details.slice(0, MAX_LISTED).map((d, i) => (
                  <li key={i}>{formatItem(d)}</li>
                ))}
                {details.length > MAX_LISTED && <li>...and {details.length - MAX_LISTED} more</li>}
              </ul>
            )}

            <div className="flex justify-end gap-3 pt-1">
              <button
                onClick={onClose}
                disabled={uploading}
                className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!file || uploading}
                className="px-5 py-2.5 rounded-lg bg-[#0EA5E9] text-white font-medium hover:bg-[#0284C7] disabled:opacity-60"
              >
                {uploading ? `Importing... ${progress}%` : `Import ${entity}`}
              </button>
            </div>
          </>
        )}

        {report && (
          <>
            <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
              {report.message || "Import finished"}
            </div>

            {report.counts.length > 0 && (
              <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {report.counts.map(([k, v]) => (
                  <div key={k} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                    <dt className="text-xs text-gray-500">{labelOf(k)}</dt>
                    <dd className="text-lg font-semibold text-gray-900">{v}</dd>
                  </div>
                ))}
              </dl>
            )}

            {report.lists.map(([k, items]) => (
              <div key={k}>
                <p className="text-sm font-medium text-gray-700 mb-1.5">
                  {labelOf(k)} ({items.length})
                </p>
                <ul className="max-h-40 overflow-y-auto rounded-lg border border-amber-100 bg-amber-50 p-3 text-xs text-amber-900 space-y-1">
                  {items.slice(0, MAX_LISTED).map((it, i) => (
                    <li key={i}>{formatItem(it)}</li>
                  ))}
                  {items.length > MAX_LISTED && <li>...and {items.length - MAX_LISTED} more</li>}
                </ul>
              </div>
            ))}

            <div className="flex justify-end gap-3 pt-1">
              <button
                onClick={() => {
                  setReport(null);
                  setFile(null);
                }}
                className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Import another file
              </button>
              <button onClick={onClose} className="px-5 py-2.5 rounded-lg bg-[#0EA5E9] text-white font-medium hover:bg-[#0284C7]">
                Done
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
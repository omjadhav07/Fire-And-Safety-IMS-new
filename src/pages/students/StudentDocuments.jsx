import React, { useEffect, useRef, useState } from "react";
import { Upload, Download, Trash2, Check, CheckCircle2, UploadCloud } from "lucide-react";
import {
  getStudentDocuments,
  uploadStudentDocument,
  updateDocumentStatus,
  downloadStudentDocument,
  deleteStudentDocument,
} from "./studentService";
import { getErrorMessage } from "../../services/api";
import Modal from "../../components/Modal";
import { getId, fmtDate, titleCase, inputClass } from "../../services/helpers";

const DOC_TYPES = ["Aadhaar Card", "Passport Photo", "10th Marksheet", "12th Marksheet", "Leaving Certificate", "Birth Certificate", "Caste Certificate"];
const DOC_ACCEPT = ".pdf,.jpg,.jpeg,.png,.webp";
const DOC_STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700",
  received: "bg-blue-100 text-blue-700",
  verified: "bg-green-100 text-green-700",
};
const DEFAULT_REMARKS = {
  received: "Physical copy received at the office.",
  verified: "Original document checked and verified.",
};
const fmtSize = (b) => (!b ? "" : b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

// Documents of one student: upload, list, download, mark received / verified, soft delete
const StudentDocuments = ({ student, onClose }) => {
  const studentId = getId(student);
  const fileRef = useRef(null);

  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [docType, setDocType] = useState("");
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const [action, setAction] = useState(null); // { doc, kind: "received" | "verified" | "delete" }
  const [remarks, setRemarks] = useState("");
  const [busy, setBusy] = useState(false);
  const [downloadingId, setDownloadingId] = useState("");

  // GET /students/:id/documents
  useEffect(() => {
    let cancelled = false;
    getStudentDocuments(studentId)
      .then((list) => !cancelled && (setDocs(list), setError("")))
      .catch((err) => !cancelled && setError(getErrorMessage(err, "Could not load documents")))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [studentId, reloadKey]);

  const reload = () => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  // POST /students/:id/documents
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!docType.trim()) return setError("Enter or choose the document type");
    if (!file) return setError("Choose a PDF or image file");
    setUploading(true);
    setProgress(0);
    setError("");
    try {
      await uploadStudentDocument(studentId, { file, document_type: docType.trim() }, setProgress);
      setNotice(`${docType.trim()} uploaded`);
      setDocType("");
      setFile(null);
      reload();
    } catch (err) {
      setError(getErrorMessage(err, "Could not upload document"));
    } finally {
      setUploading(false);
    }
  };

  const openAction = (doc, kind) => {
    setAction({ doc, kind });
    setRemarks(kind === "delete" ? "" : DEFAULT_REMARKS[kind]);
    setError("");
  };

  // PUT /documents/:id/verify   or   DELETE /documents/:id
  const confirmAction = async () => {
    const { doc, kind } = action;
    setBusy(true);
    setError("");
    try {
      if (kind === "delete") {
        await deleteStudentDocument(getId(doc));
        setNotice(`${doc.document_type} deleted`);
      } else {
        await updateDocumentStatus(getId(doc), kind, remarks.trim());
        setNotice(`${doc.document_type} marked as ${kind}`);
      }
      setAction(null);
      reload();
    } catch (err) {
      setError(getErrorMessage(err, "Could not update document"));
    } finally {
      setBusy(false);
    }
  };

  // GET /documents/:id/file
  const handleDownload = async (doc) => {
    setDownloadingId(getId(doc));
    setError("");
    try {
      await downloadStudentDocument(getId(doc), doc.upload_id?.originalName || doc.document_type || "document");
    } catch (err) {
      setError(getErrorMessage(err, "Could not download document"));
    } finally {
      setDownloadingId("");
    }
  };

  const iconBtn = "p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent";

  return (
    <Modal title="Student documents" onClose={uploading ? () => {} : onClose} maxWidth="max-w-2xl">
      <p className="text-sm text-gray-600 mb-4">
        <span className="font-medium text-gray-900">{student.name}</span>
        {student.rollNo ? ` · ${student.rollNo}` : ""}
      </p>

      {notice && (
        <div className="mb-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2.5 flex justify-between">
          <span>{notice}</span>
          <button onClick={() => setNotice("")} aria-label="Dismiss">×</button>
        </div>
      )}
      {error && <div className="mb-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5">{error}</div>}

      {/* List */}
      <div className="rounded-xl border border-gray-100 divide-y divide-gray-100">
        {loading ? (
          <p className="px-4 py-6 text-center text-sm text-gray-500">Loading documents...</p>
        ) : docs.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-gray-500">No documents uploaded yet.</p>
        ) : (
          docs.map((d) => {
            const status = String(d.status || "pending").toLowerCase();
            const up = d.upload_id && typeof d.upload_id === "object" ? d.upload_id : {};
            return (
              <div key={getId(d)} className="px-4 py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-gray-900">{d.document_type}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${DOC_STATUS_STYLES[status] || "bg-gray-100 text-gray-600"}`}>
                      {titleCase(status)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {[up.originalName, fmtSize(up.size), fmtDate(d.createdAt)].filter((v) => v && v !== "-").join(" · ")}
                  </p>
                  {d.remarks && <p className="text-xs text-gray-600 mt-1">{d.remarks}</p>}
                  {status === "verified" && d.verified_at && (
                    <p className="text-xs text-green-700 mt-0.5">Verified on {fmtDate(d.verified_at)}</p>
                  )}
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <button onClick={() => handleDownload(d)} disabled={downloadingId === getId(d)} title="Download" className={`${iconBtn} hover:text-gray-800`}>
                    <Download size={16} />
                  </button>
                  <button
                    onClick={() => openAction(d, "received")}
                    disabled={status === "received" || status === "verified"}
                    title="Mark as received"
                    className={`${iconBtn} hover:text-blue-600`}
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => openAction(d, "verified")}
                    disabled={status === "verified"}
                    title="Mark as verified"
                    className={`${iconBtn} hover:text-green-700`}
                  >
                    <CheckCircle2 size={16} />
                  </button>
                  <button onClick={() => openAction(d, "delete")} title="Delete" className={`${iconBtn} hover:text-red-600`}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Confirm: received / verified / delete */}
      {action && (
        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
          {action.kind === "delete" ? (
            <p className="text-sm text-gray-700">
              Delete <span className="font-medium">{action.doc.document_type}</span>? It will be removed from this student&apos;s documents.
            </p>
          ) : (
            <>
              <p className="text-sm text-gray-700">
                Mark <span className="font-medium">{action.doc.document_type}</span> as{" "}
                <span className="font-medium">{action.kind}</span>
              </p>
              <input
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Remarks (optional)"
                className={`${inputClass} bg-white`}
              />
            </>
          )}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setAction(null)}
              disabled={busy}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-white disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              onClick={confirmAction}
              disabled={busy}
              className={`px-5 py-2 rounded-lg text-white font-medium disabled:opacity-60 ${
                action.kind === "delete" ? "bg-red-600 hover:bg-red-700" : "bg-[#16A34A] hover:bg-[#15803D]"
              }`}
            >
              {busy ? "Please wait..." : action.kind === "delete" ? "Delete" : "Confirm"}
            </button>
          </div>
        </div>
      )}

      {/* Upload */}
      <form onSubmit={handleUpload} className="mt-5 pt-5 border-t border-gray-100 space-y-3" noValidate>
        <h3 className="text-sm font-semibold text-gray-900">Upload a document</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <input
              list="student-doc-types"
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              placeholder="Document type, e.g. Aadhaar Card"
              className={inputClass}
            />
            <datalist id="student-doc-types">
              {DOC_TYPES.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </div>
          <button
            type="button"
            onClick={() => !uploading && fileRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-gray-300 text-sm text-gray-600 hover:bg-gray-50 text-left"
          >
            <UploadCloud size={18} className="text-gray-400 shrink-0" />
            <span className="truncate">{file ? `${file.name} (${fmtSize(file.size)})` : "Choose PDF or image"}</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept={DOC_ACCEPT}
            className="hidden"
            onChange={(e) => {
              setFile(e.target.files?.[0] || null);
              e.target.value = "";
            }}
          />
        </div>
        {uploading && (
          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full bg-[#16A34A] transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={uploading}
            className="px-5 py-2.5 rounded-lg bg-[#16A34A] text-white font-medium hover:bg-[#15803D] disabled:opacity-60"
          >
            {uploading ? `Uploading... ${progress}%` : "Upload"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default StudentDocuments;

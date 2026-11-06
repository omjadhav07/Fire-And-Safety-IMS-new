import React, { useEffect, useRef, useState } from "react";
import { UploadCloud, Download, RefreshCw, FileText, Image as ImageIcon, Replace, Trash2 } from "lucide-react";
import { getMyFiles, uploadFile, downloadFile, replaceFile, deleteFile } from "./uploadService";
import { getErrorMessage } from "../../services/api";

const ALLOWED = ["application/pdf", "image/jpeg", "image/png"];
const getId = (f) => f.id || f._id;
const getName = (f) => f.original_name || f.originalName || f.file_name || f.fileName || f.filename || f.name || "file";
const getMime = (f) => f.mime_type || f.mimeType || f.mimetype || f.type || "";
const getCreated = (f) => f.created_at || f.createdAt || f.uploaded_at;

const formatSize = (bytes) => {
  const n = Number(bytes);
  if (!n) return "-";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (v) => {
  if (!v) return "-";
  const d = new Date(v);
  return Number.isNaN(d.getTime())
    ? v
    : d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const Files = () => {
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [selected, setSelected] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [busyId, setBusyId] = useState(null); // file being replaced or deleted
  const replaceInputRef = useRef(null);
  const replaceTargetRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  // GET /uploads
  useEffect(() => {
    let cancelled = false;
    getMyFiles()
      .then((list) => {
        if (cancelled) return;
        setFiles(list);
        setError("");
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, "Could not load files"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const reload = () => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  const pickFile = (file) => {
    setNotice("");
    setError("");
    if (!file) return;
    if (!ALLOWED.includes(file.type)) {
      setSelected(null);
      return setError("Only PDF, JPG and PNG files are allowed");
    }
    setSelected(file);
  };

  // POST /uploads
  const handleUpload = async () => {
    if (!selected) return;
    setUploading(true);
    setProgress(0);
    setError("");
    try {
      await uploadFile(selected, setProgress);
      setNotice(`"${selected.name}" uploaded successfully`);
      setSelected(null);
      if (inputRef.current) inputRef.current.value = "";
      reload();
    } catch (err) {
      setError(getErrorMessage(err, "Upload failed"));
    } finally {
      setUploading(false);
    }
  };

  // GET /uploads/:id/download
  const handleDownload = async (f) => {
    setDownloadingId(getId(f));
    setError("");
    try {
      await downloadFile(getId(f), getName(f));
    } catch (err) {
      setError(getErrorMessage(err, "Could not download file"));
    } finally {
      setDownloadingId(null);
    }
  };

  // PUT /uploads/:id  - pick a replacement, then upload it over the existing record
  const startReplace = (f) => {
    replaceTargetRef.current = f;
    replaceInputRef.current?.click();
  };

  const handleReplace = async (e) => {
    const file = e.target.files?.[0];
    const target = replaceTargetRef.current;
    e.target.value = "";
    if (!file || !target) return;
    setNotice("");
    setError("");
    if (!ALLOWED.includes(file.type)) return setError("Only PDF, JPG and PNG files are allowed");
    setBusyId(getId(target));
    try {
      await replaceFile(getId(target), file);
      setNotice(`"${getName(target)}" replaced with "${file.name}"`);
      reload();
    } catch (err) {
      setError(getErrorMessage(err, "Could not replace file"));
    } finally {
      setBusyId(null);
    }
  };

  // DELETE /uploads/:id
  const handleDelete = async (f) => {
    if (!window.confirm(`Delete "${getName(f)}" permanently? This cannot be undone.`)) return;
    setNotice("");
    setError("");
    setBusyId(getId(f));
    try {
      await deleteFile(getId(f));
      setNotice(`"${getName(f)}" deleted`);
      reload();
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete file"));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <input ref={replaceInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleReplace} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Files</h1>
          <p className="text-sm text-gray-500 mt-1">Upload PDF or image files and download them later</p>
        </div>
        <button
          onClick={reload}
          className="p-2.5 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
          aria-label="Refresh"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {notice && (
        <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 flex justify-between">
          <span>{notice}</span>
          <button onClick={() => setNotice("")} aria-label="Dismiss">×</button>
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>
      )}

      {/* Upload box */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          pickFile(e.dataTransfer.files?.[0]);
        }}
        className={`bg-white rounded-2xl border-2 border-dashed p-6 mb-6 text-center transition-colors ${
          dragOver ? "border-sky-500 bg-sky-50" : "border-gray-300"
        }`}
      >
        <UploadCloud size={36} className="mx-auto text-sky-600" />
        <p className="mt-2 text-sm text-gray-700">
          Drag a file here or{" "}
          <button type="button" onClick={() => inputRef.current?.click()} className="text-sky-700 font-medium hover:underline">
            browse
          </button>
        </p>
        <p className="text-xs text-gray-400 mt-1">PDF, JPG or PNG</p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          className="hidden"
          onChange={(e) => pickFile(e.target.files?.[0])}
        />

        {selected && (
          <div className="mt-4 max-w-md mx-auto text-left">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-800 truncate pr-3">{selected.name}</span>
              <span className="text-gray-500 shrink-0">{formatSize(selected.size)}</span>
            </div>
            {uploading && (
              <div className="mt-2 h-2 rounded-full bg-gray-200 overflow-hidden">
                <div className="h-full bg-sky-600 transition-all" style={{ width: `${progress}%` }} />
              </div>
            )}
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="mt-3 w-full py-2.5 rounded-lg bg-[#0EA5E9] text-white font-medium hover:bg-[#0284C7] disabled:opacity-60"
            >
              {uploading ? `Uploading... ${progress}%` : "Upload file"}
            </button>
          </div>
        )}
      </div>

      {/* File list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#0B1437] text-white">
            <tr>
              <th className="px-4 py-3 font-medium">File</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Size</th>
              <th className="px-4 py-3 font-medium">Uploaded</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-500">Loading files...</td>
              </tr>
            ) : files.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-500">No files uploaded yet</td>
              </tr>
            ) : (
              files.map((f, i) => {
                const mime = getMime(f);
                const isImage = mime.startsWith("image/");
                return (
                  <tr key={getId(f) || i} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {isImage ? <ImageIcon size={18} className="text-sky-600" /> : <FileText size={18} className="text-red-500" />}
                        <span className="font-medium text-gray-900">{getName(f)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{mime || "-"}</td>
                    <td className="px-4 py-3 text-gray-600">{formatSize(f.size || f.file_size)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(getCreated(f))}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                        <button
                          onClick={() => handleDownload(f)}
                          disabled={downloadingId === getId(f)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <Download size={14} />
                          {downloadingId === getId(f) ? "Downloading..." : "Download"}
                        </button>
                        <button
                          onClick={() => startReplace(f)}
                          disabled={busyId === getId(f)}
                          title="Replace file"
                          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 disabled:opacity-50"
                        >
                          {busyId === getId(f) ? <RefreshCw size={16} className="animate-spin" /> : <Replace size={16} />}
                        </button>
                        <button
                          onClick={() => handleDelete(f)}
                          disabled={busyId === getId(f)}
                          title="Delete file"
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
    </div>
  );
};

export default Files;

// import React, { useEffect, useMemo, useState } from "react";
// import { RefreshCw, Eye, Download, Pencil, Trash2, ExternalLink, X } from "lucide-react";
// import { getMaterials, deleteMaterial, openMaterialFile } from "./materialService";
// import { getCourses, getBatches } from "../courses/courseService";
// import { getAssignments } from "../faculty/facultyAssignmentService";
// import { getErrorMessage } from "../../services/api";
// import { fmtDate, titleCase } from "../../services/helpers";
// import { pick, relId, relName } from "../schedules/scheduleUtils";
// import { ROLE, getCurrentRole, getCurrentUser } from "../../config/permissions";
// import { PageHeader, Toolbar, AddButton, TableCard, Notice, StatusPill, RowMenu } from "../../components/ui";
// import UploadMaterial from "./UploadMaterial";
// import { MATERIAL_TYPES, getId, courseOf, batchOf, statusOf, typeOf, typeLabel, linkOf, uploaderName, uploaderId, sameText } from "./materialUtils";

// const selectClass = "px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white disabled:bg-slate-50 disabled:text-slate-400";

// const ManageMaterials = () => {
//   const role = getCurrentRole();
//   const me = getCurrentUser();
//   const myId = me?._id || me?.id || "";
//   const isStudent = role === ROLE.STUDENT;
//   const isFaculty = role === ROLE.FACULTY;
//   const canUpload = role === ROLE.SUPER_ADMIN || isFaculty; // office staff and students: read only

//   const [rows, setRows] = useState([]);
//   const [courses, setCourses] = useState([]);
//   const [assignments, setAssignments] = useState([]);
//   const [batchMap, setBatchMap] = useState({}); // courseId -> batches
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [notice, setNotice] = useState("");
//   const [reloadKey, setReloadKey] = useState(0);
//   const [busyId, setBusyId] = useState(null);

//   const [filters, setFilters] = useState({ course: "", batch: "", subject: "", type: "", q: "" });
//   const [form, setForm] = useState(null); // null = closed, {} = upload, material = edit
//   const [player, setPlayer] = useState(null); // { url, title } while a video is playing

//   // Materials + courses + (faculty) my assignments
//   useEffect(() => {
//     let cancelled = false;
//     Promise.all([
//       getMaterials({ student: isStudent }),
//       getCourses().catch(() => []),
//       isFaculty ? getAssignments().catch(() => []) : Promise.resolve([]),
//     ])
//       .then(([list, courseList, assigned]) => {
//         if (cancelled) return;
//         setRows(list);
//         setCourses(courseList);
//         setAssignments(assigned);
//         setError("");
//       })
//       .catch((err) => !cancelled && setError(getErrorMessage(err, "Could not load study material")))
//       .finally(() => !cancelled && setLoading(false));
//     return () => {
//       cancelled = true;
//     };
//   }, [reloadKey, isStudent, isFaculty]);

//   const reload = () => {
//     setLoading(true);
//     setReloadKey((k) => k + 1);
//   };

//   const closePlayer = () => {
//     if (player) window.URL.revokeObjectURL(player.url);
//     setPlayer(null);
//   };

//   // Batch names for the courses that appear in the list / filter
//   const courseIds = useMemo(
//     () => [...new Set([...rows.map(courseOf), filters.course].filter(Boolean))].sort().join(","),
//     [rows, filters.course]
//   );
//   useEffect(() => {
//     if (!courseIds) return undefined;
//     let cancelled = false;
//     Promise.all(courseIds.split(",").map((id) => getBatches(id).then((l) => [id, l]).catch(() => [id, []]))).then(
//       (pairs) => !cancelled && setBatchMap(Object.fromEntries(pairs))
//     );
//     return () => {
//       cancelled = true;
//     };
//   }, [courseIds]);

//   const courseNames = useMemo(() => Object.fromEntries(courses.map((c) => [c.id || c._id, c.name])), [courses]);
//   const batchNames = useMemo(
//     () => Object.fromEntries(Object.values(batchMap).flat().map((b) => [b.id || b._id, b.name])),
//     [batchMap]
//   );
//   const courseLabel = (m) => relName(pick(m, "course_id", "course"), courseNames) || "-";
//   const batchLabel = (m) => relName(pick(m, "batch_id", "batch"), batchNames) || "-";

//   // Faculty may change only material of their assigned course + batch + subject (or that they uploaded)
//   const canManage = (m) => {
//     if (role === ROLE.SUPER_ADMIN) return true;
//     if (!isFaculty) return false;
//     if (uploaderId(m) && uploaderId(m) === myId) return true;
//     return assignments.some(
//       (a) =>
//         relId(pick(a, "course_id", "course")) === courseOf(m) &&
//         relId(pick(a, "batch_id", "batch")) === batchOf(m) &&
//         sameText(a.subject, m.subject)
//     );
//   };

//   const setFilter = (key) => (e) => {
//     const value = e.target.value;
//     setFilters((f) => ({ ...f, [key]: value, ...(key === "course" ? { batch: "" } : {}) }));
//   };

//   const subjectOptions = useMemo(() => [...new Set(rows.map((m) => m.subject).filter(Boolean))].sort(), [rows]);

//   const shown = useMemo(() => {
//     const q = filters.q.trim().toLowerCase();
//     return rows.filter((m) => {
//       if (isStudent && statusOf(m) !== "published") return false;
//       if (filters.course && courseOf(m) !== filters.course) return false;
//       if (filters.batch && batchOf(m) !== filters.batch) return false;
//       if (filters.subject && m.subject !== filters.subject) return false;
//       if (filters.type && typeOf(m) !== filters.type) return false;
//       if (!q) return true;
//       return [m.title, m.subject, m.description, uploaderName(m)].some((v) => String(v ?? "").toLowerCase().includes(q));
//     });
//   }, [rows, filters, isStudent]);

//   const open = async (m, mode) => {
//     const link = linkOf(m);
//     if (link && !m.file_path) {
//       window.open(link, "_blank", "noopener");
//       return;
//     }
//     setBusyId(getId(m));
//     setError("");
//     try {
//       const res = await openMaterialFile(getId(m), { student: isStudent, mode, fallbackName: m.title || "material" });
//       if (res?.kind === "video") setPlayer({ url: res.url, title: m.title });
//     } catch (err) {
//       setError(getErrorMessage(err, "Could not open the file"));
//     } finally {
//       setBusyId(null);
//     }
//   };

//   // DELETE /materials/:id
//   const handleDelete = async (m) => {
//     if (!window.confirm(`Delete "${m.title}"? Students will no longer see it.`)) return;
//     setBusyId(getId(m));
//     setError("");
//     try {
//       await deleteMaterial(getId(m));
//       setNotice(`"${m.title}" deleted`);
//       reload();
//     } catch (err) {
//       setError(getErrorMessage(err, "Could not delete the material"));
//     } finally {
//       setBusyId(null);
//     }
//   };

//   const filterBatches = batchMap[filters.course] || [];
//   const filtered = !!(filters.course || filters.batch || filters.subject || filters.type || filters.q);

//   return (
//     <div>
//       <PageHeader
//         title="Study Material"
//         subtitle={isStudent ? "Published notes and files for your batch" : "Notes, presentations and videos for each batch and subject"}
//       />

//       {notice && <Notice onClose={() => setNotice("")}>{notice}</Notice>}
//       {error && <Notice tone="error">{error}</Notice>}

//       <div>
//         <Toolbar value={filters.q} onChange={(v) => setFilters((f) => ({ ...f, q: v }))} placeholder="Search title, subject or uploader">
//           <button onClick={reload} aria-label="Refresh" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm hover:bg-gray-50">
//             <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
//           </button>
//           {canUpload && (
//             <AddButton onClick={() => setForm({})}>
//               Upload material
//             </AddButton>
//           )}
//         </Toolbar>
//         <div className="flex flex-wrap gap-2 mb-4">
//           <select value={filters.course} onChange={setFilter("course")} className={selectClass}>
//             <option value="">All courses</option>
//             {courses.map((c) => (
//               <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>
//             ))}
//           </select>
//           <select value={filters.batch} onChange={setFilter("batch")} disabled={!filters.course} className={selectClass}>
//             <option value="">{filters.course ? "All batches" : "Pick a course first"}</option>
//             {filterBatches.map((b) => (
//               <option key={b.id || b._id} value={b.id || b._id}>{b.name}</option>
//             ))}
//           </select>
//           <select value={filters.subject} onChange={setFilter("subject")} className={selectClass}>
//             <option value="">All subjects</option>
//             {subjectOptions.map((s) => (
//               <option key={s} value={s}>{s}</option>
//             ))}
//           </select>
//           <select value={filters.type} onChange={setFilter("type")} className={selectClass}>
//             <option value="">All types</option>
//             {MATERIAL_TYPES.map(([v, l]) => (
//               <option key={v} value={v}>{l}</option>
//             ))}
//           </select>
//         </div>
//       </div>

//       <TableCard>
//         <table className="w-full text-sm text-left">
//           <thead className="bg-[#0B1437] text-white">
//             <tr>
//               <th className="px-4 py-3">Title</th>
//               <th className="px-4 py-3">Subject</th>
//               <th className="px-4 py-3">Course / Batch</th>
//               <th className="px-4 py-3">Type</th>
//               <th className="px-4 py-3">Uploaded by</th>
//               <th className="px-4 py-3">Date</th>
//               <th className="px-4 py-3">Status</th>
//               <th className="px-4 py-3 text-right">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-slate-100">
//             {loading ? (
//               <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-500">Loading study material...</td></tr>
//             ) : shown.length === 0 ? (
//               <tr>
//                 <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
//                   {filtered ? "No material matches your filters." : canUpload ? "No material yet. Upload the first one." : "No study material available yet."}
//                 </td>
//               </tr>
//             ) : (
//               shown.map((m, i) => {
//                 const isLink = !!linkOf(m) && !m.file_path;
//                 const manage = canManage(m);
//                 const status = statusOf(m);
//                 return (
//                   <tr key={getId(m) || i}>
//                     <td className="px-4 py-3">
//                       <p className="font-medium text-slate-900">{m.title}</p>
//                       {m.description && <p className="text-xs text-slate-500 max-w-xs truncate">{m.description}</p>}
//                     </td>
//                     <td className="px-4 py-3 text-slate-600">{m.subject || "-"}</td>
//                     <td className="px-4 py-3 text-slate-600">
//                       <p>{courseLabel(m)}</p>
//                       <p className="text-xs text-slate-500">{batchLabel(m)}</p>
//                     </td>
//                     <td className="px-4 py-3"><StatusPill tone="blue">{typeLabel(typeOf(m))}</StatusPill></td>
//                     <td className="px-4 py-3 text-slate-600">{uploaderName(m)}</td>
//                     <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{fmtDate(m.created_at || m.createdAt || m.uploaded_at)}</td>
//                     <td className="px-4 py-3"><StatusPill tone={status === "published" ? "green" : "amber"}>{titleCase(status)}</StatusPill></td>
//                     <td className="px-4 py-3 text-right">
//                       <RowMenu
//                         items={[
//                           { label: isLink ? "Open link" : "View", icon: isLink ? ExternalLink : Eye, hidden: !isLink && ["ppt", "doc"].includes(typeOf(m)), disabled: busyId === getId(m), onClick: () => open(m, "view") },
//                           { label: "Download", icon: Download, hidden: isLink, disabled: busyId === getId(m), onClick: () => open(m, "download") },
//                           { label: "Edit", icon: Pencil, hidden: !manage, onClick: () => setForm(m) },
//                           { label: "Delete", icon: Trash2, danger: true, hidden: !manage, disabled: busyId === getId(m), onClick: () => handleDelete(m) },
//                         ]}
//                       />
//                     </td>
//                   </tr>
//                 );
//               })
//             )}
//           </tbody>
//         </table>
//       </TableCard>

//       {player && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={closePlayer}>
//           <div className="w-full max-w-4xl rounded-xl bg-black overflow-hidden" onClick={(e) => e.stopPropagation()}>
//             <div className="flex items-center justify-between px-4 py-2 bg-[#0B1437] text-white text-sm">
//               <span className="truncate pr-3">{player.title}</span>
//               <button onClick={closePlayer} aria-label="Close"><X size={18} /></button>
//             </div>
//             <video src={player.url} controls autoPlay className="w-full max-h-[75vh]" />
//           </div>
//         </div>
//       )}

//       {form && (
//         <UploadMaterial
//           editing={getId(form) ? form : null}
//           courses={courses}
//           myAssignments={assignments}
//           onClose={() => setForm(null)}
//           onSaved={(msg) => {
//             setForm(null);
//             setNotice(msg);
//             reload();
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default ManageMaterials;




import React, { useEffect, useMemo, useState } from "react";
import { RefreshCw, Eye, Download, Pencil, Trash2, ExternalLink, X } from "lucide-react";
import { getMaterials, deleteMaterial, openMaterialFile } from "./materialService";
import { getCourses, getBatches } from "../courses/courseService";
import { getAssignments } from "../faculty/facultyAssignmentService";
import { getErrorMessage } from "../../services/api";
import { fmtDate, titleCase } from "../../services/helpers";
import { pick, relId, relName } from "../schedules/scheduleUtils";
import { ROLE, getCurrentRole, getCurrentUser } from "../../config/permissions";
import { PageHeader, Toolbar, AddButton, TableCard, Notice, StatusPill, RowMenu } from "../../components/ui";
import UploadMaterial from "./UploadMaterial";
import { MATERIAL_TYPES, getId, courseOf, batchOf, statusOf, typeOf, typeLabel, linkOf, uploaderName, uploaderId, sameText } from "./materialUtils";

const selectClass = "px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white disabled:bg-slate-50 disabled:text-slate-400";

const ManageMaterials = () => {
  const role = getCurrentRole();
  const me = getCurrentUser();
  const myId = me?._id || me?.id || "";
  const isStudent = role === ROLE.STUDENT;
  const isFaculty = role === ROLE.FACULTY;
  const canUpload = role === ROLE.SUPER_ADMIN || isFaculty; // office staff and students: read only

  const [rows, setRows] = useState([]);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [batchMap, setBatchMap] = useState({}); // courseId -> batches
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [busyId, setBusyId] = useState(null);

  const [filters, setFilters] = useState({ course: "", batch: "", subject: "", type: "", q: "" });
  const [form, setForm] = useState(null); // null = closed, {} = upload, material = edit
  const [player, setPlayer] = useState(null); // { url, title } while a video is playing

  // Materials + courses + (faculty) my assignments
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getMaterials({ student: isStudent }),
      getCourses().catch(() => []),
      isFaculty ? getAssignments().catch(() => []) : Promise.resolve([]),
    ])
      .then(([list, courseList, assigned]) => {
        if (cancelled) return;
        setRows(list);
        setCourses(courseList);
        setAssignments(assigned);
        setError("");
      })
      .catch((err) => !cancelled && setError(getErrorMessage(err, "Could not load study material")))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [reloadKey, isStudent, isFaculty]);

  const reload = () => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  const closePlayer = () => {
    if (player) window.URL.revokeObjectURL(player.url);
    setPlayer(null);
  };

  // Batch names for the courses that appear in the list / filter
  const courseIds = useMemo(
    () => [...new Set([...rows.map(courseOf), filters.course].filter(Boolean))].sort().join(","),
    [rows, filters.course]
  );
  useEffect(() => {
    if (!courseIds) return undefined;
    let cancelled = false;
    Promise.all(courseIds.split(",").map((id) => getBatches(id).then((l) => [id, l]).catch(() => [id, []]))).then(
      (pairs) => !cancelled && setBatchMap(Object.fromEntries(pairs))
    );
    return () => {
      cancelled = true;
    };
  }, [courseIds]);

  const courseNames = useMemo(() => Object.fromEntries(courses.map((c) => [c.id || c._id, c.name])), [courses]);
  const batchNames = useMemo(
    () => Object.fromEntries(Object.values(batchMap).flat().map((b) => [b.id || b._id, b.name])),
    [batchMap]
  );
  const courseLabel = (m) => relName(pick(m, "course_id", "course"), courseNames) || "-";
  const batchLabel = (m) => relName(pick(m, "batch_id", "batch"), batchNames) || "-";

  // Faculty may change only material of their assigned course + batch + subject (or that they uploaded)
  const canManage = (m) => {
    if (role === ROLE.SUPER_ADMIN) return true;
    if (!isFaculty) return false;
    if (uploaderId(m) && uploaderId(m) === myId) return true;
    return assignments.some(
      (a) =>
        relId(pick(a, "course_id", "course")) === courseOf(m) &&
        relId(pick(a, "batch_id", "batch")) === batchOf(m) &&
        sameText(a.subject, m.subject)
    );
  };

  const setFilter = (key) => (e) => {
    const value = e.target.value;
    setFilters((f) => ({ ...f, [key]: value, ...(key === "course" ? { batch: "" } : {}) }));
  };

  const subjectOptions = useMemo(() => [...new Set(rows.map((m) => m.subject).filter(Boolean))].sort(), [rows]);

  const shown = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return rows.filter((m) => {
      if (isStudent && statusOf(m) !== "published") return false;
      if (filters.course && courseOf(m) !== filters.course) return false;
      if (filters.batch && batchOf(m) !== filters.batch) return false;
      if (filters.subject && m.subject !== filters.subject) return false;
      if (filters.type && typeOf(m) !== filters.type) return false;
      if (!q) return true;
      return [m.title, m.subject, m.description, uploaderName(m)].some((v) => String(v ?? "").toLowerCase().includes(q));
    });
  }, [rows, filters, isStudent]);

  const open = async (m, mode) => {
    const link = linkOf(m);
    if (link && !m.file_path) {
      window.open(link, "_blank", "noopener");
      return;
    }
    setBusyId(getId(m));
    setError("");
    try {
      const res = await openMaterialFile(getId(m), { student: isStudent, mode, fallbackName: m.title || "material" });
      if (res?.kind === "video") setPlayer({ url: res.url, title: m.title });
    } catch (err) {
      setError(getErrorMessage(err, "Could not open the file"));
    } finally {
      setBusyId(null);
    }
  };

  // DELETE /materials/:id
  const handleDelete = async (m) => {
    if (!window.confirm(`Delete "${m.title}"? Students will no longer see it.`)) return;
    setBusyId(getId(m));
    setError("");
    try {
      await deleteMaterial(getId(m));
      setNotice(`"${m.title}" deleted`);
      reload();
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete the material"));
    } finally {
      setBusyId(null);
    }
  };

  const filterBatches = batchMap[filters.course] || [];
  const filtered = !!(filters.course || filters.batch || filters.subject || filters.type || filters.q);

  return (
    <div>
      <PageHeader
        title="Study Material"
        subtitle={isStudent ? "Published notes and files for your batch" : "Notes, presentations and videos for each batch and subject"}
      />

      {notice && <Notice onClose={() => setNotice("")}>{notice}</Notice>}
      {error && <Notice tone="error">{error}</Notice>}

      <div>
        <Toolbar value={filters.q} onChange={(v) => setFilters((f) => ({ ...f, q: v }))} placeholder="Search title, subject or uploader">
          <button onClick={reload} aria-label="Refresh" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm hover:bg-gray-50">
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          {canUpload && (
            <AddButton onClick={() => setForm({})}>
              Upload material
            </AddButton>
          )}
        </Toolbar>
        <div className="flex flex-wrap gap-2 mb-4">
          <select value={filters.course} onChange={setFilter("course")} className={selectClass}>
            <option value="">All courses</option>
            {courses.map((c) => (
              <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>
            ))}
          </select>
          <select value={filters.batch} onChange={setFilter("batch")} disabled={!filters.course} className={selectClass}>
            <option value="">{filters.course ? "All batches" : "Pick a course first"}</option>
            {filterBatches.map((b) => (
              <option key={b.id || b._id} value={b.id || b._id}>{b.name}</option>
            ))}
          </select>
          <select value={filters.subject} onChange={setFilter("subject")} className={selectClass}>
            <option value="">All subjects</option>
            {subjectOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select value={filters.type} onChange={setFilter("type")} className={selectClass}>
            <option value="">All types</option>
            {MATERIAL_TYPES.map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      <TableCard>
        <table className="w-full text-sm text-left">
          <thead className="bg-[#0B1437] text-white">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Subject</th>
              <th className="px-4 py-3">Course / Batch</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Uploaded by</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-500">Loading study material...</td></tr>
            ) : shown.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                  {filtered ? "No material matches your filters." : canUpload ? "No material yet. Upload the first one." : "No study material available yet."}
                </td>
              </tr>
            ) : (
              shown.map((m, i) => {
                const isLink = !!linkOf(m) && !m.file_path;
                const manage = canManage(m);
                const status = statusOf(m);
                return (
                  <tr key={getId(m) || i}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{m.title}</p>
                      {m.description && <p className="text-xs text-slate-500 max-w-xs truncate">{m.description}</p>}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{m.subject || "-"}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <p>{courseLabel(m)}</p>
                      <p className="text-xs text-slate-500">{batchLabel(m)}</p>
                    </td>
                    <td className="px-4 py-3"><StatusPill tone="blue">{typeLabel(typeOf(m))}</StatusPill></td>
                    <td className="px-4 py-3 text-slate-600">{uploaderName(m)}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{fmtDate(m.created_at || m.createdAt || m.uploaded_at)}</td>
                    <td className="px-4 py-3"><StatusPill tone={status === "published" ? "green" : "amber"}>{titleCase(status)}</StatusPill></td>
                    <td className="px-4 py-3 text-right">
                      <RowMenu
                        items={[
                          { label: isLink ? "Open link" : "View", icon: isLink ? ExternalLink : Eye, hidden: !isLink && ["ppt", "doc"].includes(typeOf(m)), disabled: busyId === getId(m), onClick: () => open(m, "view") },
                          { label: "Download", icon: Download, hidden: isLink, disabled: busyId === getId(m), onClick: () => open(m, "download") },
                          { label: "Edit", icon: Pencil, hidden: !manage, onClick: () => setForm(m) },
                          { label: "Delete", icon: Trash2, danger: true, hidden: !manage, disabled: busyId === getId(m), onClick: () => handleDelete(m) },
                        ]}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </TableCard>

      {player && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={closePlayer}>
          <div
            className="rounded-xl bg-black overflow-hidden shadow-2xl"
            style={{ width: "min(92vw, 720px)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-2 bg-[#0B1437] text-white text-sm">
              <span className="truncate pr-3">{player.title}</span>
              <button onClick={closePlayer} aria-label="Close"><X size={18} /></button>
            </div>
            <video
              src={player.url}
              controls
              autoPlay
              style={{ display: "block", width: "100%", height: "min(60vh, 405px)", objectFit: "contain", background: "#000" }}
            />
          </div>
        </div>
      )}

      {form && (
        <UploadMaterial
          editing={getId(form) ? form : null}
          courses={courses}
          myAssignments={assignments}
          onClose={() => setForm(null)}
          onSaved={(msg) => {
            setForm(null);
            setNotice(msg);
            reload();
          }}
        />
      )}
    </div>
  );
};

export default ManageMaterials;
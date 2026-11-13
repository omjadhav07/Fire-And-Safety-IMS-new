// import React, { useEffect, useState } from "react";
// import { createMaterial, updateMaterial } from "./materialService";
// import { getBatches } from "../courses/courseService";
// import { getErrorMessage } from "../../services/api";
// import Modal from "../../components/Modal";
// import Field from "../../components/Field";
// import { inputClass, titleCase } from "../../services/helpers";
// import { pick, relId } from "../schedules/scheduleUtils";
// import { ROLE, getCurrentRole } from "../../config/permissions";
// import { MATERIAL_TYPES, STATUSES, emptyMaterial, courseOf, batchOf, typeOf, linkOf, statusOf } from "./materialUtils";

// const ACCEPT = {
//   pdf: ".pdf",
//   ppt: ".ppt,.pptx",
//   doc: ".doc,.docx",
//   notes: ".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png",
// };

// // Upload / edit study material (popup, same style as the exam popup).
// // Faculty can only pick the course, batch and subject assigned to them; Super Admin can pick anything.
// const UploadMaterial = ({ editing, courses, myAssignments, onSaved, onClose }) => {
//   const isFaculty = getCurrentRole() === ROLE.FACULTY;

//   const [form, setForm] = useState(
//     editing
//       ? {
//           ...emptyMaterial,
//           title: editing.title || "",
//           description: editing.description || "",
//           course_id: courseOf(editing),
//           batch_id: batchOf(editing),
//           subject: editing.subject || "",
//           type: typeOf(editing) || "pdf",
//           link: linkOf(editing),
//           status: statusOf(editing),
//         }
//       : emptyMaterial
//   );
//   const [file, setFile] = useState(null);
//   const [batches, setBatches] = useState([]);
//   const [batchesLoading, setBatchesLoading] = useState(!!form.course_id);
//   const [error, setError] = useState("");
//   const [saving, setSaving] = useState(false);

//   // Courses this user may use
//   const assignedCourseIds = new Set(myAssignments.map((a) => relId(pick(a, "course_id", "course"))));
//   const courseOptions = isFaculty ? courses.filter((c) => assignedCourseIds.has(c.id || c._id)) : courses;

//   // Batches of the chosen course (faculty: only their assigned batches)
//   useEffect(() => {
//     if (!form.course_id) return undefined;
//     let cancelled = false;
//     getBatches(form.course_id)
//       .then((list) => !cancelled && (setBatches(list), setBatchesLoading(false)))
//       .catch((err) => !cancelled && (setError(getErrorMessage(err, "Could not load batches")), setBatchesLoading(false)));
//     return () => {
//       cancelled = true;
//     };
//   }, [form.course_id]);

//   const assignedHere = myAssignments.filter(
//     (a) => relId(pick(a, "course_id", "course")) === form.course_id && (!form.batch_id || relId(pick(a, "batch_id", "batch")) === form.batch_id)
//   );
//   const assignedBatchIds = new Set(
//     myAssignments.filter((a) => relId(pick(a, "course_id", "course")) === form.course_id).map((a) => relId(pick(a, "batch_id", "batch")))
//   );
//   const batchOptions = isFaculty ? batches.filter((b) => assignedBatchIds.has(b.id || b._id)) : batches;
//   const subjects = [...new Set(assignedHere.map((a) => a.subject).filter(Boolean))];

//   const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
//   const changeCourse = (e) => {
//     setBatches([]);
//     setBatchesLoading(!!e.target.value);
//     setForm({ ...form, course_id: e.target.value, batch_id: "", subject: "" });
//   };
//   const changeBatch = (e) => setForm({ ...form, batch_id: e.target.value, subject: "" });

//   const isVideo = form.type === "video";

//   const validate = () => {
//     if (!form.title.trim()) return "Title is required";
//     if (!form.course_id) return "Select a course";
//     if (!form.batch_id) return "Select a batch";
//     if (!form.subject.trim()) return "Select the subject";
//     if (isVideo) {
//       if (!form.link.trim() && !file && !(editing && linkOf(editing))) return "Paste the video link or choose a video file";
//     } else if (!file && !editing) {
//       return "Choose a file to upload";
//     }
//     return "";
//   };

//   // POST /materials   or   PUT /materials/:id
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const problem = validate();
//     if (problem) return setError(problem);

//     const values = {
//       title: form.title.trim(),
//       description: form.description.trim(),
//       course_id: form.course_id,
//       batch_id: form.batch_id,
//       subject: form.subject.trim(),
//       topic: form.title.trim(),
//       type: form.type,
//       status: form.status,
//     };
//     if (isVideo && form.link.trim()) values.link = form.link.trim();

//     setSaving(true);
//     setError("");
//     try {
//       if (editing) await updateMaterial(editing.id || editing._id, values, file);
//       else await createMaterial(values, file);
//       onSaved(editing ? `"${values.title}" updated` : `"${values.title}" uploaded`);
//     } catch (err) {
//       setError(getErrorMessage(err, "Could not save the material"));
//       setSaving(false);
//     }
//   };

//   const noAssignment = isFaculty && courseOptions.length === 0;

//   return (
//     <Modal title={editing ? "Edit material" : "Upload material"} onClose={onClose} maxWidth="max-w-2xl">
//       <form onSubmit={handleSubmit} className="space-y-4" noValidate>
//         {error && <p className="text-sm text-red-600">{error}</p>}
//         {noAssignment && (
//           <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
//             You have no batches assigned yet. Ask the admin to assign you in Faculty Assignments.
//           </p>
//         )}

//         <Field label="Title">
//           <input value={form.title} onChange={set("title")} placeholder="Fire Extinguisher Types - Notes" className={inputClass} />
//         </Field>
//         <Field label="Description">
//           <textarea rows={2} value={form.description} onChange={set("description")} placeholder="Short note for students (optional)" className={inputClass} />
//         </Field>

//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//           <Field label="Course">
//             <select value={form.course_id} onChange={changeCourse} className={inputClass}>
//               <option value="">Select course</option>
//               {courseOptions.map((c) => (
//                 <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>
//               ))}
//             </select>
//           </Field>
//           <Field label="Batch">
//             <select value={form.batch_id} onChange={changeBatch} disabled={!form.course_id || batchesLoading} className={`${inputClass} disabled:bg-gray-50`}>
//               <option value="">{!form.course_id ? "Pick a course first" : batchesLoading ? "Loading..." : "Select batch"}</option>
//               {batchOptions.map((b) => (
//                 <option key={b.id || b._id} value={b.id || b._id}>{b.name}</option>
//               ))}
//             </select>
//           </Field>
//           <Field label="Subject">
//             {isFaculty || subjects.length > 0 ? (
//               <select value={form.subject} onChange={set("subject")} disabled={!form.batch_id} className={`${inputClass} disabled:bg-gray-50`}>
//                 <option value="">{form.batch_id ? "Select subject" : "Pick a batch first"}</option>
//                 {[...new Set([...(form.subject ? [form.subject] : []), ...subjects])].map((s) => (
//                   <option key={s} value={s}>{s}</option>
//                 ))}
//               </select>
//             ) : (
//               <input value={form.subject} onChange={set("subject")} disabled={!form.batch_id} placeholder="Subject" className={`${inputClass} disabled:bg-gray-50`} />
//             )}
//           </Field>
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           <Field label="Type">
//             <select value={form.type} onChange={(e) => { setFile(null); setForm({ ...form, type: e.target.value }); }} className={inputClass}>
//               {MATERIAL_TYPES.map(([v, l]) => (
//                 <option key={v} value={v}>{l}</option>
//               ))}
//             </select>
//           </Field>
//           <Field label="Status">
//             <select value={form.status} onChange={set("status")} className={inputClass}>
//               {STATUSES.map((s) => (
//                 <option key={s} value={s}>{titleCase(s)}</option>
//               ))}
//             </select>
//           </Field>
//         </div>

//         {isVideo && (
//           <Field label="Video link">
//             <input value={form.link} onChange={set("link")} placeholder="https://youtu.be/..." className={inputClass} />
//             <p className="text-xs text-gray-500 mt-1">Or upload a video file below.</p>
//           </Field>
//         )}
//         <Field label={isVideo ? "Video file (optional)" : editing ? "Replace file (optional)" : "File"}>
//           <input
//             type="file"
//             accept={isVideo ? "video/*" : ACCEPT[form.type]}
//             onChange={(e) => setFile(e.target.files?.[0] || null)}
//             className="block w-full text-sm text-gray-600 file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-sky-50 file:text-sky-700 file:font-medium hover:file:bg-sky-100"
//           />
//         </Field>

//         <div className="flex justify-end gap-3 pt-2">
//           <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
//             Cancel
//           </button>
//           <button type="submit" disabled={saving || noAssignment} className="px-5 py-2.5 rounded-lg bg-[#0EA5E9] text-white font-medium hover:bg-[#0284C7] disabled:opacity-60">
//             {saving ? "Saving..." : editing ? "Save changes" : "Upload material"}
//           </button>
//         </div>
//       </form>
//     </Modal>
//   );
// };

// export default UploadMaterial;




import React, { useEffect, useState } from "react";
import { createMaterial, updateMaterial } from "./materialService";
import { getBatches } from "../courses/courseService";
import { getErrorMessage } from "../../services/api";
import Modal from "../../components/Modal";
import Field from "../../components/Field";
import { inputClass } from "../../services/helpers";
import { pick, relId } from "../schedules/scheduleUtils";
import { ROLE, getCurrentRole } from "../../config/permissions";
import { MATERIAL_TYPES, emptyMaterial, courseOf, batchOf, typeOf, linkOf } from "./materialUtils";

const ACCEPT = {
  pdf: ".pdf",
  ppt: ".ppt,.pptx",
  doc: ".doc,.docx",
  notes: ".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png",
};

// Upload / edit study material (popup, same style as the exam popup).
// Faculty can only pick the course, batch and subject assigned to them; Super Admin can pick anything.
const UploadMaterial = ({ editing, courses, myAssignments, onSaved, onClose }) => {
  const isFaculty = getCurrentRole() === ROLE.FACULTY;

  const [form, setForm] = useState(
    editing
      ? {
          ...emptyMaterial,
          title: editing.title || "",
          description: editing.description || "",
          course_id: courseOf(editing),
          batch_id: batchOf(editing),
          subject: editing.subject || "",
          type: typeOf(editing) || "pdf",
          link: linkOf(editing),
        }
      : emptyMaterial
  );
  const [file, setFile] = useState(null);
  const [batches, setBatches] = useState([]);
  const [batchesLoading, setBatchesLoading] = useState(!!form.course_id);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);

  // Courses this user may use
  const assignedCourseIds = new Set(myAssignments.map((a) => relId(pick(a, "course_id", "course"))));
  const courseOptions = isFaculty ? courses.filter((c) => assignedCourseIds.has(c.id || c._id)) : courses;

  // Batches of the chosen course (faculty: only their assigned batches)
  useEffect(() => {
    if (!form.course_id) return undefined;
    let cancelled = false;
    getBatches(form.course_id)
      .then((list) => !cancelled && (setBatches(list), setBatchesLoading(false)))
      .catch((err) => !cancelled && (setError(getErrorMessage(err, "Could not load batches")), setBatchesLoading(false)));
    return () => {
      cancelled = true;
    };
  }, [form.course_id]);

  const assignedHere = myAssignments.filter(
    (a) => relId(pick(a, "course_id", "course")) === form.course_id && (!form.batch_id || relId(pick(a, "batch_id", "batch")) === form.batch_id)
  );
  const assignedBatchIds = new Set(
    myAssignments.filter((a) => relId(pick(a, "course_id", "course")) === form.course_id).map((a) => relId(pick(a, "batch_id", "batch")))
  );
  const batchOptions = isFaculty ? batches.filter((b) => assignedBatchIds.has(b.id || b._id)) : batches;
  const subjects = [...new Set(assignedHere.map((a) => a.subject).filter(Boolean))];

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const changeCourse = (e) => {
    setBatches([]);
    setBatchesLoading(!!e.target.value);
    setForm({ ...form, course_id: e.target.value, batch_id: "", subject: "" });
  };
  const changeBatch = (e) => setForm({ ...form, batch_id: e.target.value, subject: "" });

  const isVideo = form.type === "video";

  const validate = () => {
    if (!form.title.trim()) return "Title is required";
    if (!form.course_id) return "Select a course";
    if (!form.batch_id) return "Select a batch";
    if (!form.subject.trim()) return "Select the subject";
    if (isVideo) {
      if (!form.link.trim() && !file && !(editing && linkOf(editing))) return "Paste the video link or choose a video file";
    } else if (!file && !editing) {
      return "Choose a file to upload";
    }
    if (file) {
      if (isVideo && !/^video\//i.test(file.type || "")) return "Choose a valid video file (MP4, MOV or WEBM)";
      if (!isVideo) {
        const exts = (ACCEPT[form.type] || "").split(",").filter(Boolean);
        if (exts.length && !exts.some((x) => file.name.toLowerCase().endsWith(x))) return `Allowed file types: ${exts.join(", ")}`;
      }
    }
    return "";
  };

  // POST /materials   or   PUT /materials/:id
  const handleSubmit = async (e) => {
    e.preventDefault();
    const problem = validate();
    if (problem) return setError(problem);

    const values = {
      title: form.title.trim(),
      description: form.description.trim(),
      course_id: form.course_id,
      batch_id: form.batch_id,
      subject: form.subject.trim(),
      topic: form.title.trim(),
    };
    if (isVideo && form.link.trim() && !file) values.link = form.link.trim();

    setSaving(true);
    setProgress(0);
    setError("");
    try {
      const msg = editing ? `"${values.title}" updated` : `"${values.title}" uploaded`;
      if (editing) await updateMaterial(editing.id || editing._id, values, file, setProgress);
      else await createMaterial(values, file, setProgress);
      onSaved(msg);
    } catch (err) {
      setError(getErrorMessage(err, "Could not save the material"));
      setSaving(false);
    }
  };

  const noAssignment = isFaculty && courseOptions.length === 0;

  return (
    <Modal title={editing ? "Edit material" : "Upload material"} onClose={onClose} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {noAssignment && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            You have no batches assigned yet. Ask the admin to assign you in Faculty Assignments.
          </p>
        )}

        <Field label="Title">
          <input value={form.title} onChange={set("title")} placeholder="Fire Extinguisher Types - Notes" className={inputClass} />
        </Field>
        <Field label="Description">
          <textarea rows={2} value={form.description} onChange={set("description")} placeholder="Short note for students (optional)" className={inputClass} />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Course">
            <select value={form.course_id} onChange={changeCourse} className={inputClass}>
              <option value="">Select course</option>
              {courseOptions.map((c) => (
                <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Batch">
            <select value={form.batch_id} onChange={changeBatch} disabled={!form.course_id || batchesLoading} className={`${inputClass} disabled:bg-gray-50`}>
              <option value="">{!form.course_id ? "Pick a course first" : batchesLoading ? "Loading..." : "Select batch"}</option>
              {batchOptions.map((b) => (
                <option key={b.id || b._id} value={b.id || b._id}>{b.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Subject">
            {isFaculty || subjects.length > 0 ? (
              <select value={form.subject} onChange={set("subject")} disabled={!form.batch_id} className={`${inputClass} disabled:bg-gray-50`}>
                <option value="">{form.batch_id ? "Select subject" : "Pick a batch first"}</option>
                {[...new Set([...(form.subject ? [form.subject] : []), ...subjects])].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            ) : (
              <input value={form.subject} onChange={set("subject")} disabled={!form.batch_id} placeholder="Subject" className={`${inputClass} disabled:bg-gray-50`} />
            )}
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Field label="Type">
            <select value={form.type} onChange={(e) => { setFile(null); setForm({ ...form, type: e.target.value }); }} className={inputClass}>
              {MATERIAL_TYPES.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </Field>
        </div>

        {isVideo && (
          <Field label="Video link">
            <input value={form.link} onChange={set("link")} placeholder="https://youtu.be/..." className={inputClass} />
            <p className="text-xs text-gray-500 mt-1">Or upload a video file below.</p>
          </Field>
        )}
        <Field label={isVideo ? "Video file (optional)" : editing ? "Replace file (optional)" : "File"}>
          <input
            type="file"
            accept={isVideo ? "video/*" : ACCEPT[form.type]}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-600 file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-sky-50 file:text-sky-700 file:font-medium hover:file:bg-sky-100"
          />
        </Field>

        {saving && file && (
          <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
            <div className="h-full bg-sky-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={saving || noAssignment} className="px-5 py-2.5 rounded-lg bg-[#0EA5E9] text-white font-medium hover:bg-[#0284C7] disabled:opacity-60">
            {saving ? (file && progress < 100 ? `Uploading... ${progress}%` : "Saving...") : editing ? "Save changes" : "Upload material"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UploadMaterial;
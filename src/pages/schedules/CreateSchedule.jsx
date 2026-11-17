
// import React from "react";
// import { AlertTriangle } from "lucide-react";
// import Modal from "../../components/Modal";
// import { getId, inputClass } from "../../services/helpers";
// import { today } from "./scheduleUtils";
// import Field from "../../components/Field";

// // CreateSchedule (popup)
// const CreateSchedule = ({ assignedFacultyIds, batchChosen, changeCourse, changeFaculty, courses, editing, facultyOptions, form, formBatches, formBatchesLoading, formError, handleSave, noAssignment, saving, set, setForm, setShowForm, subjectSuggestions }) => (
//   <Modal title={editing ? "Edit class schedule" : "Schedule class"} onClose={() => setShowForm(false)} maxWidth="max-w-lg">
//     <form onSubmit={handleSave} className="space-y-4" noValidate>
//       {formError && (
//         <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">{formError}</div>
//       )}
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//         <Field label="Course">
//           <select value={form.course_id} onChange={changeCourse} className={inputClass}>
//             <option value="">Select course</option>
//             {courses.map((c) => (
//               <option key={getId(c)} value={getId(c)}>{c.name}</option>
//             ))}
//           </select>
//         </Field>
//         <Field label="Batch">
//           <select
//             value={form.batch_id}
//             onChange={(e) => setForm({ ...form, batch_id: e.target.value, faculty_id: "" })}
//             disabled={!form.course_id || formBatchesLoading}
//             className={`${inputClass} disabled:bg-gray-50 disabled:text-gray-400`}
//           >
//             <option value="">
//               {!form.course_id ? "Select a course first" : formBatchesLoading ? "Loading batches..." : "Select batch"}
//             </option>
//             {formBatches.map((b) => (
//               <option key={getId(b)} value={getId(b)}>{b.name}</option>
//             ))}
//           </select>
//         </Field>

//         <Field label="Subject" className="sm:col-span-2">
//           <input
//             value={form.subject}
//             onChange={set("subject")}
//             list="schedule-subjects"
//             placeholder="Fire Safety Basics"
//             className={inputClass}
//           />
//           <datalist id="schedule-subjects">
//             {subjectSuggestions.map((s) => (
//               <option key={s} value={s} />
//             ))}
//           </datalist>
//         </Field>

//         <Field label="Faculty" className="sm:col-span-2">
//           <select value={form.faculty_id} onChange={changeFaculty} className={inputClass} disabled={!form.subject}>
//             <option value="">{form.subject ? "Select faculty" : "Enter a subject first"}</option>
//             {facultyOptions.map((f) => (
//               <option key={getId(f)} value={getId(f)}>{f.name || f.email}</option>
//             ))}
//           </select>
          
//           {batchChosen && facultyOptions.length > 0 && (
//             <p className="text-xs text-gray-500 mt-1">Showing faculty assigned to this batch and subject.</p>
//           )}
//           {noAssignment && (
//             <p className="mt-1 flex items-start gap-1.5 text-xs text-red-600 font-medium">
//               <AlertTriangle size={13} className="mt-0.5 shrink-0" />
//               No faculty is assigned to "{form.subject}" for this batch. Please assign them in Faculty Assignments first.
//             </p>
//           )}
//         </Field>

//         <Field label="Date" className="sm:col-span-2">
//           <input type="date" value={form.date} min={editing ? undefined : today()} onChange={set("date")} className={inputClass} />
//         </Field>
//         <Field label="Start time">
//           <input type="time" value={form.start_time} onChange={set("start_time")} className={inputClass} />
//         </Field>
//         <Field label="End time">
//           <input type="time" value={form.end_time} onChange={set("end_time")} className={inputClass} />
//         </Field>
//       </div>

//       <div className="flex justify-end gap-3 pt-2">
//         <button
//           type="button"
//           onClick={() => setShowForm(false)}
//           className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
//         >
//           Cancel
//         </button>
//         <button
//           type="submit"
//           disabled={saving || !form.faculty_id}
//           className="px-5 py-2.5 rounded-lg bg-[#0EA5E9] text-white font-medium hover:bg-[#0284C7] disabled:opacity-60"
//         >
//           {saving ? "Saving..." : editing ? "Save changes" : "Schedule class"}
//         </button>
//       </div>
//     </form>
//   </Modal>
// );

// export default CreateSchedule;



import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import Modal from "../../components/Modal";
import { getId, inputClass } from "../../services/helpers";
import { today, pick, relId } from "./scheduleUtils";
import Field from "../../components/Field";
import { getSubjects } from "../subjects/subjectService";

// CreateSchedule (popup)
const CreateSchedule = ({ assignedFacultyIds, batchChosen, changeCourse, changeFaculty, courses, editing, facultyOptions, form, formBatches, formBatchesLoading, formError, handleSave, noAssignment, saving, set, setForm, setShowForm }) => {
  // Subjects come from the subject master (Course Master > Subjects) and follow the chosen course
  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [subjectsError, setSubjectsError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getSubjects()
      .then((list) => !cancelled && setSubjects(list))
      .catch(() => !cancelled && setSubjectsError("Could not load the subjects"))
      .finally(() => !cancelled && setSubjectsLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const courseSubjects = useMemo(
    () => [
      ...new Set(
        subjects
          .filter((x) => relId(pick(x, "course_id", "course")) === form.course_id)
          .map((x) => x.name)
          .filter(Boolean)
      ),
    ],
    [subjects, form.course_id]
  );
  // When editing, the schedule's current subject stays selectable even if it is not in the master
  const subjectOptions = editing && form.subject && !courseSubjects.includes(form.subject) ? [form.subject, ...courseSubjects] : courseSubjects;

  // A subject chosen for another course is cleared when the course changes (new schedules only)
  useEffect(() => {
    if (!editing && !subjectsLoading && form.subject && !courseSubjects.includes(form.subject)) {
      setForm((f) => ({ ...f, subject: "", faculty_id: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseSubjects, subjectsLoading]);

  return (
    <Modal title={editing ? "Edit class schedule" : "Schedule class"} onClose={() => setShowForm(false)} maxWidth="max-w-lg">
      <form onSubmit={handleSave} className="space-y-4" noValidate>
        {formError && (
          <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">{formError}</div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Course">
            <select value={form.course_id} onChange={changeCourse} className={inputClass}>
              <option value="">Select course</option>
              {courses.map((c) => (
                <option key={getId(c)} value={getId(c)}>{c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Batch">
            <select
              value={form.batch_id}
              onChange={(e) => setForm({ ...form, batch_id: e.target.value, faculty_id: "" })}
              disabled={!form.course_id || formBatchesLoading}
              className={`${inputClass} disabled:bg-gray-50 disabled:text-gray-400`}
            >
              <option value="">
                {!form.course_id ? "Select a course first" : formBatchesLoading ? "Loading batches..." : "Select batch"}
              </option>
              {formBatches.map((b) => (
                <option key={getId(b)} value={getId(b)}>{b.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Subject" className="sm:col-span-2">
            <select
              value={form.subject}
              onChange={set("subject")}
              disabled={!form.course_id || subjectsLoading}
              className={`${inputClass} disabled:bg-gray-50 disabled:text-gray-400`}
            >
              <option value="">
                {!form.course_id ? "Select a course first" : subjectsLoading ? "Loading subjects..." : "Select subject"}
              </option>
              {subjectOptions.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            {subjectsError && <p className="text-xs text-red-600 mt-1">{subjectsError}</p>}
            {form.course_id && !subjectsLoading && !subjectsError && subjectOptions.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">This course has no subjects yet. Add them in Course Master &gt; Subjects.</p>
            )}
          </Field>

          <Field label="Faculty" className="sm:col-span-2">
            <select value={form.faculty_id} onChange={changeFaculty} className={inputClass} disabled={!form.subject}>
              <option value="">{form.subject ? "Select faculty" : "Select a subject first"}</option>
              {facultyOptions.map((f) => (
                <option key={getId(f)} value={getId(f)}>{f.name || f.email}</option>
              ))}
            </select>

            {batchChosen && facultyOptions.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">Showing faculty assigned to this batch and subject.</p>
            )}
            {noAssignment && (
              <p className="mt-1 flex items-start gap-1.5 text-xs text-red-600 font-medium">
                <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                No faculty is assigned to "{form.subject}" for this batch. Please assign them in Faculty Assignments first.
              </p>
            )}
          </Field>

          <Field label="Date" className="sm:col-span-2">
            <input type="date" value={form.date} min={editing ? undefined : today()} onChange={set("date")} className={inputClass} />
          </Field>
          <Field label="Start time">
            <input type="time" value={form.start_time} onChange={set("start_time")} className={inputClass} />
          </Field>
          <Field label="End time">
            <input type="time" value={form.end_time} onChange={set("end_time")} className={inputClass} />
          </Field>
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
            disabled={saving || !form.faculty_id}
            className="px-5 py-2.5 rounded-lg bg-[#0EA5E9] text-white font-medium hover:bg-[#0284C7] disabled:opacity-60"
          >
            {saving ? "Saving..." : editing ? "Save changes" : "Schedule class"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateSchedule;  
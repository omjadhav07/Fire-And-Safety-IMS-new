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

//         <Field label="Faculty" className="sm:col-span-2">
//           <select value={form.faculty_id} onChange={changeFaculty} className={inputClass}>
//             <option value="">Select faculty</option>
//             {facultyOptions.map((f) => (
//               <option key={getId(f)} value={getId(f)}>{f.name || f.email}</option>
//             ))}
//           </select>
//           {batchChosen && assignedFacultyIds.size > 0 && (
//             <p className="text-xs text-gray-500 mt-1">Showing faculty assigned to this batch.</p>
//           )}
//           {noAssignment && (
//             <p className="mt-1 flex items-start gap-1.5 text-xs text-amber-700">
//               <AlertTriangle size={13} className="mt-0.5 shrink-0" />
//               No faculty is assigned to this batch yet. Assign one in Faculty Assignments first, or the schedule will be rejected.
//             </p>
//           )}
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
//           disabled={saving}
//           className="px-5 py-2.5 rounded-lg bg-[#0EA5E9] text-white font-medium hover:bg-[#0284C7] disabled:opacity-60"
//         >
//           {saving ? "Saving..." : editing ? "Save changes" : "Schedule class"}
//         </button>
//       </div>
//     </form>
//   </Modal>
// );

// export default CreateSchedule;



import React from "react";
import { AlertTriangle } from "lucide-react";
import Modal from "../../components/Modal";
import { getId, inputClass } from "../../services/helpers";
import { today } from "./scheduleUtils";
import Field from "../../components/Field";

// CreateSchedule (popup)
const CreateSchedule = ({ assignedFacultyIds, batchChosen, changeCourse, changeFaculty, courses, editing, facultyOptions, form, formBatches, formBatchesLoading, formError, handleSave, noAssignment, saving, set, setForm, setShowForm, subjectSuggestions }) => (
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
          <input
            value={form.subject}
            onChange={set("subject")}
            list="schedule-subjects"
            placeholder="Fire Safety Basics"
            className={inputClass}
          />
          <datalist id="schedule-subjects">
            {subjectSuggestions.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </Field>

        <Field label="Faculty" className="sm:col-span-2">
          <select value={form.faculty_id} onChange={changeFaculty} className={inputClass} disabled={!form.subject}>
            <option value="">{form.subject ? "Select faculty" : "Enter a subject first"}</option>
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

export default CreateSchedule;
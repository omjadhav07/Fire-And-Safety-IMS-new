// import React from "react";
// import { Send } from "lucide-react";
// import Modal from "../../components/Modal";
// import { getId, inputClass } from "../../services/helpers";
// import { TARGET_TYPES } from "./noticeUtils";

// // CreateNotice (popup)
// const CreateNotice = ({ batches, batchesLoading, changeCourse, changeTargetType, courses, editing, form, formError, handleSave, saving, setForm, setShowForm }) => (
//   <Modal title={editing ? "Edit notice" : "New notice"} onClose={() => setShowForm(false)} maxWidth="max-w-lg">
//     <form onSubmit={handleSave} className="space-y-4" noValidate>
//       {formError && <p className="text-sm text-red-600">{formError}</p>}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
//         <input
//           value={form.title}
//           onChange={(e) => setForm({ ...form, title: e.target.value })}
//           placeholder="Holiday notice"
//           className={inputClass}
//         />
//       </div>
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
//         <textarea
//           rows={4}
//           value={form.description}
//           onChange={(e) => setForm({ ...form, description: e.target.value })}
//           placeholder="Write the announcement"
//           className={inputClass}
//         />
//       </div>

//       {!editing && (
//         <>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1.5">Send to</label>
//             <div className="grid grid-cols-3 gap-2">
//               {TARGET_TYPES.map((t) => (
//                 <button
//                   key={t.value}
//                   type="button"
//                   onClick={() => changeTargetType(t.value)}
//                   className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
//                     form.targetType === t.value
//                       ? "border-[#0EA5E9] bg-sky-50 text-sky-700"
//                       : "border-gray-300 text-gray-600 hover:bg-gray-50"
//                   }`}
//                 >
//                   {t.label}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {form.targetType !== "all" && (
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1.5">Course</label>
//               <select value={form.courseId} onChange={(e) => changeCourse(e.target.value)} className={inputClass}>
//                 <option value="">Select course</option>
//                 {courses.map((c) => (
//                   <option key={getId(c)} value={getId(c)}>{c.name}</option>
//                 ))}
//               </select>
//             </div>
//           )}

//           {form.targetType === "batch" && (
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1.5">Batch</label>
//               <select
//                 value={form.batchId}
//                 onChange={(e) => setForm({ ...form, batchId: e.target.value })}
//                 disabled={!form.courseId || batchesLoading}
//                 className={`${inputClass} disabled:bg-gray-50 disabled:text-gray-400`}
//               >
//                 <option value="">
//                   {!form.courseId ? "Select a course first" : batchesLoading ? "Loading batches..." : "Select batch"}
//                 </option>
//                 {batches.map((b) => (
//                   <option key={getId(b)} value={getId(b)}>{b.name}</option>
//                 ))}
//               </select>
//               {form.courseId && !batchesLoading && batches.length === 0 && (
//                 <p className="text-xs text-amber-600 mt-1">This course has no batches yet.</p>
//               )}
//             </div>
//           )}

//           <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
//             <input
//               type="checkbox"
//               checked={form.publishNow}
//               onChange={(e) => setForm({ ...form, publishNow: e.target.checked })}
//               className="w-4 h-4 accent-[#0EA5E9]"
//             />
//             Publish right away
//           </label>
//         </>
//       )}

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
//           {saving ? "Saving..." : editing ? "Save changes" : form.publishNow ? "Create & publish" : "Create notice"}
//         </button>
//       </div>
//     </form>
//   </Modal>
// );

// export default CreateNotice;



import React from "react";
import Modal from "../../components/Modal";
import { inputClass } from "../../services/helpers";

// CreateNotice (popup)
const CreateNotice = ({ editing, form, formError, handleSave, saving, setForm, setShowForm }) => (
  <Modal title={editing ? "Edit notice" : "New notice"} onClose={() => setShowForm(false)} maxWidth="max-w-lg">
    <form onSubmit={handleSave} className="space-y-4" noValidate>
      {formError && <p className="text-sm text-red-600">{formError}</p>}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Holiday notice"
          className={inputClass}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
        <textarea
          rows={4}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Write the announcement"
          className={inputClass}
        />
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
          disabled={saving}
          className="px-5 py-2.5 rounded-lg bg-[#0EA5E9] text-white font-medium hover:bg-[#0284C7] disabled:opacity-60"
        >
          {saving ? "Saving..." : editing ? "Save changes" : "Create notice"}
        </button>
      </div>
    </form>
  </Modal>
);

export default CreateNotice;
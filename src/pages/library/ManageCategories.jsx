// import React, { useEffect, useState } from "react";
// import { Plus, RefreshCw, Pencil } from "lucide-react";
// import { getCategories, createCategory, updateCategory } from "./libraryService";
// import { getErrorMessage } from "../../services/api";
// import { getId } from "../../services/helpers";
// import CreateCategory from "./CreateCategory";
// import { initialForm } from "./categoryUtils";

// const ManageCategories = () => {
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [notice, setNotice] = useState("");
//   const [reloadKey, setReloadKey] = useState(0);

//   const [showForm, setShowForm] = useState(false);
//   const [editing, setEditing] = useState(null); // null = create mode
//   const [form, setForm] = useState(initialForm);
//   const [formError, setFormError] = useState("");
//   const [saving, setSaving] = useState(false);

//   useEffect(() => {
//     let cancelled = false;
//     getCategories()
//       .then((list) => {
//         if (cancelled) return;
//         setCategories(list);
//         setError("");
//       })
//       .catch((err) => !cancelled && setError(getErrorMessage(err, "Could not load categories")))
//       .finally(() => !cancelled && setLoading(false));
//     return () => {
//       cancelled = true;
//     };
//   }, [reloadKey]);

//   const reload = () => {
//     setLoading(true);
//     setReloadKey((k) => k + 1);
//   };

//   const openCreate = () => {
//     setEditing(null);
//     setForm(initialForm);
//     setFormError("");
//     setShowForm(true);
//   };

//   const openEdit = (cat) => {
//     setEditing(cat);
//     setForm({ name: cat.name || "", description: cat.description || "" });
//     setFormError("");
//     setShowForm(true);
//   };

//   // POST /library/categories  or  PUT /library/categories/:id
//   const handleSave = async (e) => {
//     e.preventDefault();
//     if (!form.name.trim()) return setFormError("Category name is required");
//     const body = { name: form.name.trim(), description: form.description.trim() };
//     setSaving(true);
//     try {
//       if (editing) {
//         await updateCategory(getId(editing), body);
//         setNotice(`Category "${body.name}" updated`);
//       } else {
//         await createCategory(body);
//         setNotice(`Category "${body.name}" created`);
//       }
//       setShowForm(false);
//       reload();
//     } catch (err) {
//       setFormError(getErrorMessage(err, editing ? "Could not update category" : "Could not create category"));
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div>
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Book Categories</h1>
//           <p className="text-sm text-gray-500 mt-1">{categories.length} categories</p>
//         </div>
//         <div className="flex items-center gap-3">
//           <button
//             onClick={reload}
//             className="p-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
//             aria-label="Refresh"
//           >
//             <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
//           </button>
//           <button
//             onClick={openCreate}
//             className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0EA5E9] text-white font-medium hover:bg-[#0284C7]"
//           >
//             <Plus size={18} /> Add category
//           </button>
//         </div>
//       </div>

//       {notice && (
//         <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 flex justify-between">
//           <span>{notice}</span>
//           <button onClick={() => setNotice("")} aria-label="Dismiss">×</button>
//         </div>
//       )}
//       {error && (
//         <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>
//       )}

//       <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
//         <table className="w-full text-sm text-left">
//           <thead className="bg-[#0B1437] text-white">
//             <tr>
//               <th className="px-4 py-3 font-medium">Name</th>
//               <th className="px-4 py-3 font-medium">Description</th>
//               <th className="px-4 py-3 font-medium text-right">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-100">
//             {loading ? (
//               <tr>
//                 <td colSpan={3} className="px-4 py-10 text-center text-gray-500">Loading categories...</td>
//               </tr>
//             ) : categories.length === 0 ? (
//               <tr>
//                 <td colSpan={3} className="px-4 py-10 text-center text-gray-500">No categories yet. Add the first one.</td>
//               </tr>
//             ) : (
//               categories.map((c, i) => (
//                 <tr key={getId(c) || i} className="hover:bg-gray-50">
//                   <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
//                   <td className="px-4 py-3 text-gray-600 max-w-md truncate">{c.description || "-"}</td>
//                   <td className="px-4 py-3">
//                     <div className="flex justify-end">
//                       <button
//                         onClick={() => openEdit(c)}
//                         title="Edit category"
//                         className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800"
//                       >
//                         <Pencil size={16} />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {showForm && (
//         <CreateCategory
//           editing={editing}
//           form={form}
//           formError={formError}
//           handleSave={handleSave}
//           saving={saving}
//           setForm={setForm}
//           setShowForm={setShowForm}
//         />
//       )}
//     </div>
//   );
// };

// export default ManageCategories;



import React, { useEffect, useState } from "react";
import { Plus, RefreshCw, Pencil, Trash2 } from "lucide-react";
import { getCategories, createCategory, updateCategory, deleteCategory } from "./libraryService";
import { getErrorMessage } from "../../services/api";
import { getId } from "../../services/helpers";
import CreateCategory from "./CreateCategory";
import { initialForm } from "./categoryUtils";

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [busyId, setBusyId] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null); // null = create mode
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getCategories()
      .then((list) => {
        if (cancelled) return;
        setCategories(list);
        setError("");
      })
      .catch((err) => !cancelled && setError(getErrorMessage(err, "Could not load categories")))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const reload = () => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({ name: cat.name || "", description: cat.description || "" });
    setFormError("");
    setShowForm(true);
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete category "${cat.name}"? This cannot be undone.`)) return;
    setBusyId(getId(cat));
    setError("");
    try {
      await deleteCategory(getId(cat));
      setNotice(`Category "${cat.name}" deleted`);
      reload();
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete category"));
    } finally {
      setBusyId(null);
    }
  };

  // POST /library/categories  or  PUT /library/categories/:id
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setFormError("Category name is required");
    const body = { name: form.name.trim(), description: form.description.trim() };
    setSaving(true);
    try {
      if (editing) {
        await updateCategory(getId(editing), body);
        setNotice(`Category "${body.name}" updated`);
      } else {
        await createCategory(body);
        setNotice(`Category "${body.name}" created`);
      }
      setShowForm(false);
      reload();
    } catch (err) {
      setFormError(getErrorMessage(err, editing ? "Could not update category" : "Could not create category"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Book Categories</h1>
          <p className="text-sm text-gray-500 mt-1">{categories.length} categories</p>
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
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0EA5E9] text-white font-medium hover:bg-[#0284C7]"
          >
            <Plus size={18} /> Add category
          </button>
        </div>
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

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#0B1437] text-white">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center text-gray-500">Loading categories...</td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center text-gray-500">No categories yet. Add the first one.</td>
              </tr>
            ) : (
              categories.map((c, i) => (
                <tr key={getId(c) || i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-md truncate">{c.description || "-"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openEdit(c)}
                        title="Edit category"
                        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(c)}
                        disabled={busyId === getId(c)}
                        title="Delete category"
                        className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <CreateCategory
          editing={editing}
          form={form}
          formError={formError}
          handleSave={handleSave}
          saving={saving}
          setForm={setForm}
          setShowForm={setShowForm}
        />
      )}
    </div>
  );
};

export default ManageCategories;
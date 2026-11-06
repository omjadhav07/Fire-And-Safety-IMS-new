// import React, { useEffect, useState } from "react";
// import { RefreshCw, IndianRupee, CalendarDays, Pencil, Power } from "lucide-react";
// import {
//   getCourses,
//   createCourse,
//   updateCourse,
//   setCourseStatus,
//   getFeeComponents,
// } from "./courseService";
// import { getErrorMessage } from "../../services/api";
// import CreateCourse from "./CreateCourse";
// import { PageHeader, Toolbar, AddButton, TableCard, Notice, StatusPill, RowMenu, btnOutline } from "../../components/ui";
// import { initialForm, getId, isActive } from "./courseUtils";

// const ManageCourses = () => {
//   const [courses, setCourses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [notice, setNotice] = useState("");
//   const [reloadKey, setReloadKey] = useState(0);
//   const [query, setQuery] = useState("");

//   // editing: null = create mode, course object = edit mode
//   const [showForm, setShowForm] = useState(false);
//   const [editing, setEditing] = useState(null);
//   const [form, setForm] = useState(initialForm);
//   const [formError, setFormError] = useState("");
//   const [saving, setSaving] = useState(false);
//   const [busyId, setBusyId] = useState(null);

//   useEffect(() => {
//     let cancelled = false;
//     getCourses()
//       .then((list) => {
//         if (cancelled) return;
//         setCourses(list);
//         setError("");

//         // GET /courses does not return total_fee, so fill it from each course's fee components
//         // (same total shown on the Fee components page). The table shows first, totals appear as they load.
//         const missing = list.filter((c) => c.total_fee === undefined || c.total_fee === null);
//         Promise.all(
//           missing.map((c) =>
//             getFeeComponents(getId(c))
//               .then((r) => [getId(c), r.total])
//               .catch(() => null)
//           )
//         ).then((pairs) => {
//           if (cancelled) return;
//           const totals = Object.fromEntries(pairs.filter(Boolean));
//           setCourses((prev) => prev.map((c) => (getId(c) in totals ? { ...c, total_fee: totals[getId(c)] } : c)));
//         });
//       })
//       .catch((err) => {
//         if (!cancelled) setError(getErrorMessage(err, "Could not load courses"));
//       })
//       .finally(() => {
//         if (!cancelled) setLoading(false);
//       });
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

//   const openEdit = (course) => {
//     setEditing(course);
//     setForm({
//       name: course.name || "",
//       duration: course.duration || "",
//       description: course.description || "",
//     });
//     setFormError("");
//     setShowForm(true);
//   };

//   // POST /courses  or  PUT /courses/:id
//   const handleSave = async (e) => {
//     e.preventDefault();
//     if (!form.name.trim()) return setFormError("Course name is required");
//     if (!form.duration.trim()) return setFormError("Duration is required");
//     const body = {
//       name: form.name.trim(),
//       duration: form.duration.trim(),
//       description: form.description.trim(),
//     };
//     setSaving(true);
//     try {
//       if (editing) {
//         await updateCourse(getId(editing), body);
//         setNotice(`Course "${body.name}" updated`);
//       } else {
//         await createCourse(body);
//         setNotice(`Course "${body.name}" created. Use "Fees" and "Batches" to set it up.`);
//       }
//       setShowForm(false);
//       reload();
//     } catch (err) {
//       setFormError(getErrorMessage(err, editing ? "Could not update course" : "Could not create course"));
//     } finally {
//       setSaving(false);
//     }
//   };

//   // PATCH /courses/:id/status  (soft delete / restore)
//   const handleToggleStatus = async (course) => {
//     const activate = !isActive(course);
//     const message = activate
//       ? `Activate "${course.name}"?`
//       : `Deactivate "${course.name}"? It will not accept new admissions.`;
//     if (!window.confirm(message)) return;
//     setBusyId(getId(course));
//     setError("");
//     try {
//       await setCourseStatus(getId(course), activate ? "active" : "inactive");
//       setNotice(`"${course.name}" ${activate ? "activated" : "deactivated"}`);
//       reload();
//     } catch (err) {
//       setError(getErrorMessage(err, "Could not change course status"));
//     } finally {
//       setBusyId(null);
//     }
//   };

//   const q = query.trim().toLowerCase();
//   const shown = q
//     ? courses.filter((c) => [c.name, c.duration, c.description].some((v) => String(v ?? "").toLowerCase().includes(q)))
//     : courses;

//   return (
//     <div>
//       <PageHeader title="Course Master" subtitle={`Manage ${courses.length} courses, their fees and batches`} />

//       {notice && <Notice onClose={() => setNotice("")}>{notice}</Notice>}
//       {error && <Notice tone="error">{error}</Notice>}

//       <Toolbar value={query} onChange={setQuery} placeholder="Search course, duration or description">
//         <button onClick={reload} className={btnOutline} aria-label="Refresh">
//           <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
//         </button>
//         <AddButton onClick={openCreate}>Add Course</AddButton>
//       </Toolbar>

//       <TableCard>
//         <table className="w-full text-sm text-left">
//           <thead className="bg-[#0B1437] text-white">
//             <tr>
//               <th className="px-4 py-3 w-10"><input type="checkbox" disabled aria-label="Select all" className="accent-[#0EA5E9]" /></th>
//               <th className="px-4 py-3">Course</th>
//               <th className="px-4 py-3">Duration</th>
//               <th className="px-4 py-3">Total fee</th>
//               <th className="px-4 py-3">Status</th>
//               <th className="px-4 py-3 text-right">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-slate-100">
//             {loading ? (
//               <tr>
//                 <td colSpan={6} className="px-4 py-10 text-center text-slate-500">Loading courses...</td>
//               </tr>
//             ) : shown.length === 0 ? (
//               <tr>
//                 <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
//                   {query ? "No courses match your search" : "No courses yet. Add the first one."}
//                 </td>
//               </tr>
//             ) : (
//               shown.map((c, i) => {
//                 const active = isActive(c);
//                 return (
//                   <tr key={getId(c) || i} className={active ? "" : "opacity-70"}>
//                     <td className="px-4 py-3"><input type="checkbox" aria-label={`Select ${c.name}`} className="accent-[#0EA5E9]" /></td>
//                     <td className="px-4 py-3">
//                       <p className="font-medium text-slate-900">{c.name}</p>
//                       <p className="text-xs text-slate-500 max-w-xs truncate">{c.description || "-"}</p>
//                     </td>
//                     <td className="px-4 py-3 text-slate-600">{c.duration || "-"}</td>
//                     <td className="px-4 py-3 text-slate-900 font-medium">
//                       {c.total_fee !== undefined && c.total_fee !== null
//                         ? `₹${Number(c.total_fee).toLocaleString("en-IN")}`
//                         : "-"}
//                     </td>
//                     <td className="px-4 py-3">
//                       <StatusPill tone={active ? "green" : "gray"}>{active ? "Active" : "Inactive"}</StatusPill>
//                     </td>
//                     <td className="px-4 py-3 text-right">
//                       <RowMenu
//                         items={[
//                           { label: "Batches", icon: CalendarDays, href: `/courses/${getId(c)}/batches` },
//                           { label: "Fee components", icon: IndianRupee, href: `/courses/${getId(c)}/fees` },
//                           { label: "Edit course", icon: Pencil, onClick: () => openEdit(c) },
//                           {
//                             label: active ? "Deactivate" : "Activate",
//                             icon: Power,
//                             danger: active,
//                             disabled: busyId === getId(c),
//                             onClick: () => handleToggleStatus(c),
//                           },
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

//       {showForm && (
//         <CreateCourse
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

// export default ManageCourses;



import React, { useEffect, useState } from "react";
import { RefreshCw, IndianRupee, CalendarDays, Pencil, Power } from "lucide-react";
import {
  getCourses,
  createCourse,
  updateCourse,
  setCourseStatus,
  getFeeComponents,
} from "./courseService";
import { getErrorMessage } from "../../services/api";
import CreateCourse from "./CreateCourse";
import { PageHeader, Toolbar, AddButton, TableCard, Notice, StatusPill, RowMenu, btnOutline } from "../../components/ui";
import { initialForm, getId, isActive } from "./courseUtils";

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [query, setQuery] = useState("");

  // editing: null = create mode, course object = edit mode
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getCourses()
      .then((list) => {
        if (cancelled) return;
        setCourses(list);
        setError("");

        // GET /courses does not return total_fee, so fill it from each course's fee components
        // (same total shown on the Fee components page). The table shows first, totals appear as they load.
        const missing = list.filter((c) => c.total_fee === undefined || c.total_fee === null);
        Promise.all(
          missing.map((c) =>
            getFeeComponents(getId(c))
              .then((r) => [getId(c), r.total])
              .catch(() => null)
          )
        ).then((pairs) => {
          if (cancelled) return;
          const totals = Object.fromEntries(pairs.filter(Boolean));
          setCourses((prev) => prev.map((c) => (getId(c) in totals ? { ...c, total_fee: totals[getId(c)] } : c)));
        });
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, "Could not load courses"));
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

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (course) => {
    setEditing(course);
    setForm({
      name: course.name || "",
      duration: course.duration || "",
      description: course.description || "",
    });
    setFormError("");
    setShowForm(true);
  };

  // POST /courses  or  PUT /courses/:id
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setFormError("Course name is required");
    if (!form.duration.trim()) return setFormError("Duration is required");
    const body = {
      name: form.name.trim(),
      duration: form.duration.trim(),
      description: form.description.trim(),
    };
    setSaving(true);
    try {
      if (editing) {
        await updateCourse(getId(editing), body);
        setNotice(`Course "${body.name}" updated`);
      } else {
        await createCourse(body);
        setNotice(`Course "${body.name}" created. Use "Fees" and "Batches" to set it up.`);
      }
      setShowForm(false);
      reload();
    } catch (err) {
      setFormError(getErrorMessage(err, editing ? "Could not update course" : "Could not create course"));
    } finally {
      setSaving(false);
    }
  };

  // PATCH /courses/:id/status  (soft delete / restore)
  const handleToggleStatus = async (course) => {
    const activate = !isActive(course);
    const message = activate
      ? `Activate "${course.name}"?`
      : `Deactivate "${course.name}"? It will not accept new admissions.`;
    if (!window.confirm(message)) return;
    setBusyId(getId(course));
    setError("");
    try {
      await setCourseStatus(getId(course), activate ? "active" : "inactive");
      setNotice(`"${course.name}" ${activate ? "activated" : "deactivated"}`);
      reload();
    } catch (err) {
      setError(getErrorMessage(err, "Could not change course status"));
    } finally {
      setBusyId(null);
    }
  };

  const q = query.trim().toLowerCase();
  const shown = q
    ? courses.filter((c) => [c.name, c.duration, c.description].some((v) => String(v ?? "").toLowerCase().includes(q)))
    : courses;

  return (
    <div>
      <PageHeader title="Course Master" subtitle={`Manage ${courses.length} courses, their fees and batches`} />

      {notice && <Notice onClose={() => setNotice("")}>{notice}</Notice>}
      {error && <Notice tone="error">{error}</Notice>}

      <Toolbar value={query} onChange={setQuery} placeholder="Search course, duration or description">
        <button onClick={reload} className={btnOutline} aria-label="Refresh">
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
        <AddButton onClick={openCreate}>Add Course</AddButton>
      </Toolbar>

      <TableCard>
        <table className="w-full text-sm text-left">
          <thead className="bg-[#0B1437] text-white">
            <tr>
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Total fee</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">Loading courses...</td>
              </tr>
            ) : shown.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  {query ? "No courses match your search" : "No courses yet. Add the first one."}
                </td>
              </tr>
            ) : (
              shown.map((c, i) => {
                const active = isActive(c);
                return (
                  <tr key={getId(c) || i} className={active ? "" : "opacity-70"}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{c.name}</p>
                      <p className="text-xs text-slate-500 max-w-xs truncate">{c.description || "-"}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{c.duration || "-"}</td>
                    <td className="px-4 py-3 text-slate-900 font-medium">
                      {c.total_fee !== undefined && c.total_fee !== null
                        ? `₹${Number(c.total_fee).toLocaleString("en-IN")}`
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill tone={active ? "green" : "gray"}>{active ? "Active" : "Inactive"}</StatusPill>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <RowMenu
                        items={[
                          { label: "Batches", icon: CalendarDays, href: `/courses/${getId(c)}/batches` },
                          { label: "Fee components", icon: IndianRupee, href: `/courses/${getId(c)}/fees` },
                          { label: "Edit course", icon: Pencil, onClick: () => openEdit(c) },
                          {
                            label: active ? "Deactivate" : "Activate",
                            icon: Power,
                            danger: active,
                            disabled: busyId === getId(c),
                            onClick: () => handleToggleStatus(c),
                          },
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

      {showForm && (
        <CreateCourse
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

export default ManageCourses;

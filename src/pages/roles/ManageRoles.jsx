// import React, { useEffect, useMemo, useState } from "react";
// import { RefreshCw, ShieldCheck, Trash2, Lock } from "lucide-react";
// import { getRoles, getPermissions, createRole, deleteRole, updateRolePermissions } from "./rbacService";
// import { getErrorMessage } from "../../services/api";
// import Modal from "../../components/Modal";
// import Field from "../../components/Field";
// import { PageHeader, Toolbar, AddButton, TableCard, Notice, StatusPill, RowMenu, btnOutline, btnPrimary } from "../../components/ui";

// const inputClass =
//   "w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/40 focus:border-[#0EA5E9]";

// const getId = (o) => o?._id || o?.id || "";
// const roleLabel = (name) =>
//   String(name || "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "-";
// // Super Admin always keeps full access, so its permissions are shown but not editable (no lock-out)
// const isLocked = (role) => role?.name === "super_admin";

// const ManageRoles = () => {
//   const [roles, setRoles] = useState([]);
//   const [permissions, setPermissions] = useState({}); // module -> [permission]
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [notice, setNotice] = useState("");
//   const [query, setQuery] = useState("");
//   const [reloadKey, setReloadKey] = useState(0);
//   const [busyId, setBusyId] = useState(null);

//   // modal: { type: "create" } | { type: "permissions", role }
//   const [modal, setModal] = useState(null);
//   const [form, setForm] = useState({ name: "", description: "" });
//   const [selected, setSelected] = useState(new Set());
//   const [saving, setSaving] = useState(false);
//   const [modalError, setModalError] = useState("");

//   // GET /rbac/roles + GET /rbac/permissions
//   useEffect(() => {
//     let cancelled = false;
//     Promise.all([getRoles(), getPermissions()])
//       .then(([roleList, permMap]) => {
//         if (cancelled) return;
//         setRoles(roleList);
//         setPermissions(permMap);
//         setError("");
//       })
//       .catch((err) => !cancelled && setError(getErrorMessage(err, "Could not load roles and permissions")))
//       .finally(() => !cancelled && setLoading(false));
//     return () => {
//       cancelled = true;
//     };
//   }, [reloadKey]);

//   const reload = () => {
//     setLoading(true);
//     setReloadKey((k) => k + 1);
//   };

//   const modules = useMemo(() => Object.keys(permissions).sort(), [permissions]);
//   const totalPermissions = useMemo(() => modules.reduce((n, m) => n + permissions[m].length, 0), [modules, permissions]);

//   const shown = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     if (!q) return roles;
//     return roles.filter((r) => [r.name, roleLabel(r.name), r.description].some((v) => String(v ?? "").toLowerCase().includes(q)));
//   }, [roles, query]);

//   const closeModal = () => setModal(null);

//   const openCreate = () => {
//     setForm({ name: "", description: "" });
//     setModalError("");
//     setModal({ type: "create" });
//   };

//   const openPermissions = (role) => {
//     setSelected(new Set((role.permissions || []).map(getId)));
//     setModalError("");
//     setModal({ type: "permissions", role });
//   };

//   // POST /rbac/roles
//   const handleCreate = async (e) => {
//     e.preventDefault();
//     const name = form.name.trim().toLowerCase().replace(/\s+/g, "_");
//     if (!name) return setModalError("Role name is required");
//     if (!/^[a-z][a-z0-9_]*$/.test(name)) return setModalError("Use letters, numbers and underscores only (for example exam_coordinator)");
//     if (roles.some((r) => r.name === name)) return setModalError("A role with this name already exists");
//     setSaving(true);
//     setModalError("");
//     try {
//       await createRole({ name, description: form.description.trim() });
//       setNotice(`Role "${roleLabel(name)}" created. Use "Edit permissions" to choose what it can do.`);
//       closeModal();
//       reload();
//     } catch (err) {
//       setModalError(getErrorMessage(err, "Could not create the role"));
//     } finally {
//       setSaving(false);
//     }
//   };

//   // PUT /rbac/roles/:id/permissions
//   const handleSavePermissions = async () => {
//     const role = modal.role;
//     setSaving(true);
//     setModalError("");
//     try {
//       await updateRolePermissions(getId(role), [...selected]);
//       setNotice(`Permissions updated for ${roleLabel(role.name)}`);
//       closeModal();
//       reload();
//     } catch (err) {
//       setModalError(getErrorMessage(err, "Could not update permissions"));
//     } finally {
//       setSaving(false);
//     }
//   };

//   // DELETE /rbac/roles/:id
//   const handleDelete = async (role) => {
//     if (!window.confirm(`Delete the role "${roleLabel(role.name)}"? This cannot be undone.`)) return;
//     setBusyId(getId(role));
//     setError("");
//     try {
//       await deleteRole(getId(role));
//       setNotice(`Role "${roleLabel(role.name)}" deleted`);
//       reload();
//     } catch (err) {
//       setError(getErrorMessage(err, "Could not delete the role"));
//     } finally {
//       setBusyId(null);
//     }
//   };

//   const toggleOne = (id) =>
//     setSelected((prev) => {
//       const next = new Set(prev);
//       next.has(id) ? next.delete(id) : next.add(id);
//       return next;
//     });

//   const toggleModule = (mod) =>
//     setSelected((prev) => {
//       const ids = permissions[mod].map(getId);
//       const all = ids.every((id) => prev.has(id));
//       const next = new Set(prev);
//       ids.forEach((id) => (all ? next.delete(id) : next.add(id)));
//       return next;
//     });

//   const editingRole = modal?.type === "permissions" ? modal.role : null;
//   const locked = isLocked(editingRole);

//   return (
//     <div>
//       <PageHeader title="Roles & Permissions" subtitle="Create roles and choose what each role is allowed to do" />

//       {notice && <Notice onClose={() => setNotice("")}>{notice}</Notice>}
//       {error && <Notice tone="error">{error}</Notice>}

//       <Toolbar value={query} onChange={setQuery} placeholder="Search roles">
//         <button onClick={reload} className={btnOutline} aria-label="Refresh">
//           <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
//         </button>
//         <AddButton onClick={openCreate}>Create role</AddButton>
//       </Toolbar>

//       <TableCard>
//         <table className="w-full text-sm text-left">
//           <thead className="bg-[#0B1437] text-white">
//             <tr>
//               <th className="px-4 py-3">Role</th>
//               <th className="px-4 py-3">Description</th>
//               <th className="px-4 py-3">Type</th>
//               <th className="px-4 py-3">Permissions</th>
//               <th className="px-4 py-3 text-right">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-slate-100">
//             {loading ? (
//               <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-500">Loading roles...</td></tr>
//             ) : shown.length === 0 ? (
//               <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-500">{query ? "No roles match your search" : "No roles found"}</td></tr>
//             ) : (
//               shown.map((r) => {
//                 const count = (r.permissions || []).length;
//                 return (
//                   <tr key={getId(r)}>
//                     <td className="px-4 py-3">
//                       <p className="font-medium text-slate-900">{roleLabel(r.name)}</p>
//                       <p className="text-xs text-slate-500">{r.name}</p>
//                     </td>
//                     <td className="px-4 py-3 text-slate-600">{r.description || "-"}</td>
//                     <td className="px-4 py-3">
//                       <StatusPill tone={r.isSystem ? "gray" : "blue"}>{r.isSystem ? "System" : "Custom"}</StatusPill>
//                     </td>
//                     <td className="px-4 py-3 text-slate-600">
//                       {count} of {totalPermissions}
//                     </td>
//                     <td className="px-4 py-3 text-right">
//                       <RowMenu
//                         items={[
//                           { label: isLocked(r) ? "View permissions" : "Edit permissions", icon: ShieldCheck, onClick: () => openPermissions(r) },
//                           { label: "Delete", icon: Trash2, danger: true, hidden: !!r.isSystem, disabled: busyId === getId(r), onClick: () => handleDelete(r) },
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

//       {/* Create role */}
//       {modal?.type === "create" && (
//         <Modal title="Create role" onClose={closeModal}>
//           <form onSubmit={handleCreate} className="space-y-4" noValidate>
//             {modalError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{modalError}</p>}
//             <Field label="Role name">
//               <input
//                 value={form.name}
//                 onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
//                 placeholder="exam_coordinator"
//                 className={inputClass}
//                 autoFocus
//               />
//               <p className="text-xs text-slate-500 mt-1">Lowercase letters, numbers and underscores. Spaces become underscores.</p>
//             </Field>
//             <Field label="Description">
//               <input
//                 value={form.description}
//                 onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
//                 placeholder="Manages exams and results"
//                 className={inputClass}
//               />
//             </Field>
//             <div className="flex justify-end gap-3 pt-2">
//               <button type="button" onClick={closeModal} className={btnOutline}>Cancel</button>
//               <button type="submit" disabled={saving} className={btnPrimary}>{saving ? "Creating..." : "Create role"}</button>
//             </div>
//           </form>
//         </Modal>
//       )}

//       {/* Edit permissions */}
//       {editingRole && (
//         <Modal title={`${roleLabel(editingRole.name)} permissions`} onClose={closeModal} maxWidth="max-w-2xl">
//           {modalError && <p className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{modalError}</p>}
//           {locked && (
//             <p className="mb-3 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
//               <Lock size={15} /> Super Admin always has full access, so its permissions cannot be changed.
//             </p>
//           )}

//           <div className="space-y-4">
//             {modules.map((mod) => {
//               const list = permissions[mod];
//               const allOn = list.every((p) => selected.has(getId(p)));
//               return (
//                 <div key={mod} className="rounded-xl border border-slate-200">
//                   <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 rounded-t-xl">
//                     <span className="text-sm font-semibold text-slate-800">{mod}</span>
//                     <label className="flex items-center gap-2 text-xs text-slate-600">
//                       <input type="checkbox" checked={allOn} disabled={locked} onChange={() => toggleModule(mod)} />
//                       Select all
//                     </label>
//                   </div>
//                   <div className="divide-y divide-slate-100">
//                     {list.map((p) => (
//                       <label key={getId(p)} className="flex items-start gap-3 px-4 py-2.5 text-sm cursor-pointer">
//                         <input
//                           type="checkbox"
//                           className="mt-1"
//                           checked={selected.has(getId(p))}
//                           disabled={locked}
//                           onChange={() => toggleOne(getId(p))}
//                         />
//                         <span>
//                           <span className="block text-slate-800">{p.description || p.code}</span>
//                           <span className="block text-xs text-slate-500">{p.code}</span>
//                         </span>
//                       </label>
//                     ))}
//                   </div>
//                 </div>
//               );
//             })}
//             {modules.length === 0 && <p className="text-sm text-slate-500">No permissions are defined yet.</p>}
//           </div>

//           <div className="flex items-center justify-between gap-3 pt-5">
//             <span className="text-xs text-slate-500">{selected.size} of {totalPermissions} selected</span>
//             <div className="flex gap-3">
//               <button type="button" onClick={closeModal} className={btnOutline}>{locked ? "Close" : "Cancel"}</button>
//               {!locked && (
//                 <button type="button" onClick={handleSavePermissions} disabled={saving} className={btnPrimary}>
//                   {saving ? "Saving..." : "Save permissions"}
//                 </button>
//               )}
//             </div>
//           </div>
//         </Modal>
//       )}
//     </div>
//   );
// };

// export default ManageRoles;



// import React, { useEffect, useMemo, useState } from "react";
// import { RefreshCw, ChevronDown, ChevronRight, ChevronLeft, Eye, Pencil, Trash2, Lock, Plus, X } from "lucide-react";
// import { getRoles, getPermissions, createRole, deleteRole, updateRolePermissions } from "./rbacService";
// import { getErrorMessage } from "../../services/api";
// import { PageHeader, Toolbar, TableCard, Notice, StatusPill, RowMenu } from "../../components/ui";

// const inputClass =
//   "w-full px-3 py-2.5 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/40 focus:border-[#0EA5E9] disabled:bg-slate-50 disabled:text-slate-500";
// const darkBtn =
//   "inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0B1437] text-white text-sm font-medium hover:bg-[#16224f] disabled:opacity-60";
// const lightBtn =
//   "inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-60";

// const getId = (o) => o?._id || o?.id || "";
// const roleLabel = (name) => String(name || "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "-";
// const resourceLabel = (r) =>
//   String(r)
//     .split("_")
//     .map((w) => (w.length <= 2 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)))
//     .join(" ");
// const isLocked = (role) => role?.name === "super_admin"; // always full access, never editable (no lock-out)
// const fmtDate = (v) => (v && !Number.isNaN(new Date(v).getTime()) ? new Date(v).toLocaleDateString("en-IN") : "-");

// const AVATAR_COLORS = ["bg-pink-500", "bg-sky-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500", "bg-rose-500"];
// const RoleAvatar = ({ name }) => {
//   const words = roleLabel(name).split(" ").filter(Boolean);
//   const text = ((words[0]?.[0] || "?") + (words[1]?.[0] || words[0]?.[1] || "")).toUpperCase();
//   const color = AVATAR_COLORS[[...String(name)].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length];
//   return (
//     <span className={`shrink-0 w-8 h-8 rounded-full inline-flex items-center justify-center text-[11px] font-bold text-white ${color}`}>
//       {text}
//     </span>
//   );
// };

// // ---- permissions -> matrix (rows = page/resource, columns = action) ----------------------------
// // "fees.view" -> resource "fees", action "view". Codes without a dot go to the "access" column.
// const ACTION_ORDER = ["view", "manage"];
// const buildMatrix = (permMap) => {
//   const actions = new Set();
//   const modules = Object.keys(permMap)
//     .sort()
//     .map((name) => {
//       const rows = {};
//       permMap[name].forEach((p) => {
//         const [resource, ...rest] = String(p.code).split(".");
//         const action = rest.join(".") || "access";
//         actions.add(action);
//         (rows[resource] ||= { resource, perms: {} }).perms[action] = p;
//       });
//       return { name, rows: Object.values(rows) };
//     });
//   const rank = (a) => (ACTION_ORDER.includes(a) ? ACTION_ORDER.indexOf(a) : 99);
//   return { actions: [...actions].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b)), modules };
// };

// const PermissionMatrix = ({ matrix, selected, onToggle, onToggleRow, readOnly }) => {
//   const [collapsed, setCollapsed] = useState(new Set());
//   const toggleCollapse = (name) =>
//     setCollapsed((prev) => {
//       const next = new Set(prev);
//       next.has(name) ? next.delete(name) : next.add(name);
//       return next;
//     });
//   const colSpan = matrix.actions.length + 1;

//   return (
//     <div className="rounded-lg overflow-hidden border border-slate-200">
//       <div className="overflow-x-auto">
//         <table className="w-full text-sm">
//           <thead className="bg-[#0B1437] text-white">
//             <tr>
//               <th className="px-4 py-3 text-left text-xs font-semibold">Pages / Modules</th>
//               {matrix.actions.map((a) => (
//                 <th key={a} className="px-4 py-3 text-center text-xs font-semibold uppercase w-28">{a.replace(/_/g, " ")}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {matrix.modules.map((mod) => (
//               <React.Fragment key={mod.name}>
//                 <tr className="bg-sky-50 cursor-pointer" onClick={() => toggleCollapse(mod.name)}>
//                   <td colSpan={colSpan} className="px-4 py-2 text-xs font-semibold text-sky-600">
//                     <span className="inline-flex items-center gap-2">
//                       {collapsed.has(mod.name) ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
//                       {mod.name}
//                     </span>
//                   </td>
//                 </tr>
//                 {!collapsed.has(mod.name) &&
//                   mod.rows.map((row) => {
//                     const list = Object.values(row.perms);
//                     const rowAll = list.every((p) => selected.has(getId(p)));
//                     return (
//                       <tr key={row.resource} className="border-t border-slate-100">
//                         <td className="px-4 py-3 border-r border-slate-100">
//                           <div className="flex items-center justify-between gap-3">
//                             <div>
//                               <p className="text-slate-800">{resourceLabel(row.resource)}</p>
//                               <p className="text-[11px] uppercase tracking-wide text-slate-400">{row.resource}</p>
//                             </div>
//                             <input
//                               type="checkbox"
//                               style={{ accentColor: "#0EA5E9" }}
//                               className="w-4 h-4"
//                               checked={rowAll}
//                               disabled={readOnly}
//                               onChange={() => onToggleRow(list)}
//                               aria-label={`Select all for ${resourceLabel(row.resource)}`}
//                             />
//                           </div>
//                         </td>
//                         {matrix.actions.map((a) => {
//                           const p = row.perms[a];
//                           return (
//                             <td key={a} className="px-4 py-3 text-center">
//                               {p ? (
//                                 <input
//                                   type="checkbox"
//                                   style={{ accentColor: "#0EA5E9" }}
//                                   className="w-4 h-4"
//                                   title={p.description || p.code}
//                                   checked={selected.has(getId(p))}
//                                   disabled={readOnly}
//                                   onChange={() => onToggle(getId(p))}
//                                 />
//                               ) : (
//                                 <span className="text-slate-300">—</span>
//                               )}
//                             </td>
//                           );
//                         })}
//                       </tr>
//                     );
//                   })}
//               </React.Fragment>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// const ManageRoles = () => {
//   const [roles, setRoles] = useState([]);
//   const [permissions, setPermissions] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [notice, setNotice] = useState("");
//   const [query, setQuery] = useState("");
//   const [reloadKey, setReloadKey] = useState(0);
//   const [busyId, setBusyId] = useState(null);
//   const [expanded, setExpanded] = useState(new Set());
//   const [page, setPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);

//   // modal: { mode: "create" | "edit" | "view", role? }
//   const [modal, setModal] = useState(null);
//   const [form, setForm] = useState({ name: "", description: "" });
//   const [selected, setSelected] = useState(new Set());
//   const [saving, setSaving] = useState(false);
//   const [modalError, setModalError] = useState("");

//   // GET /rbac/roles + GET /rbac/permissions
//   useEffect(() => {
//     let cancelled = false;
//     Promise.all([getRoles(), getPermissions()])
//       .then(([roleList, permMap]) => {
//         if (cancelled) return;
//         setRoles(roleList);
//         setPermissions(permMap);
//         setError("");
//       })
//       .catch((err) => !cancelled && setError(getErrorMessage(err, "Could not load roles and permissions")))
//       .finally(() => !cancelled && setLoading(false));
//     return () => {
//       cancelled = true;
//     };
//   }, [reloadKey]);

//   const reload = () => {
//     setLoading(true);
//     setReloadKey((k) => k + 1);
//   };

//   const matrix = useMemo(() => buildMatrix(permissions), [permissions]);
//   const totalPermissions = useMemo(() => Object.values(permissions).reduce((n, l) => n + l.length, 0), [permissions]);
//   const codeById = useMemo(
//     () => Object.fromEntries(Object.values(permissions).flat().map((p) => [getId(p), p.code])),
//     [permissions]
//   );

//   const filtered = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     if (!q) return roles;
//     return roles.filter((r) => [r.name, roleLabel(r.name), r.description].some((v) => String(v ?? "").toLowerCase().includes(q)));
//   }, [roles, query]);

//   useEffect(() => setPage(1), [query, pageSize]);
//   const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
//   const safePage = Math.min(page, pages);
//   const start = (safePage - 1) * pageSize;
//   const shown = filtered.slice(start, start + pageSize);

//   const closeModal = () => setModal(null);
//   const openCreate = () => {
//     setForm({ name: "", description: "" });
//     setSelected(new Set());
//     setModalError("");
//     setModal({ mode: "create" });
//   };
//   const openRole = (role, mode) => {
//     setSelected(new Set((role.permissions || []).map(getId)));
//     setModalError("");
//     setModal({ mode: isLocked(role) ? "view" : mode, role });
//   };

//   const toggleOne = (id) =>
//     setSelected((prev) => {
//       const next = new Set(prev);
//       next.has(id) ? next.delete(id) : next.add(id);
//       return next;
//     });
//   const toggleRow = (list) =>
//     setSelected((prev) => {
//       const ids = list.map(getId);
//       const all = ids.every((id) => prev.has(id));
//       const next = new Set(prev);
//       ids.forEach((id) => (all ? next.delete(id) : next.add(id)));
//       return next;
//     });

//   // POST /rbac/roles, then PUT /rbac/roles/:id/permissions for the ticked boxes
//   const handleCreate = async () => {
//     const name = form.name.trim().toLowerCase().replace(/\s+/g, "_");
//     if (!name) return setModalError("Role name is required");
//     if (!/^[a-z][a-z0-9_]*$/.test(name)) return setModalError("Use letters, numbers and underscores only (for example exam_coordinator)");
//     if (roles.some((r) => r.name === name)) return setModalError("A role with this name already exists");
//     setSaving(true);
//     setModalError("");
//     try {
//       const created = await createRole({ name, description: form.description.trim() });
//       const id = getId(created) || getId(created?.role) || getId(created?.data);
//       if (selected.size && id) {
//         await updateRolePermissions(id, [...selected]);
//         setNotice(`Role "${roleLabel(name)}" created`);
//       } else if (selected.size) {
//         setNotice(`Role "${roleLabel(name)}" created. Open Edit to save its permissions.`);
//       } else {
//         setNotice(`Role "${roleLabel(name)}" created`);
//       }
//       closeModal();
//       reload();
//     } catch (err) {
//       setModalError(getErrorMessage(err, "Could not create the role"));
//     } finally {
//       setSaving(false);
//     }
//   };

//   // PUT /rbac/roles/:id/permissions
//   const handleUpdate = async () => {
//     setSaving(true);
//     setModalError("");
//     try {
//       await updateRolePermissions(getId(modal.role), [...selected]);
//       setNotice(`Permissions updated for ${roleLabel(modal.role.name)}`);
//       closeModal();
//       reload();
//     } catch (err) {
//       setModalError(getErrorMessage(err, "Could not update permissions"));
//     } finally {
//       setSaving(false);
//     }
//   };

//   // DELETE /rbac/roles/:id
//   const handleDelete = async (role) => {
//     if (!window.confirm(`Delete the role "${roleLabel(role.name)}"? This cannot be undone.`)) return;
//     setBusyId(getId(role));
//     setError("");
//     try {
//       await deleteRole(getId(role));
//       setNotice(`Role "${roleLabel(role.name)}" deleted`);
//       reload();
//     } catch (err) {
//       setError(getErrorMessage(err, "Could not delete the role"));
//     } finally {
//       setBusyId(null);
//     }
//   };

//   const toggleExpand = (id) =>
//     setExpanded((prev) => {
//       const next = new Set(prev);
//       next.has(id) ? next.delete(id) : next.add(id);
//       return next;
//     });

//   const mode = modal?.mode;
//   const role = modal?.role;
//   const readOnly = mode === "view";
//   const title = mode === "create" ? "Add Role" : mode === "edit" ? "Edit Role" : "Role Details";
//   const subtitle = mode === "create" ? "Create a role and choose its permissions" : mode === "edit" ? "Modify role details and permissions" : "Role details and permissions";

//   return (
//     <div>
//       <PageHeader title="Roles Management" subtitle="Manage and organize user roles and permissions" />

//       {notice && <Notice onClose={() => setNotice("")}>{notice}</Notice>}
//       {error && <Notice tone="error">{error}</Notice>}

//       <Toolbar value={query} onChange={setQuery} placeholder="Search by role name or description...">
//         <button onClick={reload} className={lightBtn} aria-label="Refresh">
//           <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
//         </button>
//         <button onClick={openCreate} className={darkBtn}>
//           <Plus size={16} /> Add Role
//         </button>
//       </Toolbar>

//       <TableCard>
//         <table className="w-full text-sm text-left">
//           <thead className="bg-[#0B1437] text-white">
//             <tr>
//               <th className="px-4 py-3 w-10"></th>
//               <th className="px-4 py-3">Role Name</th>
//               <th className="px-4 py-3">Description</th>
//               <th className="px-4 py-3">Permissions</th>
//               <th className="px-4 py-3">Type</th>
//               <th className="px-4 py-3">Created Date</th>
//               <th className="px-4 py-3 text-right">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-slate-100">
//             {loading ? (
//               <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-500">Loading roles...</td></tr>
//             ) : shown.length === 0 ? (
//               <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-500">{query ? "No roles match your search" : "No roles found"}</td></tr>
//             ) : (
//               shown.map((r) => {
//                 const id = getId(r);
//                 const open = expanded.has(id);
//                 const count = (r.permissions || []).length;
//                 return (
//                   <React.Fragment key={id}>
//                     <tr>
//                       <td className="px-4 py-3">
//                         <button onClick={() => toggleExpand(id)} className="text-slate-500 hover:text-slate-800" aria-label={open ? "Collapse" : "Expand"}>
//                           {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
//                         </button>
//                       </td>
//                       <td className="px-4 py-3">
//                         <div className="flex items-center gap-3">
//                           <RoleAvatar name={r.name} />
//                           <div>
//                             <p className="font-semibold text-slate-900">{roleLabel(r.name)}</p>
//                             {isLocked(r) && (
//                               <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700">Super Admin</span>
//                             )}
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-4 py-3 text-slate-700">{r.description || "-"}</td>
//                       <td className="px-4 py-3">
//                         <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-600">
//                           {count} {count === 1 ? "permission" : "permissions"}
//                         </span>
//                       </td>
//                       <td className="px-4 py-3">
//                         <StatusPill tone={r.isSystem ? "gray" : "green"}>{r.isSystem ? "System" : "Custom"}</StatusPill>
//                       </td>
//                       <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{fmtDate(r.createdAt)}</td>
//                       <td className="px-4 py-3 text-right">
//                         <RowMenu
//                           items={[
//                             { label: "View Details", icon: Eye, onClick: () => openRole(r, "view") },
//                             { label: "Edit", icon: Pencil, hidden: isLocked(r), onClick: () => openRole(r, "edit") },
//                             { label: "Delete", icon: Trash2, danger: true, hidden: !!r.isSystem, disabled: busyId === id, onClick: () => handleDelete(r) },
//                           ]}
//                         />
//                       </td>
//                     </tr>
//                     {open && (
//                       <tr className="bg-slate-50">
//                         <td></td>
//                         <td colSpan={6} className="px-4 py-3">
//                           {count === 0 ? (
//                             <p className="text-xs text-slate-500">{isLocked(r) ? "Has full access to everything." : "No permissions assigned yet."}</p>
//                           ) : (
//                             <div className="flex flex-wrap gap-1.5">
//                               {(r.permissions || []).map((p) => (
//                                 <span key={getId(p)} className="px-2 py-0.5 rounded-md text-[11px] bg-white border border-slate-200 text-slate-600">
//                                   {p.code || codeById[getId(p)]}
//                                 </span>
//                               ))}
//                             </div>
//                           )}
//                         </td>
//                       </tr>
//                     )}
//                   </React.Fragment>
//                 );
//               })
//             )}
//           </tbody>
//         </table>

//         {/* Pagination */}
//         <div className="flex items-center justify-end gap-6 px-4 py-3 border-t border-slate-100 text-xs text-slate-600">
//           <label className="flex items-center gap-2">
//             Rows per page:
//             <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="bg-transparent font-medium focus:outline-none">
//               {[10, 25, 50].map((n) => (
//                 <option key={n} value={n}>{n}</option>
//               ))}
//             </select>
//           </label>
//           <span>
//             {filtered.length === 0 ? "0" : `${start + 1}–${Math.min(start + pageSize, filtered.length)}`} of {filtered.length}
//           </span>
//           <div className="flex items-center gap-1">
//             <button onClick={() => setPage(safePage - 1)} disabled={safePage <= 1} className="p-1 rounded text-sky-600 disabled:text-slate-300" aria-label="Previous page">
//               <ChevronLeft size={18} />
//             </button>
//             <button onClick={() => setPage(safePage + 1)} disabled={safePage >= pages} className="p-1 rounded text-sky-600 disabled:text-slate-300" aria-label="Next page">
//               <ChevronRight size={18} />
//             </button>
//           </div>
//         </div>
//       </TableCard>

//       {/* Add / Edit / View role */}
//       {modal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onMouseDown={closeModal}>
//           <div
//             className="w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden"
//             onMouseDown={(e) => e.stopPropagation()}
//           >
//             <div className="flex items-start justify-between px-6 py-4 border-b border-slate-200">
//               <div>
//                 <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
//                 <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
//               </div>
//               <div className="flex items-center gap-3">
//                 {role && <span className="px-2.5 py-1 rounded-full bg-slate-100 text-[11px] text-slate-500">ID: {getId(role).slice(-6)}</span>}
//                 <button onClick={closeModal} className="text-slate-400 hover:text-slate-700" aria-label="Close">
//                   <X size={20} />
//                 </button>
//               </div>
//             </div>

//             <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
//               {modalError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{modalError}</p>}
//               {isLocked(role) && (
//                 <p className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
//                   <Lock size={15} /> Super Admin always has full access, so its permissions cannot be changed.
//                 </p>
//               )}

//               <section>
//                 <h3 className="text-xs font-semibold tracking-wide text-slate-500 uppercase mb-3">Basic Information</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <div className="md:col-span-2">
//                     <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1.5">
//                       Role name {mode === "create" && <span className="text-red-500">*</span>}
//                     </label>
//                     {mode === "create" ? (
//                       <>
//                         <input
//                           value={form.name}
//                           onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
//                           placeholder="exam_coordinator"
//                           className={inputClass}
//                           autoFocus
//                         />
//                         <p className="text-[11px] text-slate-400 mt-1">Lowercase letters, numbers and underscores. Spaces become underscores.</p>
//                       </>
//                     ) : (
//                       <>
//                         <input value={roleLabel(role?.name)} disabled className={inputClass} />
//                         <p className="text-[11px] text-slate-400 mt-1">Role name cannot be changed</p>
//                       </>
//                     )}
//                   </div>
//                   {role && (
//                     <div>
//                       <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1.5">Type</label>
//                       <div className="flex items-center gap-2 h-[42px]">
//                         <StatusPill tone={role.isSystem ? "gray" : "green"}>{role.isSystem ? "System" : "Custom"}</StatusPill>
//                         {isLocked(role) && <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">Super Admin</span>}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//                 <div className="mt-4">
//                   <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1.5">Description</label>
//                   <textarea
//                     rows={3}
//                     value={mode === "create" ? form.description : role?.description || ""}
//                     onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
//                     disabled={mode !== "create"}
//                     placeholder="Manages exams and results"
//                     className={inputClass}
//                   />
//                 </div>
//               </section>

//               <section>
//                 <h3 className="text-xs font-semibold tracking-wide text-slate-500 uppercase mb-3">Module Permissions</h3>
//                 {matrix.modules.length === 0 ? (
//                   <p className="text-sm text-slate-500">No permissions are defined yet.</p>
//                 ) : (
//                   <PermissionMatrix matrix={matrix} selected={selected} onToggle={toggleOne} onToggleRow={toggleRow} readOnly={readOnly} />
//                 )}
//               </section>
//             </div>

//             <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-200">
//               <span className="text-xs text-slate-500">{selected.size} of {totalPermissions} permissions selected</span>
//               <div className="flex gap-3">
//                 <button type="button" onClick={closeModal} className={lightBtn}>{readOnly ? "Close" : "Cancel"}</button>
//                 {mode === "edit" && (
//                   <button type="button" onClick={handleUpdate} disabled={saving} className={darkBtn}>
//                     <Pencil size={15} /> {saving ? "Saving..." : "Update Role"}
//                   </button>
//                 )}
//                 {mode === "create" && (
//                   <button type="button" onClick={handleCreate} disabled={saving} className={darkBtn}>
//                     <Plus size={15} /> {saving ? "Creating..." : "Create Role"}
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ManageRoles;



// import React, { useEffect, useMemo, useState } from "react";
// import { RefreshCw, ChevronDown, ChevronRight, ChevronLeft, Eye, Pencil, Trash2, Lock, Plus, X } from "lucide-react";
// import { getRoles, getPermissions, createRole, deleteRole, updateRolePermissions } from "./rbacService";
// import { getErrorMessage } from "../../services/api";
// import { PageHeader, Toolbar, TableCard, Notice, StatusPill, RowMenu } from "../../components/ui";

// const inputClass =
//   "w-full px-3 py-2.5 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/40 focus:border-[#0EA5E9] disabled:bg-slate-50 disabled:text-slate-500";
// const darkBtn =
//   "inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0B1437] text-white text-sm font-medium hover:bg-[#16224f] disabled:opacity-60";
// const lightBtn =
//   "inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-60";

// const getId = (o) => o?._id || o?.id || "";
// const roleLabel = (name) => String(name || "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "-";
// const resourceLabel = (r) =>
//   String(r)
//     .split("_")
//     .map((w) => (w.length <= 2 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)))
//     .join(" ");
// const isLocked = (role) => role?.name === "super_admin"; 
// const fmtDate = (v) => (v && !Number.isNaN(new Date(v).getTime()) ? new Date(v).toLocaleDateString("en-IN") : "-");

// const AVATAR_COLORS = ["bg-pink-500", "bg-sky-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500", "bg-rose-500"];
// const RoleAvatar = ({ name }) => {
//   const words = roleLabel(name).split(" ").filter(Boolean);
//   const text = ((words[0]?.[0] || "?") + (words[1]?.[0] || words[0]?.[1] || "")).toUpperCase();
//   const color = AVATAR_COLORS[[...String(name)].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length];
//   return (
//     <span className={`shrink-0 w-8 h-8 rounded-full inline-flex items-center justify-center text-[11px] font-bold text-white ${color}`}>
//       {text}
//     </span>
//   );
// };

// const ACTION_ORDER = ["view", "manage"];
// const buildMatrix = (permMap) => {
//   const actions = new Set();
//   const modules = Object.keys(permMap)
//     .sort()
//     .map((name) => {
//       const rows = {};
//       permMap[name].forEach((p) => {
//         const [resource, ...rest] = String(p.code).split(".");
//         const action = rest.join(".") || "access";
//         actions.add(action);
//         (rows[resource] ||= { resource, perms: {} }).perms[action] = p;
//       });
//       return { name, rows: Object.values(rows) };
//     });
//   const rank = (a) => (ACTION_ORDER.includes(a) ? ACTION_ORDER.indexOf(a) : 99);
//   return { actions: [...actions].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b)), modules };
// };

// const PermissionMatrix = ({ matrix, selected, onToggle, onToggleRow, readOnly }) => {
//   const [collapsed, setCollapsed] = useState(new Set());
//   const toggleCollapse = (name) =>
//     setCollapsed((prev) => {
//       const next = new Set(prev);
//       next.has(name) ? next.delete(name) : next.add(name);
//       return next;
//     });
//   const colSpan = matrix.actions.length + 1;

//   return (
//     <div className="rounded-lg overflow-hidden border border-slate-200">
//       <div className="overflow-x-auto">
//         <table className="w-full text-sm">
//           <thead className="bg-[#0B1437] text-white">
//             <tr>
//               <th className="px-4 py-3 text-left text-xs font-semibold">Pages / Modules</th>
//               {matrix.actions.map((a) => (
//                 <th key={a} className="px-4 py-3 text-center text-xs font-semibold uppercase w-28">{a.replace(/_/g, " ")}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {matrix.modules.map((mod) => (
//               <React.Fragment key={mod.name}>
//                 <tr className="bg-sky-50 cursor-pointer" onClick={() => toggleCollapse(mod.name)}>
//                   <td colSpan={colSpan} className="px-4 py-2 text-xs font-semibold text-sky-600">
//                     <span className="inline-flex items-center gap-2">
//                       {collapsed.has(mod.name) ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
//                       {mod.name}
//                     </span>
//                   </td>
//                 </tr>
//                 {!collapsed.has(mod.name) &&
//                   mod.rows.map((row) => {
//                     const list = Object.values(row.perms);
//                     const rowAll = list.every((p) => selected.has(getId(p)));
//                     return (
//                       <tr key={row.resource} className="border-t border-slate-100">
//                         <td className="px-4 py-3 border-r border-slate-100">
//                           <div className="flex items-center justify-between gap-3">
//                             <div>
//                               <p className="text-slate-800">{resourceLabel(row.resource)}</p>
//                               <p className="text-[11px] uppercase tracking-wide text-slate-400">{row.resource}</p>
//                             </div>
//                             <input
//                               type="checkbox"
//                               style={{ accentColor: "#0EA5E9" }}
//                               className="w-4 h-4"
//                               checked={rowAll}
//                               disabled={readOnly}
//                               onChange={() => onToggleRow(list)}
//                               aria-label={`Select all for ${resourceLabel(row.resource)}`}
//                             />
//                           </div>
//                         </td>
//                         {matrix.actions.map((a) => {
//                           const p = row.perms[a];
//                           return (
//                             <td key={a} className="px-4 py-3 text-center">
//                               {p ? (
//                                 <input
//                                   type="checkbox"
//                                   style={{ accentColor: "#0EA5E9" }}
//                                   className="w-4 h-4"
//                                   title={p.description || p.code}
//                                   checked={selected.has(getId(p))}
//                                   disabled={readOnly}
//                                   onChange={() => onToggle(getId(p))}
//                                 />
//                               ) : (
//                                 <span className="text-slate-300">—</span>
//                               )}
//                             </td>
//                           );
//                         })}
//                       </tr>
//                     );
//                   })}
//               </React.Fragment>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// const ManageRoles = () => {
//   const [roles, setRoles] = useState([]);
//   const [permissions, setPermissions] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [notice, setNotice] = useState("");
//   const [query, setQuery] = useState("");
//   const [reloadKey, setReloadKey] = useState(0);
//   const [busyId, setBusyId] = useState(null);
//   const [expanded, setExpanded] = useState(new Set());
//   const [page, setPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);

//   const [modal, setModal] = useState(null);
//   const [form, setForm] = useState({ name: "", description: "" });
//   const [selected, setSelected] = useState(new Set());
//   const [saving, setSaving] = useState(false);
//   const [modalError, setModalError] = useState("");

//   useEffect(() => {
//     let cancelled = false;
//     Promise.all([getRoles(), getPermissions()])
//       .then(([roleList, permMap]) => {
//         if (cancelled) return;
//         setRoles(roleList);
//         setPermissions(permMap);
//         setError("");
//       })
//       .catch((err) => !cancelled && setError(getErrorMessage(err, "Could not load roles and permissions")))
//       .finally(() => !cancelled && setLoading(false));
//     return () => {
//       cancelled = true;
//     };
//   }, [reloadKey]);

//   const reload = () => {
//     setLoading(true);
//     setReloadKey((k) => k + 1);
//   };

//   const matrix = useMemo(() => buildMatrix(permissions), [permissions]);
//   const totalPermissions = useMemo(() => Object.values(permissions).reduce((n, l) => n + l.length, 0), [permissions]);
//   const codeById = useMemo(
//     () => Object.fromEntries(Object.values(permissions).flat().map((p) => [getId(p), p.code])),
//     [permissions]
//   );

//   const filtered = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     if (!q) return roles;
//     return roles.filter((r) => [r.name, roleLabel(r.name), r.description].some((v) => String(v ?? "").toLowerCase().includes(q)));
//   }, [roles, query]);

//   useEffect(() => setPage(1), [query, pageSize]);
//   const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
//   const safePage = Math.min(page, pages);
//   const start = (safePage - 1) * pageSize;
//   const shown = filtered.slice(start, start + pageSize);

//   const closeModal = () => setModal(null);
//   const openCreate = () => {
//     setForm({ name: "", description: "" });
//     setSelected(new Set());
//     setModalError("");
//     setModal({ mode: "create" });
//   };
//   const openRole = (role, mode) => {
//     setSelected(new Set((role.permissions || []).map(getId)));
//     setModalError("");
//     setModal({ mode: isLocked(role) ? "view" : mode, role });
//   };

//   const toggleOne = (id) =>
//     setSelected((prev) => {
//       const next = new Set(prev);
//       next.has(id) ? next.delete(id) : next.add(id);
//       return next;
//     });
//   const toggleRow = (list) =>
//     setSelected((prev) => {
//       const ids = list.map(getId);
//       const all = ids.every((id) => prev.has(id));
//       const next = new Set(prev);
//       ids.forEach((id) => (all ? next.delete(id) : next.add(id)));
//       return next;
//     });

//   const handleCreate = async () => {
//     const name = form.name.trim().toLowerCase().replace(/\s+/g, "_");
//     if (!name) return setModalError("Role name is required");
//     if (!/^[a-z][a-z0-9_]*$/.test(name)) return setModalError("Use letters, numbers and underscores only (for example exam_coordinator)");
//     if (roles.some((r) => r.name === name)) return setModalError("A role with this name already exists");
//     setSaving(true);
//     setModalError("");
//     try {
//       const created = await createRole({ name, description: form.description.trim() });
//       const id = getId(created) || getId(created?.role) || getId(created?.data);
//       if (selected.size && id) {
//         await updateRolePermissions(id, [...selected]);
//         setNotice(`Role "${roleLabel(name)}" created`);
//       } else if (selected.size) {
//         setNotice(`Role "${roleLabel(name)}" created. Open Edit to save its permissions.`);
//       } else {
//         setNotice(`Role "${roleLabel(name)}" created`);
//       }
//       closeModal();
//       reload();
//     } catch (err) {
//       setModalError(getErrorMessage(err, "Could not create the role"));
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleUpdate = async () => {
//     setSaving(true);
//     setModalError("");
//     try {
//       await updateRolePermissions(getId(modal.role), [...selected]);
//       setNotice(`Permissions updated for ${roleLabel(modal.role.name)}`);
//       closeModal();
//       reload();
//     } catch (err) {
//       setModalError(getErrorMessage(err, "Could not update permissions"));
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleDelete = async (role) => {
//     if (!window.confirm(`Delete the role "${roleLabel(role.name)}"? This cannot be undone.`)) return;
//     setBusyId(getId(role));
//     setError("");
//     try {
//       await deleteRole(getId(role));
//       setNotice(`Role "${roleLabel(role.name)}" deleted`);
//       reload();
//     } catch (err) {
//       setError(getErrorMessage(err, "Could not delete the role"));
//     } finally {
//       setBusyId(null);
//     }
//   };

//   const toggleExpand = (id) =>
//     setExpanded((prev) => {
//       const next = new Set(prev);
//       next.has(id) ? next.delete(id) : next.add(id);
//       return next;
//     });

//   const mode = modal?.mode;
//   const role = modal?.role;
//   const readOnly = mode === "view";
//   const title = mode === "create" ? "Add Role" : mode === "edit" ? "Edit Role" : "Role Details";
//   const subtitle = mode === "create" ? "Create a role and choose its permissions" : mode === "edit" ? "Modify role details and permissions" : "Role details and permissions";

//   return (
//     <div>
//       <PageHeader title="Roles Management" subtitle="Manage and organize user roles and permissions" />

//       {notice && <Notice onClose={() => setNotice("")}>{notice}</Notice>}
//       {error && <Notice tone="error">{error}</Notice>}

//       <Toolbar value={query} onChange={setQuery} placeholder="Search by role name or description...">
//         <button onClick={reload} className={lightBtn} aria-label="Refresh">
//           <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
//         </button>
//         <button onClick={openCreate} className={darkBtn}>
//           <Plus size={16} /> Add Role
//         </button>
//       </Toolbar>

//       <TableCard>
//         <table className="w-full text-sm text-left">
//           <thead className="bg-[#0B1437] text-white">
//             <tr>
//               <th className="px-4 py-3 w-10"></th>
//               <th className="px-4 py-3">Role Name</th>
//               <th className="px-4 py-3">Description</th>
//               <th className="px-4 py-3">Permissions</th>
//               <th className="px-4 py-3">Type</th>
//               <th className="px-4 py-3">Created Date</th>
//               <th className="px-4 py-3 text-right">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-slate-100">
//             {loading ? (
//               <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-500">Loading roles...</td></tr>
//             ) : shown.length === 0 ? (
//               <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-500">{query ? "No roles match your search" : "No roles found"}</td></tr>
//             ) : (
//               shown.map((r) => {
//                 const id = getId(r);
//                 const open = expanded.has(id);
//                 const count = (r.permissions || []).length;
//                 return (
//                   <React.Fragment key={id}>
//                     <tr>
//                       <td className="px-4 py-3">
//                         <button onClick={() => toggleExpand(id)} className="text-slate-500 hover:text-slate-800" aria-label={open ? "Collapse" : "Expand"}>
//                           {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
//                         </button>
//                       </td>
//                       <td className="px-4 py-3">
//                         <div className="flex items-center gap-3">
//                           <RoleAvatar name={r.name} />
//                           <div>
//                             <p className="font-semibold text-slate-900">{roleLabel(r.name)}</p>
//                             {isLocked(r) && (
//                               <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700">Super Admin</span>
//                             )}
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-4 py-3 text-slate-700">{r.description || "-"}</td>
//                       <td className="px-4 py-3">
//                         <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-600">
//                           {count} {count === 1 ? "permission" : "permissions"}
//                         </span>
//                       </td>
//                       <td className="px-4 py-3">
//                         <StatusPill tone={r.isSystem ? "gray" : "green"}>{r.isSystem ? "System" : "Custom"}</StatusPill>
//                       </td>
//                       <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{fmtDate(r.createdAt)}</td>
//                       <td className="px-4 py-3 text-right">
//                         <RowMenu
//                           items={[
//                             { label: "View Details", icon: Eye, onClick: () => openRole(r, "view") },
//                             { label: "Edit", icon: Pencil, hidden: isLocked(r), onClick: () => openRole(r, "edit") },
//                             { label: "Delete", icon: Trash2, danger: true, hidden: !!r.isSystem, disabled: busyId === id, onClick: () => handleDelete(r) },
//                           ]}
//                         />
//                       </td>
//                     </tr>
//                     {open && (
//                       <tr className="bg-slate-50">
//                         <td></td>
//                         <td colSpan={6} className="px-4 py-3">
//                           {count === 0 ? (
//                             <p className="text-xs text-slate-500">{isLocked(r) ? "Has full access to everything." : "No permissions assigned yet."}</p>
//                           ) : (
//                             <div className="flex flex-wrap gap-1.5">
//                               {(r.permissions || []).map((p) => (
//                                 <span key={getId(p)} className="px-2 py-0.5 rounded-md text-[11px] bg-white border border-slate-200 text-slate-600">
//                                   {p.code || codeById[getId(p)]}
//                                 </span>
//                               ))}
//                             </div>
//                           )}
//                         </td>
//                       </tr>
//                     )}
//                   </React.Fragment>
//                 );
//               })
//             )}
//           </tbody>
//         </table>

//         <div className="flex items-center justify-end gap-6 px-4 py-3 border-t border-slate-100 text-xs text-slate-600">
//           <label className="flex items-center gap-2">
//             Rows per page:
//             <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="bg-transparent font-medium focus:outline-none">
//               {[10, 25, 50].map((n) => (
//                 <option key={n} value={n}>{n}</option>
//               ))}
//             </select>
//           </label>
//           <span>
//             {filtered.length === 0 ? "0" : `${start + 1}–${Math.min(start + pageSize, filtered.length)}`} of {filtered.length}
//           </span>
//           <div className="flex items-center gap-1">
//             <button onClick={() => setPage(safePage - 1)} disabled={safePage <= 1} className="p-1 rounded text-sky-600 disabled:text-slate-300" aria-label="Previous page">
//               <ChevronLeft size={18} />
//             </button>
//             <button onClick={() => setPage(safePage + 1)} disabled={safePage >= pages} className="p-1 rounded text-sky-600 disabled:text-slate-300" aria-label="Next page">
//               <ChevronRight size={18} />
//             </button>
//           </div>
//         </div>
//       </TableCard>

//       {modal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onMouseDown={closeModal}>
//           <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden" onMouseDown={(e) => e.stopPropagation()}>
//             <div className="flex items-start justify-between px-6 py-4 border-b border-slate-200">
//               <div>
//                 <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
//                 <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
//               </div>
//               <div className="flex items-center gap-3">
//                 {role && <span className="px-2.5 py-1 rounded-full bg-slate-100 text-[11px] text-slate-500">ID: {getId(role).slice(-6)}</span>}
//                 <button onClick={closeModal} className="text-slate-400 hover:text-slate-700" aria-label="Close">
//                   <X size={20} />
//                 </button>
//               </div>
//             </div>

//             <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
//               {modalError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{modalError}</p>}
//               {isLocked(role) && (
//                 <p className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
//                   <Lock size={15} /> Super Admin always has full access, so its permissions cannot be changed.
//                 </p>
//               )}

//               <section>
//                 <h3 className="text-xs font-semibold tracking-wide text-slate-500 uppercase mb-3">Basic Information</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <div className="md:col-span-2">
//                     <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1.5">
//                       Role name {mode === "create" && <span className="text-red-500">*</span>}
//                     </label>
//                     {mode === "create" ? (
//                       <>
//                         <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="exam_coordinator" className={inputClass} autoFocus />
//                         <p className="text-[11px] text-slate-400 mt-1">Lowercase letters, numbers and underscores. Spaces become underscores.</p>
//                       </>
//                     ) : (
//                       <>
//                         <input value={roleLabel(role?.name)} disabled className={inputClass} />
//                         <p className="text-[11px] text-slate-400 mt-1">Role name cannot be changed</p>
//                       </>
//                     )}
//                   </div>
//                   {role && (
//                     <div>
//                       <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1.5">Type</label>
//                       <div className="flex items-center gap-2 h-[42px]">
//                         <StatusPill tone={role.isSystem ? "gray" : "green"}>{role.isSystem ? "System" : "Custom"}</StatusPill>
//                         {isLocked(role) && <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">Super Admin</span>}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//                 <div className="mt-4">
//                   <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1.5">Description</label>
//                   <textarea
//                     rows={3}
//                     value={mode === "create" ? form.description : role?.description || ""}
//                     onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
//                     disabled={mode !== "create"}
//                     placeholder="Manages exams and results"
//                     className={inputClass}
//                   />
//                 </div>
//               </section>

//               <section>
//                 <h3 className="text-xs font-semibold tracking-wide text-slate-500 uppercase mb-3">Module Permissions</h3>
//                 {matrix.modules.length === 0 ? (
//                   <p className="text-sm text-slate-500">No permissions are defined yet.</p>
//                 ) : (
//                   <PermissionMatrix matrix={matrix} selected={selected} onToggle={toggleOne} onToggleRow={toggleRow} readOnly={readOnly} />
//                 )}
//               </section>
//             </div>

//             <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-200">
//               <span className="text-xs text-slate-500">{selected.size} of {totalPermissions} permissions selected</span>
//               <div className="flex gap-3">
//                 <button type="button" onClick={closeModal} className={lightBtn}>{readOnly ? "Close" : "Cancel"}</button>
//                 {mode === "edit" && (
//                   <button type="button" onClick={handleUpdate} disabled={saving} className={darkBtn}>
//                     <Pencil size={15} /> {saving ? "Saving..." : "Update Role"}
//                   </button>
//                 )}
//                 {mode === "create" && (
//                   <button type="button" onClick={handleCreate} disabled={saving} className={darkBtn}>
//                     <Plus size={15} /> {saving ? "Creating..." : "Create Role"}
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ManageRoles;

// 16 nov


import React, { useEffect, useMemo, useState } from "react";
import { RefreshCw, ChevronDown, ChevronRight, ChevronLeft, Eye, Pencil, Trash2, Lock, Plus, X } from "lucide-react";
import { getRoles, getPermissions, createRole, deleteRole, updateRolePermissions } from "./rbacService";
import { getErrorMessage } from "../../services/api";
import { PageHeader, Toolbar, TableCard, Notice, StatusPill, RowMenu } from "../../components/ui";

const inputClass =
  "w-full px-3 py-2.5 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/40 focus:border-[#0EA5E9] disabled:bg-slate-50 disabled:text-slate-500";
const darkBtn =
  "inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0B1437] text-white text-sm font-medium hover:bg-[#16224f] disabled:opacity-60";
const lightBtn =
  "inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-60";

const getId = (o) => o?._id || o?.id || "";
const roleLabel = (name) => String(name || "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "-";
const resourceLabel = (r) =>
  String(r)
    .split("_")
    .map((w) => (w.length <= 2 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)))
    .join(" ");
const isLocked = (role) => role?.name === "super_admin"; 
const fmtDate = (v) => (v && !Number.isNaN(new Date(v).getTime()) ? new Date(v).toLocaleDateString("en-IN") : "-");

const AVATAR_COLORS = ["bg-pink-500", "bg-sky-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500", "bg-rose-500"];
const RoleAvatar = ({ name }) => {
  const words = roleLabel(name).split(" ").filter(Boolean);
  const text = ((words[0]?.[0] || "?") + (words[1]?.[0] || words[0]?.[1] || "")).toUpperCase();
  const color = AVATAR_COLORS[[...String(name)].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length];
  return (
    <span className={`shrink-0 w-8 h-8 rounded-full inline-flex items-center justify-center text-[11px] font-bold text-white ${color}`}>
      {text}
    </span>
  );
};

const ACTION_ORDER = ["view", "manage"];
const buildMatrix = (permMap) => {
  const actions = new Set();
  const modules = Object.keys(permMap)
    .sort()
    .map((name) => {
      const rows = {};
      permMap[name].forEach((p) => {
        const [resource, ...rest] = String(p.code).split(".");
        const action = rest.join(".") || "access";
        actions.add(action);
        (rows[resource] ||= { resource, perms: {} }).perms[action] = p;
      });
      return { name, rows: Object.values(rows) };
    });
  const rank = (a) => (ACTION_ORDER.includes(a) ? ACTION_ORDER.indexOf(a) : 99);
  return { actions: [...actions].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b)), modules };
};

const PermissionMatrix = ({ matrix, selected, onToggle, onToggleRow, readOnly }) => {
  const [collapsed, setCollapsed] = useState(new Set());
  const toggleCollapse = (name) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  const colSpan = matrix.actions.length + 1;

  return (
    <div className="rounded-lg overflow-hidden border border-slate-200">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#0B1437] text-white">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold">Pages / Modules</th>
              {matrix.actions.map((a) => (
                <th key={a} className="px-4 py-3 text-center text-xs font-semibold uppercase w-28">{a.replace(/_/g, " ")}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.modules.map((mod) => (
              <React.Fragment key={mod.name}>
                <tr className="bg-sky-50 cursor-pointer" onClick={() => toggleCollapse(mod.name)}>
                  <td colSpan={colSpan} className="px-4 py-2 text-xs font-semibold text-sky-600">
                    <span className="inline-flex items-center gap-2">
                      {collapsed.has(mod.name) ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                      {mod.name}
                    </span>
                  </td>
                </tr>
                {!collapsed.has(mod.name) &&
                  mod.rows.map((row) => {
                    const list = Object.values(row.perms);
                    const rowAll = list.every((p) => selected.has(getId(p)));
                    return (
                      <tr key={row.resource} className="border-t border-slate-100">
                        <td className="px-4 py-3 border-r border-slate-100">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-slate-800">{resourceLabel(row.resource)}</p>
                              <p className="text-[11px] uppercase tracking-wide text-slate-400">{row.resource}</p>
                            </div>
                            <input
                              type="checkbox"
                              style={{ accentColor: "#0EA5E9" }}
                              className="w-4 h-4"
                              checked={rowAll}
                              disabled={readOnly}
                              onChange={() => onToggleRow(list)}
                              aria-label={`Select all for ${resourceLabel(row.resource)}`}
                            />
                          </div>
                        </td>
                        {matrix.actions.map((a) => {
                          const p = row.perms[a];
                          return (
                            <td key={a} className="px-4 py-3 text-center">
                              {p ? (
                                <input
                                  type="checkbox"
                                  style={{ accentColor: "#0EA5E9" }}
                                  className="w-4 h-4"
                                  title={p.description || p.code}
                                  checked={selected.has(getId(p))}
                                  disabled={readOnly}
                                  onChange={() => onToggle(getId(p))}
                                />
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ManageRoles = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [busyId, setBusyId] = useState(null);
  const [expanded, setExpanded] = useState(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [selected, setSelected] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([getRoles(), getPermissions()])
      .then(([roleList, permMap]) => {
        if (cancelled) return;
        setRoles(roleList);
        setPermissions(permMap);
        setError("");
      })
      .catch((err) => !cancelled && setError(getErrorMessage(err, "Could not load roles and permissions")))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const reload = () => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  const matrix = useMemo(() => buildMatrix(permissions), [permissions]);
  const totalPermissions = useMemo(() => Object.values(permissions).reduce((n, l) => n + l.length, 0), [permissions]);
  const codeById = useMemo(
    () => Object.fromEntries(Object.values(permissions).flat().map((p) => [getId(p), p.code])),
    [permissions]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter((r) => [r.name, roleLabel(r.name), r.description].some((v) => String(v ?? "").toLowerCase().includes(q)));
  }, [roles, query]);

  useEffect(() => setPage(1), [query, pageSize]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pages);
  const start = (safePage - 1) * pageSize;
  const shown = filtered.slice(start, start + pageSize);

  const closeModal = () => setModal(null);
  const openCreate = () => {
    setForm({ name: "", description: "" });
    setSelected(new Set());
    setModalError("");
    setModal({ mode: "create" });
  };
  const openRole = (role, mode) => {
    setSelected(new Set((role.permissions || []).map(getId)));
    setModalError("");
    setModal({ mode: isLocked(role) ? "view" : mode, role });
  };

  const toggleOne = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const toggleRow = (list) =>
    setSelected((prev) => {
      const ids = list.map(getId);
      const all = ids.every((id) => prev.has(id));
      const next = new Set(prev);
      ids.forEach((id) => (all ? next.delete(id) : next.add(id)));
      return next;
    });

  const handleCreate = async () => {
    const name = form.name.trim().toLowerCase().replace(/\s+/g, "_");
    if (!name) return setModalError("Role name is required");
    if (!/^[a-z][a-z0-9_]*$/.test(name)) return setModalError("Use letters, numbers and underscores only (for example exam_coordinator)");
    if (roles.some((r) => r.name === name)) return setModalError("A role with this name already exists");
    setSaving(true);
    setModalError("");
    try {
      const created = await createRole({ name, description: form.description.trim() });
      const id = getId(created) || getId(created?.role) || getId(created?.data);
      if (selected.size && id) {
        await updateRolePermissions(id, [...selected]);
        setNotice(`Role "${roleLabel(name)}" created`);
      } else if (selected.size) {
        setNotice(`Role "${roleLabel(name)}" created. Open Edit to save its permissions.`);
      } else {
        setNotice(`Role "${roleLabel(name)}" created`);
      }
      closeModal();
      reload();
    } catch (err) {
      setModalError(getErrorMessage(err, "Could not create the role"));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    setModalError("");
    try {
      await updateRolePermissions(getId(modal.role), [...selected]);
      setNotice(`Permissions updated for ${roleLabel(modal.role.name)}`);
      closeModal();
      reload();
    } catch (err) {
      setModalError(getErrorMessage(err, "Could not update permissions"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (role) => {
    if (!window.confirm(`Delete the role "${roleLabel(role.name)}"? This cannot be undone.`)) return;
    setBusyId(getId(role));
    setError("");
    try {
      await deleteRole(getId(role));
      setNotice(`Role "${roleLabel(role.name)}" deleted`);
      reload();
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete the role"));
    } finally {
      setBusyId(null);
    }
  };

  const toggleExpand = (id) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const mode = modal?.mode;
  const role = modal?.role;
  const readOnly = mode === "view";
  const title = mode === "create" ? "Add Role" : mode === "edit" ? "Edit Role" : "Role Details";
  const subtitle = mode === "create" ? "Create a role and choose its permissions" : mode === "edit" ? "Modify role details and permissions" : "Role details and permissions";

  return (
    <div>
      <PageHeader title="Roles Management" subtitle="Manage and organize user roles and permissions" />

      {notice && <Notice onClose={() => setNotice("")}>{notice}</Notice>}
      {error && <Notice tone="error">{error}</Notice>}

      <Toolbar value={query} onChange={setQuery} placeholder="Search by role name or description...">
        <button onClick={reload} className={lightBtn} aria-label="Refresh">
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
        <button onClick={openCreate} className={darkBtn}>
          <Plus size={16} /> Add Role
        </button>
      </Toolbar>

      <TableCard>
        <table className="w-full text-sm text-left">
          <thead className="bg-[#0B1437] text-white">
            <tr>
              <th className="px-4 py-3 w-10"></th>
              <th className="px-4 py-3">Role Name</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Permissions</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Created Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-500">Loading roles...</td></tr>
            ) : shown.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-500">{query ? "No roles match your search" : "No roles found"}</td></tr>
            ) : (
              shown.map((r) => {
                const id = getId(r);
                const open = expanded.has(id);
                const count = (r.permissions || []).length;
                return (
                  <React.Fragment key={id}>
                    <tr>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleExpand(id)} className="text-slate-500 hover:text-slate-800" aria-label={open ? "Collapse" : "Expand"}>
                          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <RoleAvatar name={r.name} />
                          <div>
                            <p className="font-semibold text-slate-900">{roleLabel(r.name)}</p>
                            {isLocked(r) && (
                              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700">Super Admin</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{r.description || "-"}</td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-600">
                          {count} {count === 1 ? "permission" : "permissions"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill tone={r.isSystem ? "gray" : "green"}>{r.isSystem ? "System" : "Custom"}</StatusPill>
                      </td>
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{fmtDate(r.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <RowMenu
                          items={[
                            { label: "View Details", icon: Eye, onClick: () => openRole(r, "view") },
                            { label: "Edit", icon: Pencil, hidden: isLocked(r), onClick: () => openRole(r, "edit") },
                            { label: "Delete", icon: Trash2, danger: true, hidden: !!r.isSystem, disabled: busyId === id, onClick: () => handleDelete(r) },
                          ]}
                        />
                      </td>
                    </tr>
                    {open && (
                      <tr className="bg-slate-50">
                        <td></td>
                        <td colSpan={6} className="px-4 py-3">
                          {count === 0 ? (
                            <p className="text-xs text-slate-500">{isLocked(r) ? "Has full access to everything." : "No permissions assigned yet."}</p>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {(r.permissions || []).map((p) => (
                                <span key={getId(p)} className="px-2 py-0.5 rounded-md text-[11px] bg-white border border-slate-200 text-slate-600">
                                  {p.code || codeById[getId(p)]}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-end gap-6 px-4 py-3 border-t border-slate-100 text-xs text-slate-600">
          <label className="flex items-center gap-2">
            Rows per page:
            <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="bg-transparent font-medium focus:outline-none">
              {[10, 25, 50].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
          <span>
            {filtered.length === 0 ? "0" : `${start + 1}–${Math.min(start + pageSize, filtered.length)}`} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(safePage - 1)} disabled={safePage <= 1} className="p-1 rounded text-sky-600 disabled:text-slate-300" aria-label="Previous page">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => setPage(safePage + 1)} disabled={safePage >= pages} className="p-1 rounded text-sky-600 disabled:text-slate-300" aria-label="Next page">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </TableCard>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onMouseDown={closeModal}>
          <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden" onMouseDown={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
              </div>
              <div className="flex items-center gap-3">
                {role && <span className="px-2.5 py-1 rounded-full bg-slate-100 text-[11px] text-slate-500">ID: {getId(role).slice(-6)}</span>}
                <button onClick={closeModal} className="text-slate-400 hover:text-slate-700" aria-label="Close">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {modalError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{modalError}</p>}
              {isLocked(role) && (
                <p className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <Lock size={15} /> Super Admin always has full access, so its permissions cannot be changed.
                </p>
              )}

              <section>
                <h3 className="text-xs font-semibold tracking-wide text-slate-500 uppercase mb-3">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1.5">
                      Role name {mode === "create" && <span className="text-red-500">*</span>}
                    </label>
                    {mode === "create" ? (
                      <>
                        <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="exam_coordinator" className={inputClass} autoFocus />
                        <p className="text-[11px] text-slate-400 mt-1">Lowercase letters, numbers and underscores. Spaces become underscores.</p>
                      </>
                    ) : (
                      <>
                        <input value={roleLabel(role?.name)} disabled className={inputClass} />
                        <p className="text-[11px] text-slate-400 mt-1">Role name cannot be changed</p>
                      </>
                    )}
                  </div>
                  {role && (
                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1.5">Type</label>
                      <div className="flex items-center gap-2 h-[42px]">
                        <StatusPill tone={role.isSystem ? "gray" : "green"}>{role.isSystem ? "System" : "Custom"}</StatusPill>
                        {isLocked(role) && <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">Super Admin</span>}
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1.5">Description</label>
                  <textarea
                    rows={3}
                    value={mode === "create" ? form.description : role?.description || ""}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    disabled={mode !== "create"}
                    placeholder="Manages exams and results"
                    className={inputClass}
                  />
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold tracking-wide text-slate-500 uppercase mb-3">Module Permissions</h3>
                {matrix.modules.length === 0 ? (
                  <p className="text-sm text-slate-500">No permissions are defined yet.</p>
                ) : (
                  <PermissionMatrix matrix={matrix} selected={selected} onToggle={toggleOne} onToggleRow={toggleRow} readOnly={readOnly} />
                )}
              </section>
            </div>

            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-200">
              <span className="text-xs text-slate-500">{selected.size} of {totalPermissions} permissions selected</span>
              <div className="flex gap-3">
                <button type="button" onClick={closeModal} className={lightBtn}>{readOnly ? "Close" : "Cancel"}</button>
                {mode === "edit" && (
                  <button type="button" onClick={handleUpdate} disabled={saving} className={darkBtn}>
                    <Pencil size={15} /> {saving ? "Saving..." : "Update Role"}
                  </button>
                )}
                {mode === "create" && (
                  <button type="button" onClick={handleCreate} disabled={saving} className={darkBtn}>
                    <Plus size={15} /> {saving ? "Creating..." : "Create Role"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRoles;
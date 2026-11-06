// import React, { useEffect, useMemo, useState } from "react";
// import { RefreshCw, Pencil, KeyRound, Power } from "lucide-react";
// import { getUsers, updateUser, setUserStatus, adminResetPassword } from "./userService";
// import { getErrorMessage } from "../../services/api";
// import Modal from "../../components/Modal";
// import { PageHeader, Toolbar, AddButton, TableCard, Notice, Avatar, StatusPill, RowMenu, btnOutline } from "../../components/ui";

// const inputClass =
//   "w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/40 focus:border-[#0EA5E9]";

// const formatRole = (user) => {
//   const raw = typeof user.role === "string" ? user.role : user.role?.name || user.roles?.[0]?.name || "";
//   return raw ? raw.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "-";
// };

// const isActive = (user) => user.is_active ?? user.isActive ?? user.status === "active";
// const getId = (u) => u.id || u._id;

// // Role key such as "student", "faculty", "office_staff"
// const roleKey = (user) =>
//   String(typeof user.role === "string" ? user.role : user.role?.name || user.roles?.[0]?.name || "").toLowerCase();
// const isStudent = (user) => roleKey(user) === "student";

// const TABS = [
//   ["staff", "Staff"],
//   ["students", "Students"],
// ];

// const Users = () => {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [notice, setNotice] = useState("");
//   const [query, setQuery] = useState("");
//   const [tab, setTab] = useState("staff");
//   const [reloadKey, setReloadKey] = useState(0);

//   // modal state: { type: "edit" | "password", user }
//   const [modal, setModal] = useState(null);
//   const [form, setForm] = useState({ name: "", phone: "", password: "" });
//   const [saving, setSaving] = useState(false);
//   const [modalError, setModalError] = useState("");
//   const [busyId, setBusyId] = useState(null);

//   useEffect(() => {
//     let cancelled = false;
//     getUsers()
//       .then(({ list }) => {
//         if (cancelled) return;
//         setUsers(list);
//         setError("");
//       })
//       .catch((err) => {
//         if (!cancelled) setError(getErrorMessage(err, "Could not load users"));
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

//   // Staff = every role except student
//   const counts = useMemo(() => {
//     const students = users.filter(isStudent).length;
//     return { students, staff: users.length - students };
//   }, [users]);

//   const filtered = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     const inTab = users.filter((u) => (tab === "students" ? isStudent(u) : !isStudent(u)));
//     if (!q) return inTab;
//     return inTab.filter((u) =>
//       [u.name, u.email, u.phone, formatRole(u)].some((v) => String(v ?? "").toLowerCase().includes(q))
//     );
//   }, [users, query, tab]);

//   const openModal = (type, user) => {
//     setForm({ name: user.name || "", phone: user.phone || "", password: "" });
//     setModalError("");
//     setModal({ type, user });
//   };
//   const closeModal = () => setModal(null);

//   // PUT /users/:id
//   const handleEdit = async (e) => {
//     e.preventDefault();
//     if (!form.name.trim()) return setModalError("Name is required");
//     if (form.phone && !/^\d{10}$/.test(form.phone)) return setModalError("Enter a 10-digit mobile number");
//     setSaving(true);
//     try {
//       await updateUser(getId(modal.user), { name: form.name.trim(), phone: form.phone });
//       setNotice("User updated successfully");
//       closeModal();
//       reload();
//     } catch (err) {
//       setModalError(getErrorMessage(err, "Could not update user"));
//     } finally {
//       setSaving(false);
//     }
//   };

//   // POST /users/:id/reset-password
//   const handleResetPassword = async (e) => {
//     e.preventDefault();
//     if (form.password.length < 8) return setModalError("Password must be at least 8 characters");
//     setSaving(true);
//     try {
//       await adminResetPassword(getId(modal.user), form.password);
//       setNotice(`Temporary password set for ${modal.user.name}. They must change it on first login.`);
//       closeModal();
//     } catch (err) {
//       setModalError(getErrorMessage(err, "Could not reset password"));
//     } finally {
//       setSaving(false);
//     }
//   };

//   // PATCH /users/:id/status
//   const handleToggleStatus = async (user) => {
//     const next = !isActive(user);
//     if (!window.confirm(`${next ? "Activate" : "Deactivate"} ${user.name}?`)) return;
//     setBusyId(getId(user));
//     setError("");
//     try {
//       await setUserStatus(getId(user), next);
//       setNotice(`${user.name} ${next ? "activated" : "deactivated"}`);
//       reload();
//     } catch (err) {
//       setError(getErrorMessage(err, "Could not change status"));
//     } finally {
//       setBusyId(null);
//     }
//   };

//   return (
//     <div>
//       <PageHeader title="User Management" subtitle={`Manage ${counts.staff} staff and ${counts.students} student logins`} />

//       {/* Tabs: staff and students are shown separately */}
//       <div className="inline-flex p-1 rounded-lg bg-slate-200/70 mb-4">
//         {TABS.map(([key, label]) => (
//           <button
//             key={key}
//             onClick={() => setTab(key)}
//             className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
//               tab === key ? "bg-white text-[#0284C7] shadow-sm" : "text-slate-600 hover:text-slate-900"
//             }`}
//           >
//             {label} ({counts[key]})
//           </button>
//         ))}
//       </div>

//       {notice && <Notice onClose={() => setNotice("")}>{notice}</Notice>}
//       {error && <Notice tone="error">{error}</Notice>}

//       <Toolbar value={query} onChange={setQuery} placeholder="Search name, email, phone or role">
//         <button onClick={reload} className={btnOutline} aria-label="Refresh">
//           <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
//         </button>
//         {tab === "staff" && <AddButton to="/users/add-user">Add User</AddButton>}
//       </Toolbar>

//       <TableCard>
//         <table className="w-full text-sm text-left">
//           <thead className="bg-[#0B1437] text-white">
//             <tr>
//               <th className="px-4 py-3 w-10"><input type="checkbox" disabled aria-label="Select all" className="accent-[#0EA5E9]" /></th>
//               <th className="px-4 py-3">Name</th>
//               <th className="px-4 py-3">Phone</th>
//               <th className="px-4 py-3">Role</th>
//               <th className="px-4 py-3">Status</th>
//               <th className="px-4 py-3 text-right">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-slate-100">
//             {loading ? (
//               <tr>
//                 <td colSpan={6} className="px-4 py-10 text-center text-slate-500">Loading users...</td>
//               </tr>
//             ) : filtered.length === 0 ? (
//               <tr>
//                 <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
//                   {query ? "No users match your search" : tab === "students" ? "No students found" : "No staff users found"}
//                 </td>
//               </tr>
//             ) : (
//               filtered.map((u, i) => (
//                 <tr key={getId(u) || u.email || i}>
//                   <td className="px-4 py-3"><input type="checkbox" aria-label={`Select ${u.name}`} className="accent-[#0EA5E9]" /></td>
//                   <td className="px-4 py-3">
//                     <div className="flex items-center gap-3">
//                       <Avatar name={u.name} />
//                       <div>
//                         <p className="font-medium text-slate-900">{u.name}</p>
//                         <p className="text-xs text-slate-500">{u.email || "-"}</p>
//                       </div>
//                     </div>
//                   </td>
//                   <td className="px-4 py-3 text-slate-600">{u.phone || "-"}</td>
//                   <td className="px-4 py-3"><StatusPill tone="blue">{formatRole(u)}</StatusPill></td>
//                   <td className="px-4 py-3">
//                     <StatusPill tone={isActive(u) ? "green" : "gray"}>{isActive(u) ? "Active" : "Inactive"}</StatusPill>
//                   </td>
//                   <td className="px-4 py-3 text-right">
//                     <RowMenu
//                       items={[
//                         { label: "Edit details", icon: Pencil, onClick: () => openModal("edit", u) },
//                         { label: "Reset password", icon: KeyRound, onClick: () => openModal("password", u) },
//                         {
//                           label: isActive(u) ? "Deactivate" : "Activate",
//                           icon: Power,
//                           danger: isActive(u),
//                           disabled: busyId === getId(u),
//                           onClick: () => handleToggleStatus(u),
//                         },
//                       ]}
//                     />
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </TableCard>

//       {modal?.type === "edit" && (
//         <Modal title={`Edit ${modal.user.name}`} onClose={closeModal}>
//           <form onSubmit={handleEdit} className="space-y-4" noValidate>
//             {modalError && <p className="text-sm text-red-600">{modalError}</p>}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
//               <input
//                 value={form.name}
//                 onChange={(e) => setForm({ ...form, name: e.target.value })}
//                 className={inputClass}
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile</label>
//               <input
//                 value={form.phone}
//                 maxLength={10}
//                 onChange={(e) => setForm({ ...form, phone: e.target.value })}
//                 className={inputClass}
//               />
//             </div>
//             <div className="flex justify-end gap-3 pt-2">
//               <button type="button" onClick={closeModal} className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
//                 Cancel
//               </button>
//               <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-lg bg-[#0EA5E9] text-white font-medium hover:bg-[#0284C7] disabled:opacity-60">
//                 {saving ? "Saving..." : "Save changes"}
//               </button>
//             </div>
//           </form>
//         </Modal>
//       )}

//       {modal?.type === "password" && (
//         <Modal title={`Reset password for ${modal.user.name}`} onClose={closeModal}>
//           <form onSubmit={handleResetPassword} className="space-y-4" noValidate>
//             {modalError && <p className="text-sm text-red-600">{modalError}</p>}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1.5">Temporary password</label>
//               <input
//                 type="text"
//                 autoComplete="off"
//                 value={form.password}
//                 onChange={(e) => setForm({ ...form, password: e.target.value })}
//                 placeholder="Minimum 8 characters"
//                 className={inputClass}
//               />
//               <p className="text-xs text-gray-500 mt-1">The user will be asked to change it at next login.</p>
//             </div>
//             <div className="flex justify-end gap-3 pt-2">
//               <button type="button" onClick={closeModal} className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
//                 Cancel
//               </button>
//               <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-lg bg-[#0EA5E9] text-white font-medium hover:bg-[#0284C7] disabled:opacity-60">
//                 {saving ? "Saving..." : "Set password"}
//               </button>
//             </div>
//           </form>
//         </Modal>
//       )}
//     </div>
//   );
// };

// export default Users;


import React, { useEffect, useMemo, useState } from "react";
import { RefreshCw, Pencil, KeyRound, Power } from "lucide-react";
import { getUsers, updateUser, setUserStatus, adminResetPassword } from "./userService";
import { getErrorMessage } from "../../services/api";
import Modal from "../../components/Modal";
import { PageHeader, Toolbar, AddButton, TableCard, Notice, Avatar, StatusPill, RowMenu, btnOutline } from "../../components/ui";

const inputClass =
  "w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/40 focus:border-[#0EA5E9]";

const formatRole = (user) => {
  const raw = typeof user.role === "string" ? user.role : user.role?.name || user.roles?.[0]?.name || "";
  return raw ? raw.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "-";
};

const isActive = (user) => user.is_active ?? user.isActive ?? user.status === "active";
const getId = (u) => u.id || u._id;

// Role key such as "student", "faculty", "office_staff"
const roleKey = (user) =>
  String(typeof user.role === "string" ? user.role : user.role?.name || user.roles?.[0]?.name || "").toLowerCase();
const isStudent = (user) => roleKey(user) === "student";

const TABS = [
  ["staff", "Staff"],
  ["students", "Students"],
];

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("staff");
  const [reloadKey, setReloadKey] = useState(0);

  // modal state: { type: "edit" | "password", user }
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", password: "" });
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getUsers()
      .then(({ list }) => {
        if (cancelled) return;
        setUsers(list);
        setError("");
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, "Could not load users"));
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

  // Staff = every role except student
  const counts = useMemo(() => {
    const students = users.filter(isStudent).length;
    return { students, staff: users.length - students };
  }, [users]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const inTab = users.filter((u) => (tab === "students" ? isStudent(u) : !isStudent(u)));
    if (!q) return inTab;
    return inTab.filter((u) =>
      [u.name, u.email, u.phone, formatRole(u)].some((v) => String(v ?? "").toLowerCase().includes(q))
    );
  }, [users, query, tab]);

  const openModal = (type, user) => {
    setForm({ name: user.name || "", phone: user.phone || "", password: "" });
    setModalError("");
    setModal({ type, user });
  };
  const closeModal = () => setModal(null);

  // PUT /users/:id
  const handleEdit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setModalError("Name is required");
    if (form.phone && !/^\d{10}$/.test(form.phone)) return setModalError("Enter a 10-digit mobile number");
    setSaving(true);
    try {
      await updateUser(getId(modal.user), { name: form.name.trim(), phone: form.phone });
      setNotice("User updated successfully");
      closeModal();
      reload();
    } catch (err) {
      setModalError(getErrorMessage(err, "Could not update user"));
    } finally {
      setSaving(false);
    }
  };

  // POST /users/:id/reset-password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) return setModalError("Password must be at least 8 characters");
    setSaving(true);
    try {
      await adminResetPassword(getId(modal.user), form.password);
      setNotice(`Temporary password set for ${modal.user.name}. They must change it on first login.`);
      closeModal();
    } catch (err) {
      setModalError(getErrorMessage(err, "Could not reset password"));
    } finally {
      setSaving(false);
    }
  };

  // PATCH /users/:id/status
  const handleToggleStatus = async (user) => {
    const next = !isActive(user);
    if (!window.confirm(`${next ? "Activate" : "Deactivate"} ${user.name}?`)) return;
    setBusyId(getId(user));
    setError("");
    try {
      await setUserStatus(getId(user), next);
      setNotice(`${user.name} ${next ? "activated" : "deactivated"}`);
      reload();
    } catch (err) {
      setError(getErrorMessage(err, "Could not change status"));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <PageHeader title="User Management" subtitle={`Manage ${counts.staff} staff and ${counts.students} student logins`} />

      {/* Tabs: staff and students are shown separately */}
      <div className="inline-flex p-1 rounded-lg bg-slate-200/70 mb-4">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === key ? "bg-white text-[#0284C7] shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {label} ({counts[key]})
          </button>
        ))}
      </div>

      {notice && <Notice onClose={() => setNotice("")}>{notice}</Notice>}
      {error && <Notice tone="error">{error}</Notice>}

      <Toolbar>
        <button onClick={reload} className={btnOutline} aria-label="Refresh">
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
        {tab === "staff" && <AddButton to="/users/add-user">Add User</AddButton>}
      </Toolbar>

      <TableCard>
        <table className="w-full text-sm text-left">
          <thead className="bg-[#0B1437] text-white">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">Loading users...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  {query ? "No users match your search" : tab === "students" ? "No students found" : "No staff users found"}
                </td>
              </tr>
            ) : (
              filtered.map((u, i) => (
                <tr key={getId(u) || u.email || i}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} />
                      <div>
                        <p className="font-medium text-slate-900">{u.name}</p>
                        <p className="text-xs text-slate-500">{u.email || "-"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{u.phone || "-"}</td>
                  <td className="px-4 py-3"><StatusPill tone="blue">{formatRole(u)}</StatusPill></td>
                  <td className="px-4 py-3">
                    <StatusPill tone={isActive(u) ? "green" : "gray"}>{isActive(u) ? "Active" : "Inactive"}</StatusPill>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <RowMenu
                      items={[
                        { label: "Edit details", icon: Pencil, onClick: () => openModal("edit", u) },
                        { label: "Reset password", icon: KeyRound, onClick: () => openModal("password", u) },
                        {
                          label: isActive(u) ? "Deactivate" : "Activate",
                          icon: Power,
                          danger: isActive(u),
                          disabled: busyId === getId(u),
                          onClick: () => handleToggleStatus(u),
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </TableCard>

      {modal?.type === "edit" && (
        <Modal title={`Edit ${modal.user.name}`} onClose={closeModal}>
          <form onSubmit={handleEdit} className="space-y-4" noValidate>
            {modalError && <p className="text-sm text-red-600">{modalError}</p>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile</label>
              <input
                value={form.phone}
                maxLength={10}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={closeModal} className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-lg bg-[#0EA5E9] text-white font-medium hover:bg-[#0284C7] disabled:opacity-60">
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modal?.type === "password" && (
        <Modal title={`Reset password for ${modal.user.name}`} onClose={closeModal}>
          <form onSubmit={handleResetPassword} className="space-y-4" noValidate>
            {modalError && <p className="text-sm text-red-600">{modalError}</p>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Temporary password</label>
              <input
                type="text"
                autoComplete="off"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Minimum 8 characters"
                className={inputClass}
              />
              <p className="text-xs text-gray-500 mt-1">The user will be asked to change it at next login.</p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={closeModal} className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-lg bg-[#0EA5E9] text-white font-medium hover:bg-[#0284C7] disabled:opacity-60">
                {saving ? "Saving..." : "Set password"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Users;
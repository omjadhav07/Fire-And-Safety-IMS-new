import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, UserPlus, RefreshCw, Pencil, KeyRound, Power } from "lucide-react";
import { getUsers, updateUser, setUserStatus, adminResetPassword } from "./userService";
import { getErrorMessage } from "../../services/api";
import Modal from "../../components/Modal";

const inputClass =
  "w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/40 focus:border-[#D32F2F]";

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-1">
            {counts.staff} staff · {counts.students} students
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={reload}
            className="p-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
            aria-label="Refresh"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          {tab === "staff" && (
            <Link
              to="/users/add-user"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#D32F2F] text-white font-medium hover:bg-[#B71C1C]"
            >
              <UserPlus size={18} /> Add user
            </Link>
          )}
        </div>
      </div>

      {/* Tabs: staff and students are shown separately */}
      <div className="inline-flex p-1 rounded-lg bg-gray-100 mb-4">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === key ? "bg-white text-green-700 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {label} ({counts[key]})
          </button>
        ))}
      </div>

      {notice && (
        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 flex justify-between">
          <span>{notice}</span>
          <button onClick={() => setNotice("")} aria-label="Dismiss">×</button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, phone or role"
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/40 focus:border-[#D32F2F]"
            />
          </div>
        </div>

        {error && (
          <div className="m-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-500">Loading users...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                    {query ? "No users match your search" : tab === "students" ? "No students found" : "No staff users found"}
                  </td>
                </tr>
              ) : (
                filtered.map((u, i) => (
                  <tr key={getId(u) || u.email || i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                    <td className="px-4 py-3 text-gray-600">{u.email || "-"}</td>
                    <td className="px-4 py-3 text-gray-600">{u.phone || "-"}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                        {formatRole(u)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          isActive(u) ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {isActive(u) ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openModal("edit", u)}
                          title="Edit details"
                          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => openModal("password", u)}
                          title="Reset password"
                          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                        >
                          <KeyRound size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          disabled={busyId === getId(u)}
                          title={isActive(u) ? "Deactivate" : "Activate"}
                          className={`p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 ${
                            isActive(u) ? "text-green-600" : "text-gray-400"
                          }`}
                        >
                          <Power size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
              <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-lg bg-[#D32F2F] text-white font-medium hover:bg-[#B71C1C] disabled:opacity-60">
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
              <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-lg bg-[#D32F2F] text-white font-medium hover:bg-[#B71C1C] disabled:opacity-60">
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
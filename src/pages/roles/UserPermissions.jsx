import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, RotateCcw, Save, Lock } from "lucide-react";
import { getUserPermissions, getPermissions, saveUserPermissions, resetUserPermissions } from "./rbacService";
import { getErrorMessage } from "../../services/api";
import PermissionMatrix from "./PermissionMatrix";
import { buildMatrix } from "./permissionUtils";
import { PageHeader, Notice, Avatar, StatusPill, btnOutline, btnPrimary } from "../../components/ui";

const getId = (o) => o?._id || o?.id || "";
const roleLabel = (name) => String(name || "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "-";
const sameSet = (a, b) => a.size === b.size && [...a].every((x) => b.has(x));

// User-wise permissions: start from the role's permissions, switch single ones off (denied) or on (extra) for this user only.
const UserPermissions = () => {
  const { userId } = useParams();

  const [catalog, setCatalog] = useState({}); // module -> [permission]
  const [data, setData] = useState(null); // { user, role, extra, denied, effective } (codes)
  const [selected, setSelected] = useState(new Set()); // permission ids the user will have
  const [saved, setSaved] = useState(new Set()); // what the server has now
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const { idByCode, codeById } = useMemo(() => {
    const byCode = {};
    const byId = {};
    Object.values(catalog)
      .flat()
      .forEach((p) => {
        byCode[p.code] = getId(p);
        byId[getId(p)] = p.code;
      });
    return { idByCode: byCode, codeById: byId };
  }, [catalog]);

  // GET /rbac/users/:userId/permissions  +  GET /rbac/permissions (names and ids)
  useEffect(() => {
    let cancelled = false;
    Promise.all([getUserPermissions(userId), getPermissions()])
      .then(([perms, cat]) => {
        if (cancelled) return;
        const byCode = {};
        Object.values(cat).flat().forEach((p) => (byCode[p.code] = getId(p)));
        const ids = new Set(perms.effective.map((c) => byCode[c]).filter(Boolean));
        setCatalog(cat);
        setData(perms);
        setSelected(ids);
        setSaved(ids);
        setError("");
      })
      .catch((err) => !cancelled && setError(getErrorMessage(err, "Could not load the user's permissions")))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [userId, reloadKey]);

  const reload = () => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  const matrix = useMemo(() => buildMatrix(catalog), [catalog]);
  const total = Object.keys(codeById).length;

  // Role defaults as ids
  const roleIds = useMemo(() => new Set((data?.role || []).map((c) => idByCode[c]).filter(Boolean)), [data, idByCode]);
  const deniedIds = [...roleIds].filter((id) => !selected.has(id));
  const extraIds = [...selected].filter((id) => !roleIds.has(id));
  const customised = deniedIds.length + extraIds.length;
  const dirty = !sameSet(selected, saved);

  const role = data?.user?.role;
  const locked = role === "super_admin"; // Super Admin always keeps full access

  const toggle = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const toggleRow = (list) =>
    setSelected((prev) => {
      const next = new Set(prev);
      const all = list.every((p) => next.has(getId(p)));
      list.forEach((p) => (all ? next.delete(getId(p)) : next.add(getId(p))));
      return next;
    });

  // PUT /rbac/users/:userId/permissions   { denied: [ids] }
  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await saveUserPermissions(userId, { denied: deniedIds, extra: extraIds });
      setNotice(res.message || "User permissions updated");
      reload();
    } catch (err) {
      setError(getErrorMessage(err, "Could not save permissions"));
    } finally {
      setSaving(false);
    }
  };

  // DELETE /rbac/users/:userId/permissions
  const handleReset = async () => {
    if (!window.confirm(`Reset ${data?.user?.name || "this user"} to the ${roleLabel(role)} role defaults? Custom changes will be removed.`)) return;
    setSaving(true);
    setError("");
    try {
      const message = await resetUserPermissions(userId);
      setNotice(message || "Permissions reset to the role defaults");
      reload();
    } catch (err) {
      setError(getErrorMessage(err, "Could not reset permissions"));
    } finally {
      setSaving(false);
    }
  };

  // Tint cells that differ from the role default
  const cellClass = (p) => {
    const id = getId(p);
    if (roleIds.has(id) && !selected.has(id)) return "bg-red-50";
    if (!roleIds.has(id) && selected.has(id)) return "bg-emerald-50";
    return "";
  };

  const user = data?.user;

  return (
    <div>
      <Link to="/users" className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-[#0284C7] mb-3">
        <ArrowLeft size={16} /> Back to users
      </Link>
      <PageHeader title="User Permissions" subtitle="Change what this user can open, on top of the role's defaults" />

      {notice && <Notice onClose={() => setNotice("")}>{notice}</Notice>}
      {error && <Notice tone="error">{error}</Notice>}

      {loading && !data ? (
        <p className="py-10 text-center text-slate-500">Loading permissions...</p>
      ) : (
        user && (
          <>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-4 flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <Avatar name={user.name} size={44} />
                <div>
                  <p className="font-semibold text-slate-900">{user.name}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
                <StatusPill tone="blue">{roleLabel(role)}</StatusPill>
              </div>
              <div className="text-sm text-slate-600">
                <span className="font-semibold text-slate-900">{selected.size}</span> of {total} permissions on
                {customised > 0 && (
                  <span className="ml-2">
                    <StatusPill tone="amber">{customised} custom change{customised > 1 ? "s" : ""}</StatusPill>
                  </span>
                )}
              </div>
              {!locked && (
                <div className="flex gap-2">
                  <button onClick={handleReset} disabled={saving} className={btnOutline}>
                    <RotateCcw size={15} /> Reset to role default
                  </button>
                  <button onClick={handleSave} disabled={saving || !dirty} className={btnPrimary}>
                    <Save size={15} /> {saving ? "Saving..." : "Save changes"}
                  </button>
                </div>
              )}
            </div>

            {locked ? (
              <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 text-sm px-4 py-3 flex items-center gap-2">
                <Lock size={15} /> Super Admin always has full access, so these permissions cannot be changed.
              </div>
            ) : (
              <p className="text-xs text-slate-500 mb-3">
                <span className="inline-block w-3 h-3 rounded-sm bg-red-100 border border-red-200 align-middle mr-1" /> switched off for this user
                <span className="inline-block w-3 h-3 rounded-sm bg-emerald-100 border border-emerald-200 align-middle ml-4 mr-1" /> added on top of the role
              </p>
            )}

            <PermissionMatrix
              matrix={matrix}
              selected={selected}
              onToggle={toggle}
              onToggleRow={toggleRow}
              readOnly={locked}
              cellClass={cellClass}
            />
          </>
        )
      )}
    </div>
  );
};

export default UserPermissions;

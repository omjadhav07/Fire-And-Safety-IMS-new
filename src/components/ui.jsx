import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Search, MoreVertical, Upload, Download, Plus, X } from "lucide-react";

// ---- shared pieces of the "master page" design ---------------------------------

export const btnPrimary =
  "inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0EA5E9] text-white text-sm font-medium hover:bg-[#0284C7] disabled:opacity-60";
export const btnOutline =
  "inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-60";

// Page title + subtitle (top of every master page)
export const PageHeader = ({ title, subtitle, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
    <div>
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
    </div>
    {children && <div className="flex items-center gap-2">{children}</div>}
  </div>
);

// White card with search on the left and action buttons on the right
export const Toolbar = ({ value, onChange, placeholder = "Search...", children }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 mb-4 flex flex-col md:flex-row md:items-center gap-3">
    <div className="relative flex-1 md:max-w-md">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9]"
      />
    </div>
    <div className="flex flex-wrap items-center gap-2 md:ml-auto">{children}</div>
  </div>
);

export const ImportButton = ({ onClick }) => (
  <button type="button" onClick={onClick} className={btnOutline}><Upload size={15} /> Import</button>
);
export const ExportButton = ({ onClick }) => (
  <button type="button" onClick={onClick} className={btnOutline}><Download size={15} /> Export</button>
);
export const AddButton = ({ onClick, to, children }) => {
  const content = <><Plus size={16} /> {children}</>;
  if (to) return <Link to={to} className={btnPrimary}>{content}</Link>;
  return <button type="button" onClick={onClick} className={btnPrimary}>{content}</button>;
};

// Table card wrapper (rounded, scrolls sideways on small screens)
export const TableCard = ({ children }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="overflow-x-auto">{children}</div>
  </div>
);

export const Notice = ({ children, onClose, tone = "success" }) => (
  <div
    className={`mb-4 rounded-lg border text-sm px-4 py-3 flex justify-between ${
      tone === "error" ? "bg-red-50 border-red-200 text-red-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"
    }`}
  >
    <span>{children}</span>
    {onClose && (
      <button onClick={onClose} aria-label="Dismiss"><X size={16} /></button>
    )}
  </div>
);

// Round initials badge
const PALETTE = ["bg-sky-100 text-sky-700", "bg-violet-100 text-violet-700", "bg-amber-100 text-amber-700", "bg-rose-100 text-rose-700", "bg-teal-100 text-teal-700", "bg-indigo-100 text-indigo-700"];
export const Avatar = ({ name = "", size = 36 }) => {
  const words = String(name).trim().split(/\s+/).filter(Boolean);
  const initials = ((words[0]?.[0] || "?") + (words.length > 1 ? words[words.length - 1][0] : "")).toUpperCase();
  const tone = PALETTE[[...String(name)].reduce((a, c) => a + c.charCodeAt(0), 0) % PALETTE.length];
  return (
    <span
      style={{ width: size, height: size }}
      className={`shrink-0 rounded-full inline-flex items-center justify-center text-xs font-semibold ${tone}`}
    >
      {initials}
    </span>
  );
};

// Pill: tone = green | gray | red | amber | blue
const TONES = {
  green: "bg-emerald-100 text-emerald-700",
  gray: "bg-slate-200 text-slate-600",
  red: "bg-red-100 text-red-700",
  amber: "bg-amber-100 text-amber-700",
  blue: "bg-sky-100 text-sky-700",
};
export const StatusPill = ({ tone = "gray", children }) => (
  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize ${TONES[tone] || TONES.gray}`}>
    {children}
  </span>
);

// Kebab (⋮) menu. items: [{label, icon, onClick, danger, hidden, disabled}]
export const RowMenu = ({ items }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const visible = items.filter((i) => !i.hidden);
  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Actions"
        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
      >
        <MoreVertical size={18} />
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-1 w-48 rounded-lg border border-slate-200 bg-white shadow-lg py-1">
          {visible.map((it) => {
            const Icon = it.icon;
            const cls = `w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left disabled:opacity-50 ${
              it.danger ? "text-red-600 hover:bg-red-50" : "text-slate-700 hover:bg-slate-50"
            }`;
            const inner = <>{Icon && <Icon size={15} />}{it.label}</>;
            return it.href ? (
              <Link key={it.label} to={it.href} className={cls} onClick={() => setOpen(false)}>{inner}</Link>
            ) : (
              <button
                key={it.label}
                disabled={it.disabled}
                className={cls}
                onClick={() => {
                  setOpen(false);
                  it.onClick?.();
                }}
              >
                {inner}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

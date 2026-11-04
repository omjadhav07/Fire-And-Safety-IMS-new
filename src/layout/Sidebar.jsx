import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, GraduationCap, Library, Megaphone, UserCheck, ClipboardList, ClipboardCheck, Award, IndianRupee, Wallet, FolderOpen, ScrollText, ChevronDown, Search, LogOut } from 'lucide-react';
import { logoutUser } from '../pages/auth/authService';
import { canAccess, getCurrentRole } from '../config/permissions';

// Add new modules here as they are built.
// "access" is a page key from config/permissions.js: the item shows only for roles allowed there.
const MENU = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', access: 'dashboard' },
  {
    label: 'User Management',
    icon: Users,
    access: 'users',
    children: [
      { label: 'All Users', path: '/users' },
      // { label: 'Add User', path: '/users/add-user' },
    ],
  },
  {
    label: 'Course Master',
    icon: GraduationCap,
    children: [
      { label: 'Courses', path: '/courses', access: 'courses' },
      { label: 'Faculty Assignments', path: '/faculty-assignments', access: 'facultyAssignments' },
      { label: 'Class Schedules', path: '/class-schedules', access: 'classSchedules' },
    ],
  },
  { label: 'Class Tests', icon: ClipboardCheck, path: '/class-tests', access: 'classTests' },
  { label: 'Exams', icon: Award, path: '/exam-results', access: 'examResults' },
  { label: 'Enquiries', icon: ClipboardList, path: '/enquiries', access: 'enquiries' },
  { label: 'Students', icon: UserCheck, path: '/students', access: 'students' },
  { label: 'Fees', icon: IndianRupee, path: '/fees', access: 'fees' },
  { label: 'My Fees', icon: Wallet, path: '/my-fees', access: 'myFees' },
  {
    label: 'Library',
    icon: Library,
    access: 'library',
    children: [
      { label: 'Books', path: '/library/books' },
      { label: 'Categories', path: '/library/categories' },
      { label: 'Book Issues', path: '/library/issues' },
    ],
  },
  { label: 'Notices', icon: Megaphone, path: '/notices', access: 'notices' },
  { label: 'My Files', icon: FolderOpen, path: '/files', access: 'files' },
  { label: 'Audit Logs', icon: ScrollText, path: '/audit-logs', access: 'auditLogs' },
];

// Menu for one role: drop what the role may not open, and groups that end up empty
const menuForRole = (role) => {
  const ok = (item) => !item.access || canAccess(role, item.access);
  return MENU.filter(ok)
    .map((m) => (m.children ? { ...m, children: m.children.filter(ok) } : m))
    .filter((m) => !m.children || m.children.length > 0);
};

const Sidebar = ({ open, onNavigate }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [search, setSearch] = useState('');

  const isActive = (path) =>
    pathname === path || (path !== '/users' && pathname.startsWith(path + '/'));

  // Group containing the current page starts expanded
  const [expanded, setExpanded] = useState(() =>
    Object.fromEntries(
      MENU.filter((m) => m.children?.some((c) => isActive(c.path))).map((m) => [m.label, true])
    )
  );

  const toggle = (label) => setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));

  const handleLogout = async () => {
    await logoutUser(); // POST /auth/logout, then clears the local session
    navigate('/login');
  };

  // Menu search: match the group label or any child label
  const q = search.trim().toLowerCase();
  const allowedMenu = menuForRole(getCurrentRole());
  const visibleMenu = allowedMenu.map((m) => {
    if (!q) return m;
    const selfMatch = m.label.toLowerCase().includes(q);
    const children = m.children?.filter((c) => selfMatch || c.label.toLowerCase().includes(q));
    if (m.children) return selfMatch || children.length ? { ...m, children } : null;
    return selfMatch ? m : null;
  }).filter(Boolean);

  return (
    <aside
      className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col
        transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}
    >
      {/* Search menu */}
      <div className="p-4 pb-2">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Menu...."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-gray-100 border border-transparent focus:outline-none focus:bg-white focus:border-green-500"
          />
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {visibleMenu.length === 0 && <p className="px-3 py-4 text-sm text-gray-400">No menu found</p>}

        {visibleMenu.map((item) => {
          const Icon = item.icon;

          if (!item.children) {
            const active = isActive(item.path);
            return (
              <NavLink
                key={item.label}
                to={item.path}
                onClick={onNavigate}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-green-600" />}
                <Icon size={18} className={active ? 'text-green-700' : 'text-green-700/80'} />
                {item.label}
              </NavLink>
            );
          }

          const isOpen = q ? true : !!expanded[item.label];
          const groupActive = item.children.some((c) => isActive(c.path));
          return (
            <div key={item.label}>
              <button
                onClick={() => toggle(item.label)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  groupActive ? 'text-green-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon size={18} className="text-green-700/80" />
                <span className="flex-1 text-left">{item.label}</span>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && (
                <div className="mt-1 ml-5 pl-4 border-l border-gray-200 space-y-0.5">
                  {item.children.map((child) => {
                    const active = isActive(child.path);
                    return (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        onClick={onNavigate}
                        className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                          active ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {child.label}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
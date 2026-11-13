// import React, { useState } from 'react';
// import { NavLink, useNavigate, useLocation } from 'react-router-dom';
// import { ChevronDown, Search, LogOut } from 'lucide-react';
// import { logoutUser } from '../pages/auth/authService';
// import { getCurrentRole } from '../config/permissions';

// // --- MENU CONFIGURATION ---
// const MENU = [
//   { label: 'Dashboard', path: '/dashboard' },
//   { label: 'User Management', path: '/users' },
//   {
//     label: 'Course Master',
//     children: [
//       { label: 'Courses', path: '/courses' },
//       { label: 'Faculty Assignments', path: '/faculty-assignments' },
//       { label: 'Class Schedules', path: '/class-schedules' },
//     ],
//   },
//   {
//     label: 'Library',
//     children: [
//       { label: 'Books', path: '/library/books' },
//       { label: 'Categories', path: '/library/categories' },
//       { label: 'Issues', path: '/library/issues' },
//     ],
//   },
//   { label: 'TC/LC', path: '/tc-lc' },
//   { label: 'Results', path: '/results' },
//   { label: 'Class Tests', path: '/class-tests' },
//   { label: 'Exams', path: '/exams' },
//   { label: 'Enquiries', path: '/enquiries' },
//   { label: 'Students', path: '/students' },
//   { label: 'Fees', path: '/fees' },
//   { label: 'Notices', path: '/notices' }, 
// ];

// const menuForRole = (role) => {
//   return MENU; 
// };

// const Sidebar = ({ open, onNavigate }) => {
//   const navigate = useNavigate();
//   const { pathname } = useLocation();
//   const [search, setSearch] = useState('');

//   const isActive = (path) =>
//     pathname === path || (path !== '/users' && pathname.startsWith(path + '/'));

//   const [expanded, setExpanded] = useState(() =>
//     Object.fromEntries(
//       MENU.filter((m) => m.children?.some((c) => isActive(c.path))).map((m) => [m.label, true])
//     )
//   );

//   const toggle = (label) => setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));

//   const handleLogout = async () => {
//     await logoutUser();
//     navigate('/login');
//   };

//   const q = search.trim().toLowerCase();
//   const allowedMenu = menuForRole(getCurrentRole());
//   const visibleMenu = allowedMenu.map((m) => {
//     if (!q) return m;
//     const selfMatch = m.label.toLowerCase().includes(q);
//     const children = m.children?.filter((c) => selfMatch || c.label.toLowerCase().includes(q));
//     if (m.children) return selfMatch || children.length ? { ...m, children } : null;
//     return selfMatch ? m : null;
//   }).filter(Boolean);

//   return (
//     <aside
//       className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0B1437] text-slate-300 flex flex-col
//         transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}
//     >
//       {/* Brand / Logo */}
//       <div className="px-4 py-4 border-b border-white/10 shrink-0">
//         <div className="rounded-lg bg-white p-2.5 shadow-sm">
//           <img 
//             src="/logo.png" 
//             alt="Sahyadri College of Fire Engineering and Safety Management" 
//             className="block w-full h-auto" 
//           />
//         </div>
//       </div>

//       {/* Search menu */}
//       <div className="px-4 pt-4 shrink-0">
//         <div className="relative">
//           <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
//           <input
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="Search menu..."
//             className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-white/10 text-white placeholder-slate-400 border border-transparent focus:outline-none focus:border-[#0EA5E9]"
//           />
//         </div>
//       </div>

//       <p className="px-6 pt-5 pb-2 text-[11px] font-semibold tracking-widest text-slate-500 shrink-0">NAVIGATION</p>

//       {/* Menu */}
//       <nav className="flex-1 overflow-y-auto no-scrollbar px-3 pb-3 space-y-1">
//         {visibleMenu.length === 0 && <p className="px-3 py-4 text-sm text-slate-500">No menu found</p>}

//         {visibleMenu.map((item) => {
          
//           // Render simple link (Main Group Label)
//           if (!item.children) {
//             const active = isActive(item.path);
//             return (
//               <NavLink
//                 key={item.label}
//                 to={item.path}
//                 onClick={onNavigate}
//                 className={`flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium transition-colors ${
//                   active ? 'bg-[#0EA5E9] text-white shadow' : 'hover:bg-white/10 hover:text-white'
//                 }`}
//               >
//                 {/* FILLED ROLE INDICATOR */}
//                 <span className={`w-2 h-2 rounded-full shrink-0 ${active ? 'bg-white' : 'bg-slate-500'}`}></span>
//                 {item.label}
//               </NavLink>
//             );
//           }

//           // Render dropdown group
//           const isOpen = q ? true : !!expanded[item.label];
//           const groupActive = item.children.some((c) => isActive(c.path));
//           return (
//             <div key={item.label}>
//               <button
//                 onClick={() => toggle(item.label)}
//                 className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium transition-colors ${
//                   groupActive ? 'text-white' : 'hover:bg-white/10 hover:text-white'
//                 }`}
//               >
//                 {/* FILLED ROLE INDICATOR for the group */}
//                 <span className={`w-2 h-2 rounded-full shrink-0 ${groupActive ? 'bg-[#0EA5E9]' : 'bg-slate-500'}`}></span>
//                 <span className="flex-1 text-left">{item.label}</span>
//                 <ChevronDown size={15} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
//               </button>

//               {isOpen && (
//                 <div className="mt-1 ml-4 pl-3 border-l border-white/10 space-y-0.5">
//                   {item.children.map((child) => {
//                     const active = isActive(child.path);
//                     return (
//                       <NavLink
//                         key={child.path}
//                         to={child.path}
//                         onClick={onNavigate}
//                         className={`flex items-center gap-3 px-3 py-2 rounded-full text-sm transition-colors ${
//                           active ? 'bg-[#0EA5E9] text-white font-medium' : 'hover:bg-white/10 hover:text-white'
//                         }`}
//                       >
//                         {/* FILLED ROLE INDICATOR for child items */}
//                         <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? 'bg-white' : 'bg-slate-600'}`}></span>
//                         {child.label}
//                       </NavLink>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </nav>

//       {/* Logout */}
//       <div className="p-3 border-t border-white/10 shrink-0">
//         <button
//           onClick={handleLogout}
//           className="w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium text-red-300 hover:bg-red-500/10 transition-colors"
//         >
//           <LogOut size={18} />
//           Logout
//         </button>
//       </div>
//     </aside>
//   );
// };

// export default Sidebar;


// import React, { useState } from 'react';
// import { NavLink, useNavigate, useLocation } from 'react-router-dom';
// import { ChevronDown, Search, LogOut } from 'lucide-react';
// import { logoutUser } from '../pages/auth/authService';
// import { canAccess, getCurrentRole } from '../config/permissions';

// // --- MENU CONFIGURATION ---
// const MENU = [
//   { label: 'Dashboard', path: '/dashboard' },
//   { label: 'User Management', path: '/users' },
//   {
//     label: 'Course Master',
//     children: [
//       { label: 'Courses', path: '/courses' },
//       { label: 'Faculty Assignments', path: '/faculty-assignments' },
//       { label: 'Class Schedules', path: '/class-schedules' },
//     ],
//   },
//   { label: 'Study Material', path: '/study-material', access: 'studyMaterial' },
//   {
//     label: 'Library',
//     children: [
//       { label: 'Books', path: '/library/books' },
//       { label: 'Categories', path: '/library/categories' },
//       { label: 'Issues', path: '/library/issues' },
//     ],
//   },
//   { label: 'TC/LC', path: '/tc-lc' },
//   { label: 'Results', path: '/results' },
//   { label: 'Class Tests', path: '/class-tests' },
//   { label: 'Exams', path: '/exams' },
//   { label: 'Enquiries', path: '/enquiries' },
//   { label: 'Students', path: '/students' },
//   { label: 'Fees', path: '/fees' },
//   { label: 'Notices', path: '/notices' }, 
// ];

// // Items with an "access" key (see config/permissions.js) show only for the roles allowed there
// const menuForRole = (role) => MENU.filter((m) => !m.access || canAccess(role, m.access));

// const Sidebar = ({ open, onNavigate }) => {
//   const navigate = useNavigate();
//   const { pathname } = useLocation();
//   const [search, setSearch] = useState('');

//   const isActive = (path) =>
//     pathname === path || (path !== '/users' && pathname.startsWith(path + '/'));

//   const [expanded, setExpanded] = useState(() =>
//     Object.fromEntries(
//       MENU.filter((m) => m.children?.some((c) => isActive(c.path))).map((m) => [m.label, true])
//     )
//   );

//   const toggle = (label) => setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));

//   const handleLogout = async () => {
//     await logoutUser();
//     navigate('/login');
//   };

//   const q = search.trim().toLowerCase();
//   const allowedMenu = menuForRole(getCurrentRole());
//   const visibleMenu = allowedMenu.map((m) => {
//     if (!q) return m;
//     const selfMatch = m.label.toLowerCase().includes(q);
//     const children = m.children?.filter((c) => selfMatch || c.label.toLowerCase().includes(q));
//     if (m.children) return selfMatch || children.length ? { ...m, children } : null;
//     return selfMatch ? m : null;
//   }).filter(Boolean);

//   return (
//     <aside
//       className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0B1437] text-slate-300 flex flex-col
//         transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}
//     >
//       {/* Brand / Logo */}
//       <div className="px-4 py-4 border-b border-white/10 shrink-0">
//         <div className="rounded-lg bg-white p-2.5 shadow-sm">
//           <img 
//             src="/logo.png" 
//             alt="Sahyadri College of Fire Engineering and Safety Management" 
//             className="block w-full h-auto" 
//           />
//         </div>
//       </div>

//       {/* Search menu */}
//       <div className="px-4 pt-4 shrink-0">
//         <div className="relative">
//           <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
//           <input
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="Search menu..."
//             className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-white/10 text-white placeholder-slate-400 border border-transparent focus:outline-none focus:border-[#0EA5E9]"
//           />
//         </div>
//       </div>

//       <p className="px-6 pt-5 pb-2 text-[11px] font-semibold tracking-widest text-slate-500 shrink-0">NAVIGATION</p>

//       {/* Menu */}
//       <nav className="flex-1 overflow-y-auto no-scrollbar px-3 pb-3 space-y-1">
//         {visibleMenu.length === 0 && <p className="px-3 py-4 text-sm text-slate-500">No menu found</p>}

//         {visibleMenu.map((item) => {
          
//           // Render simple link (Main Group Label)
//           if (!item.children) {
//             const active = isActive(item.path);
//             return (
//               <NavLink
//                 key={item.label}
//                 to={item.path}
//                 onClick={onNavigate}
//                 className={`flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium transition-colors ${
//                   active ? 'bg-[#0EA5E9] text-white shadow' : 'hover:bg-white/10 hover:text-white'
//                 }`}
//               >
//                 {/* FILLED ROLE INDICATOR */}
//                 <span className={`w-2 h-2 rounded-full shrink-0 ${active ? 'bg-white' : 'bg-slate-500'}`}></span>
//                 {item.label}
//               </NavLink>
//             );
//           }

//           // Render dropdown group
//           const isOpen = q ? true : !!expanded[item.label];
//           const groupActive = item.children.some((c) => isActive(c.path));
//           return (
//             <div key={item.label}>
//               <button
//                 onClick={() => toggle(item.label)}
//                 className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium transition-colors ${
//                   groupActive ? 'text-white' : 'hover:bg-white/10 hover:text-white'
//                 }`}
//               >
//                 {/* FILLED ROLE INDICATOR for the group */}
//                 <span className={`w-2 h-2 rounded-full shrink-0 ${groupActive ? 'bg-[#0EA5E9]' : 'bg-slate-500'}`}></span>
//                 <span className="flex-1 text-left">{item.label}</span>
//                 <ChevronDown size={15} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
//               </button>

//               {isOpen && (
//                 <div className="mt-1 ml-4 pl-3 border-l border-white/10 space-y-0.5">
//                   {item.children.map((child) => {
//                     const active = isActive(child.path);
//                     return (
//                       <NavLink
//                         key={child.path}
//                         to={child.path}
//                         onClick={onNavigate}
//                         className={`flex items-center gap-3 px-3 py-2 rounded-full text-sm transition-colors ${
//                           active ? 'bg-[#0EA5E9] text-white font-medium' : 'hover:bg-white/10 hover:text-white'
//                         }`}
//                       >
//                         {/* FILLED ROLE INDICATOR for child items */}
//                         <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? 'bg-white' : 'bg-slate-600'}`}></span>
//                         {child.label}
//                       </NavLink>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </nav>

//       {/* Logout */}
//       <div className="p-3 border-t border-white/10 shrink-0">
//         <button
//           onClick={handleLogout}
//           className="w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium text-red-300 hover:bg-red-500/10 transition-colors"
//         >
//           <LogOut size={18} />
//           Logout
//         </button>
//       </div>
//     </aside>
//   );
// };

// export default Sidebar;



// import React, { useState } from 'react';
// import { NavLink, useNavigate, useLocation } from 'react-router-dom';
// import { ChevronDown, Search, LogOut } from 'lucide-react';
// import { logoutUser } from '../pages/auth/authService';
// import { canAccess, getCurrentRole } from '../config/permissions';

// // --- MENU CONFIGURATION ---
// const MENU = [
//   { label: 'Dashboard', path: '/dashboard' },
//   { label: 'User Management', path: '/users' },
//   {
//     label: 'Course Master',
//     children: [
//       { label: 'Courses', path: '/courses' },
//       { label: 'Faculty Assignments', path: '/faculty-assignments' },
//       { label: 'Class Schedules', path: '/class-schedules' },
//     ],
//   },
//   { label: 'Study Material', path: '/study-material', access: 'studyMaterial' },
//   {
//     label: 'Library',
//     children: [
//       { label: 'Books', path: '/library/books' },
//       { label: 'Categories', path: '/library/categories' },
//       { label: 'Issues', path: '/library/issues' },
//     ],
//   },
//   { label: 'TC/LC', path: '/tc-lc' },
//   { label: 'Results', path: '/results' },
//   { label: 'Class Tests', path: '/class-tests' },
//   { label: 'Exams', path: '/exams' },
//   { label: 'Exam Forms', path: '/exam-forms', access: 'examForms' },
//   { label: 'Enquiries', path: '/enquiries' },
//   { label: 'Students', path: '/students' },
//   { label: 'Fees', path: '/fees' },
//   { label: 'Notices', path: '/notices' }, 
// ];

// // Items with an "access" key (see config/permissions.js) show only for the roles allowed there
// const menuForRole = (role) => MENU.filter((m) => !m.access || canAccess(role, m.access));

// const Sidebar = ({ open, onNavigate }) => {
//   const navigate = useNavigate();
//   const { pathname } = useLocation();
//   const [search, setSearch] = useState('');

//   const isActive = (path) =>
//     pathname === path || (path !== '/users' && pathname.startsWith(path + '/'));

//   const [expanded, setExpanded] = useState(() =>
//     Object.fromEntries(
//       MENU.filter((m) => m.children?.some((c) => isActive(c.path))).map((m) => [m.label, true])
//     )
//   );

//   const toggle = (label) => setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));

//   const handleLogout = async () => {
//     await logoutUser();
//     navigate('/login');
//   };

//   const q = search.trim().toLowerCase();
//   const allowedMenu = menuForRole(getCurrentRole());
//   const visibleMenu = allowedMenu.map((m) => {
//     if (!q) return m;
//     const selfMatch = m.label.toLowerCase().includes(q);
//     const children = m.children?.filter((c) => selfMatch || c.label.toLowerCase().includes(q));
//     if (m.children) return selfMatch || children.length ? { ...m, children } : null;
//     return selfMatch ? m : null;
//   }).filter(Boolean);

//   return (
//     <aside
//       className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0B1437] text-slate-300 flex flex-col
//         transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}
//     >
//       {/* Brand / Logo */}
//       <div className="px-4 py-4 border-b border-white/10 shrink-0">
//         <div className="rounded-lg bg-white p-2.5 shadow-sm">
//           <img 
//             src="/logo.png" 
//             alt="Sahyadri College of Fire Engineering and Safety Management" 
//             className="block w-full h-auto" 
//           />
//         </div>
//       </div>

//       {/* Search menu */}
//       <div className="px-4 pt-4 shrink-0">
//         <div className="relative">
//           <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
//           <input
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="Search menu..."
//             className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-white/10 text-white placeholder-slate-400 border border-transparent focus:outline-none focus:border-[#0EA5E9]"
//           />
//         </div>
//       </div>

//       <p className="px-6 pt-5 pb-2 text-[11px] font-semibold tracking-widest text-slate-500 shrink-0">NAVIGATION</p>

//       {/* Menu */}
//       <nav className="flex-1 overflow-y-auto no-scrollbar px-3 pb-3 space-y-1">
//         {visibleMenu.length === 0 && <p className="px-3 py-4 text-sm text-slate-500">No menu found</p>}

//         {visibleMenu.map((item) => {
          
//           // Render simple link (Main Group Label)
//           if (!item.children) {
//             const active = isActive(item.path);
//             return (
//               <NavLink
//                 key={item.label}
//                 to={item.path}
//                 onClick={onNavigate}
//                 className={`flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium transition-colors ${
//                   active ? 'bg-[#0EA5E9] text-white shadow' : 'hover:bg-white/10 hover:text-white'
//                 }`}
//               >
//                 {/* FILLED ROLE INDICATOR */}
//                 <span className={`w-2 h-2 rounded-full shrink-0 ${active ? 'bg-white' : 'bg-slate-500'}`}></span>
//                 {item.label}
//               </NavLink>
//             );
//           }

//           // Render dropdown group
//           const isOpen = q ? true : !!expanded[item.label];
//           const groupActive = item.children.some((c) => isActive(c.path));
//           return (
//             <div key={item.label}>
//               <button
//                 onClick={() => toggle(item.label)}
//                 className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium transition-colors ${
//                   groupActive ? 'text-white' : 'hover:bg-white/10 hover:text-white'
//                 }`}
//               >
//                 {/* FILLED ROLE INDICATOR for the group */}
//                 <span className={`w-2 h-2 rounded-full shrink-0 ${groupActive ? 'bg-[#0EA5E9]' : 'bg-slate-500'}`}></span>
//                 <span className="flex-1 text-left">{item.label}</span>
//                 <ChevronDown size={15} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
//               </button>

//               {isOpen && (
//                 <div className="mt-1 ml-4 pl-3 border-l border-white/10 space-y-0.5">
//                   {item.children.map((child) => {
//                     const active = isActive(child.path);
//                     return (
//                       <NavLink
//                         key={child.path}
//                         to={child.path}
//                         onClick={onNavigate}
//                         className={`flex items-center gap-3 px-3 py-2 rounded-full text-sm transition-colors ${
//                           active ? 'bg-[#0EA5E9] text-white font-medium' : 'hover:bg-white/10 hover:text-white'
//                         }`}
//                       >
//                         {/* FILLED ROLE INDICATOR for child items */}
//                         <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? 'bg-white' : 'bg-slate-600'}`}></span>
//                         {child.label}
//                       </NavLink>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </nav>

//       {/* Logout */}
//       <div className="p-3 border-t border-white/10 shrink-0">
//         <button
//           onClick={handleLogout}
//           className="w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium text-red-300 hover:bg-red-500/10 transition-colors"
//         >
//           <LogOut size={18} />
//           Logout
//         </button>
//       </div>
//     </aside>
//   );
// };

// export default Sidebar;

//13 nov 

// import React, { useState } from 'react';
// import { NavLink, useNavigate, useLocation } from 'react-router-dom';
// import { ChevronDown, Search, LogOut } from 'lucide-react';
// import { logoutUser } from '../pages/auth/authService';
// import { getCurrentRole } from '../config/permissions';

// // --- MENU CONFIGURATION ---
// const MENU = [
//   { label: 'Dashboard', path: '/dashboard' },
//   { label: 'User Management', path: '/users' },
//   {
//     label: 'Course Master',
//     children: [
//       { label: 'Courses', path: '/courses' },
//       { label: 'Faculty Assignments', path: '/faculty-assignments' },
//       { label: 'Class Schedules', path: '/class-schedules' },
//     ],
//   },
//   {
//     label: 'Library',
//     children: [
//       { label: 'Books', path: '/library/books' },
//       { label: 'Categories', path: '/library/categories' },
//       { label: 'Issues', path: '/library/issues' },
//     ],
//   },
//   { label: 'TC/LC', path: '/tc-lc' },
//   { label: 'Results', path: '/results' },
//   { label: 'Class Tests', path: '/class-tests' },
//   { label: 'Exams', path: '/exams' },
//   { label: 'Enquiries', path: '/enquiries' },
//   { label: 'Students', path: '/students' },
//   { label: 'Fees', path: '/fees' },
//   { label: 'Notices', path: '/notices' }, 
// ];

// const menuForRole = (role) => {
//   return MENU; 
// };

// const Sidebar = ({ open, onNavigate }) => {
//   const navigate = useNavigate();
//   const { pathname } = useLocation();
//   const [search, setSearch] = useState('');

//   const isActive = (path) =>
//     pathname === path || (path !== '/users' && pathname.startsWith(path + '/'));

//   const [expanded, setExpanded] = useState(() =>
//     Object.fromEntries(
//       MENU.filter((m) => m.children?.some((c) => isActive(c.path))).map((m) => [m.label, true])
//     )
//   );

//   const toggle = (label) => setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));

//   const handleLogout = async () => {
//     await logoutUser();
//     navigate('/login');
//   };

//   const q = search.trim().toLowerCase();
//   const allowedMenu = menuForRole(getCurrentRole());
//   const visibleMenu = allowedMenu.map((m) => {
//     if (!q) return m;
//     const selfMatch = m.label.toLowerCase().includes(q);
//     const children = m.children?.filter((c) => selfMatch || c.label.toLowerCase().includes(q));
//     if (m.children) return selfMatch || children.length ? { ...m, children } : null;
//     return selfMatch ? m : null;
//   }).filter(Boolean);

//   return (
//     <aside
//       className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0B1437] text-slate-300 flex flex-col
//         transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}
//     >
//       {/* Brand / Logo */}
//       <div className="px-4 py-4 border-b border-white/10 shrink-0">
//         <div className="rounded-lg bg-white p-2.5 shadow-sm">
//           <img 
//             src="/logo.png" 
//             alt="Sahyadri College of Fire Engineering and Safety Management" 
//             className="block w-full h-auto" 
//           />
//         </div>
//       </div>

//       {/* Search menu */}
//       <div className="px-4 pt-4 shrink-0">
//         <div className="relative">
//           <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
//           <input
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="Search menu..."
//             className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-white/10 text-white placeholder-slate-400 border border-transparent focus:outline-none focus:border-[#0EA5E9]"
//           />
//         </div>
//       </div>

//       <p className="px-6 pt-5 pb-2 text-[11px] font-semibold tracking-widest text-slate-500 shrink-0">NAVIGATION</p>

//       {/* Menu */}
//       <nav className="flex-1 overflow-y-auto no-scrollbar px-3 pb-3 space-y-1">
//         {visibleMenu.length === 0 && <p className="px-3 py-4 text-sm text-slate-500">No menu found</p>}

//         {visibleMenu.map((item) => {
          
//           // Render simple link (Main Group Label)
//           if (!item.children) {
//             const active = isActive(item.path);
//             return (
//               <NavLink
//                 key={item.label}
//                 to={item.path}
//                 onClick={onNavigate}
//                 className={`flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium transition-colors ${
//                   active ? 'bg-[#0EA5E9] text-white shadow' : 'hover:bg-white/10 hover:text-white'
//                 }`}
//               >
//                 {/* FILLED ROLE INDICATOR */}
//                 <span className={`w-2 h-2 rounded-full shrink-0 ${active ? 'bg-white' : 'bg-slate-500'}`}></span>
//                 {item.label}
//               </NavLink>
//             );
//           }

//           // Render dropdown group
//           const isOpen = q ? true : !!expanded[item.label];
//           const groupActive = item.children.some((c) => isActive(c.path));
//           return (
//             <div key={item.label}>
//               <button
//                 onClick={() => toggle(item.label)}
//                 className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium transition-colors ${
//                   groupActive ? 'text-white' : 'hover:bg-white/10 hover:text-white'
//                 }`}
//               >
//                 {/* FILLED ROLE INDICATOR for the group */}
//                 <span className={`w-2 h-2 rounded-full shrink-0 ${groupActive ? 'bg-[#0EA5E9]' : 'bg-slate-500'}`}></span>
//                 <span className="flex-1 text-left">{item.label}</span>
//                 <ChevronDown size={15} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
//               </button>

//               {isOpen && (
//                 <div className="mt-1 ml-4 pl-3 border-l border-white/10 space-y-0.5">
//                   {item.children.map((child) => {
//                     const active = isActive(child.path);
//                     return (
//                       <NavLink
//                         key={child.path}
//                         to={child.path}
//                         onClick={onNavigate}
//                         className={`flex items-center gap-3 px-3 py-2 rounded-full text-sm transition-colors ${
//                           active ? 'bg-[#0EA5E9] text-white font-medium' : 'hover:bg-white/10 hover:text-white'
//                         }`}
//                       >
//                         {/* FILLED ROLE INDICATOR for child items */}
//                         <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? 'bg-white' : 'bg-slate-600'}`}></span>
//                         {child.label}
//                       </NavLink>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </nav>

//       {/* Logout */}
//       <div className="p-3 border-t border-white/10 shrink-0">
//         <button
//           onClick={handleLogout}
//           className="w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium text-red-300 hover:bg-red-500/10 transition-colors"
//         >
//           <LogOut size={18} />
//           Logout
//         </button>
//       </div>
//     </aside>
//   );
// };

// export default Sidebar;


// import React, { useState } from 'react';
// import { NavLink, useNavigate, useLocation } from 'react-router-dom';
// import { ChevronDown, Search, LogOut } from 'lucide-react';
// import { logoutUser } from '../pages/auth/authService';
// import { canAccess, getCurrentRole } from '../config/permissions';

// // --- MENU CONFIGURATION ---
// const MENU = [
//   { label: 'Dashboard', path: '/dashboard' },
//   { label: 'User Management', path: '/users' },
//   {
//     label: 'Course Master',
//     children: [
//       { label: 'Courses', path: '/courses' },
//       { label: 'Faculty Assignments', path: '/faculty-assignments' },
//       { label: 'Class Schedules', path: '/class-schedules' },
//     ],
//   },
//   { label: 'Study Material', path: '/study-material', access: 'studyMaterial' },
//   {
//     label: 'Library',
//     children: [
//       { label: 'Books', path: '/library/books' },
//       { label: 'Categories', path: '/library/categories' },
//       { label: 'Issues', path: '/library/issues' },
//     ],
//   },
//   { label: 'TC/LC', path: '/tc-lc' },
//   { label: 'Results', path: '/results' },
//   { label: 'Class Tests', path: '/class-tests' },
//   { label: 'Exams', path: '/exams' },
//   { label: 'Enquiries', path: '/enquiries' },
//   { label: 'Students', path: '/students' },
//   { label: 'Fees', path: '/fees' },
//   { label: 'Notices', path: '/notices' }, 
// ];

// // Items with an "access" key (see config/permissions.js) show only for the roles allowed there
// const menuForRole = (role) => MENU.filter((m) => !m.access || canAccess(role, m.access));

// const Sidebar = ({ open, onNavigate }) => {
//   const navigate = useNavigate();
//   const { pathname } = useLocation();
//   const [search, setSearch] = useState('');

//   const isActive = (path) =>
//     pathname === path || (path !== '/users' && pathname.startsWith(path + '/'));

//   const [expanded, setExpanded] = useState(() =>
//     Object.fromEntries(
//       MENU.filter((m) => m.children?.some((c) => isActive(c.path))).map((m) => [m.label, true])
//     )
//   );

//   const toggle = (label) => setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));

//   const handleLogout = async () => {
//     await logoutUser();
//     navigate('/login');
//   };

//   const q = search.trim().toLowerCase();
//   const allowedMenu = menuForRole(getCurrentRole());
//   const visibleMenu = allowedMenu.map((m) => {
//     if (!q) return m;
//     const selfMatch = m.label.toLowerCase().includes(q);
//     const children = m.children?.filter((c) => selfMatch || c.label.toLowerCase().includes(q));
//     if (m.children) return selfMatch || children.length ? { ...m, children } : null;
//     return selfMatch ? m : null;
//   }).filter(Boolean);

//   return (
//     <aside
//       className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0B1437] text-slate-300 flex flex-col
//         transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}
//     >
//       {/* Brand / Logo */}
//       <div className="px-4 py-4 border-b border-white/10 shrink-0">
//         <div className="rounded-lg bg-white p-2.5 shadow-sm">
//           <img 
//             src="/logo.png" 
//             alt="Sahyadri College of Fire Engineering and Safety Management" 
//             className="block w-full h-auto" 
//           />
//         </div>
//       </div>

//       {/* Search menu */}
//       <div className="px-4 pt-4 shrink-0">
//         <div className="relative">
//           <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
//           <input
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="Search menu..."
//             className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-white/10 text-white placeholder-slate-400 border border-transparent focus:outline-none focus:border-[#0EA5E9]"
//           />
//         </div>
//       </div>

//       <p className="px-6 pt-5 pb-2 text-[11px] font-semibold tracking-widest text-slate-500 shrink-0">NAVIGATION</p>

//       {/* Menu */}
//       <nav className="flex-1 overflow-y-auto no-scrollbar px-3 pb-3 space-y-1">
//         {visibleMenu.length === 0 && <p className="px-3 py-4 text-sm text-slate-500">No menu found</p>}

//         {visibleMenu.map((item) => {
          
//           // Render simple link (Main Group Label)
//           if (!item.children) {
//             const active = isActive(item.path);
//             return (
//               <NavLink
//                 key={item.label}
//                 to={item.path}
//                 onClick={onNavigate}
//                 className={`flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium transition-colors ${
//                   active ? 'bg-[#0EA5E9] text-white shadow' : 'hover:bg-white/10 hover:text-white'
//                 }`}
//               >
//                 {/* FILLED ROLE INDICATOR */}
//                 <span className={`w-2 h-2 rounded-full shrink-0 ${active ? 'bg-white' : 'bg-slate-500'}`}></span>
//                 {item.label}
//               </NavLink>
//             );
//           }

//           // Render dropdown group
//           const isOpen = q ? true : !!expanded[item.label];
//           const groupActive = item.children.some((c) => isActive(c.path));
//           return (
//             <div key={item.label}>
//               <button
//                 onClick={() => toggle(item.label)}
//                 className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium transition-colors ${
//                   groupActive ? 'text-white' : 'hover:bg-white/10 hover:text-white'
//                 }`}
//               >
//                 {/* FILLED ROLE INDICATOR for the group */}
//                 <span className={`w-2 h-2 rounded-full shrink-0 ${groupActive ? 'bg-[#0EA5E9]' : 'bg-slate-500'}`}></span>
//                 <span className="flex-1 text-left">{item.label}</span>
//                 <ChevronDown size={15} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
//               </button>

//               {isOpen && (
//                 <div className="mt-1 ml-4 pl-3 border-l border-white/10 space-y-0.5">
//                   {item.children.map((child) => {
//                     const active = isActive(child.path);
//                     return (
//                       <NavLink
//                         key={child.path}
//                         to={child.path}
//                         onClick={onNavigate}
//                         className={`flex items-center gap-3 px-3 py-2 rounded-full text-sm transition-colors ${
//                           active ? 'bg-[#0EA5E9] text-white font-medium' : 'hover:bg-white/10 hover:text-white'
//                         }`}
//                       >
//                         {/* FILLED ROLE INDICATOR for child items */}
//                         <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? 'bg-white' : 'bg-slate-600'}`}></span>
//                         {child.label}
//                       </NavLink>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </nav>

//       {/* Logout */}
//       <div className="p-3 border-t border-white/10 shrink-0">
//         <button
//           onClick={handleLogout}
//           className="w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium text-red-300 hover:bg-red-500/10 transition-colors"
//         >
//           <LogOut size={18} />
//           Logout
//         </button>
//       </div>
//     </aside>
//   );
// };

// export default Sidebar;



// import React, { useState } from 'react';
// import { NavLink, useNavigate, useLocation } from 'react-router-dom';
// import { ChevronDown, Search, LogOut } from 'lucide-react';
// import { logoutUser } from '../pages/auth/authService';
// import { canAccess, getCurrentRole } from '../config/permissions';

// // --- MENU CONFIGURATION ---
// const MENU = [
//   { label: 'Dashboard', path: '/dashboard' },
//   { label: 'User Management', path: '/users' },
//   { label: 'Roles & Permissions', path: '/roles', access: 'users' },
//   {
//     label: 'Course Master',
//     children: [
//       { label: 'Courses', path: '/courses' },
//       { label: 'Faculty Assignments', path: '/faculty-assignments' },
//       { label: 'Class Schedules', path: '/class-schedules' },
//     ],
//   },
//   { label: 'Study Material', path: '/study-material', access: 'studyMaterial' },
//   {
//     label: 'Library',
//     children: [
//       { label: 'Books', path: '/library/books' },
//       { label: 'Categories', path: '/library/categories' },
//       { label: 'Issues', path: '/library/issues' },
//     ],
//   },
//   { label: 'TC/LC', path: '/tc-lc' },
//   { label: 'Results', path: '/results' },
//   { label: 'Class Tests', path: '/class-tests' },
//   { label: 'Exams', path: '/exams' },
//   { label: 'Exam Forms', path: '/exam-forms', access: 'examForms' },
//   { label: 'Enquiries', path: '/enquiries' },
//   { label: 'Students', path: '/students' },
//   { label: 'Fees', path: '/fees' },
//   { label: 'Notices', path: '/notices' }, 
// ];

// // Items with an "access" key (see config/permissions.js) show only for the roles allowed there
// const menuForRole = (role) => MENU.filter((m) => !m.access || canAccess(role, m.access));

// const Sidebar = ({ open, onNavigate }) => {
//   const navigate = useNavigate();
//   const { pathname } = useLocation();
//   const [search, setSearch] = useState('');

//   const isActive = (path) =>
//     pathname === path || (path !== '/users' && pathname.startsWith(path + '/'));

//   const [expanded, setExpanded] = useState(() =>
//     Object.fromEntries(
//       MENU.filter((m) => m.children?.some((c) => isActive(c.path))).map((m) => [m.label, true])
//     )
//   );

//   const toggle = (label) => setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));

//   const handleLogout = async () => {
//     await logoutUser();
//     navigate('/login');
//   };

//   const q = search.trim().toLowerCase();
//   const allowedMenu = menuForRole(getCurrentRole());
//   const visibleMenu = allowedMenu.map((m) => {
//     if (!q) return m;
//     const selfMatch = m.label.toLowerCase().includes(q);
//     const children = m.children?.filter((c) => selfMatch || c.label.toLowerCase().includes(q));
//     if (m.children) return selfMatch || children.length ? { ...m, children } : null;
//     return selfMatch ? m : null;
//   }).filter(Boolean);

//   return (
//     <aside
//       className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0B1437] text-slate-300 flex flex-col
//         transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}
//     >
//       {/* Brand / Logo */}
//       <div className="px-4 py-4 border-b border-white/10 shrink-0">
//         <div className="rounded-lg bg-white p-2.5 shadow-sm">
//           <img 
//             src="/logo.png" 
//             alt="Sahyadri College of Fire Engineering and Safety Management" 
//             className="block w-full h-auto" 
//           />
//         </div>
//       </div>

//       {/* Search menu */}
//       <div className="px-4 pt-4 shrink-0">
//         <div className="relative">
//           <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
//           <input
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="Search menu..."
//             className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-white/10 text-white placeholder-slate-400 border border-transparent focus:outline-none focus:border-[#0EA5E9]"
//           />
//         </div>
//       </div>

//       <p className="px-6 pt-5 pb-2 text-[11px] font-semibold tracking-widest text-slate-500 shrink-0">NAVIGATION</p>

//       {/* Menu */}
//       <nav className="flex-1 overflow-y-auto no-scrollbar px-3 pb-3 space-y-1">
//         {visibleMenu.length === 0 && <p className="px-3 py-4 text-sm text-slate-500">No menu found</p>}

//         {visibleMenu.map((item) => {
          
//           // Render simple link (Main Group Label)
//           if (!item.children) {
//             const active = isActive(item.path);
//             return (
//               <NavLink
//                 key={item.label}
//                 to={item.path}
//                 onClick={onNavigate}
//                 className={`flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium transition-colors ${
//                   active ? 'bg-[#0EA5E9] text-white shadow' : 'hover:bg-white/10 hover:text-white'
//                 }`}
//               >
//                 {/* FILLED ROLE INDICATOR */}
//                 <span className={`w-2 h-2 rounded-full shrink-0 ${active ? 'bg-white' : 'bg-slate-500'}`}></span>
//                 {item.label}
//               </NavLink>
//             );
//           }

//           // Render dropdown group
//           const isOpen = q ? true : !!expanded[item.label];
//           const groupActive = item.children.some((c) => isActive(c.path));
//           return (
//             <div key={item.label}>
//               <button
//                 onClick={() => toggle(item.label)}
//                 className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium transition-colors ${
//                   groupActive ? 'text-white' : 'hover:bg-white/10 hover:text-white'
//                 }`}
//               >
//                 {/* FILLED ROLE INDICATOR for the group */}
//                 <span className={`w-2 h-2 rounded-full shrink-0 ${groupActive ? 'bg-[#0EA5E9]' : 'bg-slate-500'}`}></span>
//                 <span className="flex-1 text-left">{item.label}</span>
//                 <ChevronDown size={15} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
//               </button>

//               {isOpen && (
//                 <div className="mt-1 ml-4 pl-3 border-l border-white/10 space-y-0.5">
//                   {item.children.map((child) => {
//                     const active = isActive(child.path);
//                     return (
//                       <NavLink
//                         key={child.path}
//                         to={child.path}
//                         onClick={onNavigate}
//                         className={`flex items-center gap-3 px-3 py-2 rounded-full text-sm transition-colors ${
//                           active ? 'bg-[#0EA5E9] text-white font-medium' : 'hover:bg-white/10 hover:text-white'
//                         }`}
//                       >
//                         {/* FILLED ROLE INDICATOR for child items */}
//                         <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? 'bg-white' : 'bg-slate-600'}`}></span>
//                         {child.label}
//                       </NavLink>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </nav>

//       {/* Logout */}
//       <div className="p-3 border-t border-white/10 shrink-0">
//         <button
//           onClick={handleLogout}
//           className="w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium text-red-300 hover:bg-red-500/10 transition-colors"
//         >
//           <LogOut size={18} />
//           Logout
//         </button>
//       </div>
//     </aside>
//   );
// };

// export default Sidebar;


// bellow code is role wise divide access page 


// import React, { useState } from 'react';
// import { NavLink, useNavigate, useLocation } from 'react-router-dom';
// import { ChevronDown, Search, LogOut } from 'lucide-react';
// import { logoutUser } from '../pages/auth/authService';
// import { getCurrentRole } from '../config/permissions';

// // --- MENU CONFIGURATION ---
// const MENU = [
//   { label: 'Dashboard', path: '/dashboard' },
//   { label: 'User Management', path: '/users' },
//   {
//     label: 'Course Master',
//     children: [
//       { label: 'Courses', path: '/courses' },
//       { label: 'Faculty Assignments', path: '/faculty-assignments' },
//       { label: 'Class Schedules', path: '/class-schedules' },
//     ],
//   },
//   {
//     label: 'Library',
//     children: [
//       { label: 'Books', path: '/library/books' },
//       { label: 'Categories', path: '/library/categories' },
//       { label: 'Issues', path: '/library/issues' },
//     ],
//   },
//   { label: 'TC/LC', path: '/tc-lc' },
//   { label: 'Results', path: '/results' },
//   { label: 'Class Tests', path: '/class-tests' },
//   { label: 'Exams', path: '/exams' },
//   { label: 'Enquiries', path: '/enquiries' },
//   { label: 'Students', path: '/students' },
//   { label: 'Fees', path: '/fees' },
//   { label: 'Notices', path: '/notices' }, 
// ];

// const menuForRole = (role) => {
//   return MENU; 
// };

// const Sidebar = ({ open, onNavigate }) => {
//   const navigate = useNavigate();
//   const { pathname } = useLocation();
//   const [search, setSearch] = useState('');

//   const isActive = (path) =>
//     pathname === path || (path !== '/users' && pathname.startsWith(path + '/'));

//   const [expanded, setExpanded] = useState(() =>
//     Object.fromEntries(
//       MENU.filter((m) => m.children?.some((c) => isActive(c.path))).map((m) => [m.label, true])
//     )
//   );

//   const toggle = (label) => setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));

//   const handleLogout = async () => {
//     await logoutUser();
//     navigate('/login');
//   };

//   const q = search.trim().toLowerCase();
//   const allowedMenu = menuForRole(getCurrentRole());
//   const visibleMenu = allowedMenu.map((m) => {
//     if (!q) return m;
//     const selfMatch = m.label.toLowerCase().includes(q);
//     const children = m.children?.filter((c) => selfMatch || c.label.toLowerCase().includes(q));
//     if (m.children) return selfMatch || children.length ? { ...m, children } : null;
//     return selfMatch ? m : null;
//   }).filter(Boolean);

//   return (
//     <aside
//       className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0B1437] text-slate-300 flex flex-col
//         transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}
//     >
//       {/* Brand / Logo */}
//       <div className="px-4 py-4 border-b border-white/10 shrink-0">
//         <div className="rounded-lg bg-white p-2.5 shadow-sm">
//           <img 
//             src="/logo.png" 
//             alt="Sahyadri College of Fire Engineering and Safety Management" 
//             className="block w-full h-auto" 
//           />
//         </div>
//       </div>

//       {/* Search menu */}
//       <div className="px-4 pt-4 shrink-0">
//         <div className="relative">
//           <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
//           <input
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="Search menu..."
//             className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-white/10 text-white placeholder-slate-400 border border-transparent focus:outline-none focus:border-[#0EA5E9]"
//           />
//         </div>
//       </div>

//       <p className="px-6 pt-5 pb-2 text-[11px] font-semibold tracking-widest text-slate-500 shrink-0">NAVIGATION</p>

//       {/* Menu */}
//       <nav className="flex-1 overflow-y-auto no-scrollbar px-3 pb-3 space-y-1">
//         {visibleMenu.length === 0 && <p className="px-3 py-4 text-sm text-slate-500">No menu found</p>}

//         {visibleMenu.map((item) => {
          
//           // Render simple link (Main Group Label)
//           if (!item.children) {
//             const active = isActive(item.path);
//             return (
//               <NavLink
//                 key={item.label}
//                 to={item.path}
//                 onClick={onNavigate}
//                 className={`flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium transition-colors ${
//                   active ? 'bg-[#0EA5E9] text-white shadow' : 'hover:bg-white/10 hover:text-white'
//                 }`}
//               >
//                 {/* FILLED ROLE INDICATOR */}
//                 <span className={`w-2 h-2 rounded-full shrink-0 ${active ? 'bg-white' : 'bg-slate-500'}`}></span>
//                 {item.label}
//               </NavLink>
//             );
//           }

//           // Render dropdown group
//           const isOpen = q ? true : !!expanded[item.label];
//           const groupActive = item.children.some((c) => isActive(c.path));
//           return (
//             <div key={item.label}>
//               <button
//                 onClick={() => toggle(item.label)}
//                 className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium transition-colors ${
//                   groupActive ? 'text-white' : 'hover:bg-white/10 hover:text-white'
//                 }`}
//               >
//                 {/* FILLED ROLE INDICATOR for the group */}
//                 <span className={`w-2 h-2 rounded-full shrink-0 ${groupActive ? 'bg-[#0EA5E9]' : 'bg-slate-500'}`}></span>
//                 <span className="flex-1 text-left">{item.label}</span>
//                 <ChevronDown size={15} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
//               </button>

//               {isOpen && (
//                 <div className="mt-1 ml-4 pl-3 border-l border-white/10 space-y-0.5">
//                   {item.children.map((child) => {
//                     const active = isActive(child.path);
//                     return (
//                       <NavLink
//                         key={child.path}
//                         to={child.path}
//                         onClick={onNavigate}
//                         className={`flex items-center gap-3 px-3 py-2 rounded-full text-sm transition-colors ${
//                           active ? 'bg-[#0EA5E9] text-white font-medium' : 'hover:bg-white/10 hover:text-white'
//                         }`}
//                       >
//                         {/* FILLED ROLE INDICATOR for child items */}
//                         <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? 'bg-white' : 'bg-slate-600'}`}></span>
//                         {child.label}
//                       </NavLink>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </nav>

//       {/* Logout */}
//       <div className="p-3 border-t border-white/10 shrink-0">
//         <button
//           onClick={handleLogout}
//           className="w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium text-red-300 hover:bg-red-500/10 transition-colors"
//         >
//           <LogOut size={18} />
//           Logout
//         </button>
//       </div>
//     </aside>
//   );
// };

// export default Sidebar;


// import React, { useState } from 'react';
// import { NavLink, useNavigate, useLocation } from 'react-router-dom';
// import { ChevronDown, Search, LogOut } from 'lucide-react';
// import { logoutUser } from '../pages/auth/authService';
// import { canAccess, getCurrentRole } from '../config/permissions';

// // --- MENU CONFIGURATION ---
// const MENU = [
//   { label: 'Dashboard', path: '/dashboard' },
//   { label: 'User Management', path: '/users' },
//   {
//     label: 'Course Master',
//     children: [
//       { label: 'Courses', path: '/courses' },
//       { label: 'Faculty Assignments', path: '/faculty-assignments' },
//       { label: 'Class Schedules', path: '/class-schedules' },
//     ],
//   },
//   { label: 'Study Material', path: '/study-material', access: 'studyMaterial' },
//   {
//     label: 'Library',
//     children: [
//       { label: 'Books', path: '/library/books' },
//       { label: 'Categories', path: '/library/categories' },
//       { label: 'Issues', path: '/library/issues' },
//     ],
//   },
//   { label: 'TC/LC', path: '/tc-lc' },
//   { label: 'Results', path: '/results' },
//   { label: 'Class Tests', path: '/class-tests' },
//   { label: 'Exams', path: '/exams' },
//   { label: 'Enquiries', path: '/enquiries' },
//   { label: 'Students', path: '/students' },
//   { label: 'Fees', path: '/fees' },
//   { label: 'Notices', path: '/notices' }, 
// ];

// // Items with an "access" key (see config/permissions.js) show only for the roles allowed there
// const menuForRole = (role) => MENU.filter((m) => !m.access || canAccess(role, m.access));

// const Sidebar = ({ open, onNavigate }) => {
//   const navigate = useNavigate();
//   const { pathname } = useLocation();
//   const [search, setSearch] = useState('');

//   const isActive = (path) =>
//     pathname === path || (path !== '/users' && pathname.startsWith(path + '/'));

//   const [expanded, setExpanded] = useState(() =>
//     Object.fromEntries(
//       MENU.filter((m) => m.children?.some((c) => isActive(c.path))).map((m) => [m.label, true])
//     )
//   );

//   const toggle = (label) => setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));

//   const handleLogout = async () => {
//     await logoutUser();
//     navigate('/login');
//   };

//   const q = search.trim().toLowerCase();
//   const allowedMenu = menuForRole(getCurrentRole());
//   const visibleMenu = allowedMenu.map((m) => {
//     if (!q) return m;
//     const selfMatch = m.label.toLowerCase().includes(q);
//     const children = m.children?.filter((c) => selfMatch || c.label.toLowerCase().includes(q));
//     if (m.children) return selfMatch || children.length ? { ...m, children } : null;
//     return selfMatch ? m : null;
//   }).filter(Boolean);

//   return (
//     <aside
//       className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0B1437] text-slate-300 flex flex-col
//         transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}
//     >
//       {/* Brand / Logo */}
//       <div className="px-4 py-4 border-b border-white/10 shrink-0">
//         <div className="rounded-lg bg-white p-2.5 shadow-sm">
//           <img 
//             src="/logo.png" 
//             alt="Sahyadri College of Fire Engineering and Safety Management" 
//             className="block w-full h-auto" 
//           />
//         </div>
//       </div>

//       {/* Search menu */}
//       <div className="px-4 pt-4 shrink-0">
//         <div className="relative">
//           <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
//           <input
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="Search menu..."
//             className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-white/10 text-white placeholder-slate-400 border border-transparent focus:outline-none focus:border-[#0EA5E9]"
//           />
//         </div>
//       </div>

//       <p className="px-6 pt-5 pb-2 text-[11px] font-semibold tracking-widest text-slate-500 shrink-0">NAVIGATION</p>

//       {/* Menu */}
//       <nav className="flex-1 overflow-y-auto no-scrollbar px-3 pb-3 space-y-1">
//         {visibleMenu.length === 0 && <p className="px-3 py-4 text-sm text-slate-500">No menu found</p>}

//         {visibleMenu.map((item) => {
          
//           // Render simple link (Main Group Label)
//           if (!item.children) {
//             const active = isActive(item.path);
//             return (
//               <NavLink
//                 key={item.label}
//                 to={item.path}
//                 onClick={onNavigate}
//                 className={`flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium transition-colors ${
//                   active ? 'bg-[#0EA5E9] text-white shadow' : 'hover:bg-white/10 hover:text-white'
//                 }`}
//               >
//                 {/* FILLED ROLE INDICATOR */}
//                 <span className={`w-2 h-2 rounded-full shrink-0 ${active ? 'bg-white' : 'bg-slate-500'}`}></span>
//                 {item.label}
//               </NavLink>
//             );
//           }

//           // Render dropdown group
//           const isOpen = q ? true : !!expanded[item.label];
//           const groupActive = item.children.some((c) => isActive(c.path));
//           return (
//             <div key={item.label}>
//               <button
//                 onClick={() => toggle(item.label)}
//                 className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium transition-colors ${
//                   groupActive ? 'text-white' : 'hover:bg-white/10 hover:text-white'
//                 }`}
//               >
//                 {/* FILLED ROLE INDICATOR for the group */}
//                 <span className={`w-2 h-2 rounded-full shrink-0 ${groupActive ? 'bg-[#0EA5E9]' : 'bg-slate-500'}`}></span>
//                 <span className="flex-1 text-left">{item.label}</span>
//                 <ChevronDown size={15} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
//               </button>

//               {isOpen && (
//                 <div className="mt-1 ml-4 pl-3 border-l border-white/10 space-y-0.5">
//                   {item.children.map((child) => {
//                     const active = isActive(child.path);
//                     return (
//                       <NavLink
//                         key={child.path}
//                         to={child.path}
//                         onClick={onNavigate}
//                         className={`flex items-center gap-3 px-3 py-2 rounded-full text-sm transition-colors ${
//                           active ? 'bg-[#0EA5E9] text-white font-medium' : 'hover:bg-white/10 hover:text-white'
//                         }`}
//                       >
//                         {/* FILLED ROLE INDICATOR for child items */}
//                         <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? 'bg-white' : 'bg-slate-600'}`}></span>
//                         {child.label}
//                       </NavLink>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </nav>

//       {/* Logout */}
//       <div className="p-3 border-t border-white/10 shrink-0">
//         <button
//           onClick={handleLogout}
//           className="w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium text-red-300 hover:bg-red-500/10 transition-colors"
//         >
//           <LogOut size={18} />
//           Logout
//         </button>
//       </div>
//     </aside>
//   );
// };

// export default Sidebar;



import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, Search, LogOut } from 'lucide-react';
import { logoutUser } from '../pages/auth/authService';
import { canAccess, getCurrentRole } from '../config/permissions';

// --- MENU CONFIGURATION ---
// "access" is a page key from config/permissions.js, "roles" is a fixed list of roles.
// An item shows only when the logged-in role may open that page (same rules as the route guards in App.jsx).
const MENU = [
  { label: 'Dashboard', path: '/dashboard', access: 'dashboard' },
  { label: 'User Management', path: '/users', access: 'users' },
  { label: 'Roles & Permissions', path: '/roles', access: 'users' },
  {
    label: 'Course Master',
    children: [
      { label: 'Courses', path: '/courses', access: 'courses' },
      { label: 'Faculty Assignments', path: '/faculty-assignments', access: 'facultyAssignments' },
      { label: 'Class Schedules', path: '/class-schedules', access: 'classSchedules' },
    ],
  },
  { label: 'Study Material', path: '/study-material', access: 'studyMaterial' },
  {
    label: 'Library',
    access: 'library',
    children: [
      { label: 'Books', path: '/library/books' },
      { label: 'Categories', path: '/library/categories' },
      { label: 'Issues', path: '/library/issues' },
    ],
  },
  { label: 'TC/LC', path: '/tc-lc', roles: ['super_admin', 'office_staff'] },
  { label: 'Results', path: '/results', access: 'examResults' },
  { label: 'Class Tests', path: '/class-tests', access: 'classTests' },
  { label: 'Exams', path: '/exams', access: 'examResults' },
  { label: 'Exam Forms', path: '/exam-forms', access: 'examForms' },
  { label: 'Enquiries', path: '/enquiries', access: 'enquiries' },
  { label: 'Students', path: '/students', access: 'students' },
  { label: 'Fees', path: '/fees', access: 'fees' },
  { label: 'My Fees', path: '/my-fees', access: 'myFees' },
  { label: 'My TC/LC', path: '/my-tc-lc', roles: ['student'] },
  { label: 'Notices', path: '/notices', access: 'notices' },
  { label: 'My Files', path: '/files', access: 'files' },
  { label: 'Audit Logs', path: '/audit-logs', access: 'auditLogs' },
];

// Menu for one role: drop what the role may not open, and groups that end up empty
const menuForRole = (role) => {
  const ok = (item) => (!item.access || canAccess(role, item.access)) && (!item.roles || item.roles.includes(role));
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

  const [expanded, setExpanded] = useState(() =>
    Object.fromEntries(
      MENU.filter((m) => m.children?.some((c) => isActive(c.path))).map((m) => [m.label, true])
    )
  );

  const toggle = (label) => setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

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
      className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0B1437] text-slate-300 flex flex-col
        transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}
    >
      {/* Brand / Logo */}
      <div className="px-4 py-4 border-b border-white/10 shrink-0">
        <div className="rounded-lg bg-white p-2.5 shadow-sm">
          <img 
            src="/logo.png" 
            alt="Sahyadri College of Fire Engineering and Safety Management" 
            className="block w-full h-auto" 
          />
        </div>
      </div>

      {/* Search menu */}
      <div className="px-4 pt-4 shrink-0">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search menu..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-white/10 text-white placeholder-slate-400 border border-transparent focus:outline-none focus:border-[#0EA5E9]"
          />
        </div>
      </div>

      <p className="px-6 pt-5 pb-2 text-[11px] font-semibold tracking-widest text-slate-500 shrink-0">NAVIGATION</p>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto no-scrollbar px-3 pb-3 space-y-1">
        {visibleMenu.length === 0 && <p className="px-3 py-4 text-sm text-slate-500">No menu found</p>}

        {visibleMenu.map((item) => {
          
          // Render simple link (Main Group Label)
          if (!item.children) {
            const active = isActive(item.path);
            return (
              <NavLink
                key={item.label}
                to={item.path}
                onClick={onNavigate}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium transition-colors ${
                  active ? 'bg-[#0EA5E9] text-white shadow' : 'hover:bg-white/10 hover:text-white'
                }`}
              >
                {/* FILLED ROLE INDICATOR */}
                <span className={`w-2 h-2 rounded-full shrink-0 ${active ? 'bg-white' : 'bg-slate-500'}`}></span>
                {item.label}
              </NavLink>
            );
          }

          // Render dropdown group
          const isOpen = q ? true : !!expanded[item.label];
          const groupActive = item.children.some((c) => isActive(c.path));
          return (
            <div key={item.label}>
              <button
                onClick={() => toggle(item.label)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium transition-colors ${
                  groupActive ? 'text-white' : 'hover:bg-white/10 hover:text-white'
                }`}
              >
                {/* FILLED ROLE INDICATOR for the group */}
                <span className={`w-2 h-2 rounded-full shrink-0 ${groupActive ? 'bg-[#0EA5E9]' : 'bg-slate-500'}`}></span>
                <span className="flex-1 text-left">{item.label}</span>
                <ChevronDown size={15} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && (
                <div className="mt-1 ml-4 pl-3 border-l border-white/10 space-y-0.5">
                  {item.children.map((child) => {
                    const active = isActive(child.path);
                    return (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        onClick={onNavigate}
                        className={`flex items-center gap-3 px-3 py-2 rounded-full text-sm transition-colors ${
                          active ? 'bg-[#0EA5E9] text-white font-medium' : 'hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {/* FILLED ROLE INDICATOR for child items */}
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? 'bg-white' : 'bg-slate-600'}`}></span>
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
      <div className="p-3 border-t border-white/10 shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium text-red-300 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Menu, ChevronDown, LogOut, Mail, Phone, Search, CornerDownLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { logoutUser } from '../pages/auth/authService';
import { pagesForRole } from './menuConfig';
import { getCurrentRole } from '../config/permissions';
import { Avatar } from '../components/ui';

const formatRole = (role) =>
  String(role || '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());

const Header = ({ onMenuClick, sidebarOpen }) => {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const searchRef = useRef(null);
  const [pageQuery, setPageQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  // Show the user saved at login straight away, then refresh from /auth/me
  const [userData, setUserData] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('userData') || 'null');
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) setIsProfileOpen(false);
      if (searchRef.current && !searchRef.current.contains(event.target)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // GET /auth/me (api.js refreshes an expired token automatically)
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }
    api
      .get('/auth/me')
      .then(({ data }) => {
        const me = data.data?.user || data.data;
        if (me) {
          setUserData(me);
          localStorage.setItem('userData', JSON.stringify(me));
        }
      })
      .catch((error) => console.error('Error fetching user data:', error));
  }, [navigate]);

  const handleLogout = async () => {
    setIsProfileOpen(false);
    await logoutUser();
    navigate('/login');
  };

  const roleValue =
    typeof userData?.role === 'string' ? userData.role : userData?.role?.name || userData?.roles?.[0]?.name;
  const displayName = userData?.name || userData?.email?.split('@')[0] || 'User';
  const userRole = roleValue ? formatRole(roleValue) : 'User';

  // "Search pages..." lists only the pages this role can open
  const pages = useMemo(() => pagesForRole(getCurrentRole()), []);
  const matches = useMemo(() => {
    const q = pageQuery.trim().toLowerCase();
    const list = q ? pages.filter((p) => `${p.label} ${p.group}`.toLowerCase().includes(q)) : pages;
    return list.slice(0, 8);
  }, [pages, pageQuery]);

  const goTo = (path) => {
    setPageQuery('');
    setSearchOpen(false);
    navigate(path);
  };

  return (
    <header
      className={`fixed top-0 right-0 left-0 h-16 z-30 bg-white border-b border-slate-200 transition-all duration-300 ${
        sidebarOpen ? 'lg:left-64' : 'lg:left-0'
      }`}
    >
      <div className="h-full px-4 flex items-center gap-3">
        <button onClick={onMenuClick} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Toggle menu">
          <Menu size={22} />
        </button>

        {/* Centre: search pages */}
        <div className="flex-1 flex justify-center">
          <div className="relative w-full max-w-md" ref={searchRef}>
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={pageQuery}
              onChange={(e) => {
                setPageQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && matches[0]) goTo(matches[0].path);
                if (e.key === 'Escape') setSearchOpen(false);
              }}
              placeholder="Search pages..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-full bg-slate-100 border border-transparent focus:bg-white focus:outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20"
            />
            {searchOpen && (
              <div className="absolute left-0 right-0 mt-2 rounded-xl border border-slate-200 bg-white shadow-lg py-1 overflow-hidden">
                {matches.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-slate-500">No page found</p>
                ) : (
                  matches.map((p, i) => (
                    <button
                      key={p.path}
                      onClick={() => goTo(p.path)}
                      className="w-full flex items-center justify-between px-4 py-2 text-sm text-left hover:bg-slate-50"
                    >
                      <span>
                        <span className="font-medium text-slate-800">{p.label}</span>
                        <span className="ml-2 text-xs text-slate-400">{p.group}</span>
                      </span>
                      {i === 0 && pageQuery && <CornerDownLeft size={13} className="text-slate-400" />}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen((o) => !o)}
            className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-slate-50"
          >
            <Avatar name={displayName} />
            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold text-slate-800 leading-tight">{displayName}</p>
              <p className="text-[11px] text-slate-500 leading-tight">{userRole}</p>
            </div>
            <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="px-4 py-4 border-b border-slate-100 bg-slate-50">
                <p className="text-sm font-semibold text-slate-800">{displayName}</p>
                <p className="text-xs text-[#0284C7] font-medium mt-0.5">{userRole}</p>
              </div>
              <div className="px-4 py-3 border-b border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail size={13} className="text-slate-400" />
                  {userData?.email || 'No email'}
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={13} className="text-slate-400" />
                  {userData?.phone || userData?.mobile || 'Not provided'}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2.5 text-sm text-left text-red-600 hover:bg-red-50 flex items-center gap-3"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

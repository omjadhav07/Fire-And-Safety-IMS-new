import React, { useState, useRef, useEffect } from 'react';
import { Menu, ChevronDown, LogOut, Mail, Phone, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { logoutUser } from '../pages/auth/authService';

const formatRole = (role) =>
  String(role || '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());

const Header = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

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
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-40 bg-white border-b border-gray-200">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left: logo + menu toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 lg:w-60">
            <div className="w-9 h-9 rounded-lg bg-green-600 text-white flex items-center justify-center">
              <Flame size={20} />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-green-700 hidden sm:block">FIRE SAFETY IMS</span>
          </div>
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            <Menu size={22} />
          </button>
        </div>

        {/* Right: profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen((o) => !o)}
            className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-gray-50"
          >
            <div className="w-9 h-9 rounded-full bg-green-100 text-green-700 font-semibold flex items-center justify-center">
              {initials}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold text-gray-800 leading-tight">{displayName}</p>
              <p className="text-[11px] text-gray-500 leading-tight">{userRole}</p>
            </div>
            <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-4 border-b border-gray-100 bg-gray-50">
                <p className="text-sm font-semibold text-gray-800">{displayName}</p>
                <p className="text-xs text-green-700 font-medium mt-0.5">{userRole}</p>
              </div>
              <div className="px-4 py-3 border-b border-gray-100 space-y-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail size={13} className="text-gray-400" />
                  {userData?.email || 'No email'}
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={13} className="text-gray-400" />
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

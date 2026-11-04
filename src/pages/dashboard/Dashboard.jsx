import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, Users, UserCheck, GraduationCap, BookOpen } from 'lucide-react';
import { getUsers } from '../users/userService';
import { getCourses } from '../courses/courseService';

const roleName = (u) => {
  const raw = typeof u.role === 'string' ? u.role : u.role?.name || u.roles?.[0]?.name || 'unknown';
  return raw.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};
const isActive = (u) => u.is_active ?? u.isActive ?? u.status === 'active';

// Card with a coloured icon tile, like the reference design
const StatCard = ({ label, value, icon, tile }) => {
  const Icon = icon;
  return (
    <div className="bg-white rounded-xl p-5 flex items-start justify-between shadow-sm min-h-[120px]">
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="mt-3 text-3xl font-extrabold text-gray-900">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${tile}`}>
        <Icon size={22} />
      </div>
    </div>
  );
};

// Half-circle gauge for the active-users percentage
const Gauge = ({ percent }) => {
  const r = 70;
  const len = Math.PI * r;
  return (
    <div className="relative w-48 mx-auto">
      <svg viewBox="0 0 180 100" className="w-full">
        <path d="M 20 90 A 70 70 0 0 1 160 90" fill="none" stroke="#E5E7EB" strokeWidth="14" strokeLinecap="round" />
        <path
          d="M 20 90 A 70 70 0 0 1 160 90"
          fill="none"
          stroke="#16A34A"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${(len * percent) / 100} ${len}`}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center">
        <p className="text-2xl font-extrabold text-gray-900">{percent}%</p>
        <p className="text-xs text-gray-500">Active</p>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    Promise.all([getUsers(), getCourses()])
      .then(([u, c]) => {
        if (cancelled) return;
        setUsers(u.list);
        setCourses(c);
      })
      .catch(() => {
        if (!cancelled) setError('Some dashboard data could not be loaded.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const activeCount = users.filter(isActive).length;
  const activePercent = users.length ? Math.round((activeCount / users.length) * 100) : 0;
  const facultyCount = users.filter((u) => roleName(u) === 'Faculty').length;

  // Users by role
  const byRole = Object.entries(
    users.reduce((acc, u) => {
      const r = roleName(u);
      acc[r] = (acc[r] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);
  const maxRole = Math.max(1, ...byRole.map(([, n]) => n));

  const show = (n) => (loading ? '...' : n);

  return (
    <div>
      {/* Page title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-green-700 text-white flex items-center justify-center">
          <Home size={18} />
        </div>
        <h1 className="text-lg font-bold text-gray-800">Dashboard</h1>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard label="Total Users" value={show(users.length)} icon={Users} tile="bg-gradient-to-br from-green-600 to-green-800" />
        <StatCard label="Active Users" value={show(activeCount)} icon={UserCheck} tile="bg-gradient-to-br from-green-400 to-green-600" />
        <StatCard label="Faculty" value={show(facultyCount)} icon={GraduationCap} tile="bg-gradient-to-br from-orange-500 to-orange-700" />
        <StatCard label="Total Courses" value={show(courses.length)} icon={BookOpen} tile="bg-gradient-to-br from-emerald-500 to-teal-700" />
      </div>

      {/* Charts / lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-900">Active Users</h2>
          <p className="text-xs text-gray-500 mb-4">
            {activeCount} of {users.length} accounts are active
          </p>
          <Gauge percent={activePercent} />
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Users by Role</h2>
          {byRole.length === 0 ? (
            <p className="text-sm text-gray-400">{loading ? 'Loading...' : 'No users yet'}</p>
          ) : (
            <div className="space-y-3">
              {byRole.map(([role, n]) => (
                <div key={role} className="flex items-center gap-3 text-sm">
                  <span className="w-28 text-gray-600 shrink-0">{role}</span>
                  <div className="flex-1 h-5 bg-gray-100 rounded">
                    <div
                      className="h-full rounded bg-green-600 text-white text-[11px] font-semibold flex items-center justify-end pr-2"
                      style={{ width: `${Math.max(12, (n / maxRole) * 100)}%` }}
                    >
                      {n}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Courses</h2>
            <Link to="/courses" className="text-xs text-green-700 hover:underline">
              View all
            </Link>
          </div>
          {courses.length === 0 ? (
            <p className="text-sm text-gray-400">{loading ? 'Loading...' : 'No courses yet'}</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {courses.slice(0, 5).map((c, i) => (
                <li key={c.id || c._id || i} className="py-2.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-800">{c.name}</span>
                  <span className="text-gray-500">{c.duration}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

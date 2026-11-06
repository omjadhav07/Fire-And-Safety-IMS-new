import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, GraduationCap, BookOpen, IndianRupee, Wallet, Library,
  BookMarked, AlertTriangle, Layers, Activity, UserPlus, CreditCard, ClipboardList, CalendarDays
} from 'lucide-react';
import {
  getDashboardSummary, getCourseWiseStudents, getFeesTrend, getRecentActivity,
} from './dashboardService';
import { fmtDate } from '../../services/helpers';

const inflight = new Map();
const shared = (key, loader) => {
  if (!inflight.has(key)) inflight.set(key, loader().finally(() => inflight.delete(key)));
  return inflight.get(key);
};

const useLoad = (key, loader) => {
  const [state, setState] = useState({ key: '', data: null, error: false });
  const loaderRef = useRef(loader);
  useEffect(() => { loaderRef.current = loader; });
  useEffect(() => {
    let cancelled = false;
    shared(key, () => loaderRef.current())
      .then((data) => !cancelled && setState({ key, data, error: false }))
      .catch(() => !cancelled && setState({ key, data: null, error: true }));
    return () => { cancelled = true; };
  }, [key]);
  return { loading: state.key !== key, data: state.data, error: state.error };
};

const safe = (fn, fallback) => { try { return fn(); } catch { return fallback; } };

export const StatCard = ({ label, value, icon, tile, to }) => {
  const Icon = icon;
  const body = (
    <div className="bg-white rounded-xl px-3 py-3 flex items-center gap-3 shadow-sm h-full">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 ${tile}`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 truncate">{label}</p>
        <p className="text-xl font-extrabold text-gray-900 leading-tight truncate">{value}</p>
      </div>
    </div>
  );
  return to ? <Link to={to} className="block hover:-translate-y-0.5 transition-transform">{body}</Link> : body;
};

const LoadStat = ({ label, k, loader, value, icon, tile, to }) => {
  const { loading, data, error } = useLoad(k, loader);
  const text = loading ? '...' : error ? '-' : safe(() => value(data), '-');
  return <StatCard label={label} value={text} icon={icon} tile={tile} to={to} />;
};

const Panel = ({ title, to, linkLabel = 'View all', children }) => (
  <div className="bg-white rounded-xl p-4 shadow-sm h-full flex flex-col">
    <div className="flex items-center justify-between mb-2">
      <h2 className="text-sm font-bold text-gray-900">{title}</h2>
      {to && <Link to={to} className="text-xs text-sky-700 hover:underline">{linkLabel}</Link>}
    </div>
    <div className="flex-1 overflow-hidden">{children}</div>
  </div>
);

const Row = ({ title, sub, right }) => (
  <>
    <div className="min-w-0 flex-1">
      <p className="font-medium text-gray-800 truncate">{title}</p>
      {sub && <p className="text-xs text-gray-500 truncate">{sub}</p>}
    </div>
    {right !== undefined && <span className="text-gray-500 text-xs whitespace-nowrap">{right}</span>}
  </>
);

const inr = (v) => v === undefined || v === null ? '-' : `₹${Number(v).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

/* ───────────── 1) KPI Stats (from data.topStats) ───────────── */

const SUMMARY_KEY = 'dashboard:summary';
const loadSummary = getDashboardSummary;
const stat = (s, key) => s?.topStats?.[key] ?? '-';

export const UserStats = () => (
  <>
    <LoadStat label="Total Users"   k={SUMMARY_KEY} loader={loadSummary} value={(s) => stat(s, 'totalUsers')}  icon={Users}         tile="bg-gradient-to-br from-sky-600 to-sky-800" to="/users" />
    <LoadStat label="Active Users"  k={SUMMARY_KEY} loader={loadSummary} value={(s) => stat(s, 'activeUsers')} icon={Users}         tile="bg-gradient-to-br from-sky-400 to-sky-600" />
    <LoadStat label="Faculty"       k={SUMMARY_KEY} loader={loadSummary} value={(s) => stat(s, 'facultyCount')} icon={GraduationCap} tile="bg-gradient-to-br from-orange-500 to-orange-700" />
  </>
);

export const StudentsStat = () => (
  <LoadStat label="Students" k={SUMMARY_KEY} loader={loadSummary} value={(s) => stat(s, 'totalStudents')} icon={GraduationCap} tile="bg-gradient-to-br from-sky-500 to-blue-700" to="/students" />
);

export const CoursesStat = ({ to = '/courses' }) => (
  <LoadStat label="Total Courses" k={SUMMARY_KEY} loader={loadSummary} value={(s) => stat(s, 'totalCourses')} icon={BookOpen} tile="bg-gradient-to-br from-emerald-500 to-teal-700" to={to} />
);

export const EnquiryStats = () => (
  <>
    <LoadStat label="New Enquiries" k={SUMMARY_KEY} loader={loadSummary} value={(s) => stat(s, 'newEnquiries')}       icon={ClipboardList} tile="bg-gradient-to-br from-violet-500 to-violet-700" to="/enquiries" />
    <LoadStat label="Converted"     k={SUMMARY_KEY} loader={loadSummary} value={(s) => stat(s, 'convertedEnquiries')} icon={UserPlus}      tile="bg-gradient-to-br from-sky-500 to-sky-700" to="/enquiries" />
  </>
);

export const PendingFeeStats = () => (
  <>
    <LoadStat label="Students with Dues" k={SUMMARY_KEY} loader={loadSummary} value={(s) => stat(s, 'studentsWithDuesCount')} icon={Wallet}        tile="bg-gradient-to-br from-amber-500 to-orange-600" to="/fees" />
    <LoadStat label="Outstanding Fees"   k={SUMMARY_KEY} loader={loadSummary} value={(s) => inr(stat(s, 'outstandingFees'))}     icon={IndianRupee} tile="bg-gradient-to-br from-rose-500 to-red-700" to="/fees" />
  </>
);

export const LibraryStats = ({ withCategories = false, withCopies = true }) => (
  <>
    <LoadStat label="Book Titles"      k={SUMMARY_KEY} loader={loadSummary} value={(s) => stat(s, 'bookTitles')}   icon={Library}       tile="bg-gradient-to-br from-sky-600 to-sky-800" to="/library/books" />
    {withCopies && (
      <LoadStat label="Copies Available" k={SUMMARY_KEY} loader={loadSummary} value={(s) => stat(s, 'availableCopies')} icon={BookOpen}      tile="bg-gradient-to-br from-emerald-500 to-teal-700" />
    )}
    <LoadStat label="Issued Now"       k={SUMMARY_KEY} loader={loadSummary} value={(s) => stat(s, 'issuedNow')}    icon={BookMarked}    tile="bg-gradient-to-br from-sky-500 to-blue-700" to="/library/issues" />
    <LoadStat label="Overdue"          k={SUMMARY_KEY} loader={loadSummary} value={(s) => stat(s, 'overdueBooks')} icon={AlertTriangle} tile="bg-gradient-to-br from-rose-500 to-red-700" to="/library/issues" />
  </>
);

export const UpcomingClassesStat = () => (
  <LoadStat label="Upcoming Classes" k={SUMMARY_KEY} loader={loadSummary} value={(s) => s?.lists?.upcomingClasses?.length ?? 0} icon={Activity} tile="bg-gradient-to-br from-sky-500 to-blue-700" to="/class-schedules" />
);

export const UpcomingTestsStat = () => (
  <LoadStat label="Upcoming Tests" k={SUMMARY_KEY} loader={loadSummary} value={(s) => s?.lists?.upcomingTests?.length ?? 0} icon={ClipboardList} tile="bg-gradient-to-br from-violet-500 to-violet-700" to="/class-tests" />
);

/* ───────────── 2) Course-wise students ───────────── */

const COURSE_KEY = 'dashboard:course-wise';

export const CourseWisePanel = () => {
  const { loading, data, error } = useLoad(COURSE_KEY, getCourseWiseStudents);
  const rows = (!loading && !error && Array.isArray(data)) ? data : [];
  const max = Math.max(1, ...rows.map((r) => r.count || 0));

  return (
    <Panel title="Students by Course" to="/students">
      {loading ? <p className="text-xs text-gray-400">Loading...</p>
        : error ? <p className="text-xs text-gray-400">Could not load course-wise data.</p>
        : rows.length === 0 ? <p className="text-xs text-gray-400">No courses yet</p>
        : (
          <div className="space-y-2 mt-2">
            {rows.slice(0, 6).map((r) => (
              <div key={r._id || r.courseName} className="flex items-center gap-3 text-sm">
                <span className="w-28 text-gray-600 shrink-0 text-xs truncate" title={r.courseName}>{r.courseName}</span>
                <div className="flex-1 h-4 bg-gray-100 rounded">
                  <div
                    className="h-full rounded bg-sky-600 text-white text-[11px] font-semibold flex items-center justify-end pr-2"
                    style={{ width: `${Math.max(10, (r.count / max) * 100)}%` }}
                  >
                    {r.count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
    </Panel>
  );
};

/* ───────────── 3) Fee collection trend ───────────── */

const FEES_KEY = 'dashboard:fees-trend';

export const FeesTrendPanel = () => {
  const { loading, data, error } = useLoad(FEES_KEY, getFeesTrend);
  const rows = (!loading && !error && Array.isArray(data)) ? data : [];

  // Map { _id: {month, year}, totalCollected } to chart points
  const points = rows.map((r) => {
    const month = r._id?.month || 1;
    const year = r._id?.year || new Date().getFullYear();
    const date = new Date(year, month - 1);
    const label = date.toLocaleString('default', { month: 'short' });
    return { label, value: Number(r.totalCollected) || 0 };
  });

  const total = points.reduce((n, p) => n + p.value, 0);

  return (
    <Panel title="Fee Collection Trend" to="/fees">
      {loading ? <p className="text-xs text-gray-400">Loading...</p>
        : error ? <p className="text-xs text-gray-400">Could not load fee trend.</p>
        : points.length === 0 ? <p className="text-xs text-gray-400">No fee data</p>
        : (
          <>
            <p className="text-xs text-gray-500 mb-2">
              Total collected: <span className="font-semibold text-gray-800">{inr(total)}</span>
            </p>
            <div className="flex items-end justify-around h-24 pt-2">
              {points.map((p, i) => (
                <div key={i} className="flex flex-col items-center justify-end h-full gap-1">
                  <div 
                    className="w-10 bg-sky-500 rounded-t-sm" 
                    style={{ height: `${Math.max(5, (p.value / Math.max(1, total)) * 100)}%` }}
                    title={inr(p.value)}
                  />
                  <span className="text-[10px] text-gray-400">{p.label}</span>
                </div>
              ))}
            </div>
          </>
        )}
    </Panel>
  );
};

/* ───────────── 4) Recent activity (Enquiries + Blocked Forms) ───────────── */

const ACTIVITY_KEY = 'dashboard:recent-activity';

export const RecentActivityPanel = () => {
  const { loading, data, error } = useLoad(ACTIVITY_KEY, getRecentActivity);
  
  const enquiries = data?.recentEnquiries || [];
  const blocked = data?.blockedForms || [];
  const rows = [...enquiries, ...blocked];

  return (
    <Panel title="Recent Activity" to="/enquiries">
      {loading ? <p className="text-xs text-gray-400">Loading...</p>
        : error ? <p className="text-xs text-gray-400">Could not load activity.</p>
        : rows.length === 0 ? <p className="text-xs text-gray-400">No recent activity</p>
        : (
          <ul className="divide-y divide-gray-100 mt-1">
            {rows.slice(0, 5).map((a, i) => (
              <li key={a._id || i} className="py-2 flex items-start gap-2 text-[13px]">
                <span className="w-6 h-6 rounded-md bg-sky-50 text-sky-700 flex items-center justify-center shrink-0 mt-0.5">
                  <ClipboardList size={13} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-gray-800 truncate font-medium">{a.name || 'New Enquiry'}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {a.course_interest_id?.name || 'General'} · {a.phone || ''}
                  </p>
                </div>
                <span className="text-[10px] text-gray-400 whitespace-nowrap pt-0.5">
                  {fmtDate(a.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
    </Panel>
  );
};

/* ───────────── Extra Lists from Summary (Courses, Classes, Tests) ───────────── */

export const RecentCoursesPanel = () => {
  const { loading, data, error } = useLoad(SUMMARY_KEY, loadSummary);
  const rows = data?.lists?.recentCourses || [];
  return (
    <Panel title="Recent Courses" to="/courses">
      {loading ? <p className="text-xs text-gray-400">Loading...</p>
        : rows.length === 0 ? <p className="text-xs text-gray-400">No courses</p>
        : (
          <ul className="divide-y divide-gray-100 mt-1">
            {rows.slice(0, 4).map((c) => (
              <li key={c._id} className="py-1.5 flex items-center justify-between gap-3 text-[13px]">
                <Row title={c.name} sub={c.duration} />
              </li>
            ))}
          </ul>
        )}
    </Panel>
  );
};

export const UpcomingClassesPanel = () => {
  const { loading, data } = useLoad(SUMMARY_KEY, loadSummary);
  const rows = data?.lists?.upcomingClasses || [];
  return (
    <Panel title="Upcoming Classes" to="/class-schedules">
      {loading ? <p className="text-xs text-gray-400">Loading...</p>
        : rows.length === 0 ? <p className="text-xs text-gray-400">No upcoming classes</p>
        : (
          <ul className="divide-y divide-gray-100 mt-1">
            {rows.slice(0, 4).map((c) => (
              <li key={c._id} className="py-1.5 flex items-center justify-between gap-3 text-[13px]">
                <Row title={c.subject} right={`${fmtDate(c.date)} · ${c.start_time}`} />
              </li>
            ))}
          </ul>
        )}
    </Panel>
  );
};

export const UpcomingTestsPanel = () => {
  const { loading, data } = useLoad(SUMMARY_KEY, loadSummary);
  const rows = data?.lists?.upcomingTests || [];
  return (
    <Panel title="Upcoming Tests" to="/class-tests">
      {loading ? <p className="text-xs text-gray-400">Loading...</p>
        : rows.length === 0 ? <p className="text-xs text-gray-400">No upcoming tests</p>
        : (
          <ul className="divide-y divide-gray-100 mt-1">
            {rows.slice(0, 4).map((t) => (
              <li key={t._id} className="py-1.5 flex items-center justify-between gap-3 text-[13px]">
                <Row title={t.title} right={fmtDate(t.test_date)} />
              </li>
            ))}
          </ul>
        )}
    </Panel>
  );
};
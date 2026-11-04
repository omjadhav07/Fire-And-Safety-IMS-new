import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, UserCheck, GraduationCap, BookOpen, ClipboardList, ClipboardCheck, IndianRupee, Wallet,
  CalendarDays, Library, AlertTriangle, Layers, BookMarked,
} from 'lucide-react';
import { getUsers } from '../users/userService';
import { getCourses, getFeeComponents } from '../courses/courseService';
import { getStudents } from '../students/studentService';
import { getEnquiries } from '../enquiries/enquiryService';
import { statusClass as enquiryStatusClass } from '../enquiries/enquiryUtils';
import { getPendingFees, getMyFees } from '../fees/feeService';
import { num, objectIdOf, studentNameOf } from '../fees/feeUtils';
import { getBooks, getIssues, getOverdueBooks, getCategories } from '../library/libraryService';
import { getSchedules } from '../schedules/classScheduleService';
import { pick, relName, fmtTime, roleOf, today } from '../schedules/scheduleUtils';
import { getClassTests } from '../classTests/classTestService';
import { getNotices } from '../notices/noticeService';
import { getAssignments } from '../faculty/facultyAssignmentService';
import { fmtDate, titleCase, daysOverdue } from '../../services/helpers';

/* ───────────── loading ───────────── */

// Widgets on one page that need the same data share a single request
const inflight = new Map();
const shared = (key, loader) => {
  if (!inflight.has(key)) inflight.set(key, loader().finally(() => inflight.delete(key)));
  return inflight.get(key);
};

// -> { loading, data, error }. A widget that fails shows "-" and never breaks the page.
const useLoad = (key, loader) => {
  const [state, setState] = useState({ key: '', data: null, error: false });
  const loaderRef = useRef(loader);
  useEffect(() => {
    loaderRef.current = loader;
  });
  useEffect(() => {
    let cancelled = false;
    shared(key, () => loaderRef.current())
      .then((data) => !cancelled && setState({ key, data, error: false }))
      .catch(() => !cancelled && setState({ key, data: null, error: true }));
    return () => {
      cancelled = true;
    };
  }, [key]);
  return { loading: state.key !== key, data: state.data, error: state.error };
};

const safe = (fn, fallback) => {
  try {
    return fn();
  } catch {
    return fallback;
  }
};

/* ───────────── shared UI ───────────── */

// Card with a coloured icon tile
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
  return to ? (
    <Link to={to} className="block hover:-translate-y-0.5 transition-transform">
      {body}
    </Link>
  ) : (
    body
  );
};

const LoadStat = ({ label, k, loader, value, icon, tile, to }) => {
  const { loading, data, error } = useLoad(k, loader);
  const text = loading ? '...' : error ? '-' : safe(() => value(data), '-');
  return <StatCard label={label} value={text} icon={icon} tile={tile} to={to} />;
};

const Panel = ({ title, to, linkLabel = 'View all', children }) => (
  <div className="bg-white rounded-xl p-4 shadow-sm">
    <div className="flex items-center justify-between mb-2">
      <h2 className="text-sm font-bold text-gray-900">{title}</h2>
      {to && (
        <Link to={to} className="text-xs text-green-700 hover:underline">
          {linkLabel}
        </Link>
      )}
    </div>
    {children}
  </div>
);

// List panel: loads data, turns it into rows with items(), draws each row with render()
const LoadPanel = ({ title, k, loader, items, render, empty, to, linkLabel }) => {
  const { loading, data, error } = useLoad(k, loader);
  const rows = loading || error ? [] : safe(() => items(data), []);
  return (
    <Panel title={title} to={to} linkLabel={linkLabel}>
      {loading ? (
        <p className="text-xs text-gray-400">Loading...</p>
      ) : error ? (
        <p className="text-xs text-gray-400">Could not load this widget.</p>
      ) : rows.length === 0 ? (
        <p className="text-xs text-gray-400">{empty}</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {rows.map((r, i) => (
            <li key={r.id || r._id || i} className="py-1.5 flex items-center justify-between gap-3 text-[13px]">
              {render(r)}
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
};

const Row = ({ title, sub, right }) => (
  <>
    <div className="min-w-0">
      <p className="font-medium text-gray-800 truncate">{title}</p>
      {sub && <p className="text-xs text-gray-500 truncate">{sub}</p>}
    </div>
    {right !== undefined && <span className="text-gray-500 text-xs whitespace-nowrap">{right}</span>}
  </>
);

// Half-circle gauge for the active-users percentage
const Gauge = ({ percent }) => {
  const r = 70;
  const len = Math.PI * r;
  return (
    <div className="relative w-36 mx-auto">
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
        <p className="text-lg font-extrabold text-gray-900">{percent}%</p>
        <p className="text-xs text-gray-500">Active</p>
      </div>
    </div>
  );
};

/* ───────────── loaders (one per API) ───────────── */

const loadUsers = () => getUsers().then((r) => r.list);
const loadCourses = () => getCourses();
const loadEnquiries = () => getEnquiries();
const loadBooks = () => getBooks();
const loadIssues = () => getIssues();
const loadOverdue = () => getOverdueBooks();
const loadCategories = () => getCategories();
const loadNotices = () => getNotices({ page: 1, limit: 5 }).then((r) => r.list);
const loadTests = () => getClassTests({ page: 1, limit: 50 }).then((r) => r.list);
const loadMyFees = () => getMyFees();

// Total students: the API reports pages, so ask for 1 per page and read the page count
const loadStudentCount = async () => {
  const one = await getStudents({ limit: 1 });
  if (one.totalPages) return one.totalPages;
  return (await getStudents({ limit: 100 })).list.length;
};

const TOTAL_KEYS = ['total_fee', 'totalFee', 'total', 'total_amount', 'totalAmount', 'total_payable', 'net_fee', 'course_fee'];
const PAID_KEYS = ['paid', 'paid_amount', 'paidAmount', 'total_paid', 'totalPaid', 'amount_paid'];

// Students with dues + total outstanding (course total fee - paid, same rule as the Fees page)
const loadPendingFees = async () => {
  const rows = await getPendingFees();
  const studentKey = (r) =>
    objectIdOf(r.studentId) || objectIdOf(r.user_id) || objectIdOf(r.student) || objectIdOf(r.student_id) || studentNameOf(r);
  const courseOf = (r) => objectIdOf(r.course) || objectIdOf(r.course_id);

  const courseIds = [...new Set(rows.map(courseOf).filter(Boolean))];
  const totals = Object.fromEntries(
    (await Promise.all(courseIds.map((id) => getFeeComponents(id).then((f) => [id, f.total]).catch(() => null)))).filter(Boolean)
  );

  let outstanding = 0;
  let known = false;
  rows.forEach((r) => {
    const total = num(r, ...TOTAL_KEYS) ?? totals[courseOf(r)];
    if (total !== undefined) {
      outstanding += Math.max(total - (num(r, ...PAID_KEYS) || 0), 0);
      known = true;
    }
  });
  const students = new Set(rows.map(studentKey).filter(Boolean)).size || rows.length;
  return { students, outstanding: known ? outstanding : undefined };
};

/* ───────────── data helpers ───────────── */

const inrShort = (v) => `₹${Number(v).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const dayOf = (v) => String(v || '').slice(0, 10);
const upcomingClasses = (list) =>
  list
    .filter((s) => dayOf(s.date) >= today() && String(s.status || 'scheduled').toLowerCase() !== 'cancelled')
    .sort((a, b) => `${dayOf(a.date)} ${a.start_time}`.localeCompare(`${dayOf(b.date)} ${b.start_time}`));
const upcomingTests = (list) =>
  list
    .filter((t) => dayOf(t.test_date) >= today() && !['cancelled', 'completed'].includes(String(t.status || '').toLowerCase()))
    .sort((a, b) => dayOf(a.test_date).localeCompare(dayOf(b.test_date)));
const isActiveUser = (u) => u.is_active ?? u.isActive ?? u.status === 'active';
const roleText = (u) => titleCase(roleOf(u)) || 'Unknown';
const issueTitle = (i) => {
  const b = i.book || i.bookId;
  return (b && typeof b === 'object' ? b.title : i.bookTitle) || 'Book';
};
const issueStudent = (i) => {
  const s = i.studentId || i.student;
  return (s && typeof s === 'object' ? s.full_name || s.name : i.studentName) || '';
};
const notReturned = (i) => String(i.status || '').toLowerCase() !== 'returned';
const availableOf = (b) => Number(b.availableQty ?? b.available ?? b.availableCopies ?? 0);

/* ───────────── stat widgets ───────────── */

export const UserStats = () => (
  <>
    <LoadStat label="Total Users" k="users" loader={loadUsers} value={(u) => u.length} icon={Users} tile="bg-gradient-to-br from-green-600 to-green-800" to="/users" />
    <LoadStat label="Active Users" k="users" loader={loadUsers} value={(u) => u.filter(isActiveUser).length} icon={UserCheck} tile="bg-gradient-to-br from-green-400 to-green-600" />
    <LoadStat label="Faculty" k="users" loader={loadUsers} value={(u) => u.filter((x) => /faculty/i.test(roleOf(x))).length} icon={GraduationCap} tile="bg-gradient-to-br from-orange-500 to-orange-700" />
  </>
);

export const StudentsStat = () => (
  <LoadStat label="Students" k="student-count" loader={loadStudentCount} value={(n) => n} icon={UserCheck} tile="bg-gradient-to-br from-sky-500 to-blue-700" to="/students" />
);

export const CoursesStat = ({ to = '/courses' }) => (
  <LoadStat label="Total Courses" k="courses" loader={loadCourses} value={(c) => c.length} icon={BookOpen} tile="bg-gradient-to-br from-emerald-500 to-teal-700" to={to} />
);

export const EnquiryStats = () => (
  <>
    <LoadStat label="New Enquiries" k="enquiries" loader={loadEnquiries} value={(e) => e.filter((x) => String(x.status || 'new').toLowerCase() === 'new').length} icon={ClipboardList} tile="bg-gradient-to-br from-violet-500 to-violet-700" to="/enquiries" />
    <LoadStat label="Converted" k="enquiries" loader={loadEnquiries} value={(e) => e.filter((x) => String(x.status).toLowerCase() === 'converted').length} icon={UserCheck} tile="bg-gradient-to-br from-green-500 to-green-700" to="/enquiries" />
  </>
);

export const PendingFeeStats = () => (
  <>
    <LoadStat label="Students with Dues" k="pending-fees" loader={loadPendingFees} value={(d) => d.students} icon={Wallet} tile="bg-gradient-to-br from-amber-500 to-orange-600" to="/fees" />
    <LoadStat label="Outstanding Fees" k="pending-fees" loader={loadPendingFees} value={(d) => (d.outstanding === undefined ? '-' : inrShort(d.outstanding))} icon={IndianRupee} tile="bg-gradient-to-br from-rose-500 to-red-700" to="/fees" />
  </>
);

export const LibraryStats = ({ withCategories = false, withCopies = true }) => (
  <>
    <LoadStat label="Book Titles" k="books" loader={loadBooks} value={(b) => b.length} icon={Library} tile="bg-gradient-to-br from-green-600 to-green-800" to="/library/books" />
    {withCopies && (
      <LoadStat label="Copies Available" k="books" loader={loadBooks} value={(b) => b.reduce((n, x) => n + availableOf(x), 0)} icon={BookOpen} tile="bg-gradient-to-br from-emerald-500 to-teal-700" />
    )}
    <LoadStat label="Issued Now" k="issues" loader={loadIssues} value={(i) => i.filter(notReturned).length} icon={BookMarked} tile="bg-gradient-to-br from-sky-500 to-blue-700" to="/library/issues" />
    <LoadStat label="Overdue" k="overdue" loader={loadOverdue} value={(o) => o.length} icon={AlertTriangle} tile="bg-gradient-to-br from-rose-500 to-red-700" to="/library/issues" />
    {withCategories && (
      <LoadStat label="Categories" k="categories" loader={loadCategories} value={(c) => c.length} icon={Layers} tile="bg-gradient-to-br from-violet-500 to-violet-700" to="/library/categories" />
    )}
  </>
);

// Student: own fee numbers (same fields as the My Fees page)
export const MyFeeStats = () => {
  const val = (d, ...keys) => {
    const o = d && typeof d === 'object' && !Array.isArray(d) ? d : {};
    const v = num(o, ...keys);
    return v === undefined ? '-' : inrShort(v);
  };
  return (
    <>
      <LoadStat label="Total Fee" k="my-fees" loader={loadMyFees} value={(d) => val(d, 'totalDue', 'total_fee', 'totalFee', 'total', 'total_amount')} icon={IndianRupee} tile="bg-gradient-to-br from-green-600 to-green-800" to="/my-fees" />
      <LoadStat label="Paid" k="my-fees" loader={loadMyFees} value={(d) => val(d, 'paid', 'paid_amount', 'paidAmount', 'total_paid', 'totalPaid')} icon={UserCheck} tile="bg-gradient-to-br from-green-400 to-green-600" to="/my-fees" />
      <LoadStat label="Pending" k="my-fees" loader={loadMyFees} value={(d) => val(d, 'pending', 'pending_amount', 'pendingAmount', 'balance', 'due', 'due_amount')} icon={Wallet} tile="bg-gradient-to-br from-amber-500 to-orange-600" to="/my-fees" />
    </>
  );
};

// facultyId limits the classes to one teacher's own timetable
export const UpcomingClassesStat = ({ facultyId }) => {
  const filters = facultyId ? { faculty_id: facultyId } : {};
  return (
    <LoadStat
      label="Upcoming Classes"
      k={`schedules:${facultyId || 'all'}`}
      loader={() => getSchedules(filters)}
      value={(s) => upcomingClasses(s).length}
      icon={CalendarDays}
      tile="bg-gradient-to-br from-sky-500 to-blue-700"
      to="/class-schedules"
    />
  );
};

export const UpcomingTestsStat = () => (
  <LoadStat label="Upcoming Tests" k="tests" loader={loadTests} value={(t) => upcomingTests(t).length} icon={ClipboardCheck} tile="bg-gradient-to-br from-violet-500 to-violet-700" to="/class-tests" />
);

export const MySubjectsStat = ({ facultyId }) => (
  <LoadStat
    label="My Subjects"
    k={`assignments:${facultyId}`}
    loader={() => getAssignments({ faculty_id: facultyId })}
    value={(a) => a.length}
    icon={GraduationCap}
    tile="bg-gradient-to-br from-orange-500 to-orange-700"
    to="/faculty-assignments"
  />
);

/* ───────────── panels ───────────── */

// Active-users gauge + users by role (one request for both)
export const UserPanels = () => {
  const { loading, data: users, error } = useLoad('users', loadUsers);
  const list = users || [];
  const active = list.filter(isActiveUser).length;
  const percent = list.length ? Math.round((active / list.length) * 100) : 0;
  const byRole = Object.entries(
    list.reduce((acc, u) => {
      const r = roleText(u);
      acc[r] = (acc[r] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...byRole.map(([, n]) => n));

  return (
    <>
      <Panel title="Active Users">
        <p className="text-xs text-gray-500 mb-1">
          {loading ? 'Loading...' : error ? 'Could not load users' : `${active} of ${list.length} accounts are active`}
        </p>
        <Gauge percent={percent} />
      </Panel>
      <Panel title="Users by Role">
        {byRole.length === 0 ? (
          <p className="text-xs text-gray-400">{loading ? 'Loading...' : 'No users yet'}</p>
        ) : (
          <div className="space-y-2">
            {byRole.map(([role, n]) => (
              <div key={role} className="flex items-center gap-3 text-sm">
                <span className="w-24 text-gray-600 shrink-0 text-xs">{role}</span>
                <div className="flex-1 h-4 bg-gray-100 rounded">
                  <div
                    className="h-full rounded bg-green-600 text-white text-[11px] font-semibold flex items-center justify-end pr-2"
                    style={{ width: `${Math.max(12, (n / max) * 100)}%` }}
                  >
                    {n}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
};

export const CoursesPanel = () => (
  <LoadPanel
    title="Courses" k="courses" loader={loadCourses} to="/courses" empty="No courses yet"
    items={(c) => c.slice(0, 4)}
    render={(c) => <Row title={c.name} right={c.duration} />}
  />
);

export const UpcomingClassesPanel = ({ facultyId, title = 'Upcoming Classes' }) => {
  const filters = facultyId ? { faculty_id: facultyId } : {};
  return (
    <LoadPanel
      title={title} k={`schedules:${facultyId || 'all'}`} loader={() => getSchedules(filters)} to="/class-schedules"
      empty="No upcoming classes"
      items={(s) => upcomingClasses(s).slice(0, 4)}
      render={(s) => (
        <Row
          title={s.subject}
          sub={relName(pick(s, 'batch_id', 'batch')) || relName(pick(s, 'course_id', 'course'))}
          right={`${fmtDate(s.date)} · ${fmtTime(s.start_time)}`}
        />
      )}
    />
  );
};

export const UpcomingTestsPanel = () => (
  <LoadPanel
    title="Upcoming Class Tests" k="tests" loader={loadTests} to="/class-tests" empty="No upcoming tests"
    items={(t) => upcomingTests(t).slice(0, 4)}
    render={(t) => <Row title={t.title} sub={t.subject} right={`${fmtDate(t.test_date)} · ${t.max_marks ?? '-'} marks`} />}
  />
);

export const NoticesPanel = () => (
  <LoadPanel
    title="Notices" k="notices" loader={loadNotices} to="/notices" empty="No notices"
    items={(n) => n.filter((x) => !['withdrawn', 'draft'].includes(String(x.status || '').toLowerCase())).slice(0, 4)}
    render={(n) => <Row title={n.title} right={fmtDate(n.createdAt || n.publishedAt)} />}
  />
);

export const RecentEnquiriesPanel = () => (
  <LoadPanel
    title="Recent Enquiries" k="enquiries" loader={loadEnquiries} to="/enquiries" empty="No enquiries yet"
    items={(e) => [...e].sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || ''))).slice(0, 4)}
    render={(e) => (
      <>
        <Row title={e.name} sub={relName(pick(e, 'course_interest_id', 'course_interest'))} />
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${enquiryStatusClass(String(e.status || 'new').toLowerCase())}`}>
          {titleCase(e.status || 'new')}
        </span>
      </>
    )}
  />
);

export const MyAssignmentsPanel = ({ facultyId }) => (
  <LoadPanel
    title="My Subjects" k={`assignments:${facultyId}`} loader={() => getAssignments({ faculty_id: facultyId })}
    to="/faculty-assignments" empty="No subjects assigned yet"
    items={(a) => a.slice(0, 4)}
    render={(a) => (
      <Row
        title={a.subject}
        sub={[relName(pick(a, 'course_id', 'course')), relName(pick(a, 'batch_id', 'batch'))].filter(Boolean).join(' · ')}
      />
    )}
  />
);

export const OverdueBooksPanel = () => (
  <LoadPanel
    title="Overdue Books" k="overdue" loader={loadOverdue} to="/library/issues" empty="No overdue books"
    items={(o) => o.slice(0, 4)}
    render={(i) => <Row title={issueTitle(i)} sub={issueStudent(i)} right={`${daysOverdue(i.dueDate)} days late`} />}
  />
);

export const RecentIssuesPanel = () => (
  <LoadPanel
    title="Recently Issued" k="issues" loader={loadIssues} to="/library/issues" empty="No books issued yet"
    items={(i) => [...i].sort((a, b) => String(b.issueDate || b.createdAt || '').localeCompare(String(a.issueDate || a.createdAt || ''))).slice(0, 4)}
    render={(i) => <Row title={issueTitle(i)} sub={issueStudent(i)} right={`Due ${fmtDate(i.dueDate)}`} />}
  />
);

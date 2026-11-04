import React from 'react';
import { Home } from 'lucide-react';
import { ROLE, getCurrentUser, getCurrentRole, roleLabel } from '../../config/permissions';
import {
  UserStats, StudentsStat, CoursesStat, EnquiryStats, PendingFeeStats, LibraryStats, MyFeeStats,
  UpcomingClassesStat, UpcomingTestsStat, MySubjectsStat,
  UserPanels, CoursesPanel, UpcomingClassesPanel, UpcomingTestsPanel, NoticesPanel,
  RecentEnquiriesPanel, MyAssignmentsPanel, OverdueBooksPanel, RecentIssuesPanel,
} from './widgets';

const Stats = ({ children }) => <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">{children}</div>;
const Panels = ({ children }) => <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mt-3">{children}</div>;

// Each role gets its own set of widgets (Permission Matrix: Dashboard row).
// To change what a role sees, add or remove widgets in its layout below.

// Super Admin: all widgets
const SuperAdminDashboard = () => (
  <>
    <Stats>
      <UserStats />
      <StudentsStat />
      <CoursesStat />
      <EnquiryStats />
      <PendingFeeStats />
      <LibraryStats withCopies={false} />
    </Stats>
    <Panels>
      <UserPanels />
      <CoursesPanel />
      <UpcomingClassesPanel />
      <UpcomingTestsPanel />
      <NoticesPanel />
      <OverdueBooksPanel />
    </Panels>
  </>
);

// Office Staff: admissions and fees
const OfficeStaffDashboard = () => (
  <>
    <Stats>
      <StudentsStat />
      <EnquiryStats />
      <PendingFeeStats />
      <CoursesStat />
    </Stats>
    <Panels>
      <RecentEnquiriesPanel />
      <UpcomingClassesPanel />
      <NoticesPanel />
    </Panels>
  </>
);

// Faculty: own subjects, own classes, class tests
const FacultyDashboard = ({ userId }) => (
  <>
    <Stats>
      <MySubjectsStat facultyId={userId} />
      <UpcomingClassesStat facultyId={userId} />
      <UpcomingTestsStat />
    </Stats>
    <Panels>
      <UpcomingClassesPanel facultyId={userId} title="My Upcoming Classes" />
      <UpcomingTestsPanel />
      <MyAssignmentsPanel facultyId={userId} />
      <NoticesPanel />
    </Panels>
  </>
);

// Librarian: library widgets only
const LibrarianDashboard = () => (
  <>
    <Stats>
      <LibraryStats withCategories />
    </Stats>
    <Panels>
      <OverdueBooksPanel />
      <RecentIssuesPanel />
      <NoticesPanel />
    </Panels>
  </>
);

// Student: own fees, own timetable, notices
const StudentDashboard = () => (
  <>
    <Stats>
      <MyFeeStats />
      <UpcomingClassesStat />
    </Stats>
    <Panels>
      <UpcomingClassesPanel title="My Upcoming Classes" />
      <NoticesPanel />
    </Panels>
  </>
);

const Dashboard = () => {
  const user = getCurrentUser();
  const role = getCurrentRole();
  const userId = user?._id || user?.id || '';
  const name = user?.name || user?.email?.split('@')[0] || 'there';

  const view = {
    [ROLE.SUPER_ADMIN]: <SuperAdminDashboard />,
    [ROLE.OFFICE_STAFF]: <OfficeStaffDashboard />,
    [ROLE.FACULTY]: <FacultyDashboard userId={userId} />,
    [ROLE.LIBRARIAN]: <LibrarianDashboard />,
    [ROLE.STUDENT]: <StudentDashboard />,
  }[role] || (
    <Panels>
      <NoticesPanel />
    </Panels>
  );

  return (
    <div>
      {/* Page title */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-green-700 text-white flex items-center justify-center">
          <Home size={18} />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-800 leading-tight">Dashboard</h1>
          <p className="text-xs text-gray-500">
            Welcome, {name} · {roleLabel(role)}
          </p>
        </div>
      </div>

      {view}
    </div>
  );
};

export default Dashboard;

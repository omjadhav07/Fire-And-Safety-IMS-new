// import React from 'react';
// import { Home } from 'lucide-react';
// import { ROLE, getCurrentUser, getCurrentRole, roleLabel } from '../../config/permissions';
// import {
//   UserStats, StudentsStat, CoursesStat, EnquiryStats, PendingFeeStats, LibraryStats,
//   UpcomingClassesStat, UpcomingTestsStat,
//   CourseWisePanel, FeesTrendPanel, RecentActivityPanel, RecentCoursesPanel,
//   UpcomingClassesPanel, UpcomingTestsPanel,
// } from './widgets';

// const Stats = ({ children }) => (
//   <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">{children}</div>
// );
// const Panels = ({ children }) => (
//   <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mt-3">{children}</div>
// );

// const SuperAdminDashboard = () => (
//   <>
//     <Stats>
//       <UserStats />
//       <StudentsStat />
//       <CoursesStat />
//       <EnquiryStats />
//       <PendingFeeStats />
//       <LibraryStats withCopies={false} />
//     </Stats>
//     <Panels>
//       <CourseWisePanel />
//       <FeesTrendPanel />
//       <RecentActivityPanel />
//       <RecentCoursesPanel />
//       <UpcomingClassesPanel />
//       <UpcomingTestsPanel />
//     </Panels>
//   </>
// );

// // Shared layout for most roles since data is identical now
// const StandardDashboard = () => (
//   <>
//     <Stats>
//       <StudentsStat />
//       <EnquiryStats />
//       <PendingFeeStats />
//       <CoursesStat />
//     </Stats>
//     <Panels>
//       <CourseWisePanel />
//       <FeesTrendPanel />
//       <RecentActivityPanel />
//       <RecentCoursesPanel />
//       <UpcomingClassesPanel />
//       <UpcomingTestsPanel />
//     </Panels>
//   </>
// );

// const StudentDashboard = () => (
//   <>
//     <Stats>
//       <CoursesStat />
//       <UpcomingClassesStat />
//       <UpcomingTestsStat />
//     </Stats>
//     <Panels>
//       <RecentActivityPanel />
//       <UpcomingClassesPanel />
//       <UpcomingTestsPanel />
//     </Panels>
//   </>
// );

// const Dashboard = () => {
//   const user = getCurrentUser();
//   const role = getCurrentRole();
//   const name = user?.name || user?.email?.split('@')[0] || 'there';

//   const view = {
//     [ROLE.SUPER_ADMIN]: <SuperAdminDashboard />,
//     [ROLE.OFFICE_STAFF]: <StandardDashboard />,
//     [ROLE.FACULTY]: <StandardDashboard />,
//     [ROLE.LIBRARIAN]: <StandardDashboard />,
//     [ROLE.STUDENT]: <StudentDashboard />,
//   }[role] || <SuperAdminDashboard />;

//   return (
//     <div>
//       <div className="flex items-center gap-3 mb-3">
//         <div className="w-9 h-9 rounded-lg bg-sky-700 text-white flex items-center justify-center">
//           <Home size={18} />
//         </div>
//         <div>
//           <h1 className="text-lg font-bold text-gray-800 leading-tight">Dashboard</h1>
//           <p className="text-xs text-gray-500">
//             Welcome, {name} · {roleLabel(role)}
//           </p>
//         </div>
//       </div>

//       {view}
//     </div>
//   );
// };

// export default Dashboard;


import React from 'react';
import { Home } from 'lucide-react';
import { ROLE, getCurrentUser, getCurrentRole, roleLabel } from '../../config/permissions';
import {
  UserStats, StudentsStat, CoursesStat, EnquiryStats, PendingFeeStats, LibraryStats,
  UpcomingClassesStat, UpcomingTestsStat,
  CourseWisePanel, FeesTrendPanel, RecentActivityPanel, RecentCoursesPanel,
  UpcomingClassesPanel, UpcomingTestsPanel,
} from './widgets';

const Stats = ({ children }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">{children}</div>
);
const Panels = ({ children }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mt-3">{children}</div>
);

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
      <CourseWisePanel />
      <FeesTrendPanel />
      <RecentActivityPanel />
      <RecentCoursesPanel />
      <UpcomingClassesPanel />
      <UpcomingTestsPanel />
    </Panels>
  </>
);

// Shared layout for most roles since data is identical now
const StandardDashboard = () => (
  <>
    <Stats>
      <StudentsStat />
      <EnquiryStats />
      <PendingFeeStats />
      <CoursesStat />
    </Stats>
    <Panels>
      <CourseWisePanel />
      <FeesTrendPanel />
      <RecentActivityPanel />
      <RecentCoursesPanel />
      <UpcomingClassesPanel />
      <UpcomingTestsPanel />
    </Panels>
  </>
);

const StudentDashboard = () => (
  <>
    <Stats>
      <CoursesStat />
      <UpcomingClassesStat />
      <UpcomingTestsStat />
    </Stats>
    <Panels>
      <RecentActivityPanel />
      <UpcomingClassesPanel />
      <UpcomingTestsPanel />
    </Panels>
  </>
);

const Dashboard = () => {
  const user = getCurrentUser();
  const role = getCurrentRole();
  const name = user?.name || user?.email?.split('@')[0] || 'there';

  const view = {
    [ROLE.SUPER_ADMIN]: <SuperAdminDashboard />,
    [ROLE.OFFICE_STAFF]: <StandardDashboard />,
    [ROLE.FACULTY]: <StandardDashboard />,
    [ROLE.LIBRARIAN]: <StandardDashboard />,
    [ROLE.STUDENT]: <StudentDashboard />,
  }[role] || <SuperAdminDashboard />;

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-sky-700 text-white flex items-center justify-center">
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
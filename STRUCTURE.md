# Project structure (src)

Every feature has its own folder inside `src/pages/`. The folder holds that feature's pages, popups (forms), API service and small helpers, so everything for one module is in one place.

```
src/
├── assets
├── components
│   ├── DataViews.jsx
│   ├── Field.jsx
│   ├── ImportExport.jsx
│   ├── Modal.jsx
│   └── StudentSearch.jsx
├── config
│   └── Config.jsx
├── layout
│   ├── Header.jsx
│   ├── Layout.jsx
│   └── Sidebar.jsx
├── pages
│   ├── audit
│   │   ├── AuditLogs.jsx
│   │   └── auditService.js
│   ├── auth
│   │   ├── authService.js
│   │   ├── ForgotPassword.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── ResetPassword.jsx
│   ├── classTests
│   │   ├── ClassTestInsights.jsx
│   │   ├── ClassTestMarks.jsx
│   │   ├── classTestService.js
│   │   ├── classTestUtils.js
│   │   ├── CreateClassTest.jsx
│   │   ├── ManageClassTests.jsx
│   │   └── MarkHistory.jsx
│   ├── courses
│   │   ├── CourseBatches.jsx
│   │   ├── CourseFees.jsx
│   │   ├── courseService.js
│   │   ├── courseUtils.js
│   │   ├── CreateCourse.jsx
│   │   └── ManageCourses.jsx
│   ├── dashboard
│   │   └── Dashboard.jsx
│   ├── enquiries
│   │   ├── ConvertEnquiry.jsx
│   │   ├── CreateEnquiry.jsx
│   │   ├── EnquiryDetails.jsx
│   │   ├── EnquiryResult.jsx
│   │   ├── enquiryService.js
│   │   ├── enquiryUtils.js
│   │   └── ManageEnquiries.jsx
│   ├── faculty
│   │   ├── AssignFaculty.jsx
│   │   ├── facultyAssignmentService.js
│   │   ├── facultyUtils.js
│   │   └── ManageFacultyAssignments.jsx
│   ├── fees
│   │   ├── EligibilityModal.jsx
│   │   ├── feeService.js
│   │   ├── FeeSummaryModal.jsx
│   │   ├── feeUtils.js
│   │   ├── GenerateLedgerModal.jsx
│   │   ├── LedgerTable.jsx
│   │   ├── ManageFees.jsx
│   │   ├── MyFees.jsx
│   │   ├── PaymentModal.jsx
│   │   └── ReceiptModal.jsx
│   ├── files
│   │   ├── MyFiles.jsx
│   │   └── uploadService.js
│   ├── library
│   │   ├── BookDetails.jsx
│   │   ├── bookImportExportService.js
│   │   ├── BookIssues.jsx
│   │   ├── BookStatus.jsx
│   │   ├── bookUtils.js
│   │   ├── categoryUtils.js
│   │   ├── CreateBook.jsx
│   │   ├── CreateCategory.jsx
│   │   ├── libraryService.js
│   │   ├── ManageBooks.jsx
│   │   ├── ManageCategories.jsx
│   │   └── StudentHistory.jsx
│   ├── notices
│   │   ├── CreateNotice.jsx
│   │   ├── ManageNotices.jsx
│   │   ├── NoticeDetails.jsx
│   │   ├── noticeService.js
│   │   └── noticeUtils.js
│   ├── schedules
│   │   ├── classScheduleService.js
│   │   ├── CreateSchedule.jsx
│   │   ├── ManageSchedules.jsx
│   │   ├── ScheduleDetails.jsx
│   │   └── scheduleUtils.js
│   ├── students
│   │   ├── CreateStudent.jsx
│   │   ├── ManageStudents.jsx
│   │   ├── StudentDocuments.jsx
│   │   ├── StudentProfile.jsx
│   │   ├── studentService.js
│   │   ├── StudentStage.jsx
│   │   ├── StudentStatus.jsx
│   │   └── studentUtils.js
│   └── users
│       ├── ManageUsers.jsx
│       └── userService.js
├── services
│   ├── api.js
│   └── helpers.js
├── App.css
├── App.jsx
├── index.css
└── main.jsx
```

## How the files are named
- `Manage<Thing>.jsx` - the main list page of a feature (table, search, filters).
- `Create<Thing>.jsx` - the add / edit form (opens as a popup).
- `<Thing>Details.jsx`, `<Thing>Status.jsx`, ... - the other popups of that feature.
- `<thing>Service.js` - the API calls of that feature.
- `<thing>Utils.js` - constants and small helpers used only by that feature.

## Shared code
- `src/components/` - used by many features (Modal, Field, DataViews, ImportExport, StudentSearch).
- `src/services/api.js` - the axios instance (base URL, token, refresh).
- `src/services/helpers.js` - small helpers used everywhere (dates, ids, input style).
- `src/layout/` - header, sidebar and page layout.

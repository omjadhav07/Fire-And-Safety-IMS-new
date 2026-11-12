// import React, { useEffect, useMemo, useState } from "react";
// import { Search, Plus, RefreshCw, Receipt, ReceiptText, ShieldCheck, FilePlus2, Ban, Download } from "lucide-react";
// import { getPendingFees, cancelPayment, feeStudentId, getFeeSummary } from "./feeService";
// import { getStudentNameMap } from "../students/studentService";
// import { getCourses, getFeeComponents } from "../courses/courseService";
// import { getErrorMessage } from "../../services/api";
// import { getId, inputClass, titleCase } from "../../services/helpers";
// import {
//   inr, num, str, objectIdOf, studentNameOf, fmtDateTime, paymentStatusClass,
//   buildFeeDetail, downloadFeeDetailCsv,
// } from "./feeUtils";
// import PaymentModal from "./PaymentModal";
// import ReceiptModal from "./ReceiptModal";
// import EligibilityModal from "./EligibilityModal";
// import GenerateLedgerModal from "./GenerateLedgerModal";
// import FeeSummaryModal from "./FeeSummaryModal";

// // Which course a pending-fee row belongs to (id, populated object, or just a name)
// const courseIdOfRow = (r, courses) => {
//   const c = r.course || r.course_id;
//   const id = objectIdOf(c);
//   if (id) return id;
//   const name = (c && typeof c === "object" ? c.name : typeof c === "string" ? c : "") || str(r, "course_name", "courseName");
//   const match = name ? courses.find((x) => x.name === name) : null;
//   return match ? getId(match) : "";
// };

// // The student record id used by the fee APIs, taken from a pending-fee row
// const feeIdOfRow = (r) =>
//   objectIdOf(r.student_id) || objectIdOf(r.studentId) || objectIdOf(r.student) || objectIdOf(r.user_id) || "";

// // Recent payments are kept in this browser so they are still there after a refresh
// const RECENT_KEY = "ims_recent_payments";
// const readRecent = () => {
//   try {
//     const v = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
//     return Array.isArray(v) ? v : [];
//   } catch {
//     return [];
//   }
// };

// const TABS = [
//   ["pending", "Pending fees"],
//   ["recent", "Recent payments"],
// ];

// const Fees = () => {
//   const [tab, setTab] = useState("pending");
//   const [pending, setPending] = useState([]);
//   const [names, setNames] = useState({});
//   const [courseNames, setCourseNames] = useState({});
//   const [courses, setCourses] = useState([]);
//   const [courseTotals, setCourseTotals] = useState({}); // courseId -> total fee (sum of fee components)
//   const [summaries, setSummaries] = useState({}); // student fee id -> { totalDue, totalPaid, balance } from the ledger
//   const [recent, setRecent] = useState(readRecent); // payments recorded on this computer
//   const [downloadingKey, setDownloadingKey] = useState("");

//   useEffect(() => {
//     try {
//       const slim = recent.slice(0, 100).map((e) => ({
//         ...e,
//         student: { id: e.student?.id, feeId: e.student?.feeId, name: e.student?.name },
//       }));
//       localStorage.setItem(RECENT_KEY, JSON.stringify(slim));
//     } catch {
//       /* storage full or blocked - the list still works for this session */
//     }
//   }, [recent]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [notice, setNotice] = useState("");
//   const [reloadKey, setReloadKey] = useState(0);
//   const [query, setQuery] = useState("");

//   const [payment, setPayment] = useState(null); // { student }
//   const [eligibility, setEligibility] = useState(null); // { student }
//   const [summaryFor, setSummaryFor] = useState(null); // { student }
//   const [showLedger, setShowLedger] = useState(false);
//   const [receiptId, setReceiptId] = useState(null);
//   const [cancellingId, setCancellingId] = useState(null);

//   // GET /fees/pending (+ student and course names, + each student's ledger summary)
//   useEffect(() => {
//     let cancelled = false;
//     Promise.all([getPendingFees(), getStudentNameMap().catch(() => ({})), getCourses().catch(() => [])])
//       .then(async ([list, nameMap, courses]) => {
//         // Total / paid / balance come from GET /fees/:studentId/summary (the real ledger),
//         // because the pending row only describes part of the student's fees.
//         const feeIds = [...new Set(list.map(feeIdOfRow).filter(Boolean))];
//         const pairs = await Promise.all(
//           feeIds.map((id) =>
//             getFeeSummary(id)
//               .then((s) => [id, s])
//               .catch(() => null)
//           )
//         );
//         if (cancelled) return;

//         setSummaries(Object.fromEntries(pairs.filter(Boolean)));
//         setPending(list);
//         setNames(nameMap);
//         setCourseNames(Object.fromEntries(courses.map((c) => [getId(c), c.name])));
//         setCourses(courses);
//         setError("");

//         // The pending list has no total fee, so take it from each course's fee components
//         const ids = [...new Set(list.map((r) => courseIdOfRow(r, courses)).filter(Boolean))];
//         Promise.all(
//           ids.map((id) =>
//             getFeeComponents(id)
//               .then((res) => [id, res.total])
//               .catch(() => null)
//           )
//         ).then((pairs) => !cancelled && setCourseTotals(Object.fromEntries(pairs.filter(Boolean))));
//       })
//       .catch((err) => !cancelled && setError(getErrorMessage(err, "Could not load pending fees")))
//       .finally(() => !cancelled && setLoading(false));
//     return () => {
//       cancelled = true;
//     };
//   }, [reloadKey]);

//   const reload = () => {
//     setLoading(true);
//     setReloadKey((k) => k + 1);
//   };

//   const rows = useMemo(
//     () =>
//       pending
//         .map((r, i) => {
//           const feeId = feeIdOfRow(r);
//           const name = studentNameOf(r) || names[feeId] || "Unknown student";
//           const course = r.course || r.course_id;
//           const ledger = summaries[feeId]; // { totalDue, totalPaid, balance } or undefined

//           // Total fee: ledger first, then the API row, then the course's total fee
//           const total =
//             num(ledger, "totalDue") ??
//             num(r, "total_fee", "totalFee", "total", "total_amount", "totalAmount", "total_payable", "net_fee", "course_fee") ??
//             courseTotals[courseIdOfRow(r, courses)];
//           const paid = num(ledger, "totalPaid") ?? num(r, "paid", "paid_amount", "paidAmount", "total_paid", "totalPaid", "amount_paid");
//           // Pending: the ledger balance when known, else total - paid (never below 0)
//           const ledgerBalance = num(ledger, "balance");
//           const pendingAmt =
//             ledgerBalance !== undefined
//               ? ledgerBalance
//               : total !== undefined
//               ? Math.max(total - (paid || 0), 0)
//               : num(r, "pending", "pending_amount", "pendingAmount", "balance", "due", "due_amount", "dueAmount", "outstanding");

//           return {
//             key: `${feeId || getId(r) || "row"}-${i}`,
//             name,
//             courseId: courseIdOfRow(r, courses),
//             course: (course && typeof course === "object" ? course.name : courseNames[course]) || str(r, "course_name", "courseName") || "-",
//             total,
//             paid,
//             pending: pendingAmt,
//             student: { id: feeId, feeId, name },
//           };
//         })
//         // one row per student, even if the API lists several fee lines for the same student
//         .filter((r, i, arr) => !r.student.feeId || arr.findIndex((x) => x.student.feeId === r.student.feeId) === i),
//     [pending, names, courseNames, courses, courseTotals, summaries]
//   );

//   const filtered = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     return q ? rows.filter((r) => r.name.toLowerCase().includes(q) || r.course.toLowerCase().includes(q)) : rows;
//   }, [rows, query]);

//   const totalPending = useMemo(() => rows.reduce((sum, r) => sum + (r.pending || 0), 0), [rows]);

//   // Download one student's fee detail (course fee components + total / paid / pending)
//   const handleDownloadRow = async (r) => {
//     setDownloadingKey(r.key);
//     try {
//       let components = [];
//       if (r.courseId) {
//         try {
//           components = (await getFeeComponents(r.courseId)).list;
//         } catch {
//           /* download without the breakdown */
//         }
//       }
//       downloadFeeDetailCsv(
//         buildFeeDetail({ student: { name: r.name }, course: r.course, components, total: r.total, paid: r.paid, pending: r.pending })
//       );
//     } finally {
//       setDownloadingKey("");
//     }
//   };

//   const handleCancel = async (entry) => {
//     if (!window.confirm(`Cancel the ${inr(entry.amount)} payment from ${entry.student.name}? This cannot be undone.`)) return;
//     setCancellingId(entry.id);
//     setError("");
//     try {
//       const res = await cancelPayment(entry.id);
//       setRecent((list) => list.map((e) => (e.id === entry.id ? { ...e, status: "cancelled" } : e)));
//       setNotice(res.message || "Payment cancelled");
//       reload();
//     } catch (err) {
//       setError(getErrorMessage(err, "Could not cancel payment"));
//     } finally {
//       setCancellingId(null);
//     }
//   };

//   return (
//     <div>
//       <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Fees</h1>
//           <p className="text-sm text-gray-500 mt-1">
//             {rows.length} students with pending fees · {inr(totalPending)} outstanding
//           </p>
//         </div>
//         <div className="flex flex-wrap items-center gap-3">
//           <button
//             onClick={reload}
//             className="p-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
//             aria-label="Refresh"
//           >
//             <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
//           </button>
//           <button
//             onClick={() => setShowLedger(true)}
//             className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
//           >
//             <FilePlus2 size={16} /> Generate ledger
//           </button>
//           <button
//             onClick={() => setSummaryFor({ student: null })}
//             className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
//           >
//             <ReceiptText size={16} /> Fee summary
//           </button>
//           <button
//             onClick={() => setEligibility({ student: null })}
//             className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
//           >
//             <ShieldCheck size={16} /> Exam eligibility
//           </button>
//           <button
//             onClick={() => setPayment({ student: null })}
//             className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0EA5E9] text-white font-medium hover:bg-[#0284C7]"
//           >
//             <Plus size={18} /> Record payment
//           </button>
//         </div>
//       </div>

//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
//         <div className="inline-flex p-1 rounded-lg bg-gray-100 self-start">
//           {TABS.map(([key, label]) => (
//             <button
//               key={key}
//               onClick={() => setTab(key)}
//               className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
//                 tab === key ? "bg-white text-sky-700 shadow-sm" : "text-gray-600 hover:text-gray-900"
//               }`}
//             >
//               {label}
//               {key === "recent" && recent.length > 0 ? ` (${recent.length})` : ""}
//             </button>
//           ))}
//         </div>
//         {tab === "pending" && (
//           <div className="relative md:w-72">
//             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//             <input
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//               placeholder="Search student or course"
//               className={`${inputClass} pl-9 bg-white`}
//             />
//           </div>
//         )}
//       </div>

//       {notice && (
//         <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 flex justify-between">
//           <span>{notice}</span>
//           <button onClick={() => setNotice("")} aria-label="Dismiss">×</button>
//         </div>
//       )}
//       {error && (
//         <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>
//       )}

//       {tab === "pending" && (
//         <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
//           <table className="w-full text-sm text-left">
//             <thead className="bg-[#0B1437] text-white">
//               <tr>
//                 <th className="px-4 py-3 font-medium">Student</th>
//                 <th className="px-4 py-3 font-medium">Course</th>
//                 <th className="px-4 py-3 font-medium text-right">Total fee</th>
//                 <th className="px-4 py-3 font-medium text-right">Paid</th>
//                 <th className="px-4 py-3 font-medium text-right">Pending</th>
//                 <th className="px-4 py-3 font-medium text-right">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100">
//               {loading ? (
//                 <tr>
//                   <td colSpan={6} className="px-4 py-10 text-center text-gray-500">Loading pending fees...</td>
//                 </tr>
//               ) : filtered.length === 0 ? (
//                 <tr>
//                   <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
//                     {rows.length === 0 ? "No pending fees. Everything is collected." : "No students match your search."}
//                   </td>
//                 </tr>
//               ) : (
//                 filtered.map((r) => (
//                   <tr key={r.key} className="hover:bg-gray-50">
//                     <td className="px-4 py-3 font-medium text-gray-900">{r.name}</td>
//                     <td className="px-4 py-3 text-gray-600">{r.course}</td>
//                     <td className="px-4 py-3 text-gray-600 text-right whitespace-nowrap">{inr(r.total)}</td>
//                     <td className="px-4 py-3 text-gray-600 text-right whitespace-nowrap">{inr(r.paid)}</td>
//                     <td className={`px-4 py-3 text-right whitespace-nowrap font-semibold ${r.pending > 0 ? "text-red-600" : "text-gray-500"}`}>{inr(r.pending)}</td>
//                     <td className="px-4 py-3">
//                       <div className="flex items-center justify-end gap-1 whitespace-nowrap">
//                         <button
//                           onClick={() => setPayment({ student: r.student })}
//                           disabled={!feeStudentId(r.student)}
//                           className="px-2.5 py-1.5 rounded-lg text-sky-700 hover:bg-sky-50 text-xs font-medium disabled:opacity-40"
//                         >
//                           Collect
//                         </button>
//                         <button
//                           onClick={() => setSummaryFor({ student: r.student })}
//                           disabled={!feeStudentId(r.student)}
//                           title="View fee ledger"
//                           className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 disabled:opacity-40"
//                         >
//                           <ReceiptText size={16} />
//                         </button>
//                         <button
//                           onClick={() => setEligibility({ student: r.student })}
//                           disabled={!feeStudentId(r.student)}
//                           title="Check exam eligibility"
//                           className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 disabled:opacity-40"
//                         >
//                           <ShieldCheck size={16} />
//                         </button>
//                         <button
//                           onClick={() => handleDownloadRow(r)}
//                           disabled={downloadingKey === r.key}
//                           title="Download fee detail"
//                           className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 disabled:opacity-40"
//                         >
//                           <Download size={16} />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {tab === "recent" && (
//         <>
//           <p className="mb-3 text-xs text-gray-500">
//             Payments recorded on this computer (saved in this browser). Use them to open a receipt or cancel a payment.
//           </p>
//           <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
//             <table className="w-full text-sm text-left">
//               <thead className="bg-[#0B1437] text-white">
//                 <tr>
//                   <th className="px-4 py-3 font-medium">Student</th>
//                   <th className="px-4 py-3 font-medium text-right">Amount</th>
//                   <th className="px-4 py-3 font-medium">Mode</th>
//                   <th className="px-4 py-3 font-medium">Reference</th>
//                   <th className="px-4 py-3 font-medium">Time</th>
//                   <th className="px-4 py-3 font-medium">Status</th>
//                   <th className="px-4 py-3 font-medium text-right">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-100">
//                 {recent.length === 0 ? (
//                   <tr>
//                     <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
//                       No payments recorded yet on this computer.
//                     </td>
//                   </tr>
//                 ) : (
//                   recent.map((e, i) => (
//                     <tr key={e.id || i} className="hover:bg-gray-50">
//                       <td className="px-4 py-3 font-medium text-gray-900">{e.student.name}</td>
//                       <td className="px-4 py-3 text-right whitespace-nowrap">{inr(e.amount)}</td>
//                       <td className="px-4 py-3 text-gray-600">{titleCase(e.mode)}</td>
//                       <td className="px-4 py-3 text-gray-600">{e.reference_no || "-"}</td>
//                       <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmtDateTime(e.at)}</td>
//                       <td className="px-4 py-3">
//                         <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${paymentStatusClass(e.status)}`}>
//                           {titleCase(e.status)}
//                         </span>
//                       </td>
//                       <td className="px-4 py-3">
//                         <div className="flex items-center justify-end gap-1 whitespace-nowrap">
//                           {e.id && (
//                             <button
//                               onClick={() => setReceiptId(e.id)}
//                               title="View receipt"
//                               className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800"
//                             >
//                               <Receipt size={16} />
//                             </button>
//                           )}
//                           {e.id && e.status !== "cancelled" && (
//                             <button
//                               onClick={() => handleCancel(e)}
//                               disabled={cancellingId === e.id}
//                               title="Cancel payment"
//                               className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
//                             >
//                               <Ban size={16} />
//                             </button>
//                           )}
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </>
//       )}

//       {payment && (
//         <PaymentModal
//           initialStudent={payment.student}
//           onClose={() => setPayment(null)}
//           onViewReceipt={setReceiptId}
//           onCreated={(entry) => {
//             setRecent((list) => [entry, ...list]);
//             reload();
//           }}
//         />
//       )}
//       {eligibility && <EligibilityModal student={eligibility.student} onClose={() => setEligibility(null)} />}
//       {summaryFor && <FeeSummaryModal student={summaryFor.student} onClose={() => setSummaryFor(null)} />}
//       {showLedger && (
//         <GenerateLedgerModal
//           onClose={() => setShowLedger(false)}
//           onGenerated={(msg) => {
//             setNotice(msg);
//             reload();
//           }}
//         />
//       )}
//       {receiptId && <ReceiptModal paymentId={receiptId} onClose={() => setReceiptId(null)} />}
//     </div>
//   );
// };

// export default Fees;



import React, { useEffect, useMemo, useState } from "react";
import { Search, Plus, RefreshCw, Receipt, ReceiptText, ShieldCheck, FilePlus2, Download } from "lucide-react";
import { getPendingFees, feeStudentId, getFeeSummary } from "./feeService";
import { getStudentNameMap } from "../students/studentService";
import { getCourses, getFeeComponents } from "../courses/courseService";
import { getErrorMessage } from "../../services/api";
import { getId, inputClass, titleCase } from "../../services/helpers";
import {
  inr, num, str, objectIdOf, studentNameOf, fmtDateTime, paymentStatusClass,
  buildFeeDetail, downloadFeeDetailCsv,
} from "./feeUtils";
import PaymentModal from "./PaymentModal";
import ReceiptModal from "./ReceiptModal";
import EligibilityModal from "./EligibilityModal";
import GenerateLedgerModal from "./GenerateLedgerModal";
import FeeSummaryModal from "./FeeSummaryModal";

// Which course a pending-fee row belongs to (id, populated object, or just a name)
const courseIdOfRow = (r, courses) => {
  const c = r.course || r.course_id;
  const id = objectIdOf(c);
  if (id) return id;
  const name = (c && typeof c === "object" ? c.name : typeof c === "string" ? c : "") || str(r, "course_name", "courseName");
  const match = name ? courses.find((x) => x.name === name) : null;
  return match ? getId(match) : "";
};

// The student record id used by the fee APIs, taken from a pending-fee row
const feeIdOfRow = (r) =>
  objectIdOf(r.student_id) || objectIdOf(r.studentId) || objectIdOf(r.student) || objectIdOf(r.user_id) || "";

// Recent payments are kept in this browser so they are still there after a refresh
const RECENT_KEY = "ims_recent_payments";
const readRecent = () => {
  try {
    const v = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};

const TABS = [
  ["pending", "Pending fees"],
  ["recent", "Recent payments"],
];

const Fees = () => {
  const [tab, setTab] = useState("pending");
  const [pending, setPending] = useState([]);
  const [names, setNames] = useState({});
  const [courseNames, setCourseNames] = useState({});
  const [courses, setCourses] = useState([]);
  const [courseTotals, setCourseTotals] = useState({}); // courseId -> total fee (sum of fee components)
  const [summaries, setSummaries] = useState({}); // student fee id -> { totalDue, totalPaid, balance } from the ledger
  const [recent, setRecent] = useState(readRecent); // payments recorded on this computer
  const [downloadingKey, setDownloadingKey] = useState("");

  useEffect(() => {
    try {
      const slim = recent.slice(0, 100).map((e) => ({
        ...e,
        student: { id: e.student?.id, feeId: e.student?.feeId, name: e.student?.name },
      }));
      localStorage.setItem(RECENT_KEY, JSON.stringify(slim));
    } catch {
      /* storage full or blocked - the list still works for this session */
    }
  }, [recent]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [query, setQuery] = useState("");

  const [payment, setPayment] = useState(null); // { student }
  const [eligibility, setEligibility] = useState(null); // { student }
  const [summaryFor, setSummaryFor] = useState(null); // { student }
  const [showLedger, setShowLedger] = useState(false);
  const [receiptId, setReceiptId] = useState(null);

  // GET /fees/pending (+ student and course names, + each student's ledger summary)
  useEffect(() => {
    let cancelled = false;
    Promise.all([getPendingFees(), getStudentNameMap().catch(() => ({})), getCourses().catch(() => [])])
      .then(async ([list, nameMap, courses]) => {
        // Total / paid / balance come from GET /fees/:studentId/summary (the real ledger),
        // because the pending row only describes part of the student's fees.
        const feeIds = [...new Set(list.map(feeIdOfRow).filter(Boolean))];
        const pairs = await Promise.all(
          feeIds.map((id) =>
            getFeeSummary(id)
              .then((s) => [id, s])
              .catch(() => null)
          )
        );
        if (cancelled) return;

        setSummaries(Object.fromEntries(pairs.filter(Boolean)));
        setPending(list);
        setNames(nameMap);
        setCourseNames(Object.fromEntries(courses.map((c) => [getId(c), c.name])));
        setCourses(courses);
        setError("");

        // The pending list has no total fee, so take it from each course's fee components
        const ids = [...new Set(list.map((r) => courseIdOfRow(r, courses)).filter(Boolean))];
        Promise.all(
          ids.map((id) =>
            getFeeComponents(id)
              .then((res) => [id, res.total])
              .catch(() => null)
          )
        ).then((pairs) => !cancelled && setCourseTotals(Object.fromEntries(pairs.filter(Boolean))));
      })
      .catch((err) => !cancelled && setError(getErrorMessage(err, "Could not load pending fees")))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const reload = () => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  const rows = useMemo(
    () =>
      pending
        .map((r, i) => {
          const feeId = feeIdOfRow(r);
          const name = studentNameOf(r) || names[feeId] || "Unknown student";
          const course = r.course || r.course_id;
          const ledger = summaries[feeId]; // { totalDue, totalPaid, balance } or undefined

          // Total fee: ledger first, then the API row, then the course's total fee
          const total =
            num(ledger, "totalDue") ??
            num(r, "total_fee", "totalFee", "total", "total_amount", "totalAmount", "total_payable", "net_fee", "course_fee") ??
            courseTotals[courseIdOfRow(r, courses)];
          const paid = num(ledger, "totalPaid") ?? num(r, "paid", "paid_amount", "paidAmount", "total_paid", "totalPaid", "amount_paid");
          // Pending: the ledger balance when known, else total - paid (never below 0)
          const ledgerBalance = num(ledger, "balance");
          const pendingAmt =
            ledgerBalance !== undefined
              ? ledgerBalance
              : total !== undefined
              ? Math.max(total - (paid || 0), 0)
              : num(r, "pending", "pending_amount", "pendingAmount", "balance", "due", "due_amount", "dueAmount", "outstanding");

          return {
            key: `${feeId || getId(r) || "row"}-${i}`,
            name,
            courseId: courseIdOfRow(r, courses),
            course: (course && typeof course === "object" ? course.name : courseNames[course]) || str(r, "course_name", "courseName") || "-",
            total,
            paid,
            pending: pendingAmt,
            student: { id: feeId, feeId, name },
          };
        })
        // one row per student, even if the API lists several fee lines for the same student
        .filter((r, i, arr) => !r.student.feeId || arr.findIndex((x) => x.student.feeId === r.student.feeId) === i),
    [pending, names, courseNames, courses, courseTotals, summaries]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? rows.filter((r) => r.name.toLowerCase().includes(q) || r.course.toLowerCase().includes(q)) : rows;
  }, [rows, query]);

  const totalPending = useMemo(() => rows.reduce((sum, r) => sum + (r.pending || 0), 0), [rows]);

  // Download one student's fee detail (course fee components + total / paid / pending)
  const handleDownloadRow = async (r) => {
    setDownloadingKey(r.key);
    try {
      let components = [];
      if (r.courseId) {
        try {
          components = (await getFeeComponents(r.courseId)).list;
        } catch {
          /* download without the breakdown */
        }
      }
      downloadFeeDetailCsv(
        buildFeeDetail({ student: { name: r.name }, course: r.course, components, total: r.total, paid: r.paid, pending: r.pending })
      );
    } finally {
      setDownloadingKey("");
    }
  };

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fees</h1>
          <p className="text-sm text-gray-500 mt-1">
            {rows.length} students with pending fees · {inr(totalPending)} outstanding
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={reload}
            className="p-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
            aria-label="Refresh"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setShowLedger(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <FilePlus2 size={16} /> Generate ledger
          </button>
          <button
            onClick={() => setSummaryFor({ student: null })}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <ReceiptText size={16} /> Fee summary
          </button>
          <button
            onClick={() => setEligibility({ student: null })}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <ShieldCheck size={16} /> Exam eligibility
          </button>
          <button
            onClick={() => setPayment({ student: null })}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0EA5E9] text-white font-medium hover:bg-[#0284C7]"
          >
            <Plus size={18} /> Record payment
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div className="inline-flex p-1 rounded-lg bg-gray-100 self-start">
          {TABS.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                tab === key ? "bg-white text-sky-700 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {label}
              {key === "recent" && recent.length > 0 ? ` (${recent.length})` : ""}
            </button>
          ))}
        </div>
        {tab === "pending" && (
          <div className="relative md:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search student or course"
              className={`${inputClass} pl-9 bg-white`}
            />
          </div>
        )}
      </div>

      {notice && (
        <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 flex justify-between">
          <span>{notice}</span>
          <button onClick={() => setNotice("")} aria-label="Dismiss">×</button>
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>
      )}

      {tab === "pending" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#0B1437] text-white">
              <tr>
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">Course</th>
                <th className="px-4 py-3 font-medium text-right">Total fee</th>
                <th className="px-4 py-3 font-medium text-right">Paid</th>
                <th className="px-4 py-3 font-medium text-right">Pending</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-500">Loading pending fees...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                    {rows.length === 0 ? "No pending fees. Everything is collected." : "No students match your search."}
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.key} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{r.name}</td>
                    <td className="px-4 py-3 text-gray-600">{r.course}</td>
                    <td className="px-4 py-3 text-gray-600 text-right whitespace-nowrap">{inr(r.total)}</td>
                    <td className="px-4 py-3 text-gray-600 text-right whitespace-nowrap">{inr(r.paid)}</td>
                    <td className={`px-4 py-3 text-right whitespace-nowrap font-semibold ${r.pending > 0 ? "text-red-600" : "text-gray-500"}`}>{inr(r.pending)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                        <button
                          onClick={() => setPayment({ student: r.student })}
                          disabled={!feeStudentId(r.student)}
                          className="px-2.5 py-1.5 rounded-lg text-sky-700 hover:bg-sky-50 text-xs font-medium disabled:opacity-40"
                        >
                          Collect
                        </button>
                        <button
                          onClick={() => setSummaryFor({ student: r.student })}
                          disabled={!feeStudentId(r.student)}
                          title="View fee ledger"
                          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 disabled:opacity-40"
                        >
                          <ReceiptText size={16} />
                        </button>
                        <button
                          onClick={() => setEligibility({ student: r.student })}
                          disabled={!feeStudentId(r.student)}
                          title="Check exam eligibility"
                          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 disabled:opacity-40"
                        >
                          <ShieldCheck size={16} />
                        </button>
                        <button
                          onClick={() => handleDownloadRow(r)}
                          disabled={downloadingKey === r.key}
                          title="Download fee detail"
                          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 disabled:opacity-40"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === "recent" && (
        <>
          <p className="mb-3 text-xs text-gray-500">
            Payments recorded on this computer (saved in this browser). Use them to open a receipt.
          </p>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#0B1437] text-white">
                <tr>
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                  <th className="px-4 py-3 font-medium">Mode</th>
                  <th className="px-4 py-3 font-medium">Reference</th>
                  <th className="px-4 py-3 font-medium">Time</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recent.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                      No payments recorded yet on this computer.
                    </td>
                  </tr>
                ) : (
                  recent.map((e, i) => (
                    <tr key={e.id || i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{e.student.name}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">{inr(e.amount)}</td>
                      <td className="px-4 py-3 text-gray-600">{titleCase(e.mode)}</td>
                      <td className="px-4 py-3 text-gray-600">{e.reference_no || "-"}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmtDateTime(e.at)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${paymentStatusClass(e.status)}`}>
                          {titleCase(e.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                          {e.id && (
                            <button
                              onClick={() => setReceiptId(e.id)}
                              title="View receipt"
                              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                            >
                              <Receipt size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {payment && (
        <PaymentModal
          initialStudent={payment.student}
          onClose={() => setPayment(null)}
          onViewReceipt={setReceiptId}
          onCreated={(entry) => {
            setRecent((list) => [entry, ...list]);
            reload();
          }}
        />
      )}
      {eligibility && <EligibilityModal student={eligibility.student} onClose={() => setEligibility(null)} />}
      {summaryFor && <FeeSummaryModal student={summaryFor.student} onClose={() => setSummaryFor(null)} />}
      {showLedger && (
        <GenerateLedgerModal
          onClose={() => setShowLedger(false)}
          onGenerated={(msg) => {
            setNotice(msg);
            reload();
          }}
        />
      )}
      {receiptId && <ReceiptModal paymentId={receiptId} onClose={() => setReceiptId(null)} />}
    </div>
  );
};

export default Fees;
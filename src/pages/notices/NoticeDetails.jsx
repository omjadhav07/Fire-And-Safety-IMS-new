// import React, { useEffect, useState } from "react";
// import { getNoticeById } from "./noticeService";
// import { getErrorMessage } from "../../services/api";
// import Modal from "../../components/Modal";
// import { fmtDate, titleCase } from "../../services/helpers";
// import { statusClass } from "./noticeUtils";

// // GET /notices/:id
// const NoticeDetails = ({ id, audience, onClose }) => {
//   const [data, setData] = useState(null);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     let cancelled = false;
//     getNoticeById(id)
//       .then((n) => !cancelled && setData(n))
//       .catch((err) => !cancelled && setError(getErrorMessage(err, "Could not load notice")));
//     return () => {
//       cancelled = true;
//     };
//   }, [id]);

//   const status = String(data?.status || "draft").toLowerCase();

//   return (
//     <Modal title="Notice details" onClose={onClose} maxWidth="max-w-lg">
//       {error && <p className="text-sm text-red-600">{error}</p>}
//       {!data && !error && <p className="text-sm text-gray-500">Loading...</p>}
//       {data && (
//         <div className="space-y-4">
//           <div>
//             <h3 className="text-lg font-semibold text-gray-900">{data.title}</h3>
//             <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{data.description}</p>
//           </div>
//           <dl className="divide-y divide-gray-100 text-sm border-t border-gray-100">
//             <div className="flex justify-between gap-4 py-2.5">
//               <dt className="text-gray-500">Audience</dt>
//               <dd className="font-medium text-gray-900">{audience(data)}</dd>
//             </div>
//             <div className="flex justify-between gap-4 py-2.5">
//               <dt className="text-gray-500">Status</dt>
//               <dd>
//                 <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusClass(status)}`}>
//                   {titleCase(status)}
//                 </span>
//               </dd>
//             </div>
//             <div className="flex justify-between gap-4 py-2.5">
//               <dt className="text-gray-500">Created</dt>
//               <dd className="font-medium text-gray-900">{fmtDate(data.createdAt)}</dd>
//             </div>
//           </dl>
//         </div>
//       )}
//     </Modal>
//   );
// };

// export default NoticeDetails;


import React, { useEffect, useState } from "react";
import { getNoticeById } from "./noticeService";
import { getErrorMessage } from "../../services/api";
import Modal from "../../components/Modal";
import { fmtDate, titleCase } from "../../services/helpers";
import { statusClass } from "./noticeUtils";

// GET /notices/:id
const NoticeDetails = ({ id, onClose }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getNoticeById(id)
      .then((n) => !cancelled && setData(n))
      .catch((err) => !cancelled && setError(getErrorMessage(err, "Could not load notice")));
    return () => {
      cancelled = true;
    };
  }, [id]);

  const status = String(data?.status || "draft").toLowerCase();

  return (
    <Modal title="Notice details" onClose={onClose} maxWidth="max-w-lg">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!data && !error && <p className="text-sm text-gray-500">Loading...</p>}
      {data && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{data.title}</h3>
            <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{data.description}</p>
          </div>
          <dl className="divide-y divide-gray-100 text-sm border-t border-gray-100">
            {/* Audience row removed */}
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-gray-500">Status</dt>
              <dd>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusClass(status)}`}>
                  {titleCase(status)}
                </span>
              </dd>
            </div>
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-gray-500">Created</dt>
              <dd className="font-medium text-gray-900">{fmtDate(data.createdAt)}</dd>
            </div>
          </dl>
        </div>
      )}
    </Modal>
  );
};

export default NoticeDetails;

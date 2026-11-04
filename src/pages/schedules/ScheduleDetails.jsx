import React, { useEffect, useState } from "react";
import { getScheduleById } from "./classScheduleService";
import { getErrorMessage } from "../../services/api";
import Modal from "../../components/Modal";
import { fmtDate, titleCase } from "../../services/helpers";
import { fmtTime, scheduleStatusClass } from "./scheduleUtils";

// GET /classschedules/:id
const ScheduleDetails = ({ id, courseName, batchName, facultyName, onClose }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getScheduleById(id)
      .then((d) => !cancelled && setData(d))
      .catch((err) => !cancelled && setError(getErrorMessage(err, "Could not load class schedule")));
    return () => {
      cancelled = true;
    };
  }, [id]);

  const status = String(data?.status || "scheduled").toLowerCase();
  const rows = data && [
    ["Course", courseName(data)],
    ["Batch", batchName(data)],
    ["Faculty", facultyName(data)],
    ["Date", fmtDate(data.date)],
    ["Time", `${fmtTime(data.start_time)} – ${fmtTime(data.end_time)}`],
  ];

  return (
    <Modal title="Class details" onClose={onClose}>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!data && !error && <p className="text-sm text-gray-500">Loading...</p>}
      {data && (
        <div>
          <div className="flex items-center justify-between gap-3 mb-3">
            <h3 className="text-lg font-semibold text-gray-900">{data.subject}</h3>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${scheduleStatusClass(status)}`}>{titleCase(status)}</span>
          </div>
          <dl className="divide-y divide-gray-100 text-sm border-t border-gray-100">
            {rows.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 py-2.5">
                <dt className="text-gray-500 shrink-0">{label}</dt>
                <dd className="font-medium text-gray-900 text-right">{value || "-"}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </Modal>
  );
};

export default ScheduleDetails;

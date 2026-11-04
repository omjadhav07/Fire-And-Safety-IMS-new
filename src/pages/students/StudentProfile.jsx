import React, { useEffect, useState } from "react";
import { getStudentById } from "./studentService";
import { getErrorMessage } from "../../services/api";
import Modal from "../../components/Modal";
import { fmtDate, titleCase } from "../../services/helpers";
import { statusClass } from "./studentUtils";

// GET /students/:id
const StudentProfile = ({ id, courseName, batchName, onClose }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getStudentById(id)
      .then((s) => !cancelled && setData(s))
      .catch((err) => !cancelled && setError(getErrorMessage(err, "Could not load student")));
    return () => {
      cancelled = true;
    };
  }, [id]);

  const status = String(data?.status || "active").toLowerCase();
  const rows = data && [
    ["Student ID", data.rollNo],
    ["Date of birth", fmtDate(data.dob)],
    ["Gender", titleCase(data.gender)],
    ["Phone", data.phone],
    ["Email", data.email],
    ["Address", data.address],
    ["Guardian", data.guardian_name],
    ["Guardian phone", data.guardian_phone],
    ["Qualification", data.qualification],
    ["Course", courseName(data)],
    ["Batch", batchName(data)],
    ["Admitted on", fmtDate(data.admitted_on)],
    ["Lifecycle stage", titleCase(data.lifecycle_stage)],
    ["Stage status", titleCase(data.stage_status)],
    [
      "Login account",
      data.user_id && typeof data.user_id === "object"
        ? `${data.user_id.email || data.user_id.name} (${data.user_id.is_active === false ? "inactive" : "active"})`
        : "",
    ],
  ];

  return (
    <Modal title="Student profile" onClose={onClose} maxWidth="max-w-lg">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!data && !error && <p className="text-sm text-gray-500">Loading...</p>}
      {data && (
        <div>
          <div className="flex items-center justify-between gap-3 mb-3">
            <h3 className="text-lg font-semibold text-gray-900">{data.name}</h3>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusClass(status)}`}>{titleCase(status)}</span>
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

export default StudentProfile;

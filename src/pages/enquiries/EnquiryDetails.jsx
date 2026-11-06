import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getEnquiryById } from "./enquiryService";
import { getErrorMessage } from "../../services/api";
import Modal from "../../components/Modal";
import { fmtDate, titleCase } from "../../services/helpers";
import { statusClass } from "./enquiryUtils";

// GET /enquiries/:id
const EnquiryDetails = ({ id, onClose }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getEnquiryById(id)
      .then((d) => !cancelled && setData(d))
      .catch((err) => !cancelled && setError(getErrorMessage(err, "Could not load enquiry")));
    return () => {
      cancelled = true;
    };
  }, [id]);

  const status = String(data?.status || "new").toLowerCase();
  const rows = data && [
    ["Phone", data.phone],
    ["Email", data.email],
    ["Address", data.address],
    ["Course of interest", data.course_interest_id?.name],
    ["Source", titleCase(data.source)],
    ["Notes", data.notes],
    ["Created by", data.created_by?.name],
    ["Created on", fmtDate(data.createdAt)],
  ];

  return (
    <Modal title="Enquiry details" onClose={onClose}>
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
          {status === "converted" && data.converted_student_id && (
            <p className="mt-3 text-sm text-sky-700">
              Converted to a student. <Link to="/students" className="underline">Open students</Link>
            </p>
          )}
        </div>
      )}
    </Modal>
  );
};

export default EnquiryDetails;

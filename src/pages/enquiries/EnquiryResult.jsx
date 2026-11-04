import React from "react";
import { Link } from "react-router-dom";
import { Copy, Check, KeyRound } from "lucide-react";
import Modal from "../../components/Modal";

// EnquiryResult (popup)
const EnquiryResult = ({ closeResult, copied, copyPassword, result }) => (
  <Modal title="Admission created" onClose={closeResult}>
    <div className="space-y-4">
      <div className="text-sm">
        <p className="text-gray-600">
          <span className="font-semibold text-gray-900">{result.student?.full_name || result.enquiryName}</span> is now a student.
        </p>
        <dl className="mt-3 divide-y divide-gray-100 border-t border-gray-100">
          <div className="flex justify-between py-2">
            <dt className="text-gray-500">Student ID</dt>
            <dd className="font-mono text-gray-900">{result.student?.student_id || "-"}</dd>
          </div>
          <div className="flex justify-between py-2">
            <dt className="text-gray-500">Fee components generated</dt>
            <dd className="font-medium text-gray-900">{result.fees_generated ?? "-"}</dd>
          </div>
          <div className="flex justify-between py-2">
            <dt className="text-gray-500">Login email</dt>
            <dd className="font-medium text-gray-900">{result.account?.email || "-"}</dd>
          </div>
        </dl>
      </div>

      {result.account?.temporary_password && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="flex items-center gap-1.5 text-sm font-medium text-amber-800">
            <KeyRound size={15} /> Temporary password
          </p>
          <div className="mt-2 flex items-center gap-2">
            <code className="flex-1 min-w-0 break-all rounded bg-white border border-amber-200 px-2 py-1.5 text-sm text-gray-900 select-all">
              {result.account.temporary_password}
            </code>
            <button
              type="button"
              onClick={copyPassword}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 bg-white text-amber-800 hover:bg-amber-100 text-sm"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="mt-2 text-xs text-amber-800">
            Shown only once. Share it with the student securely
            {result.account.must_change_password ? "; they must change it on first login" : ""}.
          </p>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-1">
        <Link
          to="/students"
          className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Go to students
        </Link>
        <button
          onClick={closeResult}
          className="px-5 py-2.5 rounded-lg bg-[#16A34A] text-white font-medium hover:bg-[#15803D]"
        >
          Done
        </button>
      </div>
    </div>
  </Modal>
);

export default EnquiryResult;

import React from "react";
import Modal from "../../components/Modal";
import { titleCase, inputClass } from "../../services/helpers";
import { GENDERS } from "./enquiryUtils";
import Field from "../../components/Field";

// ConvertEnquiry (popup)
const ConvertEnquiry = ({ convertError, convertForm, convertTarget, converting, handleConvert, setC, setConvertTarget }) => (
  <Modal title={`Convert ${convertTarget.name} to admission`} onClose={() => setConvertTarget(null)} maxWidth="max-w-lg">
    <form onSubmit={handleConvert} className="space-y-4" noValidate>
      <p className="text-sm text-gray-500">
        This creates the student record and a login account. Fees for the course are generated automatically.
      </p>
      {convertError && <p className="text-sm text-red-600">{convertError}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Date of birth">
          <input type="date" value={convertForm.dob} max={new Date().toISOString().slice(0, 10)} onChange={setC("dob")} className={inputClass} />
        </Field>
        <Field label="Gender">
          <select value={convertForm.gender} onChange={setC("gender")} className={inputClass}>
            <option value="">Select gender</option>
            {GENDERS.map((g) => (
              <option key={g} value={g}>{titleCase(g)}</option>
            ))}
          </select>
        </Field>
        <Field label="Qualification" className="sm:col-span-2">
          <input value={convertForm.qualification} onChange={setC("qualification")} placeholder="12th Science" className={inputClass} />
        </Field>
        <Field label="Address" className="sm:col-span-2">
          <input value={convertForm.address} onChange={setC("address")} className={inputClass} />
        </Field>
        <Field label="Guardian name">
          <input value={convertForm.guardian_name} onChange={setC("guardian_name")} className={inputClass} />
        </Field>
        <Field label="Guardian phone">
          <input value={convertForm.guardian_phone} onChange={setC("guardian_phone")} inputMode="numeric" maxLength={10} className={inputClass} />
        </Field>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => setConvertTarget(null)}
          className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={converting}
          className="px-5 py-2.5 rounded-lg bg-[#16A34A] text-white font-medium hover:bg-[#15803D] disabled:opacity-60"
        >
          {converting ? "Converting..." : "Convert to admission"}
        </button>
      </div>
    </form>
  </Modal>
);

export default ConvertEnquiry;

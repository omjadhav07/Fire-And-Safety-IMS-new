import React from "react";

// Label + input wrapper used by the forms
const Field = ({ label, children, className = "" }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    {children}
  </div>
);

export default Field;

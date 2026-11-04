import React from "react";
import { X } from "lucide-react";

const Modal = ({ title, onClose, children, maxWidth = "max-w-md" }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onMouseDown={onClose}>
    <div
      className={`w-full ${maxWidth} bg-white rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto`}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
          <X size={20} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

export default Modal;

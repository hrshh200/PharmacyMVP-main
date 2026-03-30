import React from "react";

const ConfirmationToaster = ({ message, onClose }) => {
  return (
    <div className="fixed right-6 top-6 z-50">
      <div className="rounded-xl px-4 py-3 text-sm font-medium shadow-lg bg-emerald-600 text-white">
        {message}
        <button onClick={onClose} className="ml-4 text-white">
          Close
        </button>
        <button onClick={onClose} className="ml-4 text-white">
          Proceed
        </button>
      </div>
    </div>
  );
};

export default ConfirmationToaster;

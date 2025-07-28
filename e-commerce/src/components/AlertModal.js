// src/components/AlertModal.js
import React from 'react';

const AlertModal = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50">
      <div className="bg-white p-6 rounded shadow-lg text-center max-w-sm mx-auto">
        <p className="text-lg font-semibold mb-4">{message}</p>
        <button 
          onClick={onClose} 
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded font-semibold"
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default AlertModal;

import React from 'react';

interface ResetConfirmModalProps {
  show: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({ show, onCancel, onConfirm }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Reset All Data?</h2>
        <p className="text-gray-700 mb-6">
          Are you sure you want to reset all data to default values? This will clear all your priorities and configurations. This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
          >
            Reset Everything
          </button>
        </div>
      </div>
    </div>
  );
};

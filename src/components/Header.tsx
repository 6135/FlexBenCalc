import React from 'react';

interface HeaderProps {
  onPrint: () => void;
  onReset: () => void;
  onExport: () => void;
  onImport: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onPrint, onReset, onExport, onImport }) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold text-gray-900">Benefits Allocation Calculator</h1>
      <div className="flex gap-3">
        <button
          onClick={onExport}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold"
        >
          💾 Export JSON
        </button>
        <button
          onClick={onImport}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-semibold"
        >
          📂 Import JSON
        </button>
        <button
          onClick={onPrint}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-semibold"
        >
          🖨️ Print PDF
        </button>
        <button
          onClick={onReset}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-semibold"
        >
          🔄 Reset All Data
        </button>
      </div>
    </div>
  );
};

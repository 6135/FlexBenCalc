import React, { useState } from 'react';

interface HeaderProps {
  onPrint: () => void;
  onReset: () => void;
  onExport: () => void;
  onImport: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onPrint, onReset, onExport, onImport }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleAction = (action: () => void) => {
    action();
    setMenuOpen(false);
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Benefits Allocation Calculator</h1>
        
        {/* Desktop Menu - Hidden on mobile */}
        <div className="hidden lg:flex gap-3">
          <button
            onClick={onExport}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md font-medium flex items-center gap-2"
          >
            <span>💾</span>
            <span>Export</span>
          </button>
          <button
            onClick={onImport}
            className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-all shadow-sm hover:shadow-md font-medium flex items-center gap-2"
          >
            <span>📂</span>
            <span>Import</span>
          </button>
          <button
            onClick={onPrint}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md font-medium flex items-center gap-2"
          >
            <span>🖨️</span>
            <span>Print</span>
          </button>
          <button
            onClick={onReset}
            className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-all shadow-sm hover:shadow-md font-medium flex items-center gap-2"
          >
            <span>🔄</span>
            <span>Reset</span>
          </button>
        </div>

        {/* Burger Menu Button - Visible on mobile */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6 text-gray-900"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {menuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="lg:hidden mt-4 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <button
            onClick={() => handleAction(onExport)}
            className="w-full px-4 py-3 bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-medium text-left border-b border-indigo-700 flex items-center gap-2"
          >
            <span>💾</span>
            <span>Export JSON</span>
          </button>
          <button
            onClick={() => handleAction(onImport)}
            className="w-full px-4 py-3 bg-violet-600 text-white hover:bg-violet-700 transition-colors font-medium text-left border-b border-violet-700 flex items-center gap-2"
          >
            <span>📂</span>
            <span>Import JSON</span>
          </button>
          <button
            onClick={() => handleAction(onPrint)}
            className="w-full px-4 py-3 bg-emerald-600 text-white hover:bg-emerald-700 transition-colors font-medium text-left border-b border-emerald-700 flex items-center gap-2"
          >
            <span>🖨️</span>
            <span>Print PDF</span>
          </button>
          <button
            onClick={() => handleAction(onReset)}
            className="w-full px-4 py-3 bg-rose-600 text-white hover:bg-rose-700 transition-colors font-medium text-left flex items-center gap-2"
          >
            <span>🔄</span>
            <span>Reset All Data</span>
          </button>
        </div>
      )}
    </div>
  );
};

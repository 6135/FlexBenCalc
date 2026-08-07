import React from 'react';
import { Link } from 'react-router-dom';

interface FooterProps {
  onCookieSettings: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onCookieSettings }) => {
  return (
    <footer className="max-w-7xl mx-auto mt-6 sm:mt-8 pb-4 sm:pb-6">
      <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 text-center">
        <p className="text-sm text-gray-600">
          Created with the invaluable help of <strong className="text-gray-800">Ana Pereira</strong> and <strong className="text-gray-800">Florbela Tavares</strong>
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm">
          <Link to="/privacy" className="text-blue-600 hover:text-blue-800 hover:underline">
            Privacy Policy
          </Link>
          <span aria-hidden="true" className="text-gray-300">|</span>
          <button
            type="button"
            onClick={onCookieSettings}
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            Cookie settings
          </button>
        </div>
      </div>
    </footer>
  );
};

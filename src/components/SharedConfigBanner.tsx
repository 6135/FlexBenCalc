import React from 'react';

interface SharedConfigBannerProps {
  onImport: () => void;
  onDismiss: () => void;
}

export const SharedConfigBanner: React.FC<SharedConfigBannerProps> = ({ onImport, onDismiss }) => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 text-2xl">🔗</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-blue-900 mb-1">
            Shared Configuration Loaded
          </h3>
          <p className="text-blue-800 text-sm mb-3">
            You're viewing a shared benefits configuration. Your own saved data has not been affected.
          </p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={onImport}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              Import This Configuration
            </button>
            <button
              onClick={onDismiss}
              className="px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors font-medium text-sm"
            >
              Continue Viewing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

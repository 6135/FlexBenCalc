import React, { useState, useEffect } from 'react';
import { analytics, optOutAnalytics, optInAnalytics, hasAnalyticsConsent } from '../utils/analytics';

interface DisclaimerModalProps {
  show: boolean;
  onAccept: () => void;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ show, onAccept }) => {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  // Load saved preference on mount
  useEffect(() => {
    // If user has already given consent, checkbox should reflect that
    setAnalyticsEnabled(hasAnalyticsConsent());
  }, []);

  if (!show) return null;

  const handleAccept = () => {
    // Set preference BEFORE calling onAccept to ensure no events fire if opted out
    if (analyticsEnabled) {
      optInAnalytics();
      analytics.acceptDisclaimer();
    } else {
      optOutAnalytics();
    }
    onAccept();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Scrollable Content */}
        <div className="overflow-y-auto p-4 sm:p-6 lg:p-8 flex-1">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-red-700 mb-2">IMPORTANT DISCLAIMER</h2>
              <div className="text-gray-700 space-y-3">
                <p className="font-semibold">
                  This calculator is provided for informational purposes only. By using this tool, you acknowledge and agree that:
                </p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li><strong>No Guarantee of Accuracy:</strong> All calculations performed by this tool are the user's sole responsibility.</li>
                  <li><strong>No Liability:</strong> The creator assumes NO responsibility for any errors, mistakes, or financial losses resulting from the use of this calculator.</li>
                  <li><strong>Verify All Results:</strong> You must independently verify all calculations before making any financial decisions.</li>
                  <li><strong>Use At Your Own Risk:</strong> This tool is provided "as-is" without any warranties of any kind.</li>
                </ul>
                <p className="font-semibold text-red-600 mt-4">
                  If you do not agree with these terms, do not use this calculator.
                </p>
              </div>

              {/* Analytics Disclosure */}
              <div className="mt-6 pt-4 border-t border-gray-300">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">📊 Analytics & Privacy</h3>
                <div className="text-gray-700 space-y-3">
                  <p className="font-semibold">
                    We use Google Analytics to improve this tool. The following data is tracked:
                  </p>
                  <ul className="list-disc list-inside space-y-2 pl-4">
                    <li>Button clicks (Export, Import, Print, Reset, Auto-balance)</li>
                    <li>Priority management actions (Add, Remove, Reorder)</li>
                    <li>Page views and session duration</li>
                    <li>Device type and browser information</li>
                  </ul>
                  <p className="font-semibold mt-2">We DO NOT track or store:</p>
                  <ul className="list-disc list-inside space-y-2 pl-4">
                    <li>Your personal financial data or budget amounts</li>
                    <li>Health insurance selections or family information</li>
                    <li>Any personally identifiable information (PII)</li>
                    <li>IP addresses (anonymized by Google Analytics)</li>
                  </ul>
                  
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={analyticsEnabled}
                        onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-900">
                        I consent to anonymous usage analytics to help improve this tool
                      </span>
                    </label>
                    <p className="text-xs text-gray-600 mt-2 ml-6">
                      Your preference will be remembered for future visits.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer with Button */}
        <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50">
          <div className="flex justify-end gap-3">
            <button
              onClick={handleAccept}
              className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-md"
            >
              I Understand and Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

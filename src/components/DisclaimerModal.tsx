import React from 'react';

interface DisclaimerModalProps {
  show: boolean;
  onAccept: () => void;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ show, onAccept }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-4 sm:p-6 lg:p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
          <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <div>
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
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onAccept}
            className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
          >
            I Understand and Accept
          </button>
        </div>
      </div>
    </div>
  );
};

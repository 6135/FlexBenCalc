import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getStoredConsent } from '../utils/analytics';

interface DisclaimerModalProps {
  show: boolean;
  onAccept: () => void;
  onAcceptCookies: () => void;
  onRejectCookies: () => void;
}

type CookieChoice = 'accepted' | 'rejected' | null;

const initialCookieChoice = (): CookieChoice => {
  const stored = getStoredConsent();
  if (stored === 'granted') return 'accepted';
  if (stored === 'denied') return 'rejected';
  return null;
};

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({
  show,
  onAccept,
  onAcceptCookies,
  onRejectCookies,
}) => {
  const [cookieChoice, setCookieChoice] = useState<CookieChoice>(initialCookieChoice);

  // First-time visitors must make an explicit cookie choice before they can
  // dismiss the dialog. Returning visitors keep their stored choice and can
  // dismiss straight away (they can still change it here).
  const mustChooseCookies = cookieChoice === null;

  if (!show) return null;

  const handleAcceptCookies = (): void => {
    setCookieChoice('accepted');
    onAcceptCookies();
  };

  const handleRejectCookies = (): void => {
    setCookieChoice('rejected');
    onRejectCookies();
  };

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

        <div className="border-t border-gray-200 pt-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-2">🍪 Cookies &amp; Analytics</h3>
          <div className="text-gray-700 space-y-2 text-sm">
            <p>
              We use Google Analytics to understand which features people actually use
              (e.g. Share, Export, Print, Auto-Balance), so we know what's worth improving.
              It only records that an action happened — never your budget, dependents,
              priorities, or other figures you enter. Shared-link URLs are also stripped
              of their encoded data before anything is reported.
            </p>
            <p>
              Nothing is collected until you choose. If you reject, the Google Analytics
              script is never loaded, no analytics cookies are set, and nothing is sent to
              Google. You can change your choice any time via <strong>Cookie settings</strong> at
              the bottom of the page.
            </p>
            <p>
              Full details — including who receives the data, how long it is kept, and your
              rights — are in the{' '}
              <Link to="/privacy" className="text-blue-600 hover:text-blue-800 underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
          {/* Both options are given identical weight and styling, so neither is
              nudged over the other (EDPB guidance on equally prominent choices). */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <button
              onClick={handleAcceptCookies}
              aria-pressed={cookieChoice === 'accepted'}
              className={`px-4 py-2 rounded-lg font-medium text-sm border transition-colors ${
                cookieChoice === 'accepted'
                  ? 'bg-blue-700 text-white border-blue-700'
                  : 'bg-white text-gray-800 border-gray-400 hover:bg-gray-100'
              }`}
            >
              {cookieChoice === 'accepted' ? '✓ Analytics accepted' : 'Accept analytics cookies'}
            </button>
            <button
              onClick={handleRejectCookies}
              aria-pressed={cookieChoice === 'rejected'}
              className={`px-4 py-2 rounded-lg font-medium text-sm border transition-colors ${
                cookieChoice === 'rejected'
                  ? 'bg-blue-700 text-white border-blue-700'
                  : 'bg-white text-gray-800 border-gray-400 hover:bg-gray-100'
              }`}
            >
              {cookieChoice === 'rejected' ? '✓ Analytics rejected' : 'Reject analytics cookies'}
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
          {mustChooseCookies && (
            <p className="text-sm text-gray-600 sm:mr-auto">
              Please accept or reject analytics cookies above to continue.
            </p>
          )}
          <button
            onClick={onAccept}
            disabled={mustChooseCookies}
            aria-disabled={mustChooseCookies}
            title={mustChooseCookies ? 'Choose whether to accept analytics cookies first' : undefined}
            className={`px-6 py-3 font-semibold rounded-lg transition-colors ${
              mustChooseCookies
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            I Understand and Accept
          </button>
        </div>
      </div>
    </div>
  );
};

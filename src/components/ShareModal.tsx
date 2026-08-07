import React, { useState } from 'react';

interface ShareModalProps {
  show: boolean;
  shareUrl: string;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ 
  show, 
  shareUrl, 
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  if (!show) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Share Configuration</h2>
        
        <p className="text-gray-600 mb-4">
          Share this link to let others view your benefits configuration. They can import it without affecting their own saved data.
        </p>

        <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 mb-4">
          <p className="text-sm text-amber-900">
            <strong>Heads up:</strong> this link contains your figures — budget, bonus, health plan
            and priorities — encoded in the address itself. Anyone who has the link can read them,
            and links can travel further than intended through browser history, chat previews and
            server logs. Only send it to people you would be comfortable showing the numbers to.
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              placeholder="Share URL"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium whitespace-nowrap"
            >
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

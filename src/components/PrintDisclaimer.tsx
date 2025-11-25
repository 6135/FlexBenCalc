import React from 'react';

export const PrintDisclaimer: React.FC = () => {
  return (
    <div className="print-disclaimer hidden">
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ flexShrink: 0, width: '48px', height: '48px', backgroundColor: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
            ⚠️
          </div>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#b91c1c', marginBottom: '1rem' }}>IMPORTANT DISCLAIMER</h2>
            <div style={{ color: '#374151', lineHeight: '1.6' }}>
              <p style={{ fontWeight: '600', marginBottom: '1rem' }}>
                This calculator is provided for informational purposes only. By using this tool, you acknowledge and agree that:
              </p>
              <ul style={{ listStyleType: 'disc', paddingLeft: '2rem', marginBottom: '1rem' }}>
                <li style={{ marginBottom: '0.5rem' }}><strong>No Guarantee of Accuracy:</strong> All calculations performed by this tool are the user's sole responsibility.</li>
                <li style={{ marginBottom: '0.5rem' }}><strong>No Liability:</strong> The creator assumes NO responsibility for any errors, mistakes, or financial losses resulting from the use of this calculator.</li>
                <li style={{ marginBottom: '0.5rem' }}><strong>Verify All Results:</strong> You must independently verify all calculations before making any financial decisions.</li>
                <li style={{ marginBottom: '0.5rem' }}><strong>Use At Your Own Risk:</strong> This tool is provided "as-is" without any warranties of any kind.</li>
              </ul>
              <p style={{ fontWeight: '600', color: '#dc2626', marginTop: '1.5rem' }}>
                If you do not agree with these terms, do not use this calculator.
              </p>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '1rem', marginTop: '2rem', textAlign: 'center', color: '#6b7280' }}>
          <p>Created with the invaluable help of <strong>Ana Pereira</strong> and <strong>Florbela Tavares</strong></p>
        </div>
      </div>
    </div>
  );
};

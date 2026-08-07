// index.tsx
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import App from './App';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import './index.css';
import { trackPageView, initAnalyticsFromStoredConsent } from './utils/analytics';

// Resumes analytics only if the user granted consent in a previous session.
// If they never chose, or rejected, this is a no-op - nothing is loaded.
initAnalyticsFromStoredConsent();

// Tracks every route (initial load and subsequent client-side navigations, e.g.
// after importing a shared link). No-ops until analytics consent is granted.
const AnalyticsTracker: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  return null;
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <HashRouter>
      <AnalyticsTracker />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/shared/:sharedData" element={<App />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
);
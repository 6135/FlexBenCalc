// index.tsx
import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import App from './App';
import './index.css';
import { trackPageView } from './utils/analytics';

// The GA snippet in public/index.html sends the initial page_view automatically.
// This tracks subsequent client-side route changes (e.g. after importing a shared link).
const AnalyticsTracker: React.FC = () => {
  const location = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
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
      </Routes>
    </HashRouter>
  </React.StrictMode>
);
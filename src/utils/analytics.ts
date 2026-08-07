// analytics.ts
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const GA_MEASUREMENT_ID = 'G-7S0Q813S0J';
const CONSENT_STORAGE_KEY = 'gaConsent';

export type ConsentChoice = 'granted' | 'denied';

let scriptLoaded = false;

export const getStoredConsent = (): ConsentChoice | null => {
  try {
    const value = localStorage.getItem(CONSENT_STORAGE_KEY);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    return null;
  }
};

const hasConsent = (): boolean => getStoredConsent() === 'granted';

// Removes any Google Analytics cookies so a rejected/revoked choice takes
// effect immediately, even if a previous session had already granted consent.
const clearGaCookies = (): void => {
  document.cookie.split(';').forEach((cookie) => {
    const name = cookie.split('=')[0].trim();
    if (name.startsWith('_ga')) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
  });
};

// The /shared/:sharedData route embeds the user's full config (budget, dependents,
// priorities, etc.) as a base64 blob in the path — strip it before reporting to GA.
const sanitizePath = (path: string): string =>
  path.replace(/^\/shared\/.+/, '/shared/[redacted]');

const currentSanitizedPath = (): string =>
  sanitizePath(window.location.hash.replace(/^#/, '') || '/');

const loadGtagScript = (): void => {
  if (scriptLoaded) return;
  scriptLoaded = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };

  // gtag.js withholds hits for visitors it geo-detects in a consent-required region
  // (e.g. EEA/UK) unless an explicit consent state is set - silently, with no error,
  // even though dataLayer fills up normally. loadGtagScript() only ever runs after
  // the user has already granted consent via the disclaimer, so tell the library
  // that directly. Ad storage stays denied since this app has no ads/remarketing.
  window.gtag('consent', 'default', {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });

  window.gtag('js', new Date());
  // page_view is sent manually (via trackPageView) so the /shared/:sharedData
  // route's personal data can be redacted before it's reported.
  window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
};

// Call once at app startup: resumes analytics only if the user previously granted consent.
export const initAnalyticsFromStoredConsent = (): void => {
  if (hasConsent()) {
    loadGtagScript();
  }
};

export const grantConsent = (): void => {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, 'granted');
  } catch {
    // localStorage unavailable (e.g. private browsing) - consent won't persist across reloads.
  }
  const wasAlreadyLoaded = scriptLoaded;
  loadGtagScript();
  if (!wasAlreadyLoaded) {
    trackPageView(currentSanitizedPath());
  }
};

export const revokeConsent = (): void => {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, 'denied');
  } catch {
    // localStorage unavailable (e.g. private browsing) - consent won't persist across reloads.
  }
  if (typeof window.gtag === 'function') {
    window.gtag('consent', 'update', { analytics_storage: 'denied' });
  }
  clearGaCookies();
};

export const trackPageView = (path: string): void => {
  if (!hasConsent() || typeof window.gtag !== 'function') return;

  const sanitizedPath = sanitizePath(path);
  window.gtag('event', 'page_view', {
    page_path: sanitizedPath,
    page_location: `${window.location.origin}${window.location.pathname}#${sanitizedPath}`,
    page_title: document.title,
    send_to: GA_MEASUREMENT_ID,
  });
};

// Usage-pattern events (which features people actually use) - never includes
// financial figures or other personal data, only the fact that an action happened.
export const trackEvent = (name: string, params?: Record<string, unknown>): void => {
  if (!hasConsent() || typeof window.gtag !== 'function') return;
  window.gtag('event', name, { ...params, send_to: GA_MEASUREMENT_ID });
};

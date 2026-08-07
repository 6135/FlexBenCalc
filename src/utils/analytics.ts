// analytics.ts
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// Keep in sync with the Measurement ID in public/index.html.
export const GA_MEASUREMENT_ID = 'G-7S0Q813S0J';

// The /shared/:sharedData route embeds the user's full config (budget, dependents,
// priorities, etc.) as a base64 blob in the path — strip it before reporting to GA.
const sanitizePath = (path: string): string =>
  path.replace(/^\/shared\/.+/, '/shared/[redacted]');

export const trackPageView = (path: string): void => {
  if (typeof window.gtag !== 'function') return;

  const sanitizedPath = sanitizePath(path);

  window.gtag('event', 'page_view', {
    page_path: sanitizedPath,
    page_location: `${window.location.origin}${window.location.pathname}#${sanitizedPath}`,
    page_title: document.title,
    send_to: GA_MEASUREMENT_ID,
  });
};

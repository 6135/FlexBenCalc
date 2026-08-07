// analytics.ts
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const GA_MEASUREMENT_ID = 'G-7S0Q813S0J';
const CONSENT_STORAGE_KEY = 'gaConsent';

// Bump when the privacy policy or the scope of what we collect changes, so
// previously stored consent stops counting and users are asked again.
export const CONSENT_POLICY_VERSION = 1;

export type ConsentChoice = 'granted' | 'denied';

export interface ConsentRecord {
  choice: ConsentChoice;
  // ISO timestamp + policy version, so the consent can be *demonstrated*
  // after the fact (GDPR Art. 7(1)) rather than just acted on.
  timestamp: string;
  policyVersion: number;
}

let scriptLoaded = false;

export const getConsentRecord = (): ConsentRecord | null => {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;

    // Legacy format: a bare 'granted'/'denied' string with no timestamp or
    // version. It can't be demonstrated, so treat it as no choice at all.
    if (raw === 'granted' || raw === 'denied') return null;

    const parsed = JSON.parse(raw) as Partial<ConsentRecord>;
    if (parsed.choice !== 'granted' && parsed.choice !== 'denied') return null;
    if (parsed.policyVersion !== CONSENT_POLICY_VERSION) return null;
    if (typeof parsed.timestamp !== 'string') return null;

    return parsed as ConsentRecord;
  } catch {
    return null;
  }
};

export const getStoredConsent = (): ConsentChoice | null => getConsentRecord()?.choice ?? null;

const storeConsent = (choice: ConsentChoice): void => {
  const record: ConsentRecord = {
    choice,
    timestamp: new Date().toISOString(),
    policyVersion: CONSENT_POLICY_VERSION,
  };
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // localStorage unavailable (e.g. private browsing) - consent won't persist across reloads.
  }
};

const hasConsent = (): boolean => getStoredConsent() === 'granted';

const gaCookieNames = (): string[] =>
  document.cookie
    .split(';')
    .map((cookie) => cookie.split('=')[0].trim())
    .filter((name) => name.startsWith('_ga'));

// Removes any Google Analytics cookies so a rejected/revoked choice takes
// effect immediately, even if a previous session had already granted consent.
//
// A deletion only matches if its domain attribute matches the one the cookie
// was set with, so we widen from host-only outwards. Crucially we stop as soon
// as the cookie is actually gone: broader candidates can be public suffixes
// (.github.io) or TLDs (.io), which browsers reject with a console warning.
const clearGaCookies = (): void => {
  const names = gaCookieNames();
  if (names.length === 0) return;

  const { hostname } = window.location;
  const parts = hostname.split('.');
  const domains: (string | null)[] = [null, hostname];
  // Parent domains only; the full hostname is already covered above, and a
  // bare TLD is never a valid cookie domain.
  for (let i = 1; i < parts.length - 1; i++) {
    domains.push(`.${parts.slice(i).join('.')}`);
  }

  names.forEach((name) => {
    for (const domain of domains) {
      if (!gaCookieNames().includes(name)) break;
      const domainPart = domain ? ` domain=${domain};` : '';
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;${domainPart}`;
    }
  });
};

// The /shared/:sharedData route embeds the user's full config (budget, dependents,
// priorities, etc.) as a base64 blob in the path — strip it before reporting to GA.
const sanitizePath = (path: string): string =>
  path.replace(/^\/shared\/.+/, '/shared/[redacted]');

const currentSanitizedPath = (): string =>
  sanitizePath(window.location.hash.replace(/^#/, '') || '/');

const redactedUrl = (sanitizedPath: string): string =>
  `${window.location.origin}${window.location.pathname}#${sanitizedPath}`;

// Applies the redacted URL globally so that EVERY hit inherits it - including
// events we don't construct ourselves (trackEvent calls, and GA4 Enhanced
// Measurement's automatic scroll/click/download events). Without this, gtag.js
// falls back to reading document.location.href, which on the /shared/ route
// contains the user's base64-encoded financial config.
const applyRedactedLocation = (path: string): void => {
  if (typeof window.gtag !== 'function') return;
  const sanitizedPath = sanitizePath(path);
  window.gtag('set', {
    page_path: sanitizedPath,
    page_location: redactedUrl(sanitizedPath),
  });
};

const loadGtagScript = (): void => {
  if (scriptLoaded) return;
  scriptLoaded = true;

  window.dataLayer = window.dataLayer || [];
  // Must push the `arguments` object, exactly as Google's official snippet does.
  // gtag.js ignores commands pushed as real arrays (e.g. via rest parameters),
  // silently: the library still loads and dataLayer still fills up, but no hits
  // are ever sent.
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
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
  // route's personal data can be redacted before it's reported. The redacted
  // location is set here too so it applies from the very first hit.
  const sanitizedPath = currentSanitizedPath();
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false,
    page_path: sanitizedPath,
    page_location: redactedUrl(sanitizedPath),
    // Pin cookies to this exact host. The default ('auto') makes gtag.js probe
    // for the broadest domain it can write to, walking up from the top: on
    // 6135.github.io that means trying '.io' and '.github.io' first, both of
    // which the browser rejects because github.io is on the Public Suffix List.
    // The cookie still ends up set on the host, but every attempt logs
    // "Cookie ... has been rejected for invalid domain". 'none' writes a
    // host-only cookie directly, with no probing and no warnings.
    cookie_domain: 'none',
  });

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
  storeConsent('granted');
  const wasAlreadyLoaded = scriptLoaded;
  loadGtagScript();
  if (!wasAlreadyLoaded) {
    trackPageView(currentSanitizedPath());
  }
};

// Returns whether a reload is needed to fully stop analytics. Once gtag.js is
// running, setting consent to denied stops cookies but the library still sends
// cookieless pings (which carry the IP address). Only unloading it - i.e. a
// reload, after which initAnalyticsFromStoredConsent() won't load it again -
// actually stops all transmission, which is what the UI promises.
export const revokeConsent = (): { reloadRequired: boolean } => {
  storeConsent('denied');
  if (typeof window.gtag === 'function') {
    window.gtag('consent', 'update', { analytics_storage: 'denied' });
  }
  clearGaCookies();
  return { reloadRequired: scriptLoaded };
};

export const trackPageView = (path: string): void => {
  if (!hasConsent() || typeof window.gtag !== 'function') return;

  // Update the global redacted location first, so later events on this route
  // (including GA's automatic ones) inherit it rather than the raw URL.
  applyRedactedLocation(path);

  const sanitizedPath = sanitizePath(path);
  window.gtag('event', 'page_view', {
    page_path: sanitizedPath,
    page_location: redactedUrl(sanitizedPath),
    page_title: document.title,
    send_to: GA_MEASUREMENT_ID,
  });
};

// Usage-pattern events (which features people actually use) - never includes
// financial figures or other personal data, only the fact that an action happened.
export const trackEvent = (name: string, params?: Record<string, unknown>): void => {
  if (!hasConsent() || typeof window.gtag !== 'function') return;

  const sanitizedPath = currentSanitizedPath();
  window.gtag('event', name, {
    ...params,
    // Set explicitly as well as globally: without it gtag falls back to
    // document.location.href, leaking the /shared/ route's encoded config.
    page_path: sanitizedPath,
    page_location: redactedUrl(sanitizedPath),
    send_to: GA_MEASUREMENT_ID,
  });
};

// Google Analytics tracking utilities

const ANALYTICS_OPT_OUT_KEY = 'analytics_opt_out';
const ANALYTICS_CONSENT_KEY = 'analytics_consent_given';

declare global {
  interface Window {
    gtag?: (
      command: 'event' | 'config' | 'js',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
    'ga-disable-G-F1YQRB2MBH'?: boolean;
  }
}

// Check if user has given consent
export const hasAnalyticsConsent = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(ANALYTICS_CONSENT_KEY) === 'true';
};

// Check if user has opted out
export const isAnalyticsOptedOut = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(ANALYTICS_OPT_OUT_KEY) === 'true';
};

// Opt out of analytics
export const optOutAnalytics = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ANALYTICS_OPT_OUT_KEY, 'true');
    localStorage.removeItem(ANALYTICS_CONSENT_KEY);
    window['ga-disable-G-F1YQRB2MBH'] = true;
  }
};

// Opt in to analytics
export const optInAnalytics = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ANALYTICS_CONSENT_KEY, 'true');
    localStorage.removeItem(ANALYTICS_OPT_OUT_KEY);
    window['ga-disable-G-F1YQRB2MBH'] = false;
  }
};

export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  // Only track if user has explicitly consented and not opted out
  if (typeof window !== 'undefined' && window.gtag && hasAnalyticsConsent() && !isAnalyticsOptedOut()) {
    window.gtag('event', eventName, eventParams);
  }
};

// Specific event tracking functions
export const analytics = {
  // Button clicks
  exportConfig: () => trackEvent('export_config', { method: 'json' }),
  importConfig: (success: boolean) => trackEvent('import_config', { success }),
  printReport: () => trackEvent('print_report'),
  resetData: () => trackEvent('reset_data'),
  
  // Disclaimer
  acceptDisclaimer: () => trackEvent('accept_disclaimer'),
  
  // Configuration changes
  setBudget: (budgetRange: string) => trackEvent('set_budget', { budget_range: budgetRange }),
  setMonths: (months: number, customMonths: boolean) => 
    trackEvent('set_months', { months, custom_months: customMonths }),
  setHealthPlan: (plan: string) => trackEvent('set_health_plan', { plan_type: plan }),
  
  // Priority management
  addPriority: () => trackEvent('add_priority'),
  removePriority: () => trackEvent('remove_priority'),
  reorderPriority: () => trackEvent('reorder_priority'),
  autoBalance: () => trackEvent('auto_balance_priorities'),
  
  // Family coverage
  toggleSpouse: (included: boolean) => trackEvent('toggle_spouse', { included }),
  setDependents: (under25: number, over25: number) => 
    trackEvent('set_dependents', { under_25: under25, over_25: over25 }),
};

// Helper to get budget range
export const getBudgetRange = (budget: number): string => {
  if (budget < 5000) return '<5000';
  if (budget < 10000) return '5000-10000';
  if (budget < 15000) return '10000-15000';
  return '>15000';
};

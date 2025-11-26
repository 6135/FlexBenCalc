import { AppState, PricingTable } from '../types';

// Default values
export const defaults: AppState = {
  showDisclaimer: false, // Not persisted - always shown on load
  totalBudget: 575,
  numMonths: 12,
  customMonths: false,
  startInDecember: true,
  carAllowance: 0,
  bonus: 0,
  healthPlan: 'standard',
  employeeIncluded: true,
  spouseIncluded: false,
  dependentsUnder25: 0,
  dependents25Plus: 0,
  priorities: []
};

// Pricing table
export const pricingTable: PricingTable = {
  downgrade: { employee: 370.88, spouse: 370.88, under25: 333.80, over25: 370.88 },
  standard: { employee: 598.92, spouse: 598.92, under25: 441.28, over25: 598.61 },
  upgrade: { employee: 898.61, spouse: 898.61, under25: 662.10, over25: 898.61 }
};

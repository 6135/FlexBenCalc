// Shared types across the application

export type HealthPlanType = 'downgrade' | 'standard' | 'upgrade';

export interface Priority {
  id: number;
  name: string;
  yearlyAmount: number;
  isHealthInsurance?: boolean;
  note?: string;
}

export interface PricingTableRow {
  employee: number;
  spouse: number;
  under25: number;
  over25: number;
}

export interface PricingTable {
  downgrade: PricingTableRow;
  standard: PricingTableRow;
  upgrade: PricingTableRow;
}

export interface AppState {
  version?: number; // Version for backward compatibility
  showDisclaimer: boolean;
  totalBudget: number;
  numMonths: number;
  customMonths: boolean;
  startInDecember: boolean;
  carAllowance: number;
  healthPlan: HealthPlanType;
  employeeIncluded: boolean;
  spouseIncluded: boolean;
  dependentsUnder25: number;
  dependents25Plus: number;
  priorities: Priority[];
}

export interface HealthInsuranceCosts {
  employeeValue: number;
  spouseValue: number;
  dependentsUnder25Value: number;
  dependents25PlusValue: number;
  totalCost: number;
  companyContribution: number;
  employeeContribution: number;
}
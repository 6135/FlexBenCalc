// Shared types across the application

export type HealthPlanType = 'downgrade' | 'standard' | 'upgrade';

export interface Priority {
  id: number;
  name: string;
  yearlyAmount: number;
  isHealthInsurance?: boolean;
  note?: string;
  benefitId?: string; // Catalog benefit id; undefined or 'other' means free-text
}

export interface BenefitOption {
  id: string;
  name: string;
  appliesTo: string;
  irsExempt: boolean;
  provider: string;
  min?: number; // Yearly minimum (undefined = no minimum)
  max?: number; // Yearly cap (undefined = no cap)
  notes?: string; // Extra rules that can't be expressed as min/max
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
  bonus: number;
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
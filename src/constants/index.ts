import { AppState, BenefitOption, PricingTable } from '../types';

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

// Pricing table (2027 annual premiums)
export const pricingTable: PricingTable = {
  downgrade: { employee: 388.60, spouse: 388.60, under25: 349.75, over25: 388.60 },
  standard: { employee: 627.54, spouse: 627.54, under25: 462.37, over25: 627.54 },
  upgrade: { employee: 941.55, spouse: 941.55, under25: 693.74, over25: 941.55 }
};

export const OTHER_BENEFIT_ID = 'other';

// 2027 benefits catalog (health insurance is handled separately in the configurator).
// Set min/max to apply yearly limits; leave undefined for open-ended benefits.
export const benefitCatalog: BenefitOption[] = [
  { id: 'seguro-vida', name: 'Seguro de Vida', appliesTo: 'Colaborador', irsExempt: true, provider: 'Allianz' },
  { id: 'donativos', name: 'Donativos', appliesTo: 'Colaborador', irsExempt: true, provider: 'Programa Give2Help', min: 5 },
  { id: 'wallet-creche', name: 'Wallet Creche', appliesTo: 'Dependentes até aos 7 anos', irsExempt: true, provider: 'Edenred', min: 5, notes: 'Valid for 24 months' },
  { id: 'wallet-estudante', name: 'Wallet Estudante', appliesTo: 'Colaborador e dependentes (até aos 25 anos)', irsExempt: false, provider: 'Edenred' },
  { id: 'cartao-flexivel', name: 'Cartão Flexível', appliesTo: 'Colaborador e agregado familiar', irsExempt: false, provider: 'Edenred', min: 5, notes: 'Valid for 36 months' },
  { id: 'plano-pensoes-flex', name: 'Plano de Pensões Flex', appliesTo: 'Colaborador', irsExempt: true, provider: 'CGD Pensões', notes: 'Requires regular contributions to the company pension plan' },
  { id: 'ppr-save-grow', name: 'PPR Save & Grow', appliesTo: 'Colaborador', irsExempt: false, provider: 'Casa de Investimento', min: 250, notes: 'Initial subscription min 250 €; later top-ups from 100 €' },
  { id: 'seguro-vida-capitalizacao', name: 'Seguro Vida Capitalização', appliesTo: 'Colaborador', irsExempt: false, provider: 'Real Vida Seguros', min: 20 },
  { id: 'tecnologia-encomendas', name: 'Tecnologia - encomendas', appliesTo: 'Colaborador', irsExempt: true, provider: 'Plataforma Accenture', max: 5940, notes: 'Values without IVA; max 990 € per item, one item of each type' },
  { id: 'subsidio-alimentacao', name: 'Subsídio de Alimentação', appliesTo: 'Colaborador', irsExempt: true, provider: 'Edenred', notes: 'Daily max 6,00 € via salary or 7,63 € on meal card' },
  { id: 'tecnologia-reembolso', name: 'Tecnologia - reembolso', appliesTo: 'Colaborador', irsExempt: true, provider: 'Reembolso', notes: 'Max 990 € per item without IVA, one item of each type' },
  { id: 'mobilidade-urbana', name: 'Mobilidade Urbana', appliesTo: 'Colaborador', irsExempt: true, provider: 'Reembolso' },
  { id: 'formacao-profissional', name: 'Formação Profissional', appliesTo: 'Colaborador', irsExempt: true, provider: 'Reembolso' },
  { id: 'despesas-educacao', name: 'Despesas de Educação', appliesTo: 'Colaborador e agregado familiar', irsExempt: false, provider: 'Reembolso' },
  { id: 'despesas-saude', name: 'Despesas de Saúde', appliesTo: 'Colaborador e agregado familiar', irsExempt: false, provider: 'Reembolso' },
  { id: 'despesas-lares', name: 'Despesas de Lares e Apoio Social', appliesTo: 'Colaborador e agregado familiar', irsExempt: false, provider: 'Reembolso' }
];

export const getBenefit = (benefitId?: string): BenefitOption | undefined =>
  benefitCatalog.find(b => b.id === benefitId);

// Clamp a yearly amount to the benefit's cap. The minimum is not enforced while
// typing (it would block partial input) and is surfaced as a warning instead.
export const clampToBenefitMax = (amount: number, benefitId?: string): number => {
  const benefit = getBenefit(benefitId);
  if (benefit?.max !== undefined) return Math.min(amount, benefit.max);
  return amount;
};

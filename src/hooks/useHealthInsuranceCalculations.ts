import { useMemo } from 'react';
import { Priority, HealthPlanType, HealthInsuranceCosts } from '../types';
import { pricingTable } from '../constants';

export const useHealthInsuranceCalculations = (
  healthPlan: HealthPlanType,
  employeeIncluded: boolean,
  spouseIncluded: boolean,
  dependentsUnder25: number,
  dependents25Plus: number
) => {
  // Calculate health insurance priorities
  const healthInsurancePriorities = useMemo((): Priority[] => {
    const standardPrices = pricingTable.standard;
    const selectedPrices = pricingTable[healthPlan];
    const insurancePriorities: Priority[] = [];
    
    // Employee - only add if upgrade (cost above standard)
    // For downgrade, the credit is handled in effectiveBudget calculation
    if (employeeIncluded && healthPlan === 'upgrade') {
      const upgradeCost = selectedPrices.employee - standardPrices.employee;
      insurancePriorities.push({
        id: -1,
        name: `Health Insurance - Employee (${healthPlan} upgrade)`,
        yearlyAmount: upgradeCost,
        isHealthInsurance: true
      });
    }
    
    // Spouse cost - employee pays: full cost - company contribution
    // Company pays 50% of standard plan (or 50% of selected if downgrade)
    if (spouseIncluded) {
      const companyPays = healthPlan === 'downgrade' 
        ? selectedPrices.spouse * 0.5  // For downgrade, company pays 50% of downgrade cost
        : standardPrices.spouse * 0.5; // For standard/upgrade, company pays 50% of standard
      const spouseCost = selectedPrices.spouse - companyPays;
      insurancePriorities.push({
        id: -2,
        name: `Health Insurance - Spouse (${healthPlan})`,
        yearlyAmount: spouseCost,
        isHealthInsurance: true
      });
    }
    
    // Dependents under 25
    if (dependentsUnder25 > 0) {
      const companyPaysPerDependent = healthPlan === 'downgrade'
        ? selectedPrices.under25 * 0.5  // For downgrade, company pays 50% of downgrade cost
        : standardPrices.under25 * 0.5; // For standard/upgrade, company pays 50% of standard
      const dependentsCost = (dependentsUnder25 * selectedPrices.under25) - (dependentsUnder25 * companyPaysPerDependent);
      insurancePriorities.push({
        id: -3,
        name: `Health Insurance - ${dependentsUnder25} Dependent(s) <25 (${healthPlan})`,
        yearlyAmount: dependentsCost,
        isHealthInsurance: true
      });
    }
    
    // Dependents 25+
    if (dependents25Plus > 0) {
      const companyPaysPerDependent = healthPlan === 'downgrade'
        ? selectedPrices.over25 * 0.5  // For downgrade, company pays 50% of downgrade cost
        : standardPrices.over25 * 0.5; // For standard/upgrade, company pays 50% of standard
      const dependentsCost = (dependents25Plus * selectedPrices.over25) - (dependents25Plus * companyPaysPerDependent);
      insurancePriorities.push({
        id: -4,
        name: `Health Insurance - ${dependents25Plus} Dependent(s) ≥25 (${healthPlan})`,
        yearlyAmount: dependentsCost,
        isHealthInsurance: true
      });
    }
    
    return insurancePriorities;
  }, [healthPlan, employeeIncluded, spouseIncluded, dependentsUnder25, dependents25Plus]);

  // Calculate health insurance summary for display
  const healthInsuranceCosts = useMemo((): HealthInsuranceCosts => {
    const prices = pricingTable[healthPlan];
    const standardPrices = pricingTable.standard;
    
    const employeeValue = employeeIncluded ? prices.employee : 0;
    const spouseValue = spouseIncluded ? prices.spouse : 0;
    const dependentsUnder25Value = dependentsUnder25 * prices.under25;
    const dependents25PlusValue = dependents25Plus * prices.over25;
    
    const totalCost = employeeValue + spouseValue + dependentsUnder25Value + dependents25PlusValue;
    
    // Company contribution calculation:
    // - Employee: 100% of standard plan (always)
    // - Family members: 50% of standard plan for standard/upgrade, 50% of downgrade plan for downgrade
    const companyContribution = 
      (employeeIncluded ? standardPrices.employee : 0) +
      (spouseIncluded ? (healthPlan === 'downgrade' ? prices.spouse * 0.5 : standardPrices.spouse * 0.5) : 0) +
      (dependentsUnder25 * (healthPlan === 'downgrade' ? prices.under25 * 0.5 : standardPrices.under25 * 0.5)) +
      (dependents25Plus * (healthPlan === 'downgrade' ? prices.over25 * 0.5 : standardPrices.over25 * 0.5));
    
    const employeeContribution = totalCost - companyContribution;
    
    return {
      employeeValue,
      spouseValue,
      dependentsUnder25Value,
      dependents25PlusValue,
      totalCost,
      companyContribution,
      employeeContribution
    };
  }, [healthPlan, employeeIncluded, spouseIncluded, dependentsUnder25, dependents25Plus]);

  return {
    healthInsurancePriorities,
    healthInsuranceCosts
  };
};

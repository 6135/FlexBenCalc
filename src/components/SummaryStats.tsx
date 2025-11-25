import React from 'react';
import { HealthInsuranceCosts, Priority } from '../types';

interface SummaryStatsProps {
  totalBudget: number;
  effectiveBudget: number;
  healthInsuranceCosts: HealthInsuranceCosts;
  allPriorities: Priority[];
}

export const SummaryStats: React.FC<SummaryStatsProps> = ({
  totalBudget,
  effectiveBudget,
  healthInsuranceCosts,
  allPriorities
}) => {
  const totalNeeded = allPriorities.reduce((sum, p) => sum + p.yearlyAmount, 0);
  const difference = totalNeeded - effectiveBudget;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-md">
      <div className="p-2 sm:p-0">
        <div className="text-sm text-gray-600">Fixed Budget</div>
        <div className="text-lg font-semibold text-gray-900">{totalBudget.toFixed(2)} €</div>
      </div>
      <div className="p-2 sm:p-0">
        <div className="text-sm text-gray-600">Health Credit Back</div>
        <div className="text-lg font-semibold text-green-600">
          {healthInsuranceCosts.employeeContribution < 0 ? `+${Math.abs(healthInsuranceCosts.employeeContribution).toFixed(2)}` : '0.00'} €
        </div>
      </div>
      <div className="p-2 sm:p-0">
        <div className="text-sm text-gray-600">Effective Budget</div>
        <div className="text-lg font-semibold text-blue-600">{effectiveBudget.toFixed(2)} €</div>
      </div>
      <div className="p-2 sm:p-0">
        <div className="text-sm text-gray-600">Total Needed (All Priorities)</div>
        <div className="text-lg font-semibold text-gray-900">{totalNeeded.toFixed(2)} €</div>
      </div>
      <div className="p-2 sm:p-0">
        <div className="text-sm text-gray-600">
          {difference > 0 ? 'Underfunding' : 'Surplus'}
        </div>
        <div className={`text-lg font-semibold ${difference > 0 ? 'text-red-600' : 'text-green-600'}`}>
          {Math.abs(difference).toFixed(2)} €
        </div>
      </div>
    </div>
  );
};

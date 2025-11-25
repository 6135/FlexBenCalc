import React from 'react';
import { HealthPlanType, HealthInsuranceCosts } from '../types';
import { pricingTable } from '../constants';

const InfoIcon: React.FC<{ title: string }> = ({ title }) => (
  <span className="inline-flex items-center justify-center cursor-help" title={title}>
    <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
  </span>
);

interface HealthInsuranceConfigProps {
  healthPlan: HealthPlanType;
  employeeIncluded: boolean;
  spouseIncluded: boolean;
  dependentsUnder25: number;
  dependents25Plus: number;
  totalBudget: number;
  effectiveBudget: number;
  healthInsuranceCosts: HealthInsuranceCosts;
  onHealthPlanChange: (value: HealthPlanType) => void;
  onEmployeeIncludedChange: (value: boolean) => void;
  onSpouseIncludedChange: (value: boolean) => void;
  onDependentsUnder25Change: (value: number) => void;
  onDependents25PlusChange: (value: number) => void;
  onTotalBudgetChange: (value: number) => void;
}

export const HealthInsuranceConfig: React.FC<HealthInsuranceConfigProps> = ({
  healthPlan,
  employeeIncluded,
  spouseIncluded,
  dependentsUnder25,
  dependents25Plus,
  totalBudget,
  effectiveBudget,
  healthInsuranceCosts,
  onHealthPlanChange,
  onEmployeeIncludedChange,
  onSpouseIncludedChange,
  onDependentsUnder25Change,
  onDependents25PlusChange,
  onTotalBudgetChange
}) => {
  return (
    <div className="mt-6">
      <div className="flex flex-col lg:flex-row justify-between items-start gap-3 mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800">Health Insurance Configuration</h3>
        <div className="flex flex-col gap-2 w-full lg:w-auto">
          <div className="text-xs text-amber-700 bg-amber-50 px-3 py-1 rounded border border-amber-200">
            ⚠️ Note: Bonus credits, car allowance, and remaining credits from previous year not yet implemented
          </div>
          <div className="text-xs text-red-700 bg-red-50 px-3 py-1 rounded border border-red-200 font-semibold">
            ⚠️ WARNING: Spouse and children calculations may be incorrect - verify manually!
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Available Credits Section */}
        <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
          <h4 className="text-sm font-semibold text-cyan-700 mb-3 bg-cyan-50 px-2 py-1 rounded">AVAILABLE CREDITS</h4>
          
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <label className="text-sm text-gray-700 flex items-center gap-1">
                Fixed credits
                <InfoIcon title="Base annual budget allocation" />
              </label>
              <div className="relative w-full sm:w-32">
                <input
                  type="number"
                  step="0.01"
                  value={totalBudget === 0 ? '' : totalBudget}
                  onChange={(e) => onTotalBudgetChange(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1 pr-6 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">€</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <label className="text-sm text-gray-400 flex items-center gap-1">
                Variable credits (bonus)
                <InfoIcon title="Not yet implemented" />
              </label>
              <div className="relative w-full sm:w-32">
                <input
                  type="number"
                  step="0.01"
                  value={0}
                  disabled
                  className="w-full px-3 py-1 pr-6 border border-gray-300 rounded bg-gray-100 text-gray-400"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <label className="text-sm text-gray-400 flex items-center gap-1">
                Car allowance (current year)
                <InfoIcon title="Not yet implemented" />
              </label>
              <div className="relative w-full sm:w-32">
                <input
                  type="number"
                  step="0.01"
                  value={0}
                  disabled
                  className="w-full px-3 py-1 pr-6 border border-gray-300 rounded bg-gray-100 text-gray-400"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <label className="text-sm text-gray-400 flex items-center gap-1">
                Remaining credits (previous year)
                <InfoIcon title="Not yet implemented" />
              </label>
              <div className="relative w-full sm:w-32">
                <input
                  type="number"
                  step="0.01"
                  value={0}
                  disabled
                  className="w-full px-3 py-1 pr-6 border border-gray-300 rounded bg-gray-100 text-gray-400"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t-2 border-gray-300">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                <span className="text-base font-semibold text-gray-900 flex items-center gap-1">
                  Total Available Credits
                  <InfoIcon title="Sum of all available credits" />
                </span>
                <div className="w-full sm:w-40">
                  <div className="px-4 py-2 border-2 border-green-500 bg-green-50 rounded text-right font-bold text-green-700 text-lg">
                    {effectiveBudget.toFixed(2)} €
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-gray-50 px-3 py-2 rounded mb-3">
                <span className="text-sm text-gray-700">Monthly distributable value</span>
                <span className="text-right font-semibold text-gray-900">
                  {(effectiveBudget / 12).toFixed(2)} €
                </span>
              </div>
              
              {healthInsuranceCosts.employeeContribution < 0 && (
                <div className="p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800">
                  <strong>💰 Health Credit Back:</strong> You selected a plan cheaper than standard! {Math.abs(healthInsuranceCosts.employeeContribution).toFixed(2)} € has been added to your available budget.
                </div>
              )}
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
              <strong>Note:</strong> Health insurance costs are now included as priorities in the allocation table below. Any upgrade beyond standard plan or family member coverage will appear as a separate priority line.
            </div>
          </div>
        </div>

        {/* Health Insurance Plan Section */}
        <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
          <h4 className="text-sm font-semibold text-cyan-700 mb-3 bg-cyan-50 px-2 py-1 rounded">HEALTH INSURANCE</h4>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-700 block mb-1 flex items-center gap-1">
                  Plan
                  <InfoIcon title="Select insurance plan tier" />
                </label>
                <select 
                  value={healthPlan}
                  onChange={(e) => onHealthPlanChange(e.target.value as HealthPlanType)}
                  className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="downgrade">Downgrade</option>
                  <option value="standard">Standard</option>
                  <option value="upgrade">Upgrade</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-700 block mb-1 flex items-center gap-1">
                  Employee included?
                  <InfoIcon title="Include employee in health insurance" />
                </label>
                <select 
                  value={employeeIncluded ? 'yes' : 'no'}
                  onChange={(e) => onEmployeeIncludedChange(e.target.value === 'yes')}
                  className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-700 block mb-1 flex items-center gap-1">
                  Spouse included?
                  <InfoIcon title="Include spouse in health insurance" />
                </label>
                <select 
                  value={spouseIncluded ? 'yes' : 'no'}
                  onChange={(e) => onSpouseIncludedChange(e.target.value === 'yes')}
                  className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-700 block mb-1 flex items-center gap-1">
                  # Dependents (&lt;25)
                  <InfoIcon title="Number of dependents under 25 years old" />
                </label>
                <input
                  type="number"
                  min="0"
                  value={dependentsUnder25 === 0 ? '' : dependentsUnder25}
                  onChange={(e) => onDependentsUnder25Change(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm text-gray-700 block mb-1 flex items-center gap-1">
                # Dependents (&gt;=25)
                <InfoIcon title="Number of dependents 25 years or older" />
              </label>
              <input
                type="number"
                min="0"
                value={dependents25Plus === 0 ? '' : dependents25Plus}
                onChange={(e) => onDependents25PlusChange(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="pt-3 space-y-2 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Employee value</span>
                <span className="font-semibold">{healthInsuranceCosts.employeeValue.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Spouse value</span>
                <span className="font-semibold">{healthInsuranceCosts.spouseValue.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Dependents value (&lt;25)</span>
                <span className="font-semibold">{healthInsuranceCosts.dependentsUnder25Value.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Dependents value (&gt;=25)</span>
                <span className="font-semibold">{healthInsuranceCosts.dependents25PlusValue.toFixed(2)} €</span>
              </div>
            </div>

            <div className="pt-2 space-y-2 border-t-2 border-gray-300">
              <div className="flex justify-between font-semibold">
                <span className="text-sm text-gray-900 flex items-center gap-1">
                  Total Health Insurance Cost
                  <InfoIcon title="Sum of all selected insurance costs" />
                </span>
                <span className="text-gray-900">{healthInsuranceCosts.totalCost.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-sm bg-gray-100 px-2 py-1 rounded">
                <span className="text-gray-700 flex items-center gap-1">
                  Company contribution
                  <InfoIcon title="100% of standard employee plan + 50% of standard plan for family members" />
                </span>
                <span className="font-semibold">{healthInsuranceCosts.companyContribution.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-sm bg-red-50 px-2 py-1 rounded">
                <span className="text-gray-700 flex items-center gap-1">
                  Employee contribution (from credits)
                  <InfoIcon title="Remaining cost deducted from flexible credits (negative = credit added)" />
                </span>
                <span className={`font-semibold ${healthInsuranceCosts.employeeContribution >= 0 ? 'text-red-700' : 'text-green-700'}`}>
                  {healthInsuranceCosts.employeeContribution.toFixed(2)} €
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Table */}
      <div className="mt-4 border border-gray-200 rounded-lg p-3 sm:p-4 bg-gray-50">
        <h5 className="text-sm font-semibold text-gray-700 mb-3">Annual Pricing Reference</h5>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[400px]">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left py-2"></th>
                <th className="text-center py-2 font-semibold text-gray-700">Downgrade</th>
                <th className="text-center py-2 font-semibold text-gray-700">Standard</th>
                <th className="text-center py-2 font-semibold text-gray-700">Upgrade</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="py-2 text-gray-700">Employee</td>
                <td className="text-center py-2">{pricingTable.downgrade.employee} €</td>
                <td className="text-center py-2">{pricingTable.standard.employee} €</td>
                <td className="text-center py-2">{pricingTable.upgrade.employee} €</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 text-gray-700">Spouse</td>
                <td className="text-center py-2">{pricingTable.downgrade.spouse} €</td>
                <td className="text-center py-2">{pricingTable.standard.spouse} €</td>
                <td className="text-center py-2">{pricingTable.upgrade.spouse} €</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 text-gray-700">Dependent (&lt;25)</td>
                <td className="text-center py-2">{pricingTable.downgrade.under25} €</td>
                <td className="text-center py-2">{pricingTable.standard.under25} €</td>
                <td className="text-center py-2">{pricingTable.upgrade.under25} €</td>
              </tr>
              <tr>
                <td className="py-2 text-gray-700">Dependent (&gt;=25)</td>
                <td className="text-center py-2">{pricingTable.downgrade.over25} €</td>
                <td className="text-center py-2">{pricingTable.standard.over25} €</td>
                <td className="text-center py-2">{pricingTable.upgrade.over25} €</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

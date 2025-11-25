import React, { useState, useMemo, useEffect } from 'react';

// Types
type HealthPlanType = 'downgrade' | 'standard' | 'upgrade';

interface Priority {
  id: number;
  name: string;
  yearlyAmount: number;
  isHealthInsurance?: boolean;
}

interface PricingTableRow {
  employee: number;
  spouse: number;
  under25: number;
  over25: number;
}

interface PricingTable {
  downgrade: PricingTableRow;
  standard: PricingTableRow;
  upgrade: PricingTableRow;
}

interface AppState {
  showDisclaimer: boolean;
  totalBudget: number;
  numMonths: number;
  customMonths: boolean;
  carAllowance: number;
  healthPlan: HealthPlanType;
  employeeIncluded: boolean;
  spouseIncluded: boolean;
  dependentsUnder25: number;
  dependents25Plus: number;
  priorities: Priority[];
}

interface HealthInsuranceCosts {
  employeeValue: number;
  spouseValue: number;
  dependentsUnder25Value: number;
  dependents25PlusValue: number;
  totalCost: number;
  companyContribution: number;
  employeeContribution: number;
}

// Default values
const defaults: AppState = {
  showDisclaimer: true,
  totalBudget: 575,
  numMonths: 12,
  customMonths: false,
  carAllowance: 0,
  healthPlan: 'standard',
  employeeIncluded: true,
  spouseIncluded: false,
  dependentsUnder25: 0,
  dependents25Plus: 0,
  priorities: []
};

// Pricing table - moved outside component to avoid dependency issues
const pricingTable: PricingTable = {
  downgrade: { employee: 370.88, spouse: 370.88, under25: 333.80, over25: 370.88 },
  standard: { employee: 598.92, spouse: 598.92, under25: 441.28, over25: 598.61 },
  upgrade: { employee: 898.61, spouse: 898.61, under25: 662.10, over25: 898.61 }
};

const App: React.FC = () => {

  // Load from localStorage or use defaults
  const loadState = (): AppState => {
    try {
      const saved = localStorage.getItem('benefitsAllocatorState');
      return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    } catch (e) {
      console.error('Error loading state:', e);
      return defaults;
    }
  };

  const initialState = loadState();

  const [showDisclaimer, setShowDisclaimer] = useState<boolean>(initialState.showDisclaimer);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [totalBudget, setTotalBudget] = useState<number>(initialState.totalBudget);
  const [numMonths, setNumMonths] = useState<number>(initialState.numMonths);
  const [customMonths, setCustomMonths] = useState<boolean>(initialState.customMonths);
  const [carAllowance, setCarAllowance] = useState<number>(initialState.carAllowance);
  const [healthPlan, setHealthPlan] = useState<HealthPlanType>(initialState.healthPlan);
  const [employeeIncluded, setEmployeeIncluded] = useState<boolean>(initialState.employeeIncluded);
  const [spouseIncluded, setSpouseIncluded] = useState<boolean>(initialState.spouseIncluded);
  const [dependentsUnder25, setDependentsUnder25] = useState<number>(initialState.dependentsUnder25);
  const [dependents25Plus, setDependents25Plus] = useState<number>(initialState.dependents25Plus);
  const [priorities, setPriorities] = useState<Priority[]>(initialState.priorities);

  // Save to localStorage whenever state changes
  useEffect(() => {
    const stateToSave: AppState = {
      showDisclaimer,
      totalBudget,
      numMonths,
      customMonths,
      carAllowance,
      healthPlan,
      employeeIncluded,
      spouseIncluded,
      dependentsUnder25,
      dependents25Plus,
      priorities
    };
    try {
      localStorage.setItem('benefitsAllocatorState', JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Error saving state:', e);
    }
  }, [showDisclaimer, totalBudget, numMonths, customMonths, carAllowance, healthPlan, 
      employeeIncluded, spouseIncluded, dependentsUnder25, dependents25Plus, priorities]);

  // Reset function
  const resetToDefaults = (): void => {
    setTotalBudget(defaults.totalBudget);
    setNumMonths(defaults.numMonths);
    setCustomMonths(defaults.customMonths);
    setCarAllowance(defaults.carAllowance);
    setHealthPlan(defaults.healthPlan);
    setEmployeeIncluded(defaults.employeeIncluded);
    setSpouseIncluded(defaults.spouseIncluded);
    setDependentsUnder25(defaults.dependentsUnder25);
    setDependents25Plus(defaults.dependents25Plus);
    setPriorities(defaults.priorities);
    localStorage.removeItem('benefitsAllocatorState');
    setShowResetConfirm(false);
  };

  // Calculate health insurance costs and priorities
  const healthInsurancePriorities = useMemo((): Priority[] => {
    const standardPrices = pricingTable.standard;
    const selectedPrices = pricingTable[healthPlan];
    const insurancePriorities: Priority[] = [];
    
    // Employee upgrade cost (if upgraded beyond standard)
    if (employeeIncluded && healthPlan !== 'standard') {
      const upgradeCost = selectedPrices.employee - standardPrices.employee;
      if (upgradeCost > 0) {
        insurancePriorities.push({
          id: -1,
          name: `Health Insurance - Employee (${healthPlan} upgrade)`,
          yearlyAmount: upgradeCost,
          isHealthInsurance: true
        });
      }
    }
    
    // Spouse cost - employee pays: full cost - 50% of standard
    if (spouseIncluded) {
      const spouseCost = selectedPrices.spouse - (standardPrices.spouse * 0.5);
      insurancePriorities.push({
        id: -2,
        name: `Health Insurance - Spouse (${healthPlan})`,
        yearlyAmount: spouseCost,
        isHealthInsurance: true
      });
    }
    
    // Dependents under 25 - employee pays: full cost - 50% of standard per dependent
    if (dependentsUnder25 > 0) {
      const dependentsCost = (dependentsUnder25 * selectedPrices.under25) - (dependentsUnder25 * standardPrices.under25 * 0.5);
      insurancePriorities.push({
        id: -3,
        name: `Health Insurance - ${dependentsUnder25} Dependent(s) <25 (${healthPlan})`,
        yearlyAmount: dependentsCost,
        isHealthInsurance: true
      });
    }
    
    // Dependents 25+ - employee pays: full cost - 50% of standard per dependent
    if (dependents25Plus > 0) {
      const dependentsCost = (dependents25Plus * selectedPrices.over25) - (dependents25Plus * standardPrices.over25 * 0.5);
      insurancePriorities.push({
        id: -4,
        name: `Health Insurance - ${dependents25Plus} Dependent(s) ≥25 (${healthPlan})`,
        yearlyAmount: dependentsCost,
        isHealthInsurance: true
      });
    }
    
    return insurancePriorities;
  }, [healthPlan, employeeIncluded, spouseIncluded, dependentsUnder25, dependents25Plus]);

  // Combine health insurance priorities with user priorities
  const allPriorities = useMemo((): Priority[] => 
    [...healthInsurancePriorities, ...priorities],
    [healthInsurancePriorities, priorities]
  );

  // Calculate health insurance summary for display
  const healthInsuranceCosts = useMemo((): HealthInsuranceCosts => {
    const prices = pricingTable[healthPlan];
    const standardPrices = pricingTable.standard;
    
    const employeeValue = employeeIncluded ? prices.employee : 0;
    const spouseValue = spouseIncluded ? prices.spouse : 0;
    const dependentsUnder25Value = dependentsUnder25 * prices.under25;
    const dependents25PlusValue = dependents25Plus * prices.over25;
    
    const totalCost = employeeValue + spouseValue + dependentsUnder25Value + dependents25PlusValue;
    
    // Company pays: 100% of standard for employee + 50% of STANDARD (not selected plan) for family
    const companyContribution = 
      (employeeIncluded ? standardPrices.employee : 0) +
      (spouseIncluded ? standardPrices.spouse * 0.5 : 0) +
      (dependentsUnder25 * standardPrices.under25 * 0.5) +
      (dependents25Plus * standardPrices.over25 * 0.5);
    
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

  // Effective budget includes the negative employee contribution (when company owes credits back)
  const effectiveBudget: number = useMemo(() => {
    const creditBack = healthInsuranceCosts.employeeContribution < 0 ? Math.abs(healthInsuranceCosts.employeeContribution) : 0;
    return totalBudget + creditBack;
  }, [totalBudget, healthInsuranceCosts.employeeContribution]);

  const monthlyAllowance: number = effectiveBudget / numMonths;

  const monthNames: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const getMonthLabel = (monthIndex: number): string => {
    if (numMonths === 12) {
      return monthNames[monthIndex];
    }
    return `Month ${monthIndex + 1}`;
  };

  const calculateAllocation = useMemo(() => {
    const matrix: number[][] = [];
    const surplusPerMonth: number[] = [];
    
    for (let month = 0; month < numMonths; month++) {
      let remainingBudget = monthlyAllowance;
      const monthAllocations: number[] = [];
      
      for (let i = 0; i < allPriorities.length; i++) {
        const priority = allPriorities[i];
        const alreadyAllocated = matrix
          .slice(0, month)
          .reduce((sum, prevMonth) => sum + (prevMonth[i] || 0), 0);
        
        const stillNeeded = Math.max(0, priority.yearlyAmount - alreadyAllocated);
        const allocation = Math.min(remainingBudget, stillNeeded);
        
        monthAllocations.push(allocation);
        remainingBudget -= allocation;
      }
      
      matrix.push(monthAllocations);
      surplusPerMonth.push(remainingBudget);
    }
    
    return { matrix, surplusPerMonth };
  }, [monthlyAllowance, numMonths, allPriorities]);

  const addPriority = (): void => {
    const newId = Math.max(...priorities.map(p => p.id), 0) + 1;
    setPriorities([...priorities, { id: newId, name: `Priority ${newId}`, yearlyAmount: 0 }]);
  };

  const removePriority = (id: number): void => {
    setPriorities(priorities.filter(p => p.id !== id));
  };

  const updatePriority = (id: number, field: keyof Priority, value: string | number): void => {
    setPriorities(priorities.map(p => 
      p.id === id ? { ...p, [field]: field === 'yearlyAmount' ? parseFloat(value as string) || 0 : value } : p
    ));
  };

  const totalSurplus: number = calculateAllocation.surplusPerMonth.reduce((sum, val) => sum + val, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Disclaimer Modal */}
      {showDisclaimer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-4 sm:p-6 lg:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-red-700 mb-2">IMPORTANT DISCLAIMER</h2>
                <div className="text-gray-700 space-y-3">
                  <p className="font-semibold">
                    This calculator is provided for informational purposes only. By using this tool, you acknowledge and agree that:
                  </p>
                  <ul className="list-disc list-inside space-y-2 pl-4">
                    <li><strong>No Guarantee of Accuracy:</strong> All calculations performed by this tool are the user's sole responsibility.</li>
                    <li><strong>No Liability:</strong> The creator assumes NO responsibility for any errors, mistakes, or financial losses resulting from the use of this calculator.</li>
                    <li><strong>Verify All Results:</strong> You must independently verify all calculations before making any financial decisions.</li>
                    <li><strong>Use At Your Own Risk:</strong> This tool is provided "as-is" without any warranties of any kind.</li>
                  </ul>
                  <p className="font-semibold text-red-600 mt-4">
                    If you do not agree with these terms, do not use this calculator.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDisclaimer(false)}
                className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
              >
                I Understand and Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Reset All Data?</h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to reset all data to default values? This will clear all your priorities and configurations. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={resetToDefaults}
                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
              >
                Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Benefits Allocation Calculator</h1>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-semibold"
          >
            🔄 Reset All Data
          </button>
        </div>
        
        {/* Configuration Section */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Configuration</h2>
          
          <div className="space-y-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Budget
              </label>
              <input
                type="number"
                value={totalBudget}
                onChange={(e) => setTotalBudget(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">
                Monthly allowance: {monthlyAllowance.toFixed(2)} ({totalBudget} ÷ {numMonths})
              </p>
            </div>
            
            <div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={customMonths}
                  onChange={(e) => {
                    setCustomMonths(e.target.checked);
                    if (!e.target.checked) setNumMonths(12);
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Custom number of months</span>
              </label>
              
              {customMonths && (
                <div className="mt-3">
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={numMonths}
                    onChange={(e) => setNumMonths(Math.min(12, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Summary Stats */}
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
              <div className="text-lg font-semibold text-gray-900">{allPriorities.reduce((sum, p) => sum + p.yearlyAmount, 0).toFixed(2)} €</div>
            </div>
            <div className="p-2 sm:p-0">
              <div className="text-sm text-gray-600">
                {allPriorities.reduce((sum, p) => sum + p.yearlyAmount, 0) > effectiveBudget ? 'Underfunding' : 'Surplus'}
              </div>
              <div className={`text-lg font-semibold ${
                allPriorities.reduce((sum, p) => sum + p.yearlyAmount, 0) > effectiveBudget ? 'text-red-600' : 'text-green-600'
              }`}>
                {allPriorities.reduce((sum, p) => sum + p.yearlyAmount, 0) > effectiveBudget 
                  ? (allPriorities.reduce((sum, p) => sum + p.yearlyAmount, 0) - effectiveBudget).toFixed(2)
                  : (effectiveBudget - allPriorities.reduce((sum, p) => sum + p.yearlyAmount, 0)).toFixed(2)
                } €
              </div>
            </div>
          </div>

          {/* Extra Configuration Space */}
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
                      <span className="text-gray-400 cursor-help" title="Base annual budget allocation">ℹ</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={totalBudget}
                      onChange={(e) => setTotalBudget(parseFloat(e.target.value) || 0)}
                      className="w-full sm:w-32 px-3 py-1 text-right border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <label className="text-sm text-gray-400 flex items-center gap-1">
                      Variable credits (bonus)
                      <span className="text-gray-400 cursor-help" title="Not yet implemented">ℹ</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={0}
                      disabled
                      className="w-full sm:w-32 px-3 py-1 text-right border border-gray-300 rounded bg-gray-100 text-gray-400"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <label className="text-sm text-gray-400 flex items-center gap-1">
                      Car allowance (current year)
                      <span className="text-gray-400 cursor-help" title="Not yet implemented">ℹ</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={0}
                      disabled
                      className="w-full sm:w-32 px-3 py-1 text-right border border-gray-300 rounded bg-gray-100 text-gray-400"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <label className="text-sm text-gray-400 flex items-center gap-1">
                      Remaining credits (previous year)
                      <span className="text-gray-400 cursor-help" title="Not yet implemented">ℹ</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={0}
                      disabled
                      className="w-full sm:w-32 px-3 py-1 text-right border border-gray-300 rounded bg-gray-100 text-gray-400"
                    />
                  </div>
                  
                  <div className="pt-2 mt-2 border-t-2 border-gray-300">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 font-bold">
                      <label className="text-sm text-gray-900 flex items-center gap-1">
                        Total Available Credits
                        <span className="text-gray-400 cursor-help" title="Total credits for allocation to priorities (includes health insurance credit back)">ℹ</span>
                      </label>
                      <div className="w-full sm:w-32 px-3 py-1 text-right bg-green-50 border-2 border-green-400 rounded">
                        {effectiveBudget.toFixed(2)} €
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm bg-gray-50 px-2 py-1 rounded">
                    <label className="text-gray-700">Monthly distributable value</label>
                    <div className="font-semibold text-gray-900">{monthlyAllowance.toFixed(2)} €</div>
                  </div>
                  
                  {healthInsuranceCosts.employeeContribution < 0 && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800">
                      <strong>💰 Health Credit Back:</strong> You selected a plan cheaper than standard! {Math.abs(healthInsuranceCosts.employeeContribution).toFixed(2)} € has been added to your available budget.
                    </div>
                  )}
                  
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
                        <span className="text-gray-400 cursor-help" title="Select insurance plan tier">ℹ</span>
                      </label>
                      <select 
                        value={healthPlan}
                        onChange={(e) => setHealthPlan(e.target.value as HealthPlanType)}
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
                        <span className="text-gray-400 cursor-help" title="Include employee in health insurance">ℹ</span>
                      </label>
                      <select 
                        value={employeeIncluded ? 'yes' : 'no'}
                        onChange={(e) => setEmployeeIncluded(e.target.value === 'yes')}
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
                        <span className="text-gray-400 cursor-help" title="Include spouse in health insurance">ℹ</span>
                      </label>
                      <select 
                        value={spouseIncluded ? 'yes' : 'no'}
                        onChange={(e) => setSpouseIncluded(e.target.value === 'yes')}
                        className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-700 block mb-1 flex items-center gap-1">
                        # Dependents (&lt;25)
                        <span className="text-gray-400 cursor-help" title="Number of dependents under 25 years old">ℹ</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={dependentsUnder25}
                        onChange={(e) => setDependentsUnder25(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-700 block mb-1 flex items-center gap-1">
                      # Dependents (&gt;=25)
                      <span className="text-gray-400 cursor-help" title="Number of dependents 25 years or older">ℹ</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={dependents25Plus}
                      onChange={(e) => setDependents25Plus(parseInt(e.target.value) || 0)}
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
                        <span className="text-gray-400 cursor-help" title="Sum of all selected insurance costs">ℹ</span>
                      </span>
                      <span className="text-gray-900">{healthInsuranceCosts.totalCost.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-sm bg-gray-100 px-2 py-1 rounded">
                      <span className="text-gray-700 flex items-center gap-1">
                        Company contribution
                        <span className="text-gray-400 cursor-help" title="100% of standard employee plan + 50% of standard plan for family members">ℹ</span>
                      </span>
                      <span className="font-semibold">{healthInsuranceCosts.companyContribution.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-sm bg-red-50 px-2 py-1 rounded">
                      <span className="text-gray-700 flex items-center gap-1">
                        Employee contribution (from credits)
                        <span className="text-gray-400 cursor-help" title="Remaining cost deducted from flexible credits (negative = credit added)">ℹ</span>
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
                    <td className="text-center py-2">370.88 €</td>
                    <td className="text-center py-2">598.92 €</td>
                    <td className="text-center py-2">898.61 €</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 text-gray-700">Spouse</td>
                    <td className="text-center py-2">370.88 €</td>
                    <td className="text-center py-2">598.92 €</td>
                    <td className="text-center py-2">898.61 €</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 text-gray-700">Dependent (&lt;25)</td>
                    <td className="text-center py-2">333.80 €</td>
                    <td className="text-center py-2">441.28 €</td>
                    <td className="text-center py-2">662.10 €</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-700">Dependent (&gt;=25)</td>
                    <td className="text-center py-2">370.88 €</td>
                    <td className="text-center py-2">598.61 €</td>
                    <td className="text-center py-2">898.61 €</td>
                  </tr>
                </tbody>
              </table>
              </div>
            </div>
          </div>
        </div>

        {/* Priorities Configuration */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Priorities</h2>
            <button
              onClick={addPriority}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              + Add Priority
            </button>
          </div>
          
          <div className="space-y-3">
            {priorities.map((priority, index) => (
              <div key={priority.id} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-md">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold self-start sm:self-center">
                  {index + 1}
                </div>
                <input
                  type="text"
                  value={priority.name}
                  onChange={(e) => updatePriority(priority.id, 'name', e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Priority name"
                />
                <input
                  type="number"
                  value={priority.yearlyAmount}
                  onChange={(e) => updatePriority(priority.id, 'yearlyAmount', e.target.value)}
                  className="w-full sm:w-40 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Yearly amount"
                />
                <button
                  onClick={() => removePriority(priority.id)}
                  className="w-full sm:w-auto px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Allocation Matrix */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Monthly Allocation Matrix</h2>
          
          <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden">
            <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-blue-700">
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-white border border-blue-500">Priority</th>
                  {Array.from({ length: numMonths }, (_, i) => (
                    <th key={i} className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-white border border-blue-500">
                      {getMonthLabel(i)}
                    </th>
                  ))}
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-white border border-blue-500">Total</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-white border border-blue-500">Needed</th>
                </tr>
              </thead>
              <tbody>
                {allPriorities.map((priority, i) => {
                  const rowTotal = calculateAllocation.matrix.reduce((sum, month) => sum + month[i], 0);
                  const needed = priority.yearlyAmount;
                  const fundingRatio = needed > 0 ? rowTotal / needed : 1;
                  
                  return (
                    <tr key={priority.id} className={`hover:bg-gray-50 transition-colors ${priority.isHealthInsurance ? 'bg-cyan-50' : ''}`}>
                      <td className={`px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium border border-gray-200 ${priority.isHealthInsurance ? 'text-cyan-900 bg-cyan-100' : 'text-gray-900 bg-gray-50'}`}>
                        {priority.name}
                        {priority.isHealthInsurance && <span className="ml-2 text-xs text-cyan-600">🏥</span>}
                      </td>
                      {calculateAllocation.matrix.map((month, monthIndex) => {
                        const value = month[i];
                        const allocatedSoFar = calculateAllocation.matrix
                          .slice(0, monthIndex + 1)
                          .reduce((sum, m) => sum + m[i], 0);
                        const percentFunded = needed > 0 ? allocatedSoFar / needed : 1;
                        
                        let bgColor = '';
                        let textColor = 'text-gray-900';
                        
                        if (value === 0) {
                          bgColor = priority.isHealthInsurance ? 'bg-cyan-50' : '';
                          textColor = 'text-gray-300';
                        } else if (percentFunded >= 0.9999) {
                          bgColor = 'bg-green-100';
                          textColor = 'text-green-800 font-semibold';
                        } else if (percentFunded >= 0.01) {
                          bgColor = 'bg-yellow-50';
                          textColor = 'text-yellow-800';
                        } else if (needed > 0) {
                          bgColor = 'bg-red-50';
                          textColor = 'text-red-800';
                        }
                        
                        return (
                          <td key={monthIndex} className={`px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm border border-gray-200 ${bgColor} ${textColor}`}>
                            {value === 0 ? '—' : value.toFixed(2)}
                          </td>
                        );
                      })}
                      <td className={`px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-bold border border-gray-200 ${
                        fundingRatio >= 0.9999 ? 'bg-green-100 text-green-800' : 
                        fundingRatio > 0 ? 'bg-red-100 text-red-800' : 
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {rowTotal === 0 ? '—' : rowTotal.toFixed(2)}
                      </td>
                      <td className={`px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-medium border border-gray-200 ${priority.isHealthInsurance ? 'bg-cyan-50 text-cyan-900' : 'text-gray-700 bg-gray-50'}`}>
                        {needed === 0 ? '—' : needed.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-gradient-to-r from-amber-50 to-amber-100 font-semibold">
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 border border-gray-200">Surplus</td>
                  {calculateAllocation.surplusPerMonth.map((surplus, i) => (
                    <td key={i} className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm text-amber-800 border border-gray-200">
                      {surplus === 0 ? '—' : surplus.toFixed(2)}
                    </td>
                  ))}
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm text-amber-900 border border-gray-200 font-bold">
                    {totalSurplus === 0 ? '—' : totalSurplus.toFixed(2)}
                  </td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm border border-gray-200">—</td>
                </tr>
              </tbody>
            </table>
          </div>
          </div>
          </div>
          
          <div className="mt-4 flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm px-4 sm:px-0">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
              <span className="text-gray-600">Fully funded</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-50 border border-yellow-200 rounded"></div>
              <span className="text-gray-600">Partially funded</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
              <span className="text-gray-600">Underfunded</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto mt-6 sm:mt-8 pb-4 sm:pb-6">
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 text-center">
          <p className="text-sm text-gray-600">
            Created with the invaluable help of <strong className="text-gray-800">Ana Pereira</strong> and <strong className="text-gray-800">Florbela Tavares</strong>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
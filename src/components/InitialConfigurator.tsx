import React from 'react';

interface BudgetConfigurationProps {
  totalBudget: number;
  numMonths: number;
  customMonths: boolean;
  startInDecember: boolean;
  carAllowance: number;
  bonus: number;
  monthlyAllowance: number;
  onTotalBudgetChange: (value: number) => void;
  onCustomMonthsChange: (value: boolean) => void;
  onNumMonthsChange: (value: number) => void;
  onStartInDecemberChange: (value: boolean) => void;
  onCarAllowanceChange: (value: number) => void;
  onBonusChange: (value: number) => void;
}

export const BudgetConfiguration: React.FC<BudgetConfigurationProps> = ({
  totalBudget,
  numMonths,
  customMonths,
  startInDecember,
  carAllowance,
  bonus,
  monthlyAllowance,
  onTotalBudgetChange,
  onCustomMonthsChange,
  onNumMonthsChange,
  onStartInDecemberChange,
  onCarAllowanceChange,
  onBonusChange
}) => {
  return (
    <div className="space-y-6 mb-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Total Budget
        </label>
        <div className="relative">
          <input
            type="number"
            value={totalBudget === 0 ? '' : totalBudget}
            onChange={(e) => onTotalBudgetChange(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2 pr-8 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
        </div>
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
              onCustomMonthsChange(e.target.checked);
              if (!e.target.checked) onNumMonthsChange(12);
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
              onChange={(e) => onNumMonthsChange(Math.min(12, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}
      </div>

      <div>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={startInDecember}
            onChange={(e) => {
              onStartInDecemberChange(e.target.checked);
              if (e.target.checked) {
                onNumMonthsChange(12);
                onCustomMonthsChange(false);
              }
            }}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">Start in December (Dec - Nov next year)</span>
        </label>
      </div>
    </div>
  );
};

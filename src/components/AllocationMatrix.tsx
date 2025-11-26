import React from 'react';
import { Priority } from '../types';

interface AllocationMatrixProps {
  allPriorities: Priority[];
  numMonths: number;
  bonus: number;
  getMonthLabel: (index: number) => string;
  calculateAllocation: {
    matrix: number[][];
    surplusPerMonth: number[];
  };
  totalSurplus: number;
  onAutoBalanceLast?: () => void;
}

export const AllocationMatrix: React.FC<AllocationMatrixProps> = ({
  allPriorities,
  numMonths,
  bonus,
  getMonthLabel,
  calculateAllocation,
  totalSurplus,
  onAutoBalanceLast
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 page-break-before">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Monthly Allocation Matrix</h2>
        {onAutoBalanceLast && (
          <button
            onClick={onAutoBalanceLast}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors duration-200 flex items-center gap-2 print:hidden"
            title={totalSurplus > 0 
              ? "Automatically adjust the last priority with value > 0 to use the remaining surplus" 
              : totalSurplus < 0
              ? "Automatically reduce priorities from bottom to top to fit within the available budget"
              : "Budget is already balanced"}
          >
            <span>⚖️</span>
            <span>Auto-Balance</span>
          </button>
        )}
      </div>
      
      {bonus > 0 && (
        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>💰 Bonus:</strong> {bonus.toFixed(2)} € available in {getMonthLabel(0)} (first month) on top of regular monthly allowance
          </p>
        </div>
      )}
      
      <div className="overflow-x-auto -mx-4 sm:mx-0 allocation-matrix-container">
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
                        <div className="flex items-center gap-2">
                          <span className="relative group cursor-help" title={priority.note || ''}>
                            {i + 1}.
                            {priority.note && (
                              <span className="hidden group-hover:block absolute left-0 top-full mt-1 z-10 w-max max-w-xs bg-gray-800 text-white text-xs rounded px-2 py-1 shadow-lg">
                                {priority.note}
                              </span>
                            )}
                          </span>
                          <span>{priority.name}</span>
                          {priority.isHealthInsurance && <span className="ml-1 text-xs text-cyan-600">🏥</span>}
                        </div>
                        {priority.note && (
                          <div className="hidden print:block text-xs text-gray-600 italic mt-1 ml-5">
                            Note: {priority.note}
                          </div>
                        )}
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
  );
};

import { useMemo } from 'react';
import { Priority } from '../types';

export const useAllocationCalculations = (
  monthlyAllowance: number,
  numMonths: number,
  allPriorities: Priority[]
) => {
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

  const totalSurplus = calculateAllocation.surplusPerMonth.reduce((sum, val) => sum + val, 0);

  return {
    calculateAllocation,
    totalSurplus
  };
};

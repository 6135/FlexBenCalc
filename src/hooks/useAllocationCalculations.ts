import { useMemo } from 'react';
import { Priority } from '../types';
import { calculateAllocation as allocate } from '../utils/allocation';

export const useAllocationCalculations = (
  effectiveBudget: number,
  numMonths: number,
  allPriorities: Priority[],
  bonus: number = 0
) => {
  const calculateAllocation = useMemo(
    () => allocate({ effectiveBudget, numMonths, priorities: allPriorities, bonus }),
    [effectiveBudget, numMonths, allPriorities, bonus]
  );

  const totalSurplus = calculateAllocation.surplusPerMonth.reduce((sum, val) => sum + val, 0);

  return {
    calculateAllocation,
    totalSurplus
  };
};

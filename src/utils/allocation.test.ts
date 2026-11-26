import { calculateAllocation } from './allocation';
import { Priority } from '../types';

const benefit = (id: number, yearlyAmount: number, isHealthInsurance = false): Priority => ({
  id,
  name: `B${id}`,
  yearlyAmount,
  isHealthInsurance
});

const rowTotal = (matrix: number[][], i: number): number =>
  Math.round(matrix.reduce((sum, month) => sum + month[i] * 100, 0)) / 100;

const sumCents = (values: number[]): number => Math.round(values.reduce((sum, v) => sum + v * 100, 0));

describe('calculateAllocation', () => {
  it('splits equally, not in proportion to the yearly value', () => {
    const { matrix, surplusPerMonth } = calculateAllocation({
      effectiveBudget: 575,
      numMonths: 12,
      priorities: [benefit(1, 325), benefit(2, 250)]
    });

    expect(matrix[0]).toEqual([23.96, 23.96]);
    expect(matrix[10]).toEqual([37.49, 10.42]);
    expect(matrix[11]).toEqual([47.91, 0]);
    expect([rowTotal(matrix, 0), rowTotal(matrix, 1)]).toEqual([325, 250]);
    expect(sumCents(surplusPerMonth)).toBe(0);
  });

  it('gives the share of a completed benefit to the others', () => {
    const { matrix } = calculateAllocation({
      effectiveBudget: 240,
      numMonths: 12,
      priorities: [benefit(1, 300), benefit(2, 300), benefit(3, 12)]
    });

    // Pool 20,00: 6,67 / 6,67 / 6,66. Benefit 3 needs 5,34 in month 2; the rest goes to 1 and 2.
    expect(matrix[0]).toEqual([6.67, 6.67, 6.66]);
    expect(matrix[1]).toEqual([7.33, 7.33, 5.34]);
    expect(matrix[2]).toEqual([10, 10, 0]);
    expect(rowTotal(matrix, 2)).toBe(12);
  });

  it('gives cents that do not split equally to the highest priority', () => {
    const { matrix } = calculateAllocation({
      effectiveBudget: 10,
      numMonths: 1,
      priorities: [benefit(1, 100), benefit(2, 100), benefit(3, 100)]
    });

    expect(matrix[0]).toEqual([3.34, 3.33, 3.33]);
  });

  it('lets the remaining benefits take the full allowance after one is complete', () => {
    const { matrix, surplusPerMonth } = calculateAllocation({
      effectiveBudget: 240,
      numMonths: 12,
      priorities: [benefit(1, 10), benefit(2, 200)]
    });

    expect(rowTotal(matrix, 0)).toBe(10);
    expect(rowTotal(matrix, 1)).toBe(200);
    expect(matrix[11]).toEqual([0, 0]);
    expect(sumCents(surplusPerMonth)).toBe(3000);
  });

  it('uses the bonus in the first month with the same rules', () => {
    const { matrix, surplusPerMonth } = calculateAllocation({
      effectiveBudget: 120,
      numMonths: 12,
      priorities: [benefit(1, 60), benefit(2, 60)],
      bonus: 30
    });

    expect(matrix[0]).toEqual([20, 20]);
    expect(rowTotal(matrix, 0)).toBe(60);
    expect(rowTotal(matrix, 1)).toBe(60);
    expect(sumCents(surplusPerMonth)).toBe(3000);
  });

  it('funds health insurance first, then splits the rest', () => {
    const { matrix } = calculateAllocation({
      effectiveBudget: 240,
      numMonths: 12,
      priorities: [benefit(-1, 30, true), benefit(1, 120), benefit(2, 120)]
    });

    expect(matrix[0]).toEqual([20, 0, 0]);
    expect(matrix[1]).toEqual([10, 5, 5]);
    expect(rowTotal(matrix, 0)).toBe(30);
  });

  it('keeps every month total plus surplus equal to the monthly pool', () => {
    const budget = 575;
    const { matrix, surplusPerMonth } = calculateAllocation({
      effectiveBudget: budget,
      numMonths: 12,
      priorities: [benefit(-1, 37.11, true), benefit(1, 250), benefit(2, 33.33), benefit(3, 400)],
      bonus: 12.34
    });

    const allocated = matrix.reduce((sum, month) => sum + sumCents(month), 0);
    expect(allocated + sumCents(surplusPerMonth)).toBe(57500 + 1234);
  });

  it('returns an empty result for zero months', () => {
    expect(calculateAllocation({ effectiveBudget: 100, numMonths: 0, priorities: [benefit(1, 10)] }))
      .toEqual({ matrix: [], surplusPerMonth: [] });
  });
});

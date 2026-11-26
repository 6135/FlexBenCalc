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
  it('matches the 47,92 example: caps per month, extra cents to highest priority', () => {
    const { matrix, surplusPerMonth } = calculateAllocation({
      effectiveBudget: 575,
      numMonths: 12,
      priorities: [benefit(1, 200), benefit(2, 200), benefit(3, 175)]
    });

    expect(matrix[0]).toEqual([16.67, 16.67, 14.58]);
    expect([rowTotal(matrix, 0), rowTotal(matrix, 1), rowTotal(matrix, 2)]).toEqual([200, 200, 175]);
    expect(sumCents(surplusPerMonth)).toBe(0);
  });

  it('fully funds higher priorities and cuts the lowest when the budget is short', () => {
    const { matrix, surplusPerMonth } = calculateAllocation({
      effectiveBudget: 575,
      numMonths: 12,
      priorities: [benefit(1, 100), benefit(2, 300), benefit(3, 250)]
    });

    // 650 needed, 575 available: benefit 3 is cut to 175.
    expect(matrix[1]).toEqual([8.34, 25, 14.58]);
    expect([rowTotal(matrix, 0), rowTotal(matrix, 1), rowTotal(matrix, 2)]).toEqual([100, 300, 175]);
    expect(sumCents(surplusPerMonth)).toBe(0);
  });

  it('gives nothing to a priority when the higher ones use all the budget', () => {
    const { matrix } = calculateAllocation({
      effectiveBudget: 240,
      numMonths: 12,
      priorities: [benefit(1, 200), benefit(2, 60), benefit(3, 12)]
    });

    expect([rowTotal(matrix, 0), rowTotal(matrix, 1), rowTotal(matrix, 2)]).toEqual([200, 40, 0]);
  });

  it('subtracts health insurance before it cuts the benefits', () => {
    const { matrix } = calculateAllocation({
      effectiveBudget: 240,
      numMonths: 12,
      priorities: [benefit(-1, 40, true), benefit(1, 150), benefit(2, 150)],
      bonus: 10
    });

    expect([rowTotal(matrix, 0), rowTotal(matrix, 1), rowTotal(matrix, 2)]).toEqual([40, 150, 60]);
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

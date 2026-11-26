import { Priority } from '../types';

export interface AllocationResult {
  matrix: number[][];
  surplusPerMonth: number[];
}

interface AllocationInput {
  effectiveBudget: number;
  numMonths: number;
  priorities: Priority[];
  bonus?: number;
}

const toCents = (euros: number): number => Math.round(euros * 100);
const toEuros = (cents: number): number => cents / 100;

// Splits `pool` cents equally between the indexes in `order` (highest priority first).
// Each index gets no more than its `room`. When a share is full, the rest goes to the others.
// Cents that cannot split equally go to the highest priorities.
// Returns the cents that no index could take.
const waterFill = (pool: number, order: number[], room: number[], allocation: number[]): number => {
  let remaining = pool;
  let open = order.filter(i => room[i] > 0);

  while (remaining > 0 && open.length > 0) {
    const share = Math.floor(remaining / open.length);

    if (share === 0) {
      open.slice(0, remaining).forEach(i => {
        allocation[i] += 1;
        room[i] -= 1;
      });
      return 0;
    }

    for (const i of open) {
      const given = Math.min(share, room[i]);
      allocation[i] += given;
      room[i] -= given;
      remaining -= given;
    }
    open = open.filter(i => room[i] > 0);
  }

  return remaining;
};

// Spreads `total` cents across `parts` months. Extra cents go to the first months.
const spreadCents = (total: number, parts: number, index: number): number =>
  Math.floor(total / parts) + (index < total % parts ? 1 : 0);

// Monthly allocation rules:
// 1. Health insurance rows get funded first, top-down, as much as they still need.
// 2. The rest of the month splits equally between the other open benefits. Each benefit gets
//    no more than its monthly cap (yearly value / number of months).
// 3. Money left after step 2 splits equally between the benefits that still need value,
//    without the monthly cap. A benefit stops when its yearly value is met.
// 4. Cents that do not split equally go to the highest priority (top of the list).
// 5. The bonus adds to the first month and follows the same rules.
export const calculateAllocation = ({
  effectiveBudget,
  numMonths,
  priorities,
  bonus = 0
}: AllocationInput): AllocationResult => {
  const matrix: number[][] = [];
  const surplusPerMonth: number[] = [];
  if (numMonths <= 0) return { matrix, surplusPerMonth };

  const budgetCents = Math.max(0, toCents(effectiveBudget));
  const bonusCents = Math.max(0, toCents(bonus));
  const neededCents = priorities.map(p => Math.max(0, toCents(p.yearlyAmount)));
  const allocatedCents = priorities.map(() => 0);

  const healthOrder = priorities.map((_, i) => i).filter(i => priorities[i].isHealthInsurance);
  const benefitOrder = priorities.map((_, i) => i).filter(i => !priorities[i].isHealthInsurance);

  // Monthly cap per benefit. Cumulative rounding makes the caps add up to the yearly value.
  const monthlyCap = (i: number, month: number): number =>
    Math.floor((neededCents[i] * (month + 1)) / numMonths) - Math.floor((neededCents[i] * month) / numMonths);

  for (let month = 0; month < numMonths; month++) {
    let pool = spreadCents(budgetCents, numMonths, month) + (month === 0 ? bonusCents : 0);
    const monthCents = priorities.map(() => 0);
    const stillNeeded = neededCents.map((needed, i) => needed - allocatedCents[i]);

    healthOrder.forEach(i => {
      const given = Math.min(pool, stillNeeded[i]);
      monthCents[i] += given;
      stillNeeded[i] -= given;
      pool -= given;
    });

    const cappedRoom = priorities.map((_, i) => Math.min(monthlyCap(i, month), stillNeeded[i]));
    pool = waterFill(pool, benefitOrder, cappedRoom, monthCents);

    const uncappedRoom = priorities.map((_, i) => neededCents[i] - allocatedCents[i] - monthCents[i]);
    pool = waterFill(pool, benefitOrder, uncappedRoom, monthCents);

    monthCents.forEach((cents, i) => {
      allocatedCents[i] += cents;
    });
    matrix.push(monthCents.map(toEuros));
    surplusPerMonth.push(toEuros(pool));
  }

  return { matrix, surplusPerMonth };
};

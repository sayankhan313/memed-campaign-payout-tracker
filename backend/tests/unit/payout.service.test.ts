
import {
  calculateHighestMilestonePayout,
  calculateAdditionalPayout,
  hasEnoughBudget,
} from '../../src/modules/payout/payout.service.js';

const milestones = [
  { views: 10000, payout: 500 },
  { views: 50000, payout: 2000 },
  { views: 100000, payout: 5000 },
];

describe('Milestone Payout Calculation', () => {
  test('returns zero before the first milestone', () => {
    expect(calculateHighestMilestonePayout(milestones, 9999)).toBe(0);
  });

  test('returns first payout at 10000 views', () => {
    expect(calculateHighestMilestonePayout(milestones, 10000)).toBe(500);
  });

  test('retains first payout between milestones', () => {
    expect(calculateHighestMilestonePayout(milestones, 30000)).toBe(500);
  });

  test('returns second payout at 50000 views', () => {
    expect(calculateHighestMilestonePayout(milestones, 50000)).toBe(2000);
  });

  test('returns highest payout above all milestones', () => {
    expect(calculateHighestMilestonePayout(milestones, 150000)).toBe(5000);
  });

  test('returns zero for empty milestones', () => {
    expect(calculateHighestMilestonePayout([], 150000)).toBe(0);
  });
});

describe('Incremental Payout Calculation', () => {
  test('calculates first payout', () => {
    expect(calculateAdditionalPayout(500, 0)).toBe(500);
  });

  test('calculates only the difference between milestones', () => {
    expect(calculateAdditionalPayout(2000, 500)).toBe(1500);
  });

  test('returns zero when payout already completed', () => {
    expect(calculateAdditionalPayout(2000, 2000)).toBe(0);
  });

  test('never calculates a negative payout', () => {
    expect(calculateAdditionalPayout(500, 2000)).toBe(0);
  });
});

describe('Campaign Budget Protection', () => {
  test('allows payout within available budget', () => {
    expect(hasEnoughBudget(10000, 2000, 3000)).toBe(true);
  });

  test('allows payout equal to remaining budget', () => {
    expect(hasEnoughBudget(10000, 7000, 3000)).toBe(true);
  });

  test('rejects payout exceeding remaining budget', () => {
    expect(hasEnoughBudget(10000, 8000, 3000)).toBe(false);
  });

  test('rejects payout when budget is exhausted', () => {
    expect(hasEnoughBudget(10000, 10000, 500)).toBe(false);
  });

  test('allows zero payout when budget is exhausted', () => {
    expect(hasEnoughBudget(10000, 10000, 0)).toBe(true);
  });

  test('rejects negative budget spending', () => {
    expect(hasEnoughBudget(10000, -100, 500)).toBe(false);
  });

  test('rejects campaigns already exceeding their budget', () => {
    expect(hasEnoughBudget(10000, 11000, 500)).toBe(false);
  });
});

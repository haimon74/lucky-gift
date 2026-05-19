import { describe, it, expect } from 'vitest';
import { mulberry32, pickUniqueNumbers, generateLotteryNumbers } from '../mulberry32.js';
import { LOTTERY_GAMES } from '../lottery-games.js';

describe('mulberry32', () => {
  it('produces same sequence from same seed', () => {
    const rng1 = mulberry32(42);
    const rng2 = mulberry32(42);
    for (let i = 0; i < 10; i++) {
      expect(rng1()).toBe(rng2());
    }
  });

  it('produces values in [0, 1)', () => {
    const rng = mulberry32(12345);
    for (let i = 0; i < 100; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('different seeds produce different sequences', () => {
    const rng1 = mulberry32(1);
    const rng2 = mulberry32(2);
    expect(rng1()).not.toBe(rng2());
  });
});

describe('pickUniqueNumbers', () => {
  it('returns the correct count', () => {
    const rng = mulberry32(99);
    expect(pickUniqueNumbers(rng, 5, 1, 69)).toHaveLength(5);
  });

  it('returns values within [min, max]', () => {
    const rng = mulberry32(7);
    const nums = pickUniqueNumbers(rng, 10, 1, 20);
    for (const n of nums) {
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(20);
    }
  });

  it('returns no duplicates', () => {
    const rng = mulberry32(3);
    const nums = pickUniqueNumbers(rng, 15, 1, 20);
    expect(new Set(nums).size).toBe(15);
  });

  it('returns sorted ascending', () => {
    const rng = mulberry32(55);
    const nums = pickUniqueNumbers(rng, 5, 1, 69);
    for (let i = 1; i < nums.length; i++) {
      expect(nums[i]!).toBeGreaterThan(nums[i - 1]!);
    }
  });
});

describe('generateLotteryNumbers', () => {
  const pwr = LOTTERY_GAMES.find((g) => g.gameId === 'PWR')!;
  const mml = LOTTERY_GAMES.find((g) => g.gameId === 'MML')!;
  const mfl = LOTTERY_GAMES.find((g) => g.gameId === 'MFL')!;

  it('generates 5 main + 1 bonus for Powerball', () => {
    const { main, bonus } = generateLotteryNumbers('a1b2c3d4e5f6g7h8', pwr);
    expect(main).toHaveLength(5);
    expect(bonus).toHaveLength(1);
  });

  it('Powerball main numbers in [1, 69]', () => {
    const { main } = generateLotteryNumbers('deadbeef12345678', pwr);
    for (const n of main) {
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(69);
    }
  });

  it('Powerball bonus in [1, 26]', () => {
    const { bonus } = generateLotteryNumbers('cafebabe12345678', pwr);
    expect(bonus[0]).toBeGreaterThanOrEqual(1);
    expect(bonus[0]).toBeLessThanOrEqual(26);
  });

  it('Mega Millions bonus in [1, 24]', () => {
    const { bonus } = generateLotteryNumbers('abcdef0123456789', mml);
    expect(bonus[0]).toBeGreaterThanOrEqual(1);
    expect(bonus[0]).toBeLessThanOrEqual(24);
  });

  it('Millionaire for Life bonus in [1, 5]', () => {
    const { bonus } = generateLotteryNumbers('1234567890abcdef', mfl);
    expect(bonus[0]).toBeGreaterThanOrEqual(1);
    expect(bonus[0]).toBeLessThanOrEqual(5);
  });

  it('same seedHash always produces same numbers', () => {
    const result1 = generateLotteryNumbers('a1b2c3d4e5f6g7h8', pwr);
    const result2 = generateLotteryNumbers('a1b2c3d4e5f6g7h8', pwr);
    expect(result1.main).toEqual(result2.main);
    expect(result1.bonus).toEqual(result2.bonus);
  });
});

import { describe, it, expect } from 'vitest';
import { LOTTERY_GAMES, getLotteryGame } from '../lottery-games.js';

describe('LOTTERY_GAMES', () => {
  it('contains exactly 3 games', () => {
    expect(LOTTERY_GAMES).toHaveLength(3);
  });

  it('contains Powerball', () => {
    expect(LOTTERY_GAMES.some((g) => g.gameId === 'PWR')).toBe(true);
  });

  it('contains Mega Millions', () => {
    expect(LOTTERY_GAMES.some((g) => g.gameId === 'MML')).toBe(true);
  });

  it('contains Millionaire for Life', () => {
    expect(LOTTERY_GAMES.some((g) => g.gameId === 'MFL')).toBe(true);
  });
});

describe('getLotteryGame', () => {
  it('returns Powerball for PWR', () => {
    const game = getLotteryGame('PWR');
    expect(game).toBeDefined();
    expect(game!.name).toBe('Powerball');
    expect(game!.mainCount).toBe(5);
    expect(game!.mainMax).toBe(69);
    expect(game!.bonusMax).toBe(26);
  });

  it('returns Mega Millions for MML', () => {
    const game = getLotteryGame('MML');
    expect(game).toBeDefined();
    expect(game!.mainMax).toBe(70);
    expect(game!.bonusMax).toBe(24);
  });

  it('returns Millionaire for Life for MFL', () => {
    const game = getLotteryGame('MFL');
    expect(game).toBeDefined();
    expect(game!.mainMax).toBe(58);
    expect(game!.bonusMax).toBe(5);
  });

  it('returns undefined for unknown gameId', () => {
    expect(getLotteryGame('INVALID')).toBeUndefined();
    expect(getLotteryGame('')).toBeUndefined();
  });
});

import type { LotteryGame } from './types';

export const LOTTERY_GAMES: LotteryGame[] = [
  {
    gameId: 'PWR',
    name: 'Powerball',
    mainCount: 5,
    mainMin: 1,
    mainMax: 69,
    bonusCount: 1,
    bonusMin: 1,
    bonusMax: 26,
    bonusName: 'Powerball',
  },
  {
    gameId: 'MML',
    name: 'Mega Millions',
    mainCount: 5,
    mainMin: 1,
    mainMax: 70,
    bonusCount: 1,
    bonusMin: 1,
    bonusMax: 24,
    bonusName: 'Mega Ball',
  },
  {
    gameId: 'MFL',
    name: 'Millionaire for Life',
    mainCount: 5,
    mainMin: 1,
    mainMax: 58,
    bonusCount: 1,
    bonusMin: 1,
    bonusMax: 5,
    bonusName: 'Millionaire Ball',
  },
];

export function getLotteryGame(gameId: string): LotteryGame | undefined {
  return LOTTERY_GAMES.find((g) => g.gameId === gameId);
}

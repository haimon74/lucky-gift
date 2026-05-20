import type { LotteryGame } from './types';

export function mulberry32(seed: number): () => number {
  let s = seed;
  return function (): number {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickUniqueNumbers(
  rng: () => number,
  count: number,
  min: number,
  max: number,
): number[] {
  const pool: number[] = [];
  for (let i = min; i <= max; i++) pool.push(i);
  const picked: number[] = [];
  while (picked.length < count) {
    const idx = Math.floor(rng() * pool.length);
    picked.push(pool.splice(idx, 1)[0]!);
  }
  return picked.sort((a, b) => a - b);
}

export function generateLotteryNumbers(
  seedHash: string,
  game: LotteryGame,
): { main: number[]; bonus: number[] } {
  const seed = parseInt(seedHash.slice(0, 8), 16);
  const rng = mulberry32(seed);

  const main = pickUniqueNumbers(rng, game.mainCount, game.mainMin, game.mainMax);
  const bonus =
    game.bonusCount > 0 && game.bonusMin != null && game.bonusMax != null
      ? pickUniqueNumbers(rng, game.bonusCount, game.bonusMin, game.bonusMax)
      : [];

  return { main, bonus };
}

import { describe, it, expect } from 'vitest';
import { generateSeedHash } from '../seed-generator.js';

describe('generateSeedHash', () => {
  it('returns a hex string of length 64 (SHA-256)', async () => {
    const hash = await generateSeedHash('gift-1', 'user@example.com', 1716000000000);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('same inputs produce same hash', async () => {
    const h1 = await generateSeedHash('abc', 'a@b.com', 1000);
    const h2 = await generateSeedHash('abc', 'a@b.com', 1000);
    expect(h1).toBe(h2);
  });

  it('different giftId produces different hash', async () => {
    const h1 = await generateSeedHash('gift-1', 'a@b.com', 1000);
    const h2 = await generateSeedHash('gift-2', 'a@b.com', 1000);
    expect(h1).not.toBe(h2);
  });

  it('different email produces different hash', async () => {
    const h1 = await generateSeedHash('gift-1', 'alice@b.com', 1000);
    const h2 = await generateSeedHash('gift-1', 'bob@b.com', 1000);
    expect(h1).not.toBe(h2);
  });

  it('different timestamp produces different hash', async () => {
    const h1 = await generateSeedHash('gift-1', 'a@b.com', 1000);
    const h2 = await generateSeedHash('gift-1', 'a@b.com', 2000);
    expect(h1).not.toBe(h2);
  });
});

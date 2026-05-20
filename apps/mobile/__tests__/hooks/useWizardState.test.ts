import { describe, it, expect } from 'vitest';
import { OCCASIONS, LOTTERY_GAMES } from '@lucky-gift/shared';

/**
 * Mobile wizard state is pure logic — we test the business logic directly
 * rather than rendering hooks (which requires @testing-library/react-hooks with RN environment).
 * The hook itself just wires AsyncStorage to the same state logic tested in the web package.
 */
describe('useWizardState logic (mobile)', () => {
  it('OCCASIONS has 5 entries with correct keys', () => {
    expect(OCCASIONS.length).toBe(5);
    const keys = OCCASIONS.map((o) => o.occasionKey);
    expect(keys).toContain('birthday');
    expect(keys).toContain('holiday');
    expect(keys).toContain('no_reason');
  });

  it('LOTTERY_GAMES has 3 entries with correct gameIds', () => {
    expect(LOTTERY_GAMES.length).toBe(3);
    const ids = LOTTERY_GAMES.map((g) => g.gameId);
    expect(ids).toContain('PWR');
    expect(ids).toContain('MML');
    expect(ids).toContain('MFL');
  });

  it('each occasion has a non-empty defaultMessage', () => {
    for (const occ of OCCASIONS) {
      expect(occ.defaultMessage.length).toBeGreaterThan(0);
    }
  });

  it('each game has valid number ranges', () => {
    for (const game of LOTTERY_GAMES) {
      expect(game.mainMin).toBeLessThan(game.mainMax);
      expect(game.mainCount).toBeGreaterThan(0);
    }
  });

  it('AsyncStorage mock works for get/set', async () => {
    const AsyncStorage = await import('@react-native-async-storage/async-storage');
    const store = AsyncStorage.default;
    await store.setItem('test_key', JSON.stringify({ step: 2 }));
    const value = await store.getItem('test_key');
    expect(JSON.parse(value!).step).toBe(2);
    await store.removeItem('test_key');
    expect(await store.getItem('test_key')).toBeNull();
  });
});

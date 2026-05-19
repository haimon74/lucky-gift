import { describe, it, expect } from 'vitest';

describe('shared package smoke test', () => {
  it('is importable', async () => {
    const mod = await import('../index.js');
    expect(mod).toBeDefined();
  });

  it('basic assertion', () => {
    expect(true).toBe(true);
  });
});

import { describe, it, expect, vi, afterEach } from 'vitest';
import { submitGift, fetchReveal } from '../../utils/api';

describe('submitGift', () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it('posts to /api/gifts and returns response data', async () => {
    const mockData = { giftId: 'g1', recipientCount: 1, emailsSent: 1 };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok: true, json: async () => mockData,
    }));
    const result = await submitGift({
      gameId: 'PWR', occasionKey: 'birthday', message: 'Hi', senderName: 'Alice',
      senderEmail: 'alice@example.com', recipients: [{ name: 'Bob', email: 'bob@example.com' }],
    });
    expect(result.giftId).toBe('g1');
  });

  it('throws on non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok: false, json: async () => ({ error: 'Validation failed' }),
    }));
    await expect(submitGift({
      gameId: 'PWR', occasionKey: 'birthday', message: '', senderName: 'A',
      senderEmail: 'a@b.com', recipients: [],
    })).rejects.toThrow('Validation failed');
  });
});

describe('fetchReveal', () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it('fetches reveal endpoint and returns data', async () => {
    const mockData = { gift: { id: 'g1' } };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({ ok: true, json: async () => mockData }));
    const result = await fetchReveal('g1', 'token123');
    expect((result as typeof mockData).gift.id).toBe('g1');
  });

  it('throws on non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({ ok: false, status: 404 }));
    await expect(fetchReveal('bad-id', 'bad-token')).rejects.toThrow('HTTP 404');
  });
});

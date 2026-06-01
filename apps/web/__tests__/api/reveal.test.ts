import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/reveal/[giftId]/route';
import type { NextRequest } from 'next/server';

const MOCK_RESULT = {
  gift: {
    id: 'gift-1',
    gameId: 'PWR',
    occasionKey: 'birthday',
    message: 'Happy Birthday!',
    senderName: 'Alice',
    senderEmail: 'alice@example.com',
    amountPaidCents: 0,
    stripeSessionId: null,
    stripePaymentStatus: 'free',
    createdAt: 1700000000000,
  },
  recipient: {
    id: 1,
    recipientName: 'Bob',
    recipientEmail: 'bob@example.com',
    recipientPhone: null,
    seedHash: 'deadbeef1234',
    isRevealed: 0,
    revealToken: 'token-abc',
    giftId: 'gift-1',
    revealedAt: null,
  },
  game: {
    id: 1,
    gameId: 'PWR',
    name: 'Powerball',
    mainCount: 5,
    mainMin: 1,
    mainMax: 69,
    bonusCount: 1,
    bonusMin: 1,
    bonusMax: 26,
    bonusName: 'Powerball',
    notes: null,
  },
  template: {
    id: 1,
    occasionKey: 'birthday',
    displayName: 'Birthday',
    emoji: '🎂',
    defaultMessage: 'Happy Birthday!',
    revealButtonText: 'Reveal your lucky Powerball numbers!',
    greetingHtml: '',
    gradientColors: '[]',
  },
};

vi.mock('@lucky-gift/db', () => ({
  getGiftWithRecipient: vi.fn(),
  markRevealed: vi.fn().mockResolvedValue(undefined),
  createGift: vi.fn(),
  createGiftRecipient: vi.fn(),
}));

function makeRequest(giftId: string, token: string): NextRequest {
  const url = `http://localhost/api/reveal/${giftId}?t=${token}`;
  return new Request(url) as unknown as NextRequest;
}

function makeCtx(giftId: string) {
  return { params: Promise.resolve({ giftId }) };
}

describe('GET /api/reveal/[giftId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with correct shape for valid giftId + token', async () => {
    const { getGiftWithRecipient } = await import('@lucky-gift/db');
    vi.mocked(getGiftWithRecipient).mockResolvedValueOnce(MOCK_RESULT);

    const res = await GET(makeRequest('gift-1', 'token-abc'), makeCtx('gift-1'));
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.gift.id).toBe('gift-1');
    expect(data.recipient.name).toBe('Bob');
    expect(data.recipient.seedHash).toBe('deadbeef1234');
    // revealToken must NOT be in response
    expect(data.recipient.revealToken).toBeUndefined();
    expect(data.game.gameId).toBe('PWR');
    expect(data.template.revealButtonText).toBeDefined();
  });

  it('returns 404 when token does not match', async () => {
    const { getGiftWithRecipient } = await import('@lucky-gift/db');
    vi.mocked(getGiftWithRecipient).mockResolvedValueOnce(null);

    const res = await GET(makeRequest('gift-1', 'wrong-token'), makeCtx('gift-1'));
    expect(res.status).toBe(404);
  });

  it('returns 404 for non-existent giftId', async () => {
    const { getGiftWithRecipient } = await import('@lucky-gift/db');
    vi.mocked(getGiftWithRecipient).mockResolvedValueOnce(null);

    const res = await GET(makeRequest('no-such-gift', 'any-token'), makeCtx('no-such-gift'));
    expect(res.status).toBe(404);
  });

  it('returns 400 when token is missing', async () => {
    const url = 'http://localhost/api/reveal/gift-1';
    const req = new Request(url) as unknown as NextRequest;
    const res = await GET(req, makeCtx('gift-1'));
    expect(res.status).toBe(400);
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/gifts/route';

// Mock server-side dependencies
vi.mock('@lucky-gift/db', () => ({
  createGift: vi.fn().mockResolvedValue({ id: 'gift-uuid-1' }),
  createGiftRecipient: vi.fn().mockResolvedValue({ id: 1 }),
}));

vi.mock('@/lib/settings-cache', () => ({
  isPaymentsEnabled: vi.fn(() => false),
  getMaxRecipients: vi.fn(() => 5),
  getSettingValue: vi.fn(() => null),
}));

vi.mock('@/lib/email', () => ({
  sendGiftEmail: vi.fn().mockResolvedValue(true),
  buildGiftEmailHtml: vi.fn(() => '<html/>'),
}));

vi.mock('@lucky-gift/shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@lucky-gift/shared')>();
  return {
    ...actual,
    generateSeedHash: vi.fn().mockResolvedValue('deadbeef1234'),
  };
});

const VALID_PAYLOAD = {
  gameId: 'PWR',
  occasionKey: 'birthday',
  message: 'Happy Birthday!',
  senderName: 'Alice',
  senderEmail: 'alice@example.com',
  recipients: [{ name: 'Bob', email: 'bob@example.com', phone: '' }],
};

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/gifts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/gifts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 201 with giftId for valid payload', async () => {
    const res = await POST(makeRequest(VALID_PAYLOAD));
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.giftId).toBeDefined();
    expect(data.recipientCount).toBe(1);
  });

  it('returns 400 for missing required fields', async () => {
    const res = await POST(makeRequest({ gameId: 'PWR' }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/validation/i);
  });

  it('returns 400 for too many recipients', async () => {
    const tooMany = Array.from({ length: 6 }, (_, i) => ({
      name: `Person ${i}`,
      email: `person${i}@example.com`,
    }));
    const res = await POST(makeRequest({ ...VALID_PAYLOAD, recipients: tooMany }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for duplicate recipient emails', async () => {
    const res = await POST(
      makeRequest({
        ...VALID_PAYLOAD,
        recipients: [
          { name: 'Bob', email: 'same@example.com' },
          { name: 'Alice', email: 'same@example.com' },
        ],
      }),
    );
    expect(res.status).toBe(400);
  });

  it('returns 402 when payments are enabled', async () => {
    const { isPaymentsEnabled } = await import('@/lib/settings-cache');
    vi.mocked(isPaymentsEnabled).mockReturnValueOnce(true);
    const res = await POST(makeRequest(VALID_PAYLOAD));
    expect(res.status).toBe(402);
  });

  it('returns 500 when DB throws', async () => {
    const { createGift } = await import('@lucky-gift/db');
    vi.mocked(createGift).mockRejectedValueOnce(new Error('DB down'));
    const res = await POST(makeRequest(VALID_PAYLOAD));
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toMatch(/failed/i);
  });
});

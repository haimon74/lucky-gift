import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/webhooks/stripe/route';

// Mock DB
vi.mock('@lucky-gift/db', () => ({
  createGift: vi.fn().mockResolvedValue({ id: 'gift-uuid-1' }),
  createGiftRecipient: vi.fn().mockResolvedValue({ id: 1 }),
}));

// Mock email
vi.mock('@/lib/email', () => ({
  sendGiftEmail: vi.fn().mockResolvedValue(true),
}));

// Mock shared (preserve real implementations but mock generateSeedHash)
vi.mock('@lucky-gift/shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@lucky-gift/shared')>();
  return {
    ...actual,
    generateSeedHash: vi.fn().mockResolvedValue('deadbeef1234'),
  };
});

const VALID_GIFT_DATA = JSON.stringify({
  gameId: 'PWR',
  occasionKey: 'birthday',
  message: 'Happy Birthday!',
  senderName: 'Alice',
  senderEmail: 'alice@example.com',
  recipients: [{ name: 'Bob', email: 'bob@example.com', phone: '' }],
});

function makeWebhookRequest(overrides: {
  body?: string;
  signature?: string;
  webhookSecret?: string;
  mockConstructEvent?: () => unknown;
}): Request {
  const body = overrides.body ?? '{}';
  const signature = overrides.signature ?? 'stripe-sig';

  return new Request('http://localhost/api/webhooks/stripe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'stripe-signature': signature,
    },
    body,
  });
}

describe('POST /api/webhooks/stripe', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set env vars
    process.env['STRIPE_WEBHOOK_SECRET'] = 'whsec_test123';
    process.env['STRIPE_SECRET_KEY'] = 'sk_test_xxx';
  });

  it('returns 400 when webhook secret is missing', async () => {
    delete process.env['STRIPE_WEBHOOK_SECRET'];

    const req = makeWebhookRequest({});
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/missing webhook secret/i);
  });

  it('returns 400 when signature is missing', async () => {
    const req = new Request('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/missing webhook secret or signature/i);
  });

  it('returns 400 when signature verification fails', async () => {
    // Stripe constructEvent will throw since we can't verify a real sig in test
    const req = makeWebhookRequest({ signature: 'invalid-sig' });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/invalid signature/i);
  });

  it('returns 200 received:true for checkout.session.expired event (mock stripe)', async () => {
    // Mock the stripe module import
    vi.doMock('@/lib/stripe', () => ({
      getStripeClient: () => ({
        webhooks: {
          constructEvent: vi.fn().mockReturnValue({
            type: 'checkout.session.expired',
            data: { object: { id: 'cs_expired' } },
          }),
        },
      }),
    }));

    // Re-import after mock
    const { POST: FreshPOST } = await import('@/app/api/webhooks/stripe/route');
    const req = makeWebhookRequest({});
    const res = await FreshPOST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.received).toBe(true);

    vi.doUnmock('@/lib/stripe');
  });

  it('creates gift and sends emails for checkout.session.completed', async () => {
    const mockSession = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_completed',
          metadata: {
            giftId: 'test-gift-id',
            pendingGiftData: VALID_GIFT_DATA,
          },
        },
      },
    };

    vi.doMock('@/lib/stripe', () => ({
      getStripeClient: () => ({
        webhooks: {
          constructEvent: vi.fn().mockReturnValue(mockSession),
        },
      }),
    }));

    const { POST: FreshPOST } = await import('@/app/api/webhooks/stripe/route');
    const req = makeWebhookRequest({});
    const res = await FreshPOST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.received).toBe(true);

    const { createGift } = await import('@lucky-gift/db');
    expect(vi.mocked(createGift)).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'test-gift-id',
        gameId: 'PWR',
        occasionKey: 'birthday',
        senderName: 'Alice',
      }),
    );

    const { sendGiftEmail } = await import('@/lib/email');
    expect(vi.mocked(sendGiftEmail)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(sendGiftEmail)).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientEmail: 'bob@example.com',
        recipientName: 'Bob',
      }),
    );

    vi.doUnmock('@/lib/stripe');
  });

  it('returns 200 even when gift processing fails (to prevent Stripe retry)', async () => {
    const mockSession = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_fail',
          metadata: {
            giftId: 'fail-gift-id',
            pendingGiftData: VALID_GIFT_DATA,
          },
        },
      },
    };

    vi.doMock('@/lib/stripe', () => ({
      getStripeClient: () => ({
        webhooks: {
          constructEvent: vi.fn().mockReturnValue(mockSession),
        },
      }),
    }));

    const { createGift } = await import('@lucky-gift/db');
    vi.mocked(createGift).mockRejectedValueOnce(new Error('DB down'));

    const { POST: FreshPOST } = await import('@/app/api/webhooks/stripe/route');
    const req = makeWebhookRequest({});
    const res = await FreshPOST(req);
    // Should still return 200 to prevent Stripe retries
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.received).toBe(true);

    vi.doUnmock('@/lib/stripe');
  });

  it('handles checkout.session.completed with no pendingGiftData gracefully', async () => {
    const mockSession = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_no_data',
          metadata: {},
        },
      },
    };

    vi.doMock('@/lib/stripe', () => ({
      getStripeClient: () => ({
        webhooks: {
          constructEvent: vi.fn().mockReturnValue(mockSession),
        },
      }),
    }));

    const { POST: FreshPOST } = await import('@/app/api/webhooks/stripe/route');
    const req = makeWebhookRequest({});
    const res = await FreshPOST(req);
    expect(res.status).toBe(200);

    vi.doUnmock('@/lib/stripe');
  });
});

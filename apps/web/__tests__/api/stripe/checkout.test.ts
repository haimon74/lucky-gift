import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/checkout/route';

vi.mock('@/lib/settings-cache', () => ({
  isPaymentsEnabled: vi.fn(() => false),
  getSettingValue: vi.fn(() => null),
}));

vi.mock('@/lib/stripe', () => ({
  getStripeClient: vi.fn(() => ({
    checkout: {
      sessions: {
        create: vi.fn().mockResolvedValue({ url: 'https://checkout.stripe.com/pay/cs_test_abc' }),
      },
    },
  })),
}));

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const VALID_BODY = {
  giftId: 'gift-uuid-1',
  gameId: 'PWR',
  occasionKey: 'birthday',
  recipientCount: 2,
  pendingGiftData: '{"foo":"bar"}',
};

describe('POST /api/checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 403 when payments are not enabled', async () => {
    const { isPaymentsEnabled } = await import('@/lib/settings-cache');
    vi.mocked(isPaymentsEnabled).mockReturnValueOnce(false);

    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toMatch(/payments not enabled/i);
  });

  it('returns 200 with checkoutUrl when payments enabled and Stripe session created', async () => {
    const { isPaymentsEnabled } = await import('@/lib/settings-cache');
    vi.mocked(isPaymentsEnabled).mockReturnValueOnce(true);

    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.checkoutUrl).toBe('https://checkout.stripe.com/pay/cs_test_abc');
  });

  it('returns 400 when required fields are missing', async () => {
    const { isPaymentsEnabled } = await import('@/lib/settings-cache');
    vi.mocked(isPaymentsEnabled).mockReturnValueOnce(true);

    const res = await POST(makeRequest({ gameId: 'PWR' }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/missing required/i);
  });

  it('returns 400 for invalid JSON body', async () => {
    const { isPaymentsEnabled } = await import('@/lib/settings-cache');
    vi.mocked(isPaymentsEnabled).mockReturnValueOnce(true);

    const req = new Request('http://localhost/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/invalid json/i);
  });

  it('uses gift_price_cents setting when available', async () => {
    const { isPaymentsEnabled, getSettingValue } = await import('@/lib/settings-cache');
    vi.mocked(isPaymentsEnabled).mockReturnValueOnce(true);
    vi.mocked(getSettingValue).mockReturnValueOnce('2500'); // $25.00

    const { getStripeClient } = await import('@/lib/stripe');
    const mockCreate = vi.fn().mockResolvedValue({ url: 'https://checkout.stripe.com/pay/cs_test_price' });
    vi.mocked(getStripeClient).mockReturnValueOnce({
      checkout: { sessions: { create: mockCreate } },
    } as never);

    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(200);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: expect.arrayContaining([
          expect.objectContaining({
            price_data: expect.objectContaining({ unit_amount: 2500 }),
          }),
        ]),
      }),
    );
  });

  it('returns 503 when Stripe is not configured', async () => {
    const { isPaymentsEnabled } = await import('@/lib/settings-cache');
    vi.mocked(isPaymentsEnabled).mockReturnValueOnce(true);

    const { getStripeClient } = await import('@/lib/stripe');
    vi.mocked(getStripeClient).mockImplementationOnce(() => {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    });

    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(503);
  });

  it('returns 500 when Stripe session creation fails', async () => {
    const { isPaymentsEnabled } = await import('@/lib/settings-cache');
    vi.mocked(isPaymentsEnabled).mockReturnValueOnce(true);

    const { getStripeClient } = await import('@/lib/stripe');
    vi.mocked(getStripeClient).mockReturnValueOnce({
      checkout: {
        sessions: {
          create: vi.fn().mockRejectedValueOnce(new Error('Stripe error')),
        },
      },
    } as never);

    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(500);
  });
});

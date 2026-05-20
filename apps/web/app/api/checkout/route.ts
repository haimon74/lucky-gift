import { isPaymentsEnabled, getSettingValue } from '@/lib/settings-cache';
import { getStripeClient } from '@/lib/stripe';

const BASE_URL = process.env['NEXT_PUBLIC_BASE_URL'] ?? 'https://luck-gift.haimazar.us';

interface CheckoutBody {
  giftId?: string;
  gameId?: string;
  occasionKey?: string;
  recipientCount?: number;
  pendingGiftData?: string;
}

export async function POST(request: Request) {
  if (!isPaymentsEnabled()) {
    return Response.json({ error: 'Payments not enabled' }, { status: 403 });
  }

  let body: CheckoutBody;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { giftId, gameId, occasionKey, recipientCount, pendingGiftData } = body;

  if (!gameId || !occasionKey || !recipientCount) {
    return Response.json({ error: 'Missing required fields: gameId, occasionKey, recipientCount' }, { status: 400 });
  }

  let stripe: ReturnType<typeof getStripeClient>;
  try {
    stripe = getStripeClient();
  } catch {
    return Response.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  const priceStr = getSettingValue('gift_price_cents') ?? '1000';
  const unitAmount = parseInt(priceStr, 10) || 1000;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: unitAmount,
            product_data: {
              name: `Lucky Gift — ${gameId} for ${recipientCount} recipient${recipientCount !== 1 ? 's' : ''}`,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${BASE_URL}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/?payment=cancelled`,
      metadata: {
        giftId: giftId ?? '',
        gameId,
        occasionKey,
        pendingGiftData: pendingGiftData ?? '',
      },
    });

    return Response.json({ checkoutUrl: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return Response.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}

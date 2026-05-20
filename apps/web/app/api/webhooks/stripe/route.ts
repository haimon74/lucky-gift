import { giftPayloadSchema, generateSeedHash } from '@lucky-gift/shared';
import { createGift, createGiftRecipient } from '@lucky-gift/db';
import { sendGiftEmail } from '@/lib/email';

export const runtime = 'nodejs';

const BASE_URL = process.env['NEXT_PUBLIC_BASE_URL'] ?? 'https://luck-gift.haimazar.us';

export async function POST(request: Request) {
  const webhookSecret = process.env['STRIPE_WEBHOOK_SECRET'];

  // Read raw body for signature verification
  const rawBody = await request.arrayBuffer();
  const signature = request.headers.get('stripe-signature') ?? '';

  if (!webhookSecret || !signature) {
    return Response.json({ error: 'Missing webhook secret or signature' }, { status: 400 });
  }

  // Import Stripe lazily to avoid initialization when payments disabled
  let stripe: import('stripe').default;
  let event: import('stripe').Stripe.Event;
  try {
    const { getStripeClient } = await import('@/lib/stripe');
    stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(Buffer.from(rawBody), signature, webhookSecret);
  } catch (err) {
    console.error('Stripe signature verification failed:', err);
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as import('stripe').Stripe.Checkout.Session;
    const raw = session.metadata?.pendingGiftData;

    if (raw) {
      try {
        const parsed = giftPayloadSchema.safeParse(JSON.parse(raw));
        if (parsed.success) {
          const { gameId, occasionKey, message, senderName, senderEmail, recipients } = parsed.data;
          const giftId = session.metadata?.giftId || crypto.randomUUID();
          const createdAt = Date.now();

          await createGift({ id: giftId, gameId, occasionKey, message, senderName, senderEmail, createdAt });

          for (const recipient of recipients) {
            const revealToken = crypto.randomUUID();
            const seedHash = await generateSeedHash(giftId, recipient.email, createdAt);
            await createGiftRecipient({
              giftId,
              recipientName: recipient.name,
              recipientEmail: recipient.email,
              recipientPhone: recipient.phone,
              revealToken,
              seedHash,
            });
            const revealUrl = `${BASE_URL}/reveal/${giftId}?t=${revealToken}`;
            await sendGiftEmail({ recipientName: recipient.name, recipientEmail: recipient.email, senderName, senderEmail, message, revealUrl });
          }
        }
      } catch (err) {
        console.error('Failed to process completed checkout:', err);
        // Return 200 so Stripe doesn't retry — log the error
      }
    }
  } else if (event.type === 'checkout.session.expired') {
    console.log('Checkout session expired:', event.data.object);
  }

  return Response.json({ received: true });
}

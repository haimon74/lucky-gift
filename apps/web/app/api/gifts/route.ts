import { giftPayloadSchema } from '@lucky-gift/shared';
import { generateSeedHash } from '@lucky-gift/shared';
import { createGift, createGiftRecipient } from '@lucky-gift/db';
import { isPaymentsEnabled } from '@/lib/settings-cache';
import { sendGiftEmail } from '@/lib/email';

const BASE_URL = process.env['NEXT_PUBLIC_BASE_URL'] ?? 'https://luck-gift.haimazar.us';

export async function POST(request: Request) {
  // Parse request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Validate payload
  const parsed = giftPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // Gate behind payments if enabled
  if (isPaymentsEnabled()) {
    return Response.json(
      { error: 'Payment required', code: 'PAYMENT_REQUIRED' },
      { status: 402 },
    );
  }

  const { gameId, occasionKey, message, senderName, senderEmail, recipients } = parsed.data;

  const giftId = crypto.randomUUID();
  const createdAt = Date.now();

  // Insert gift record
  try {
    await createGift({ id: giftId, gameId, occasionKey, message, senderName, senderEmail, createdAt });
  } catch (err) {
    console.error('DB error creating gift:', err);
    return Response.json({ error: 'Failed to create gift' }, { status: 500 });
  }

  // Process each recipient
  let emailsSent = 0;
  for (const recipient of recipients) {
    const revealToken = crypto.randomUUID();
    let seedHash: string;
    try {
      seedHash = await generateSeedHash(giftId, recipient.email, createdAt);
    } catch (err) {
      console.error('Seed hash error:', err);
      seedHash = `${giftId}:${recipient.email}:${createdAt}`;
    }

    try {
      await createGiftRecipient({
        giftId,
        recipientName: recipient.name,
        recipientEmail: recipient.email,
        recipientPhone: recipient.phone,
        revealToken,
        seedHash,
      });
    } catch (err) {
      console.error('DB error creating recipient:', err);
      // Continue to next recipient — gift is already saved
    }

    const revealUrl = `${BASE_URL}/reveal/${giftId}?t=${revealToken}`;
    const sent = await sendGiftEmail({
      recipientName: recipient.name,
      recipientEmail: recipient.email,
      senderName,
      senderEmail,
      message,
      revealUrl,
    });
    if (sent) emailsSent++;
  }

  return Response.json(
    { giftId, recipientCount: recipients.length, emailsSent },
    { status: 201 },
  );
}

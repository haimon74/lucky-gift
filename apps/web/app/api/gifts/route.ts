import { giftPayloadSchema } from '@lucky-gift/shared';
import { generateSeedHash } from '@lucky-gift/shared';
import { createGift, createGiftRecipient } from '@lucky-gift/db';
import { isPaymentsEnabled } from '@/lib/settings-cache';
import { sendGiftEmail } from '@/lib/email';

const BASE_URL = process.env['NEXT_PUBLIC_BASE_URL'] ?? 'https://luck-gift.haimazar.us';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // sendEmail flag: default true (backward compat). Pass false to save gift without emailing.
  const sendEmail = (body as Record<string, unknown>)?.sendEmail !== false;

  const parsed = giftPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (isPaymentsEnabled()) {
    return Response.json(
      { error: 'Payment required', code: 'PAYMENT_REQUIRED' },
      { status: 402 },
    );
  }

  const { gameId, occasionKey, message, senderName, senderEmail, recipients } = parsed.data;

  const giftId = crypto.randomUUID();
  const createdAt = Date.now();

  try {
    await createGift({ id: giftId, gameId, occasionKey, message, senderName, senderEmail, createdAt });
  } catch (err) {
    console.error('DB error creating gift:', err);
    return Response.json({ error: 'Failed to create gift' }, { status: 500 });
  }

  let emailsSent = 0;
  const savedRecipients: { name: string; email: string; revealUrl: string }[] = [];

  for (const recipient of recipients) {
    const revealToken = crypto.randomUUID();
    let seedHash: string;
    try {
      seedHash = await generateSeedHash(giftId, recipient.email, createdAt);
    } catch {
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
    }

    const revealUrl = `${BASE_URL}/reveal/${giftId}?t=${revealToken}`;
    savedRecipients.push({ name: recipient.name, email: recipient.email, revealUrl });

    if (sendEmail) {
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
  }

  return Response.json(
    { giftId, recipientCount: recipients.length, emailsSent, recipients: savedRecipients },
    { status: 201 },
  );
}

import { getGiftWithRecipients } from '@lucky-gift/db';
import { sendGiftEmail } from '@/lib/email';

const BASE_URL = process.env['NEXT_PUBLIC_BASE_URL'] ?? 'https://luck-gift.haimazar.us';

export async function POST(
  request: Request,
  ctx: RouteContext<'/api/gifts/[giftId]/email'>,
) {
  const { giftId } = await ctx.params;

  // Require senderEmail in the body — caller must prove they are the gift owner
  let body: { senderEmail?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { senderEmail } = body;
  if (!senderEmail) {
    return Response.json({ error: 'senderEmail is required' }, { status: 400 });
  }

  let result: Awaited<ReturnType<typeof getGiftWithRecipients>>;
  try {
    result = await getGiftWithRecipients(giftId);
  } catch (err) {
    console.error('DB error fetching gift:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }

  if (!result) {
    return Response.json({ error: 'Gift not found' }, { status: 404 });
  }

  const { gift, recipients } = result;

  // Verify the caller is the original sender
  if (gift.senderEmail.toLowerCase() !== senderEmail.toLowerCase()) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let emailsSent = 0;
  for (const recipient of recipients) {
    const revealUrl = `${BASE_URL}/reveal/${giftId}?t=${recipient.revealToken}`;
    const sent = await sendGiftEmail({
      recipientName: recipient.recipientName,
      recipientEmail: recipient.recipientEmail,
      senderName: gift.senderName,
      senderEmail: gift.senderEmail,
      message: gift.message ?? '',
      revealUrl,
    });
    if (sent) emailsSent++;
  }

  return Response.json({ emailsSent, recipientCount: recipients.length });
}

import { getGiftWithRecipient, markRevealed } from '@lucky-gift/db';

export async function GET(
  request: Request,
  ctx: RouteContext<'/api/reveal/[giftId]'>,
) {
  const { giftId } = await ctx.params;
  const { searchParams } = new URL(request.url);
  const revealToken = searchParams.get('t') ?? '';

  if (!revealToken) {
    return Response.json({ error: 'Missing reveal token' }, { status: 400 });
  }

  let result: Awaited<ReturnType<typeof getGiftWithRecipient>>;
  try {
    result = await getGiftWithRecipient(giftId, revealToken);
  } catch (err) {
    console.error('DB error in reveal lookup:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }

  if (!result) {
    return Response.json({ error: 'Gift not found' }, { status: 404 });
  }

  const { gift, recipient, game, template } = result;

  // Mark as revealed if first time
  if (!recipient.isRevealed) {
    try {
      await markRevealed(recipient.id);
    } catch (err) {
      console.error('Failed to mark revealed:', err);
      // Non-fatal — still return the data
    }
  }

  // Strip revealToken from response
  return Response.json({
    gift: {
      id: gift.id,
      gameId: gift.gameId,
      occasionKey: gift.occasionKey,
      message: gift.message,
      senderName: gift.senderName,
      createdAt: gift.createdAt,
    },
    recipient: {
      name: recipient.recipientName,
      email: recipient.recipientEmail,
      seedHash: recipient.seedHash,
      isRevealed: Boolean(recipient.isRevealed),
    },
    game: {
      gameId: game.gameId,
      name: game.name,
      mainCount: game.mainCount,
      mainMin: game.mainMin,
      mainMax: game.mainMax,
      bonusCount: game.bonusCount,
      bonusMin: game.bonusMin,
      bonusMax: game.bonusMax,
    },
    template: {
      name: template.displayName,
      revealButtonText: template.revealButtonText,
    },
  });
}

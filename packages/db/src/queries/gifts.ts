import { eq, and } from 'drizzle-orm';
import { db } from '../client';
import { gifts, giftRecipients, lotteryGames, messageTemplates } from '../schema';

export interface CreateGiftData {
  id: string;
  gameId: string;
  occasionKey: string;
  message: string;
  senderName: string;
  senderEmail: string;
  createdAt: number;
}

export interface CreateRecipientData {
  giftId: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhone?: string;
  revealToken: string;
  seedHash: string;
}

export async function createGift(data: CreateGiftData) {
  const [gift] = await db.insert(gifts).values(data).returning();
  return gift!;
}

export async function createGiftRecipient(data: CreateRecipientData) {
  const [recipient] = await db.insert(giftRecipients).values(data).returning();
  return recipient!;
}

export async function getGiftWithRecipient(giftId: string, revealToken: string) {
  const recipient = await db.query.giftRecipients.findFirst({
    where: and(
      eq(giftRecipients.giftId, giftId),
      eq(giftRecipients.revealToken, revealToken),
    ),
  });

  if (!recipient) return null;

  const gift = await db.query.gifts.findFirst({
    where: eq(gifts.id, giftId),
  });

  if (!gift) return null;

  const game = await db.query.lotteryGames.findFirst({
    where: eq(lotteryGames.gameId, gift.gameId),
  });

  const template = await db.query.messageTemplates.findFirst({
    where: eq(messageTemplates.occasionKey, gift.occasionKey),
  });

  if (!game || !template) return null;

  return { gift, recipient, game, template };
}

export async function markRevealed(recipientId: number) {
  await db
    .update(giftRecipients)
    .set({ isRevealed: 1, revealedAt: Date.now() })
    .where(eq(giftRecipients.id, recipientId));
}

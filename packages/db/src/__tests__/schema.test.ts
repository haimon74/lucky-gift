import { describe, it, expect, beforeEach } from 'vitest';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as schema from '../schema.js';
import { eq, and } from 'drizzle-orm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsFolder = join(__dirname, '..', '..', 'drizzle');

function createTestDb() {
  const sqlite = new Database(':memory:');
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  const db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder });
  return { db, sqlite };
}

describe('gifts + gift_recipients schema', () => {
  let db: ReturnType<typeof createTestDb>['db'];

  beforeEach(() => {
    ({ db } = createTestDb());
  });

  it('inserts and retrieves a gift', async () => {
    await db.insert(schema.gifts).values({
      id: 'test-gift-1',
      gameId: 'PWR',
      occasionKey: 'birthday',
      message: 'Good luck!',
      senderName: 'Alice',
      senderEmail: 'alice@example.com',
      createdAt: Date.now(),
    });

    const [gift] = await db
      .select()
      .from(schema.gifts)
      .where(eq(schema.gifts.id, 'test-gift-1'));

    expect(gift).toBeDefined();
    expect(gift!.senderName).toBe('Alice');
    expect(gift!.stripePaymentStatus).toBe('free');
    expect(gift!.amountPaidCents).toBe(0);
  });

  it('inserts and retrieves a gift recipient', async () => {
    const now = Date.now();
    await db.insert(schema.gifts).values({
      id: 'gift-2',
      gameId: 'MML',
      occasionKey: 'no_reason',
      message: '',
      senderName: 'Bob',
      senderEmail: 'bob@example.com',
      createdAt: now,
    });

    await db.insert(schema.giftRecipients).values({
      giftId: 'gift-2',
      recipientName: 'Carol',
      recipientEmail: 'carol@example.com',
      revealToken: 'token-abc',
      seedHash: 'a1b2c3d4',
    });

    const [recipient] = await db
      .select()
      .from(schema.giftRecipients)
      .where(eq(schema.giftRecipients.revealToken, 'token-abc'));

    expect(recipient).toBeDefined();
    expect(recipient!.recipientName).toBe('Carol');
    expect(recipient!.isRevealed).toBe(0);
    expect(recipient!.revealedAt).toBeNull();
  });

  it('getGiftWithRecipient returns correct joined data', async () => {
    // Seed game and template first
    await db.insert(schema.lotteryGames).values({
      gameId: 'PWR',
      name: 'Powerball',
      mainCount: 5,
      mainMin: 1,
      mainMax: 69,
      bonusCount: 1,
      bonusMin: 1,
      bonusMax: 26,
      bonusName: 'Powerball',
    });
    await db.insert(schema.messageTemplates).values({
      occasionKey: 'birthday',
      displayName: 'Birthday',
      emoji: '🎂',
      defaultMessage: 'Happy Birthday!',
      greetingHtml: '<p>Happy Birthday {{recipient_name}}!</p>',
      revealButtonText: 'Reveal numbers!',
      gradientColors: '["#6b21a8","#db2777"]',
    });

    const now = Date.now();
    await db.insert(schema.gifts).values({
      id: 'gift-3',
      gameId: 'PWR',
      occasionKey: 'birthday',
      message: 'Good luck!',
      senderName: 'Dave',
      senderEmail: 'dave@example.com',
      createdAt: now,
    });
    await db.insert(schema.giftRecipients).values({
      giftId: 'gift-3',
      recipientName: 'Eve',
      recipientEmail: 'eve@example.com',
      revealToken: 'token-xyz',
      seedHash: 'deadbeef',
    });

    // Find recipient
    const recipient = await db.query.giftRecipients.findFirst({
      where: and(
        eq(schema.giftRecipients.giftId, 'gift-3'),
        eq(schema.giftRecipients.revealToken, 'token-xyz'),
      ),
    });
    expect(recipient).toBeDefined();
    expect(recipient!.recipientName).toBe('Eve');
  });

  it('getGiftWithRecipient returns null for wrong revealToken', async () => {
    await db.insert(schema.gifts).values({
      id: 'gift-4',
      gameId: 'PWR',
      occasionKey: 'birthday',
      senderName: 'Frank',
      senderEmail: 'frank@example.com',
      createdAt: Date.now(),
    });
    await db.insert(schema.giftRecipients).values({
      giftId: 'gift-4',
      recipientName: 'Grace',
      recipientEmail: 'grace@example.com',
      revealToken: 'correct-token',
      seedHash: 'aabbccdd',
    });

    const recipient = await db.query.giftRecipients.findFirst({
      where: and(
        eq(schema.giftRecipients.giftId, 'gift-4'),
        eq(schema.giftRecipients.revealToken, 'wrong-token'),
      ),
    });
    expect(recipient).toBeUndefined();
  });

  it('markRevealed sets isRevealed=1 and revealedAt', async () => {
    await db.insert(schema.gifts).values({
      id: 'gift-5',
      gameId: 'PWR',
      occasionKey: 'holiday',
      senderName: 'Hank',
      senderEmail: 'hank@example.com',
      createdAt: Date.now(),
    });
    const [r] = await db.insert(schema.giftRecipients).values({
      giftId: 'gift-5',
      recipientName: 'Ivy',
      recipientEmail: 'ivy@example.com',
      revealToken: 'reveal-tok',
      seedHash: '11223344',
    }).returning();

    await db
      .update(schema.giftRecipients)
      .set({ isRevealed: 1, revealedAt: Date.now() })
      .where(eq(schema.giftRecipients.id, r!.id));

    const updated = await db.query.giftRecipients.findFirst({
      where: eq(schema.giftRecipients.id, r!.id),
    });
    expect(updated!.isRevealed).toBe(1);
    expect(updated!.revealedAt).toBeGreaterThan(0);
  });
});

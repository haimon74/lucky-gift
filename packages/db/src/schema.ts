import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const lotteryGames = sqliteTable('lottery_games', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  gameId: text('game_id').notNull().unique(),
  name: text('name').notNull(),
  mainCount: integer('main_count').notNull(),
  mainMin: integer('main_min').notNull(),
  mainMax: integer('main_max').notNull(),
  bonusCount: integer('bonus_count').notNull().default(0),
  bonusMin: integer('bonus_min'),
  bonusMax: integer('bonus_max'),
  bonusName: text('bonus_name'),
  notes: text('notes'),
});

export const messageTemplates = sqliteTable('message_templates', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  occasionKey: text('occasion_key').notNull().unique(),
  displayName: text('display_name').notNull(),
  emoji: text('emoji').notNull(),
  defaultMessage: text('default_message').notNull(),
  greetingHtml: text('greeting_html').notNull(),
  revealButtonText: text('reveal_button_text').notNull(),
  gradientColors: text('gradient_colors').notNull(),
});

export const gifts = sqliteTable('gifts', {
  id: text('id').primaryKey(),
  gameId: text('game_id').notNull(),
  occasionKey: text('occasion_key').notNull(),
  message: text('message').default(''),
  senderName: text('sender_name').notNull(),
  senderEmail: text('sender_email').notNull(),
  amountPaidCents: integer('amount_paid_cents').notNull().default(0),
  stripeSessionId: text('stripe_session_id').unique(),
  stripePaymentStatus: text('stripe_payment_status').notNull().default('free'),
  createdAt: integer('created_at').notNull(),
});

export const giftRecipients = sqliteTable(
  'gift_recipients',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    giftId: text('gift_id').notNull(),
    recipientName: text('recipient_name').notNull(),
    recipientEmail: text('recipient_email').notNull(),
    recipientPhone: text('recipient_phone'),
    revealToken: text('reveal_token').notNull().unique(),
    seedHash: text('seed_hash').notNull(),
    isRevealed: integer('is_revealed').notNull().default(0),
    revealedAt: integer('revealed_at'),
  },
  (t) => [uniqueIndex('gift_recipient_unique').on(t.giftId, t.recipientEmail)],
);

export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  description: text('description'),
  updatedAt: integer('updated_at').notNull(),
});

export const adminSessions = sqliteTable('admin_sessions', {
  id: text('id').primaryKey(),
  createdAt: integer('created_at').notNull(),
  expiresAt: integer('expires_at').notNull(),
});

export const giftsRelations = relations(gifts, ({ many }) => ({
  recipients: many(giftRecipients),
}));

export const giftRecipientsRelations = relations(giftRecipients, ({ one }) => ({
  gift: one(gifts, {
    fields: [giftRecipients.giftId],
    references: [gifts.id],
  }),
}));

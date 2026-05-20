import { db, sqlite } from './client';
import { lotteryGames, messageTemplates, settings } from './schema';
import { sql } from 'drizzle-orm';

const GAMES = [
  {
    gameId: 'PWR',
    name: 'Powerball',
    mainCount: 5,
    mainMin: 1,
    mainMax: 69,
    bonusCount: 1,
    bonusMin: 1,
    bonusMax: 26,
    bonusName: 'Powerball',
    notes: '5 white balls + 1 red Powerball',
  },
  {
    gameId: 'MML',
    name: 'Mega Millions',
    mainCount: 5,
    mainMin: 1,
    mainMax: 70,
    bonusCount: 1,
    bonusMin: 1,
    bonusMax: 24,
    bonusName: 'Mega Ball',
    notes: '5 white balls + 1 gold Mega Ball',
  },
  {
    gameId: 'MFL',
    name: 'Millionaire for Life',
    mainCount: 5,
    mainMin: 1,
    mainMax: 58,
    bonusCount: 1,
    bonusMin: 1,
    bonusMax: 5,
    bonusName: 'Millionaire Ball',
    notes: '5 white balls + 1 Millionaire Ball',
  },
];

const TEMPLATES = [
  {
    occasionKey: 'birthday',
    displayName: 'Birthday',
    emoji: '🎂',
    defaultMessage: 'Wishing you a wonderful birthday filled with joy and luck! 🎂',
    greetingHtml:
      '<p>Happy Birthday, <strong>{{recipient_name}}</strong>! 🎂</p><p>{{sender_name}} has sent you a lucky gift!</p><p><em>{{message}}</em></p>',
    revealButtonText: 'Reveal your lucky numbers!',
    gradientColors: JSON.stringify(['#6b21a8', '#db2777']),
  },
  {
    occasionKey: 'anniversary',
    displayName: 'Anniversary',
    emoji: '💍',
    defaultMessage: 'Celebrating your special day with a little extra luck! 💍',
    greetingHtml:
      '<p>Happy Anniversary, <strong>{{recipient_name}}</strong>! 💍</p><p>{{sender_name}} is celebrating with you!</p><p><em>{{message}}</em></p>',
    revealButtonText: 'Reveal your lucky numbers!',
    gradientColors: JSON.stringify(['#be185d', '#dc2626']),
  },
  {
    occasionKey: 'holiday',
    displayName: 'Holiday',
    emoji: '🎄',
    defaultMessage: "Season's greetings and all the luck for the new year! 🎄",
    greetingHtml:
      '<p>Happy Holidays, <strong>{{recipient_name}}</strong>! 🎄</p><p>{{sender_name}} wishes you a lucky season!</p><p><em>{{message}}</em></p>',
    revealButtonText: 'Reveal your lucky numbers!',
    gradientColors: JSON.stringify(['#166534', '#15803d']),
  },
  {
    occasionKey: 'mothers_fathers_day',
    displayName: "Mother's/Father's Day",
    emoji: '💛',
    defaultMessage: 'To the luckiest parent in the world — these numbers are for you! 💛',
    greetingHtml:
      '<p>To the best parent, <strong>{{recipient_name}}</strong>! 💛</p><p>{{sender_name}} loves you!</p><p><em>{{message}}</em></p>',
    revealButtonText: 'Reveal your lucky numbers!',
    gradientColors: JSON.stringify(['#b45309', '#d97706']),
  },
  {
    occasionKey: 'no_reason',
    displayName: 'Just Because',
    emoji: '🍀',
    defaultMessage: 'Just because — sending you some lucky numbers to brighten your day! 🍀',
    greetingHtml:
      '<p>Hey <strong>{{recipient_name}}</strong>! 🍀</p><p>{{sender_name}} is thinking of you!</p><p><em>{{message}}</em></p>',
    revealButtonText: 'Reveal your lucky numbers!',
    gradientColors: JSON.stringify(['#065f46', '#0f766e']),
  },
];

const SETTINGS = [
  { key: 'payments_enabled', value: 'false', description: 'Enable Stripe payment flow' },
  { key: 'max_recipients', value: '5', description: 'Maximum recipients per gift' },
  { key: 'email_from_address', value: 'noreply@luck-gift.haimazar.us', description: 'From address for gift emails' },
  { key: 'email_from_name', value: 'Lucky Gift', description: 'From name for gift emails' },
  { key: 'site_name', value: 'Lucky Gift', description: 'Site display name' },
  { key: 'gift_price_cents', value: '1000', description: 'Price in cents when payments enabled' },
];

async function seed() {
  const now = Date.now();

  for (const game of GAMES) {
    await db
      .insert(lotteryGames)
      .values(game)
      .onConflictDoNothing();
  }

  for (const template of TEMPLATES) {
    await db
      .insert(messageTemplates)
      .values(template)
      .onConflictDoNothing();
  }

  for (const setting of SETTINGS) {
    await db
      .insert(settings)
      .values({ ...setting, updatedAt: now })
      .onConflictDoNothing();
  }

  console.log('Seed data inserted successfully');
  sqlite.close();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

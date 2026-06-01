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

const HOLIDAY_TEMPLATES = [
  {
    occasionKey: 'new_years_day',
    displayName: "New Year's Day",
    emoji: '🥂',
    defaultMessage: "Cheers to a lucky new year! May these numbers bring fortune in the year ahead! 🥂",
    greetingHtml:
      "<p>Happy New Year, <strong>{{recipient_name}}</strong>! 🥂</p><p>{{sender_name}} is wishing you a lucky year ahead!</p><p><em>{{message}}</em></p>",
    revealButtonText: 'Reveal your lucky numbers!',
    gradientColors: JSON.stringify(['#4b5563', '#c9a227']),
  },
  {
    occasionKey: 'mlk_day',
    displayName: 'MLK Jr. Day',
    emoji: '✊',
    defaultMessage: "Honoring a great legacy — may these lucky numbers inspire hope and possibility! ✊",
    greetingHtml:
      "<p>Happy MLK Jr. Day, <strong>{{recipient_name}}</strong>! ✊</p><p>{{sender_name}} is honoring the dream with you!</p><p><em>{{message}}</em></p>",
    revealButtonText: 'Reveal your lucky numbers!',
    gradientColors: JSON.stringify(['#1e3a5f', '#1d4ed8']),
  },
  {
    occasionKey: 'valentines_day',
    displayName: "Valentine's Day",
    emoji: '💝',
    defaultMessage: "Sending you love and luck this Valentine's Day! 💝",
    greetingHtml:
      "<p>Happy Valentine's Day, <strong>{{recipient_name}}</strong>! 💝</p><p>{{sender_name}} is sending you love and luck!</p><p><em>{{message}}</em></p>",
    revealButtonText: 'Reveal your lucky numbers!',
    gradientColors: JSON.stringify(['#9f1239', '#ec4899']),
  },
  {
    occasionKey: 'presidents_day',
    displayName: "Presidents' Day",
    emoji: '🦅',
    defaultMessage: "Celebrating American history with a lucky gift just for you! 🦅",
    greetingHtml:
      "<p>Happy Presidents' Day, <strong>{{recipient_name}}</strong>! 🦅</p><p>{{sender_name}} sent you a lucky gift!</p><p><em>{{message}}</em></p>",
    revealButtonText: 'Reveal your lucky numbers!',
    gradientColors: JSON.stringify(['#1e3a5f', '#dc2626']),
  },
  {
    occasionKey: 'st_patricks_day',
    displayName: "St. Patrick's Day",
    emoji: '🍀',
    defaultMessage: "The luck of the Irish is with you today! 🍀",
    greetingHtml:
      "<p>Happy St. Patrick's Day, <strong>{{recipient_name}}</strong>! 🍀</p><p>{{sender_name}} is sharing the luck of the Irish!</p><p><em>{{message}}</em></p>",
    revealButtonText: 'Reveal your lucky numbers!',
    gradientColors: JSON.stringify(['#14532d', '#16a34a']),
  },
  {
    occasionKey: 'easter',
    displayName: 'Easter',
    emoji: '🐣',
    defaultMessage: "Wishing you a joyful and lucky Easter! 🐣",
    greetingHtml:
      "<p>Happy Easter, <strong>{{recipient_name}}</strong>! 🐣</p><p>{{sender_name}} is wishing you a lucky season!</p><p><em>{{message}}</em></p>",
    revealButtonText: 'Reveal your lucky numbers!',
    gradientColors: JSON.stringify(['#7c3aed', '#f59e0b']),
  },
  {
    occasionKey: 'memorial_day',
    displayName: 'Memorial Day',
    emoji: '🇺🇸',
    defaultMessage: "Honoring those who served — enjoy a little luck this Memorial Day! 🇺🇸",
    greetingHtml:
      "<p>Happy Memorial Day, <strong>{{recipient_name}}</strong>! 🇺🇸</p><p>{{sender_name}} honors those who served alongside you!</p><p><em>{{message}}</em></p>",
    revealButtonText: 'Reveal your lucky numbers!',
    gradientColors: JSON.stringify(['#1e3a5f', '#dc2626']),
  },
  {
    occasionKey: 'juneteenth',
    displayName: 'Juneteenth',
    emoji: '✊🏿',
    defaultMessage: "Celebrating freedom and luck this Juneteenth! ✊🏿",
    greetingHtml:
      "<p>Happy Juneteenth, <strong>{{recipient_name}}</strong>! ✊🏿</p><p>{{sender_name}} is celebrating freedom with you!</p><p><em>{{message}}</em></p>",
    revealButtonText: 'Reveal your lucky numbers!',
    gradientColors: JSON.stringify(['#dc2626', '#16a34a']),
  },
  {
    occasionKey: 'independence_day',
    displayName: 'Independence Day',
    emoji: '🎆',
    defaultMessage: "Happy 4th of July! May freedom and fortune be yours! 🎆",
    greetingHtml:
      "<p>Happy 4th of July, <strong>{{recipient_name}}</strong>! 🎆</p><p>{{sender_name}} is celebrating freedom with a lucky gift!</p><p><em>{{message}}</em></p>",
    revealButtonText: 'Reveal your lucky numbers!',
    gradientColors: JSON.stringify(['#1e3a5f', '#dc2626']),
  },
  {
    occasionKey: 'labor_day',
    displayName: 'Labor Day',
    emoji: '💪',
    defaultMessage: "You work hard — let luck do the work today! Happy Labor Day! 💪",
    greetingHtml:
      "<p>Happy Labor Day, <strong>{{recipient_name}}</strong>! 💪</p><p>{{sender_name}} thinks you deserve some luck today!</p><p><em>{{message}}</em></p>",
    revealButtonText: 'Reveal your lucky numbers!',
    gradientColors: JSON.stringify(['#1e40af', '#0284c7']),
  },
  {
    occasionKey: 'columbus_day',
    displayName: 'Columbus Day',
    emoji: '⚓',
    defaultMessage: "Exploring new fortunes this Columbus Day! ⚓",
    greetingHtml:
      "<p>Happy Columbus Day, <strong>{{recipient_name}}</strong>! ⚓</p><p>{{sender_name}} sent you a lucky gift to discover!</p><p><em>{{message}}</em></p>",
    revealButtonText: 'Reveal your lucky numbers!',
    gradientColors: JSON.stringify(['#7c2d12', '#b45309']),
  },
  {
    occasionKey: 'halloween',
    displayName: 'Halloween',
    emoji: '🎃',
    defaultMessage: "Trick or treat — these lucky numbers are a treat just for you! 🎃",
    greetingHtml:
      "<p>Happy Halloween, <strong>{{recipient_name}}</strong>! 🎃</p><p>{{sender_name}} has a treat for you — no tricks!</p><p><em>{{message}}</em></p>",
    revealButtonText: 'Reveal your lucky numbers!',
    gradientColors: JSON.stringify(['#7c2d12', '#d97706']),
  },
  {
    occasionKey: 'veterans_day',
    displayName: 'Veterans Day',
    emoji: '🎖️',
    defaultMessage: "To those who served — a lucky thank you on Veterans Day! 🎖️",
    greetingHtml:
      "<p>Happy Veterans Day, <strong>{{recipient_name}}</strong>! 🎖️</p><p>{{sender_name}} thanks you for your service!</p><p><em>{{message}}</em></p>",
    revealButtonText: 'Reveal your lucky numbers!',
    gradientColors: JSON.stringify(['#1e3a5f', '#dc2626']),
  },
  {
    occasionKey: 'thanksgiving',
    displayName: 'Thanksgiving',
    emoji: '🦃',
    defaultMessage: "Grateful for you — here are some lucky numbers to give thanks for! 🦃",
    greetingHtml:
      "<p>Happy Thanksgiving, <strong>{{recipient_name}}</strong>! 🦃</p><p>{{sender_name}} is grateful for you!</p><p><em>{{message}}</em></p>",
    revealButtonText: 'Reveal your lucky numbers!',
    gradientColors: JSON.stringify(['#7c2d12', '#b45309']),
  },
  {
    occasionKey: 'christmas',
    displayName: 'Christmas',
    emoji: '🎄',
    defaultMessage: "Wishing you a magical and lucky Christmas! 🎄",
    greetingHtml:
      "<p>Merry Christmas, <strong>{{recipient_name}}</strong>! 🎄</p><p>{{sender_name}} wishes you a magical and lucky holiday!</p><p><em>{{message}}</em></p>",
    revealButtonText: 'Reveal your lucky numbers!',
    gradientColors: JSON.stringify(['#166534', '#dc2626']),
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

  for (const template of [...TEMPLATES, ...HOLIDAY_TEMPLATES]) {
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

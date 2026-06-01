import type { OccasionTemplate } from './types';

type HolidayRule =
  | { type: 'fixed'; month: number; day: number }
  | { type: 'nth_weekday'; month: number; weekday: number; n: number } // weekday: 0=Sun..6=Sat, n: 1=first..-1=last
  | { type: 'easter' };

interface HolidayDefinition extends OccasionTemplate {
  rule: HolidayRule;
}

// Meeus/Jones/Butcher algorithm for Easter Sunday
function getEasterDate(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1; // 0-based
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month, day);
}

// Returns the nth occurrence of a weekday in a given month/year. n=-1 means last.
function getNthWeekday(year: number, month: number, weekday: number, n: number): Date {
  if (n > 0) {
    const first = new Date(year, month - 1, 1);
    const diff = (weekday - first.getDay() + 7) % 7;
    return new Date(year, month - 1, 1 + diff + (n - 1) * 7);
  }
  // last occurrence
  const last = new Date(year, month, 0); // last day of month
  const diff = (last.getDay() - weekday + 7) % 7;
  return new Date(year, month - 1, last.getDate() - diff);
}

function getHolidayDate(def: HolidayDefinition, year: number): Date {
  const { rule } = def;
  if (rule.type === 'fixed') return new Date(year, rule.month - 1, rule.day);
  if (rule.type === 'easter') return getEasterDate(year);
  return getNthWeekday(year, rule.month, rule.weekday, rule.n);
}

const HOLIDAY_DEFINITIONS: HolidayDefinition[] = [
  {
    occasionKey: 'new_years_day',
    displayName: "New Year's Day",
    emoji: '🥂',
    defaultMessage: "Cheers to a lucky new year! May these numbers bring fortune in the year ahead! 🥂",
    revealButtonText: 'Reveal your lucky numbers!',
    gradientColors: ['#4b5563', '#c9a227'],
    rule: { type: 'fixed', month: 1, day: 1 },
  },
  {
    occasionKey: 'mlk_day',
    displayName: 'MLK Jr. Day',
    emoji: '✊',
    defaultMessage: "Honoring a great legacy — may these lucky numbers inspire hope and possibility! ✊",
    revealButtonText: 'Reveal your lucky numbers!',
    gradientColors: ['#1e3a5f', '#1d4ed8'],
    rule: { type: 'nth_weekday', month: 1, weekday: 1, n: 3 },
  },
  {
    occasionKey: 'valentines_day',
    displayName: "Valentine's Day",
    emoji: '💝',
    defaultMessage: "Sending you love and luck this Valentine's Day! 💝",
    revealButtonText: 'Reveal your lucky numbers!',
    gradientColors: ['#9f1239', '#ec4899'],
    rule: { type: 'fixed', month: 2, day: 14 },
  },
  {
    occasionKey: 'presidents_day',
    displayName: "Presidents' Day",
    emoji: '🦅',
    defaultMessage: "Celebrating American history with a lucky gift just for you! 🦅",
    revealButtonText: 'Reveal your lucky numbers!',
    gradientColors: ['#1e3a5f', '#dc2626'],
    rule: { type: 'nth_weekday', month: 2, weekday: 1, n: 3 },
  },
  {
    occasionKey: 'st_patricks_day',
    displayName: "St. Patrick's Day",
    emoji: '🍀',
    defaultMessage: "The luck of the Irish is with you today! 🍀",
    revealButtonText: 'Reveal your lucky numbers!',
    gradientColors: ['#14532d', '#16a34a'],
    rule: { type: 'fixed', month: 3, day: 17 },
  },
  {
    occasionKey: 'easter',
    displayName: 'Easter',
    emoji: '🐣',
    defaultMessage: "Wishing you a joyful and lucky Easter! 🐣",
    revealButtonText: 'Reveal your lucky numbers!',
    gradientColors: ['#7c3aed', '#f59e0b'],
    rule: { type: 'easter' },
  },
  {
    occasionKey: 'memorial_day',
    displayName: 'Memorial Day',
    emoji: '🇺🇸',
    defaultMessage: "Honoring those who served — enjoy a little luck this Memorial Day! 🇺🇸",
    revealButtonText: 'Reveal your lucky numbers!',
    gradientColors: ['#1e3a5f', '#dc2626'],
    rule: { type: 'nth_weekday', month: 5, weekday: 1, n: -1 },
  },
  {
    occasionKey: 'juneteenth',
    displayName: 'Juneteenth',
    emoji: '✊🏿',
    defaultMessage: "Celebrating freedom and luck this Juneteenth! ✊🏿",
    revealButtonText: 'Reveal your lucky numbers!',
    gradientColors: ['#dc2626', '#16a34a'],
    rule: { type: 'fixed', month: 6, day: 19 },
  },
  {
    occasionKey: 'independence_day',
    displayName: 'Independence Day',
    emoji: '🎆',
    defaultMessage: "Happy 4th of July! May freedom and fortune be yours! 🎆",
    revealButtonText: 'Reveal your lucky numbers!',
    gradientColors: ['#1e3a5f', '#dc2626'],
    rule: { type: 'fixed', month: 7, day: 4 },
  },
  {
    occasionKey: 'labor_day',
    displayName: 'Labor Day',
    emoji: '💪',
    defaultMessage: "You work hard — let luck do the work today! Happy Labor Day! 💪",
    revealButtonText: 'Reveal your lucky numbers!',
    gradientColors: ['#1e40af', '#0284c7'],
    rule: { type: 'nth_weekday', month: 9, weekday: 1, n: 1 },
  },
  {
    occasionKey: 'columbus_day',
    displayName: 'Columbus Day',
    emoji: '⚓',
    defaultMessage: "Exploring new fortunes this Columbus Day! ⚓",
    revealButtonText: 'Reveal your lucky numbers!',
    gradientColors: ['#7c2d12', '#b45309'],
    rule: { type: 'nth_weekday', month: 10, weekday: 1, n: 2 },
  },
  {
    occasionKey: 'halloween',
    displayName: 'Halloween',
    emoji: '🎃',
    defaultMessage: "Trick or treat — these lucky numbers are a treat just for you! 🎃",
    revealButtonText: 'Reveal your lucky numbers!',
    gradientColors: ['#7c2d12', '#d97706'],
    rule: { type: 'fixed', month: 10, day: 31 },
  },
  {
    occasionKey: 'veterans_day',
    displayName: 'Veterans Day',
    emoji: '🎖️',
    defaultMessage: "To those who served — a lucky thank you on Veterans Day! 🎖️",
    revealButtonText: 'Reveal your lucky numbers!',
    gradientColors: ['#1e3a5f', '#dc2626'],
    rule: { type: 'fixed', month: 11, day: 11 },
  },
  {
    occasionKey: 'thanksgiving',
    displayName: 'Thanksgiving',
    emoji: '🦃',
    defaultMessage: "Grateful for you — here are some lucky numbers to give thanks for! 🦃",
    revealButtonText: 'Reveal your lucky numbers!',
    gradientColors: ['#7c2d12', '#b45309'],
    rule: { type: 'nth_weekday', month: 11, weekday: 4, n: 4 },
  },
  {
    occasionKey: 'christmas',
    displayName: 'Christmas',
    emoji: '🎄',
    defaultMessage: "Wishing you a magical and lucky Christmas! 🎄",
    revealButtonText: 'Reveal your lucky numbers!',
    gradientColors: ['#166534', '#dc2626'],
    rule: { type: 'fixed', month: 12, day: 25 },
  },
];

export const HOLIDAY_TEMPLATES: OccasionTemplate[] = HOLIDAY_DEFINITIONS.map(
  ({ rule: _rule, ...template }) => template,
);

export const ALL_HOLIDAY_KEYS: string[] = HOLIDAY_DEFINITIONS.map((h) => h.occasionKey);

export function getHolidayTemplate(key: string): OccasionTemplate | undefined {
  return HOLIDAY_TEMPLATES.find((h) => h.occasionKey === key);
}

export function getNextHoliday(from: Date = new Date()): { template: OccasionTemplate; date: Date } {
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());

  let nearest: { template: OccasionTemplate; date: Date } | null = null;

  for (const def of HOLIDAY_DEFINITIONS) {
    for (const yearOffset of [0, 1]) {
      const year = today.getFullYear() + yearOffset;
      const date = getHolidayDate(def, year);
      if (date >= today) {
        if (!nearest || date < nearest.date) {
          const { rule: _rule, ...template } = def;
          nearest = { template, date };
        }
        break; // found the next occurrence for this holiday, move on
      }
    }
  }

  // Fallback — should never happen as we check year+1 above
  const christmasDef = HOLIDAY_DEFINITIONS.find((d) => d.occasionKey === 'christmas')!;
  const { rule: _rule, ...fallbackTemplate } = christmasDef;
  return nearest ?? { template: fallbackTemplate, date: new Date(today.getFullYear(), 11, 25) };
}

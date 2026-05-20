import type { OccasionTemplate } from './types';

export const OCCASIONS: OccasionTemplate[] = [
  {
    occasionKey: 'birthday',
    displayName: 'Birthday',
    emoji: '🎂',
    defaultMessage:
      'Wishing you a wonderful birthday filled with joy and luck! 🎂',
    revealButtonText: 'Reveal your lucky numbers!',
    gradientColors: ['#6b21a8', '#db2777'],
  },
  {
    occasionKey: 'anniversary',
    displayName: 'Anniversary',
    emoji: '💍',
    defaultMessage:
      'Celebrating your special day with a little extra luck! 💍',
    revealButtonText: 'Reveal your lucky numbers!',
    gradientColors: ['#be185d', '#dc2626'],
  },
  {
    occasionKey: 'holiday',
    displayName: 'Holiday',
    emoji: '🎄',
    defaultMessage: "Season's greetings and all the luck for the new year! 🎄",
    revealButtonText: 'Reveal your lucky numbers!',
    gradientColors: ['#166534', '#15803d'],
  },
  {
    occasionKey: 'mothers_fathers_day',
    displayName: "Mother's/Father's Day",
    emoji: '💛',
    defaultMessage:
      'To the luckiest parent in the world — these numbers are for you! 💛',
    revealButtonText: 'Reveal your lucky numbers!',
    gradientColors: ['#b45309', '#d97706'],
  },
  {
    occasionKey: 'no_reason',
    displayName: 'Just Because',
    emoji: '🍀',
    defaultMessage:
      'Just because — sending you some lucky numbers to brighten your day! 🍀',
    revealButtonText: 'Reveal your lucky numbers!',
    gradientColors: ['#065f46', '#0f766e'],
  },
];

export function getOccasion(occasionKey: string): OccasionTemplate | undefined {
  return OCCASIONS.find((o) => o.occasionKey === occasionKey);
}

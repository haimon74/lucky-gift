import { describe, it, expect } from 'vitest';
import { getNextHoliday, getHolidayTemplate, ALL_HOLIDAY_KEYS } from '../holidays.js';

/** Convenience: build a local-midnight Date from year/month/day (1-based month). */
function d(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day);
}

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------

describe('ALL_HOLIDAY_KEYS', () => {
  it('contains exactly 15 holidays', () => {
    expect(ALL_HOLIDAY_KEYS).toHaveLength(15);
  });

  it('includes every expected key', () => {
    const expected = [
      'new_years_day', 'mlk_day', 'valentines_day', 'presidents_day',
      'st_patricks_day', 'easter', 'memorial_day', 'juneteenth',
      'independence_day', 'labor_day', 'columbus_day', 'halloween',
      'veterans_day', 'thanksgiving', 'christmas',
    ];
    for (const key of expected) {
      expect(ALL_HOLIDAY_KEYS).toContain(key);
    }
  });
});

describe('getHolidayTemplate', () => {
  it('returns a template for every key in ALL_HOLIDAY_KEYS', () => {
    for (const key of ALL_HOLIDAY_KEYS) {
      const t = getHolidayTemplate(key);
      expect(t, `missing template for ${key}`).toBeDefined();
      expect(t!.occasionKey).toBe(key);
    }
  });

  it('returns the correct emoji for a known holiday', () => {
    expect(getHolidayTemplate('halloween')!.emoji).toBe('🎃');
    expect(getHolidayTemplate('christmas')!.emoji).toBe('🎄');
    expect(getHolidayTemplate('valentines_day')!.emoji).toBe('💝');
  });

  it('returns undefined for an unknown key', () => {
    expect(getHolidayTemplate('unknown_holiday')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Floating holiday exact dates — 2025
// ---------------------------------------------------------------------------

describe('Floating holiday dates — 2025', () => {
  // MLK: 3rd Monday in January
  it('MLK Jr. Day 2025 is January 20', () => {
    // from Jan 2 the very next holiday should be MLK on Jan 20
    const { occasionKey, date } = asResult(getNextHoliday(d(2025, 1, 2)));
    expect(occasionKey).toBe('mlk_day');
    expect(date).toEqual(d(2025, 1, 20));
  });

  // Presidents' Day: 3rd Monday in February
  it("Presidents' Day 2025 is February 17", () => {
    const { occasionKey, date } = asResult(getNextHoliday(d(2025, 2, 15)));
    expect(occasionKey).toBe('presidents_day');
    expect(date).toEqual(d(2025, 2, 17));
  });

  // Easter 2025: April 20 (Meeus/Jones/Butcher)
  it('Easter 2025 is April 20', () => {
    const { occasionKey, date } = asResult(getNextHoliday(d(2025, 3, 18)));
    expect(occasionKey).toBe('easter');
    expect(date).toEqual(d(2025, 4, 20));
  });

  // Memorial Day: last Monday in May — May 26, 2025
  it('Memorial Day 2025 is May 26', () => {
    const { occasionKey, date } = asResult(getNextHoliday(d(2025, 4, 21)));
    expect(occasionKey).toBe('memorial_day');
    expect(date).toEqual(d(2025, 5, 26));
  });

  // Labor Day: 1st Monday in September — Sep 1, 2025
  it('Labor Day 2025 is September 1', () => {
    const { occasionKey, date } = asResult(getNextHoliday(d(2025, 7, 5)));
    expect(occasionKey).toBe('labor_day');
    expect(date).toEqual(d(2025, 9, 1));
  });

  // Columbus Day: 2nd Monday in October — Oct 13, 2025
  it('Columbus Day 2025 is October 13', () => {
    const { occasionKey, date } = asResult(getNextHoliday(d(2025, 9, 2)));
    expect(occasionKey).toBe('columbus_day');
    expect(date).toEqual(d(2025, 10, 13));
  });

  // Thanksgiving: 4th Thursday in November — Nov 27, 2025
  it('Thanksgiving 2025 is November 27', () => {
    const { occasionKey, date } = asResult(getNextHoliday(d(2025, 11, 12)));
    expect(occasionKey).toBe('thanksgiving');
    expect(date).toEqual(d(2025, 11, 27));
  });
});

// ---------------------------------------------------------------------------
// Floating holiday exact dates — 2026
// ---------------------------------------------------------------------------

describe('Floating holiday dates — 2026', () => {
  // MLK: 3rd Monday in January — Jan 19, 2026
  it('MLK Jr. Day 2026 is January 19', () => {
    const { occasionKey, date } = asResult(getNextHoliday(d(2026, 1, 2)));
    expect(occasionKey).toBe('mlk_day');
    expect(date).toEqual(d(2026, 1, 19));
  });

  // Presidents' Day: 3rd Monday in February — Feb 16, 2026
  it("Presidents' Day 2026 is February 16", () => {
    const { occasionKey, date } = asResult(getNextHoliday(d(2026, 2, 15)));
    expect(occasionKey).toBe('presidents_day');
    expect(date).toEqual(d(2026, 2, 16));
  });

  // Easter 2026: April 5
  it('Easter 2026 is April 5', () => {
    const { occasionKey, date } = asResult(getNextHoliday(d(2026, 3, 18)));
    expect(occasionKey).toBe('easter');
    expect(date).toEqual(d(2026, 4, 5));
  });

  // Memorial Day: last Monday in May — May 25, 2026
  it('Memorial Day 2026 is May 25', () => {
    const { occasionKey, date } = asResult(getNextHoliday(d(2026, 4, 6)));
    expect(occasionKey).toBe('memorial_day');
    expect(date).toEqual(d(2026, 5, 25));
  });

  // Labor Day: 1st Monday in September — Sep 7, 2026
  it('Labor Day 2026 is September 7', () => {
    const { occasionKey, date } = asResult(getNextHoliday(d(2026, 7, 5)));
    expect(occasionKey).toBe('labor_day');
    expect(date).toEqual(d(2026, 9, 7));
  });

  // Columbus Day: 2nd Monday in October — Oct 12, 2026
  it('Columbus Day 2026 is October 12', () => {
    const { occasionKey, date } = asResult(getNextHoliday(d(2026, 9, 8)));
    expect(occasionKey).toBe('columbus_day');
    expect(date).toEqual(d(2026, 10, 12));
  });

  // Thanksgiving: 4th Thursday in November — Nov 26, 2026
  it('Thanksgiving 2026 is November 26', () => {
    const { occasionKey, date } = asResult(getNextHoliday(d(2026, 11, 12)));
    expect(occasionKey).toBe('thanksgiving');
    expect(date).toEqual(d(2026, 11, 26));
  });
});

// ---------------------------------------------------------------------------
// Full sequential walk — 2025
// Each case: from day after previous holiday → returns correct next holiday.
// ---------------------------------------------------------------------------

describe('getNextHoliday — sequential walk 2025', () => {
  const cases: Array<{ from: Date; key: string; date: Date }> = [
    { from: d(2024, 12, 31), key: 'new_years_day',    date: d(2025,  1,  1) },
    { from: d(2025,  1,  2), key: 'mlk_day',           date: d(2025,  1, 20) },
    { from: d(2025,  1, 21), key: 'valentines_day',    date: d(2025,  2, 14) },
    { from: d(2025,  2, 15), key: 'presidents_day',    date: d(2025,  2, 17) },
    { from: d(2025,  2, 18), key: 'st_patricks_day',   date: d(2025,  3, 17) },
    { from: d(2025,  3, 18), key: 'easter',             date: d(2025,  4, 20) },
    { from: d(2025,  4, 21), key: 'memorial_day',       date: d(2025,  5, 26) },
    { from: d(2025,  5, 27), key: 'juneteenth',         date: d(2025,  6, 19) },
    { from: d(2025,  6, 20), key: 'independence_day',  date: d(2025,  7,  4) },
    { from: d(2025,  7,  5), key: 'labor_day',          date: d(2025,  9,  1) },
    { from: d(2025,  9,  2), key: 'columbus_day',       date: d(2025, 10, 13) },
    { from: d(2025, 10, 14), key: 'halloween',          date: d(2025, 10, 31) },
    { from: d(2025, 11,  1), key: 'veterans_day',       date: d(2025, 11, 11) },
    { from: d(2025, 11, 12), key: 'thanksgiving',       date: d(2025, 11, 27) },
    { from: d(2025, 11, 28), key: 'christmas',          date: d(2025, 12, 25) },
  ];

  for (const { from, key, date } of cases) {
    it(`from ${fmtDate(from)} → ${key} on ${fmtDate(date)}`, () => {
      const result = asResult(getNextHoliday(from));
      expect(result.occasionKey).toBe(key);
      expect(result.date).toEqual(date);
    });
  }
});

// ---------------------------------------------------------------------------
// Full sequential walk — 2026
// ---------------------------------------------------------------------------

describe('getNextHoliday — sequential walk 2026', () => {
  const cases: Array<{ from: Date; key: string; date: Date }> = [
    { from: d(2025, 12, 26), key: 'new_years_day',    date: d(2026,  1,  1) },
    { from: d(2026,  1,  2), key: 'mlk_day',           date: d(2026,  1, 19) },
    { from: d(2026,  1, 20), key: 'valentines_day',    date: d(2026,  2, 14) },
    { from: d(2026,  2, 15), key: 'presidents_day',    date: d(2026,  2, 16) },
    { from: d(2026,  2, 17), key: 'st_patricks_day',   date: d(2026,  3, 17) },
    { from: d(2026,  3, 18), key: 'easter',             date: d(2026,  4,  5) },
    { from: d(2026,  4,  6), key: 'memorial_day',       date: d(2026,  5, 25) },
    { from: d(2026,  5, 26), key: 'juneteenth',         date: d(2026,  6, 19) },
    { from: d(2026,  6, 20), key: 'independence_day',  date: d(2026,  7,  4) },
    { from: d(2026,  7,  5), key: 'labor_day',          date: d(2026,  9,  7) },
    { from: d(2026,  9,  8), key: 'columbus_day',       date: d(2026, 10, 12) },
    { from: d(2026, 10, 13), key: 'halloween',          date: d(2026, 10, 31) },
    { from: d(2026, 11,  1), key: 'veterans_day',       date: d(2026, 11, 11) },
    { from: d(2026, 11, 12), key: 'thanksgiving',       date: d(2026, 11, 26) },
    { from: d(2026, 11, 27), key: 'christmas',          date: d(2026, 12, 25) },
  ];

  for (const { from, key, date } of cases) {
    it(`from ${fmtDate(from)} → ${key} on ${fmtDate(date)}`, () => {
      const result = asResult(getNextHoliday(from));
      expect(result.occasionKey).toBe(key);
      expect(result.date).toEqual(date);
    });
  }
});

// ---------------------------------------------------------------------------
// Boundary: today IS a holiday
// ---------------------------------------------------------------------------

describe('getNextHoliday — today is the holiday', () => {
  it('returns New Year\'s Day when called on Jan 1', () => {
    const result = asResult(getNextHoliday(d(2025, 1, 1)));
    expect(result.occasionKey).toBe('new_years_day');
    expect(result.date).toEqual(d(2025, 1, 1));
  });

  it('returns Christmas when called on Dec 25', () => {
    const result = asResult(getNextHoliday(d(2025, 12, 25)));
    expect(result.occasionKey).toBe('christmas');
    expect(result.date).toEqual(d(2025, 12, 25));
  });

  it('returns Halloween when called on Oct 31', () => {
    const result = asResult(getNextHoliday(d(2025, 10, 31)));
    expect(result.occasionKey).toBe('halloween');
    expect(result.date).toEqual(d(2025, 10, 31));
  });

  it('returns MLK Day when called on the exact date', () => {
    const result = asResult(getNextHoliday(d(2025, 1, 20)));
    expect(result.occasionKey).toBe('mlk_day');
    expect(result.date).toEqual(d(2025, 1, 20));
  });

  it('returns Thanksgiving when called on the exact date', () => {
    const result = asResult(getNextHoliday(d(2025, 11, 27)));
    expect(result.occasionKey).toBe('thanksgiving');
    expect(result.date).toEqual(d(2025, 11, 27));
  });

  it('returns Easter 2025 when called on Apr 20 2025', () => {
    const result = asResult(getNextHoliday(d(2025, 4, 20)));
    expect(result.occasionKey).toBe('easter');
    expect(result.date).toEqual(d(2025, 4, 20));
  });
});

// ---------------------------------------------------------------------------
// Year rollover
// ---------------------------------------------------------------------------

describe('getNextHoliday — year rollover', () => {
  it('from Dec 26 returns New Year\'s Day of the following year', () => {
    const result = asResult(getNextHoliday(d(2025, 12, 26)));
    expect(result.occasionKey).toBe('new_years_day');
    expect(result.date).toEqual(d(2026, 1, 1));
  });

  it('from Dec 31 returns New Year\'s Day of the following year', () => {
    const result = asResult(getNextHoliday(d(2025, 12, 31)));
    expect(result.occasionKey).toBe('new_years_day');
    expect(result.date).toEqual(d(2026, 1, 1));
  });

  it('from Dec 26 2026 returns New Year\'s Day 2027', () => {
    const result = asResult(getNextHoliday(d(2026, 12, 26)));
    expect(result.occasionKey).toBe('new_years_day');
    expect(result.date).toEqual(d(2027, 1, 1));
  });
});

// ---------------------------------------------------------------------------
// Template round-trip: returned key has a valid template with a defaultMessage
// ---------------------------------------------------------------------------

describe('getNextHoliday — returned template completeness', () => {
  const testDates: Date[] = [
    d(2025, 1, 2), d(2025, 2, 18), d(2025, 4, 21),
    d(2025, 7, 5), d(2025, 10, 14), d(2025, 11, 28),
  ];

  for (const from of testDates) {
    it(`template returned from ${fmtDate(from)} has all required fields`, () => {
      const { template } = getNextHoliday(from);
      expect(template.occasionKey).toBeTruthy();
      expect(template.displayName).toBeTruthy();
      expect(template.emoji).toBeTruthy();
      expect(template.defaultMessage).toBeTruthy();
      expect(template.gradientColors).toHaveLength(2);
    });
  }
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function asResult(r: ReturnType<typeof getNextHoliday>) {
  return { occasionKey: r.template.occasionKey, date: r.date, template: r.template };
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

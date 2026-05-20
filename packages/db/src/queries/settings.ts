import { eq } from 'drizzle-orm';
import { db } from '../client';
import { settings } from '../schema';
import type { SettingEntry } from '@lucky-gift/shared';

export function getAllSettings(): SettingEntry[] {
  const rows = db.select().from(settings).all();
  return rows.map((r) => ({
    key: r.key,
    value: r.value,
    description: r.description ?? undefined,
  }));
}

export function getSetting(key: string): string | null {
  const row = db.select().from(settings).where(eq(settings.key, key)).get();
  return row?.value ?? null;
}

export function updateSetting(key: string, value: string): void {
  db.update(settings)
    .set({ value, updatedAt: Date.now() })
    .where(eq(settings.key, key))
    .run();
}

export function updateSettings(entries: { key: string; value: string }[]): void {
  for (const entry of entries) {
    updateSetting(entry.key, entry.value);
  }
}

/**
 * Server-side settings cache.
 * Reads from the SQLite settings table and caches values for 60 seconds.
 * Import only in server-side code (API routes, server components).
 */
import { getSetting } from '@lucky-gift/db';

interface CacheEntry {
  value: string;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const TTL_MS = 60_000;

export function getSettingValue(key: string): string | null {
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && cached.expiresAt > now) return cached.value;

  const value = getSetting(key);
  if (value !== null) {
    cache.set(key, { value, expiresAt: now + TTL_MS });
  }
  return value;
}

export function isPaymentsEnabled(): boolean {
  return getSettingValue('payments_enabled') === 'true';
}

export function getMaxRecipients(): number {
  const v = getSettingValue('max_recipients');
  if (!v) return 5;
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : 5;
}

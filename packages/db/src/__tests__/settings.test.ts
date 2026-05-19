import { describe, it, expect, beforeEach } from 'vitest';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as schema from '../schema.js';
import { eq } from 'drizzle-orm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsFolder = join(__dirname, '..', '..', 'drizzle');

function createTestDb() {
  const sqlite = new Database(':memory:');
  const db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder });
  return { db, sqlite };
}

function seedSettings(db: ReturnType<typeof createTestDb>['db']) {
  const now = Date.now();
  db.insert(schema.settings).values([
    { key: 'payments_enabled', value: 'false', description: 'Enable payments', updatedAt: now },
    { key: 'max_recipients', value: '5', description: 'Max recipients', updatedAt: now },
  ]).run();
}

describe('settings queries', () => {
  let db: ReturnType<typeof createTestDb>['db'];

  beforeEach(() => {
    ({ db } = createTestDb());
    seedSettings(db);
  });

  it('retrieves a seeded setting value', () => {
    const row = db.select().from(schema.settings).where(eq(schema.settings.key, 'max_recipients')).get();
    expect(row?.value).toBe('5');
  });

  it('returns undefined for unknown key', () => {
    const row = db.select().from(schema.settings).where(eq(schema.settings.key, 'nonexistent')).get();
    expect(row).toBeUndefined();
  });

  it('updates a setting value', () => {
    db.update(schema.settings)
      .set({ value: 'true', updatedAt: Date.now() })
      .where(eq(schema.settings.key, 'payments_enabled'))
      .run();

    const row = db.select().from(schema.settings).where(eq(schema.settings.key, 'payments_enabled')).get();
    expect(row?.value).toBe('true');
  });

  it('batch updates multiple settings', () => {
    const updates = [
      { key: 'payments_enabled', value: 'true' },
      { key: 'max_recipients', value: '3' },
    ];
    for (const u of updates) {
      db.update(schema.settings)
        .set({ value: u.value, updatedAt: Date.now() })
        .where(eq(schema.settings.key, u.key))
        .run();
    }

    const pe = db.select().from(schema.settings).where(eq(schema.settings.key, 'payments_enabled')).get();
    const mr = db.select().from(schema.settings).where(eq(schema.settings.key, 'max_recipients')).get();
    expect(pe?.value).toBe('true');
    expect(mr?.value).toBe('3');
  });
});

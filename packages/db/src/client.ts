import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { mkdirSync } from 'fs';
import { dirname } from 'path';
import * as schema from './schema.js';

const DATABASE_URL = process.env['DATABASE_URL'] ?? './data/lucky-gift.db';

function createClient(url: string) {
  if (url !== ':memory:') {
    try {
      mkdirSync(dirname(url), { recursive: true });
    } catch {
      // directory already exists
    }
  }
  const sqlite = new Database(url);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  const db = drizzle(sqlite, { schema });
  return { db, sqlite };
}

const { db, sqlite } = createClient(DATABASE_URL);

export { db, sqlite, createClient };
export type DbType = typeof db;

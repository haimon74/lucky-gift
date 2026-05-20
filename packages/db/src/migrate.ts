import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { sqlite, db } from './client';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsFolder = join(__dirname, '..', 'drizzle');

migrate(db, { migrationsFolder });
console.log('Migrations applied successfully');
sqlite.close();

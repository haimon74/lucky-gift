import type { Config } from 'drizzle-kit';

export default {
  dialect: 'sqlite',
  schema: './src/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env['DATABASE_URL'] ?? './data/lucky-gift.db',
  },
} satisfies Config;

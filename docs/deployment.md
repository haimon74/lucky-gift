# Lucky Gift — Deployment

## Environment

**Domain:** `luck-gift.haimazar.us`
**Platform:** Node 20 LTS
**Database:** SQLite file (`apps/web/data/lucky-gift.db`)

---

## Environment Variables

Create `apps/web/.env.local` (never commit):

```env
# Database
DATABASE_URL=./data/lucky-gift.db

# Email (Brevo)
BREVO_API_KEY=your_brevo_api_key_here

# Public base URL
NEXT_PUBLIC_BASE_URL=https://luck-gift.haimazar.us

# Admin credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2b$10$...   # bcrypt hash of "Lucky1!"

# Stripe (Phase 2 - leave blank until payments_enabled)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

---

## Local Development

```bash
# Install dependencies
pnpm install

# Run database migrations + seed
pnpm --filter @lucky-gift/db run migrate
pnpm --filter @lucky-gift/db run seed

# Start all apps in dev mode
pnpm dev

# Web only
pnpm --filter web dev

# Mobile only (requires Expo CLI)
pnpm --filter mobile start
```

---

## Build

```bash
# Build all packages and apps
pnpm build

# Build web only
pnpm --filter web build
```

---

## Database Migrations

```bash
# Generate new migration after schema changes
pnpm --filter @lucky-gift/db run generate

# Apply migrations
pnpm --filter @lucky-gift/db run migrate

# Reset and reseed (development only)
pnpm --filter @lucky-gift/db run seed:reset
```

---

## Production Deployment (VPS/Server)

1. Clone repo, run `pnpm install --frozen-lockfile`
2. Set environment variables
3. Run `pnpm build`
4. Run migrations: `pnpm --filter @lucky-gift/db run migrate`
5. Run seeds (first deploy only): `pnpm --filter @lucky-gift/db run seed`
6. Start: `pnpm --filter web start`
7. Configure nginx/caddy reverse proxy to port 3000
8. Point `luck-gift.haimazar.us` DNS to server

---

## Vercel Deployment (Alternative)

1. Connect GitHub repo to Vercel
2. Set `apps/web` as root directory
3. Add all environment variables in Vercel dashboard
4. **Note:** SQLite doesn't work on Vercel serverless — use Turso (LibSQL) or switch to Postgres for Vercel deployment

---

## Mobile (Expo)

```bash
# Development build
pnpm --filter mobile start

# iOS
pnpm --filter mobile ios

# Android
pnpm --filter mobile android

# EAS Build (production)
eas build --platform all
```

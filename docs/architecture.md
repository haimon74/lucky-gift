# Lucky Gift — Architecture

## Monorepo Layout

```
lucky-gift/
├── apps/
│   ├── web/                   # Next.js 15 — web frontend + API
│   └── mobile/                # Expo (React Native) — iOS & Android
├── packages/
│   ├── shared/                # Shared business logic & types
│   ├── ui/                    # Shared React component primitives (web)
│   └── db/                    # Drizzle ORM schema, migrations, seed
├── docs/                      # Project documentation
├── tasks/                     # Implementation task files
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Monorepo | pnpm workspaces + Turborepo |
| Web frontend | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4 |
| Mobile | Expo SDK 51+, React Native, TypeScript |
| Shared logic | TypeScript package (`@lucky-gift/shared`) |
| Shared UI | React component library (`@lucky-gift/ui`) |
| Database | SQLite via Drizzle ORM + better-sqlite3 |
| Email | Brevo (Sendinblue) REST API |
| Payments | Stripe (Phase 2, scaffolded + gated) |
| Validation | Zod |
| Testing | Vitest (unit), Playwright (e2e web) |
| Node | 20 LTS |

## Package Responsibilities

### `@lucky-gift/shared`
- Lottery game definitions (Powerball, Mega Millions, Millionaire for Life)
- Mulberry32 PRNG for deterministic number generation
- Seed generation algorithm (hash → seed number)
- TypeScript interfaces shared across all apps
- Zod validation schemas for forms and API payloads
- Occasion definitions and default messages
- Utility functions (hash creation, formatting)

### `@lucky-gift/db`
- Drizzle schema for all tables
- Database client singleton
- Migration files
- Seed data scripts (lottery_games, message_templates, default settings)
- Query helpers / typed repository functions

### `@lucky-gift/ui`
- Shared React components used in the web app
- Button, Card, Input, Badge, Spinner etc.
- Tailwind-based, dark-theme-first
- NOT used by React Native (mobile has its own components)

### `apps/web` (Next.js 15)
- Page routes: `/`, `/reveal/[giftId]`, `/settings`
- API routes: `/api/gifts`, `/api/reveal/[giftId]`, `/api/admin/login`, `/api/settings`, `/api/webhooks/stripe`
- Tailwind dark theme with gold accent palette
- localStorage persistence for wizard state
- Server Components + Client Components as appropriate

### `apps/mobile` (Expo)
- React Navigation stack
- Full wizard flow screens
- Gift reveal screen
- Uses `@lucky-gift/shared` for all lottery logic

## Data Flow: Sending a Gift

```
User fills wizard (web/mobile)
        ↓
POST /api/gifts
        ↓
1. Validate payload (Zod)
2. Generate gift UUID
3. For each recipient: generate reveal_token (UUID v4)
4. INSERT gifts row
5. INSERT gift_recipients rows (one per recipient)
6. Send Brevo email to each recipient with reveal link
        ↓
Gift saved, emails sent
```

## Data Flow: Revealing a Gift

```
Recipient clicks link: /reveal/{giftId}?t={revealToken}
        ↓
GET /api/reveal/[giftId]?t={token}
        ↓
1. Validate giftId + token match in gift_recipients
2. Return gift metadata (game, occasion, message, sender, createdAt)
        ↓
Client-side: mulberry32(seed) generates deterministic lucky numbers
(seed = hash of giftId + recipientEmail + createdAt timestamp)
        ↓
Animated reveal of lucky numbers
```

## URL Structure

- **Reveal URL**: `https://luck-gift.haimazar.us/reveal/{giftId}?t={revealToken}`
- **Settings**: `https://luck-gift.haimazar.us/settings`

## Theme

- Background: `#0a0a0f` (near-black)
- Surface: `#12121a`
- Gold accent: `#c9a227` / `#f0c040`
- Text primary: `#f5f5f0`
- Red (envelope): `#c0392b` (vermilion)
- Gradient: deep navy → midnight purple → dark gold

## Environment Variables

```
# apps/web/.env.local
DATABASE_URL=./data/lucky-gift.db
BREVO_API_KEY=...
NEXT_PUBLIC_BASE_URL=https://luck-gift.haimazar.us
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=...   # bcrypt of "Lucky1!"
STRIPE_SECRET_KEY=...     # Phase 2
STRIPE_WEBHOOK_SECRET=... # Phase 2
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=... # Phase 2
```

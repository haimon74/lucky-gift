# Lucky Gift — Database Schema

Database: SQLite via Drizzle ORM (`better-sqlite3`)
Location: `apps/web/data/lucky-gift.db`

---

## Tables

### `lottery_games` (static seed data)

| Column | Type | Description |
|--------|------|-------------|
| id | integer PK autoincrement | |
| game_id | text UNIQUE NOT NULL | e.g. `"PWR"`, `"MML"`, `"MFL"` |
| name | text NOT NULL | e.g. `"Powerball"` |
| main_count | integer NOT NULL | Number of main balls to pick |
| main_min | integer NOT NULL | Min value for main balls |
| main_max | integer NOT NULL | Max value for main balls |
| bonus_count | integer NOT NULL | Number of bonus balls (0 if none) |
| bonus_min | integer | Min value for bonus ball (nullable) |
| bonus_max | integer | Max value for bonus ball (nullable) |
| bonus_name | text | e.g. `"Powerball"`, `"Mega Ball"`, `"Millionaire Ball"` |
| notes | text | Optional notes |

**Seed data:**
```
PWR  | Powerball            | main: 5 × [1–69]  | bonus: 1 × [1–26]  | bonus_name: Powerball
MML  | Mega Millions        | main: 5 × [1–70]  | bonus: 1 × [1–24]  | bonus_name: Mega Ball
MFL  | Millionaire for Life | main: 5 × [1–58]  | bonus: 1 × [1–5]   | bonus_name: Millionaire Ball
```

---

### `message_templates` (static seed data)

| Column | Type | Description |
|--------|------|-------------|
| id | integer PK autoincrement | |
| occasion_key | text UNIQUE NOT NULL | e.g. `"birthday"`, `"anniversary"` |
| display_name | text NOT NULL | e.g. `"Birthday"` |
| emoji | text NOT NULL | e.g. `"🎂"` |
| default_message | text NOT NULL | Default message text shown in wizard |
| greeting_html | text NOT NULL | HTML template with `{{recipient_name}}`, `{{sender_name}}`, `{{message}}` placeholders |
| reveal_button_text | text NOT NULL | e.g. `"Reveal your lucky Powerball numbers!"` |
| gradient_colors | text NOT NULL | JSON array of CSS gradient colors for card background |

**Occasions:** birthday, anniversary, holiday, mothers_fathers_day, no_reason

---

### `gifts`

| Column | Type | Description |
|--------|------|-------------|
| id | text PK | UUID v4, generated server-side |
| game_id | text NOT NULL | FK → lottery_games.game_id |
| occasion_key | text NOT NULL | FK → message_templates.occasion_key |
| message | text | Custom message (max 500 chars) |
| sender_name | text NOT NULL | Name shown on the gift |
| sender_email | text NOT NULL | Sender's email address |
| amount_paid_cents | integer NOT NULL DEFAULT 0 | 0 until payments enabled |
| stripe_session_id | text UNIQUE | Null until payments enabled |
| stripe_payment_status | text NOT NULL DEFAULT 'free' | `'free'`, `'pending'`, `'paid'`, `'failed'` |
| created_at | integer NOT NULL | Unix timestamp (milliseconds) |

---

### `gift_recipients`

| Column | Type | Description |
|--------|------|-------------|
| id | integer PK autoincrement | |
| gift_id | text NOT NULL | FK → gifts.id |
| recipient_name | text NOT NULL | |
| recipient_email | text NOT NULL | |
| recipient_phone | text | Optional phone number |
| reveal_token | text UNIQUE NOT NULL | UUID v4 — used in reveal URL |
| seed_hash | text NOT NULL | Hex string used as mulberry32 seed (derived from gift_id + recipient_email + created_at) |
| is_revealed | integer NOT NULL DEFAULT 0 | Boolean (0/1) |
| revealed_at | integer | Unix timestamp when first revealed |

**Index:** `(gift_id, recipient_email)` UNIQUE

---

### `settings`

| Column | Type | Description |
|--------|------|-------------|
| id | integer PK autoincrement | |
| key | text UNIQUE NOT NULL | Setting key |
| value | text NOT NULL | Setting value (stored as string) |
| description | text | Human-readable description |
| updated_at | integer NOT NULL | Unix timestamp |

**Default settings:**
| Key | Default Value | Description |
|-----|---------------|-------------|
| `payments_enabled` | `"false"` | Enable/disable Stripe payment flow |
| `max_recipients` | `"5"` | Max recipients per gift |
| `email_from_address` | `"noreply@luck-gift.haimazar.us"` | From address for gift emails |
| `email_from_name` | `"Lucky Gift"` | From name for gift emails |
| `site_name` | `"Lucky Gift"` | Site display name |
| `gift_price_cents` | `"1000"` | Price in cents when payments enabled |

---

### `admin_sessions`

| Column | Type | Description |
|--------|------|-------------|
| id | text PK | UUID v4 session token |
| created_at | integer NOT NULL | Unix timestamp |
| expires_at | integer NOT NULL | Unix timestamp (24h TTL) |

---

## Seed Generation Algorithm

The `seed_hash` stored per recipient is used client-side to generate deterministic lottery numbers via mulberry32:

```
input  = gift_id + ":" + recipient_email + ":" + created_at_ms
hash   = SHA-256(input) → first 8 hex chars → parseInt(hex, 16)
seed   = resulting 32-bit unsigned integer
```

The `reveal_token` (UUID v4) is separate — it authenticates the reveal URL. The `seed_hash` drives number generation deterministically.

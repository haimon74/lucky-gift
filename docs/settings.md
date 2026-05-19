# Lucky Gift — Admin Settings

## Route: `/settings`

Protected admin page for managing application configuration.

---

## Authentication

- **Credentials:** username `admin`, password `Lucky1!`
- **Login endpoint:** `POST /api/admin/login`
- **Session:** UUID v4 token stored in `admin_sessions` table, 24-hour TTL
- **Client storage:** sessionToken stored in `sessionStorage` (not localStorage — cleared on tab close)
- **Auth check:** All settings API calls include `Authorization: Bearer {sessionToken}` header

### Login Flow
1. Visit `/settings` → redirect to `/settings/login` if no session token
2. Submit credentials → `POST /api/admin/login`
3. On success: store token in sessionStorage, redirect to `/settings`
4. On failure: show "Invalid credentials" error

---

## Settings UI

### Layout
- Dark theme card with gold header
- Table of settings with inline editing
- Each row: Key | Description | Current Value | Edit button
- "Save Changes" button (batch save all pending changes)
- Logout button

### Editable Settings

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `payments_enabled` | boolean toggle | `false` | Enable Stripe payment flow |
| `max_recipients` | number (1–10) | `5` | Maximum recipients per gift |
| `email_from_address` | email input | `noreply@luck-gift.haimazar.us` | From address for gift emails |
| `email_from_name` | text input | `Lucky Gift` | From name for gift emails |
| `site_name` | text input | `Lucky Gift` | Site display name |
| `gift_price_cents` | number input | `1000` | Price in cents (used when payments enabled) |

---

## Adding New Settings

To add a new setting:
1. Add a row to the `settings` table seed in `packages/db/src/seed.ts`
2. Add a migration if needed
3. The settings page automatically picks up all rows from the `settings` table

---

## Security Notes

- Admin credentials are environment-variable backed (`ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`)
- Password is bcrypt-hashed; comparison uses `bcryptjs`
- Sessions expire after 24 hours
- Settings API validates session token on every request
- The `/settings` route uses middleware to check for valid session before rendering

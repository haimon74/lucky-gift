# Lucky Gift — API Reference

Base URL: `https://luck-gift.haimazar.us/api`

All request/response bodies are JSON. Errors follow `{ error: string, details?: any }`.

---

## POST /api/gifts

Create a new gift, save all recipients, and send reveal emails.

**Request Body:**
```json
{
  "gameId": "PWR",
  "occasionKey": "birthday",
  "message": "Wishing you all the luck in the world!",
  "senderName": "Jane",
  "senderEmail": "jane@example.com",
  "recipients": [
    {
      "name": "John",
      "email": "john@example.com",
      "phone": "+15551234567"
    }
  ]
}
```

**Validation:**
- `gameId`: must exist in `lottery_games`
- `occasionKey`: must exist in `message_templates`
- `message`: max 500 chars
- `senderName`: required, max 100 chars
- `senderEmail`: valid email
- `recipients`: 1–5 items, each with valid email, unique emails within array

**Response 201:**
```json
{
  "giftId": "uuid-v4",
  "recipientCount": 1,
  "emailsSent": 1
}
```

**Response 402** (when `payments_enabled = "true"` and payment not completed):
```json
{ "error": "Payment required", "checkoutUrl": "https://stripe.com/..." }
```

---

## GET /api/reveal/[giftId]?t={revealToken}

Fetch gift reveal data for a recipient. Used by the reveal page.

**Query Params:**
- `t`: the recipient's `reveal_token`

**Response 200:**
```json
{
  "gift": {
    "id": "uuid",
    "gameId": "PWR",
    "occasionKey": "birthday",
    "message": "Wishing you all the luck!",
    "senderName": "Jane",
    "senderEmail": "jane@example.com",
    "createdAt": 1716000000000
  },
  "recipient": {
    "name": "John",
    "email": "john@example.com",
    "seedHash": "a1b2c3d4",
    "isRevealed": false
  },
  "game": {
    "gameId": "PWR",
    "name": "Powerball",
    "mainCount": 5,
    "mainMin": 1,
    "mainMax": 69,
    "bonusCount": 1,
    "bonusMin": 1,
    "bonusMax": 26,
    "bonusName": "Powerball"
  },
  "template": {
    "occasionKey": "birthday",
    "displayName": "Birthday",
    "emoji": "🎂",
    "greetingHtml": "<p>Happy Birthday {{recipient_name}}!...</p>",
    "revealButtonText": "Reveal your lucky Powerball numbers!"
  }
}
```

**Response 404:** `{ "error": "Gift not found" }`
**Response 410:** `{ "error": "Invalid or expired reveal token" }`

**Side effect:** marks `gift_recipients.is_revealed = true` and sets `revealed_at` on first access.

---

## POST /api/admin/login

Authenticate as admin for the settings page.

**Request Body:**
```json
{ "username": "admin", "password": "Lucky1!" }
```

**Response 200:**
```json
{ "sessionToken": "uuid-v4", "expiresAt": 1716086400000 }
```

**Response 401:** `{ "error": "Invalid credentials" }`

---

## GET /api/settings

Get all settings (admin only).

**Headers:** `Authorization: Bearer {sessionToken}`

**Response 200:**
```json
{
  "settings": [
    { "key": "payments_enabled", "value": "false", "description": "Enable Stripe payment flow" },
    { "key": "max_recipients", "value": "5", "description": "Max recipients per gift" }
  ]
}
```

---

## PUT /api/settings

Update one or more settings (admin only).

**Headers:** `Authorization: Bearer {sessionToken}`

**Request Body:**
```json
{
  "settings": [
    { "key": "payments_enabled", "value": "true" },
    { "key": "max_recipients", "value": "3" }
  ]
}
```

**Response 200:** `{ "updated": 2 }`

---

## POST /api/webhooks/stripe  *(Phase 2 — scaffolded)*

Stripe webhook handler. Verifies Stripe signature and updates `gifts.stripe_payment_status`.

**Headers:** `stripe-signature: ...`

**Events handled:**
- `checkout.session.completed` → set status to `'paid'`, trigger email sending
- `checkout.session.expired` → set status to `'failed'`

**Response 200:** `{ "received": true }`

---

## GET /api/health

Simple liveness check.

**Response 200:** `{ "status": "ok", "timestamp": 1716000000000 }`

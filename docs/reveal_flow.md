# Lucky Gift — Reveal Flow

## Reveal URL Format

```
https://luck-gift.haimazar.us/reveal/{giftId}?t={revealToken}
```

- `giftId` — UUID of the gift record
- `t` — UUID v4 reveal token unique to the recipient (from `gift_recipients.reveal_token`)

---

## Recipient Email

**Visual design:** Chinese red envelope (vermilion `#c0392b`) aesthetic

**Email content:**
- Subject: "You've received a Lucky Gift from {senderName}! 🍀"
- Background: vermilion red (`#c0392b`)
- Gold border/ornament decoration
- Large text: "You have a Lucky Gift! 🎁"
- Sender name displayed
- Big gold CTA button: **"Open Gift"**
- Button links to the reveal URL

---

## Reveal Page (`/reveal/[giftId]`)

### Before Reveal

1. Page loads, fetches gift data from `GET /api/reveal/[giftId]?t={token}`
2. If invalid token → show "This gift link is invalid or has expired" error page
3. If valid:
   - Show occasion visual (large emoji + gradient background matching occasion)
   - Show personalized greeting HTML (with recipient/sender names interpolated)
   - Custom message from sender
   - Large gold button at bottom: **"Reveal your lucky [Game Name] numbers! 🎰"**

### Reveal Animation

On button click:
1. Button fades out
2. Star/fairy dust particle animation triggers (CSS keyframes + JS canvas or pure CSS)
3. Lucky number balls appear one by one with a pop-in animation:
   - Main numbers: white balls with black number
   - Bonus ball: colored per game (red for Powerball, gold for Mega Millions, diamond/teal for Millionaire for Life)
4. Sound effect: cheerful chime/sparkle sound (Web Audio API, short clip)
5. "✨ Your Lucky Numbers ✨" heading fades in above balls
6. Numbers stay visible

### Number Generation (Client-Side)

Uses mulberry32 PRNG with a deterministic seed:

```ts
// Seed derivation (matches server-side seed_hash)
function deriveSeed(seedHash: string): number {
  return parseInt(seedHash.slice(0, 8), 16);
}

// Mulberry32 PRNG
function mulberry32(seed: number) {
  return function(): number {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Pick unique numbers in range [min, max]
function pickNumbers(rng: () => number, count: number, min: number, max: number): number[] {
  const pool = Array.from({ length: max - min + 1 }, (_, i) => i + min);
  const picked: number[] = [];
  while (picked.length < count) {
    const idx = Math.floor(rng() * pool.length);
    picked.push(pool.splice(idx, 1)[0]);
  }
  return picked.sort((a, b) => a - b);
}
```

The `seedHash` comes from the API response and was computed server-side as:
```
SHA-256(giftId + ":" + recipientEmail + ":" + createdAtMs)
→ take first 8 hex chars
```

### After Reveal

Below the lucky numbers:

- "🔗 Send a lucky gift back to {senderName}"
  - Links to: `/?prefill={"senderName": "{originalSenderName}", "senderEmail": "{originalSenderEmail}", "gameId": "{sameGameId}"}`
  - Pre-fills the wizard with the original sender as recipient

### Revealed State

- `gift_recipients.is_revealed` is set to `true` on first API call
- On subsequent visits, gift is still shown with numbers (not hidden after reveal)
- The "Reveal" button is replaced with "🎰 Your Lucky Numbers" heading directly

---

## Error States

| Condition | Display |
|-----------|---------|
| Invalid giftId | "This gift link is invalid." |
| Invalid/mismatched token | "This reveal link is not valid." |
| Gift not found | "This gift has expired or doesn't exist." |
| Network error | "Unable to load your gift. Please try again." |

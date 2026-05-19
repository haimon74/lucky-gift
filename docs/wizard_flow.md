# Lucky Gift — Wizard Flow

The gift creation wizard is a 3-step multi-page form (4 steps when payments are enabled).
State persists in `localStorage` until submission.

---

## Step 1: Choose Game & Occasion

**URL:** `/` (wizard step 1)

**Elements:**
- Header: "Send Lucky Numbers" with gold gradient
- **Lottery Game selector** (3 cards with game name, ball visual, description):
  - 🔴 Powerball — 5 white balls (1–69) + 1 red (1–26)
  - 🟡 Mega Millions — 5 white balls (1–70) + 1 gold (1–24)
  - 💎 Millionaire for Life — 5 white balls (1–58) + 1 diamond (1–5)
- **Occasion selector** (pill/chip buttons):
  - 🎂 Birthday | 💍 Anniversary | 🎄 Holiday | 👨‍👩‍👧 Mother/Father's Day | 🍀 No Reason
- **Live Mini-Preview**: As user selects game + occasion, a small card shows how the gift envelope will look (occasion emoji, background gradient, occasion name)
- **Continue →** button (gold, disabled until both selections made)

**LocalStorage key:** `lucky_gift_step1`

---

## Step 2: Your Message

**URL:** `/` (wizard step 2)

**Elements:**
- **Occasion visual**: Large emoji in a colorful gradient card matching the occasion
- **Message textarea**: 
  - Pre-filled with default message for selected occasion
  - Max 500 characters, live character counter
  - Placeholder changes per occasion
- **Live Preview**: Full gift card preview updates in real-time as user types
  - Shows: occasion emoji, occasion gradient background, message text
  - Mobile-sized card preview (simulates what recipient sees)
- **← Back** button | **Continue →** button

**Default messages by occasion:**
- Birthday: "Wishing you a wonderful birthday filled with joy and luck! 🎂"
- Anniversary: "Celebrating your special day with a little extra luck! 💍"
- Holiday: "Season's greetings and all the luck for the new year! 🎄"
- Mother/Father's Day: "To the luckiest parent in the world — these numbers are for you! 💛"
- No Reason: "Just because — sending you some lucky numbers to brighten your day! 🍀"

**LocalStorage key:** `lucky_gift_step2`

---

## Step 3: Recipients & Sender

**URL:** `/` (wizard step 3)

**Elements:**
- **"Who Gets Lucky?"** section — recipient cards (1 to max_recipients):
  - Each card: Name (required), Email (required), Phone (optional)
  - "+ Add another recipient" button (disabled at max)
  - Remove (×) button per card (min 1 required)
- **"From" section** — sender details:
  - Your Name (required)
  - Your Email (required, used as reply-to on gift emails)
- **← Back** button | **Send Gift** button (or **Pay & Send** when payments enabled)
  - Send Gift is gold, labeled "Send Lucky Numbers — Free!" in Phase 1

**LocalStorage key:** `lucky_gift_step3`

---

## Step 4: Payment *(gated behind `payments_enabled = "true"`)*

**URL:** `/` (wizard step 4) or redirect to Stripe Checkout

**Elements:**
- Order summary: game, occasion, # of recipients, price ($10.00 flat)
- **Pay with Card** button → opens Stripe Checkout session
- **Pay with PayPal** button (future)
- **← Back** button

After Stripe success redirect:
- Show "🎉 Gift Sent!" confirmation screen
- Display: "Your lucky numbers have been sent to {n} recipient(s)"
- CTA: "Send Another Gift"

---

## Success Screen

After successful submission (free or paid):

- Animated confetti / star burst
- "🎉 Your Lucky Gift Has Been Sent!"
- List of recipients notified
- "Send Another Gift" button (clears localStorage, resets to step 1)

---

## Wizard State (localStorage schema)

```ts
interface WizardState {
  step: 1 | 2 | 3 | 4;
  gameId: string | null;
  occasionKey: string | null;
  message: string;
  senderName: string;
  senderEmail: string;
  recipients: Array<{
    id: string;         // local UUID for React key
    name: string;
    email: string;
    phone: string;
  }>;
}
```

Key: `lucky_gift_wizard_state`
Cleared on: successful submission

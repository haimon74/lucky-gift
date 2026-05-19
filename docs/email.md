# Lucky Gift — Email Integration

## Provider: Brevo (formerly Sendinblue)

**Plan:** Free tier (300 emails/day)
**SDK:** `@getbrevo/brevo` Node.js SDK or Brevo REST API via `fetch`
**Auth:** API key via `BREVO_API_KEY` environment variable

---

## Gift Reveal Email

Sent to each recipient when a gift is created.

**From:** `{email_from_name} <{email_from_address}>` (from settings)
**Reply-To:** sender's email address
**Subject:** `You've received a Lucky Gift from {senderName}! 🍀`

### HTML Template

Red envelope design:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#8B0000;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="500" style="max-width:500px;background-color:#c0392b;border-radius:12px;border:4px solid #f0c040;box-shadow:0 8px 32px rgba(0,0,0,0.5);">
          <!-- Gold top ornament -->
          <tr>
            <td align="center" style="padding:24px 0 8px;font-size:48px;">🧧</td>
          </tr>
          <!-- Title -->
          <tr>
            <td align="center" style="padding:8px 32px;color:#f0c040;font-size:28px;font-weight:bold;letter-spacing:2px;">
              Lucky Gift
            </td>
          </tr>
          <!-- Subtitle -->
          <tr>
            <td align="center" style="padding:4px 32px 16px;color:#ffd700;font-size:16px;">
              {senderName} sent you something special ✨
            </td>
          </tr>
          <!-- Divider -->
          <tr>
            <td style="padding:0 32px;"><hr style="border:1px solid rgba(240,192,64,0.4);"></td>
          </tr>
          <!-- Message preview -->
          <tr>
            <td align="center" style="padding:24px 40px;color:#fff5e0;font-size:18px;line-height:1.6;font-style:italic;">
              "{messagePreview}"
            </td>
          </tr>
          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding:8px 32px 40px;">
              <a href="{revealUrl}"
                 style="display:inline-block;background:linear-gradient(135deg,#f0c040,#c9a227);color:#1a0a00;font-size:20px;font-weight:bold;padding:18px 48px;border-radius:50px;text-decoration:none;letter-spacing:1px;box-shadow:0 4px 16px rgba(240,192,64,0.4);">
                🎁 Open Gift
              </a>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding:0 32px 24px;color:rgba(255,245,224,0.6);font-size:12px;">
              This lucky gift was sent via Lucky Gift · luck-gift.haimazar.us
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

**Variables:**
- `{senderName}` — from `gifts.sender_name`
- `{messagePreview}` — first 100 chars of `gifts.message`
- `{revealUrl}` — `https://luck-gift.haimazar.us/reveal/{giftId}?t={revealToken}`

---

## Brevo API Call

```ts
import { TransactionalEmailsApi, SendSmtpEmail } from '@getbrevo/brevo';

const client = new TransactionalEmailsApi();
client.setApiKey(0, process.env.BREVO_API_KEY!);

const email: SendSmtpEmail = {
  sender: { name: fromName, email: fromAddress },
  replyTo: { email: senderEmail },
  to: [{ name: recipientName, email: recipientEmail }],
  subject: `You've received a Lucky Gift from ${senderName}! 🍀`,
  htmlContent: buildGiftEmailHtml({ senderName, messagePreview, revealUrl }),
};

await client.sendTransacEmail(email);
```

---

## Error Handling

- If Brevo API fails for one recipient, log the error and continue sending to others
- Return `emailsSent` count in the API response (may be less than `recipientCount` on partial failure)
- Do NOT roll back the gift record if email sending fails — gift is still saved

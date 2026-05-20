/**
 * Brevo (Sendinblue) email helper.
 * Uses Brevo REST API v3 via fetch — no SDK to avoid CJS/ESM issues.
 * Import only in server-side code (API routes).
 */
import { getSettingValue } from './settings-cache';

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

export interface GiftEmailParams {
  senderName: string;
  messagePreview: string;
  revealUrl: string;
}

export interface SendGiftEmailParams {
  recipientName: string;
  recipientEmail: string;
  senderName: string;
  senderEmail: string;
  message: string;
  revealUrl: string;
}

export function buildGiftEmailHtml({ senderName, messagePreview, revealUrl }: GiftEmailParams): string {
  const preview = messagePreview.slice(0, 100);
  return `<!DOCTYPE html>
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
          <tr>
            <td align="center" style="padding:24px 0 8px;font-size:48px;">&#x1F9E7;</td>
          </tr>
          <tr>
            <td align="center" style="padding:8px 32px;color:#f0c040;font-size:28px;font-weight:bold;letter-spacing:2px;">
              Lucky Gift
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:4px 32px 16px;color:#ffd700;font-size:16px;">
              ${escapeHtml(senderName)} sent you something special &#x2728;
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px;"><hr style="border:1px solid rgba(240,192,64,0.4);"></td>
          </tr>
          <tr>
            <td align="center" style="padding:24px 40px;color:#fff5e0;font-size:18px;line-height:1.6;font-style:italic;">
              &ldquo;${escapeHtml(preview)}&rdquo;
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:8px 32px 40px;">
              <a href="${escapeHtml(revealUrl)}"
                 style="display:inline-block;background:linear-gradient(135deg,#f0c040,#c9a227);color:#1a0a00;font-size:20px;font-weight:bold;padding:18px 48px;border-radius:50px;text-decoration:none;letter-spacing:1px;box-shadow:0 4px 16px rgba(240,192,64,0.4);">
                &#x1F381; Open Gift
              </a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 32px 24px;color:rgba(255,245,224,0.6);font-size:12px;">
              This lucky gift was sent via Lucky Gift &middot; luck-gift.haimazar.us
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export async function sendGiftEmail({
  recipientName,
  recipientEmail,
  senderName,
  senderEmail,
  message,
  revealUrl,
}: SendGiftEmailParams): Promise<boolean> {
  const apiKey = process.env['BREVO_API_KEY'];
  if (!apiKey) {
    console.log('Email skipped: BREVO_API_KEY not configured');
    return false;
  }

  const fromAddress = getSettingValue('email_from_address') ?? 'noreply@luck-gift.haimazar.us';
  const fromName = getSettingValue('email_from_name') ?? 'Lucky Gift';

  const htmlContent = buildGiftEmailHtml({
    senderName,
    messagePreview: message,
    revealUrl,
  });

  const payload = {
    sender: { name: fromName, email: fromAddress },
    replyTo: { email: senderEmail, name: senderName },
    to: [{ name: recipientName, email: recipientEmail }],
    subject: `You've received a Lucky Gift from ${senderName}! 🍀`,
    htmlContent,
  };

  try {
    const res = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error(`Brevo API error ${res.status}: ${body}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Brevo fetch error:', err);
    return false;
  }
}

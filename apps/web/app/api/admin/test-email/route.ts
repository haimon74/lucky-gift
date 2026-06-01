/**
 * POST /api/admin/test-email
 * Sends a test email and returns the full Brevo API response.
 * Protected — requires admin session. Remove or gate in production.
 */
import { getSession } from '@lucky-gift/db';
import { getSettingValue } from '@/lib/settings-cache';

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

export async function POST(request: Request) {
  // Auth check
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '') ?? '';
  const session = token ? await getSession(token) : null;
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env['BREVO_API_KEY'];
  if (!apiKey) {
    return Response.json({
      ok: false,
      step: 'config',
      error: 'BREVO_API_KEY is not set in environment variables',
    }, { status: 200 });
  }

  let body: { to?: string };
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const fromAddress = getSettingValue('email_from_address') ?? 'noreply@luck-gift.haimazar.us';
  const fromName = getSettingValue('email_from_name') ?? 'Lucky Gift';
  const toAddress = body.to ?? fromAddress; // default: send to self

  const payload = {
    sender: { name: fromName, email: fromAddress },
    to: [{ name: 'Test Recipient', email: toAddress }],
    subject: '✅ Lucky Gift — Email Test',
    htmlContent: `
      <div style="font-family:sans-serif;padding:24px;background:#0a0a0f;color:#f5f5f0;">
        <h2 style="color:#f0c040;">🍀 Lucky Gift email test</h2>
        <p>If you received this, Brevo is configured correctly.</p>
        <p style="color:#6b6b80;font-size:12px;">
          Sent from: ${fromAddress}<br>
          API key prefix: ${apiKey.slice(0, 12)}...
        </p>
      </div>
    `,
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

    const responseText = await res.text();
    let responseJson: unknown;
    try { responseJson = JSON.parse(responseText); } catch { responseJson = responseText; }

    return Response.json({
      ok: res.ok,
      step: 'brevo_api',
      httpStatus: res.status,
      from: fromAddress,
      to: toAddress,
      brevoResponse: responseJson,
    });
  } catch (err) {
    return Response.json({
      ok: false,
      step: 'network',
      error: String(err),
    });
  }
}

import { getSession, getAllSettings, updateSettings } from '@lucky-gift/db';
import { settingsUpdateSchema } from '@lucky-gift/shared';

function getToken(request: Request): string | null {
  const auth = request.headers.get('Authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  // Also check cookie
  const cookie = request.headers.get('Cookie') ?? '';
  const match = cookie.match(/lucky_gift_admin_session=([^;]+)/);
  return match?.[1] ?? null;
}

function validateSession(request: Request): boolean {
  const token = getToken(request);
  if (!token) return false;
  const session = getSession(token);
  return session !== null;
}

export async function GET(request: Request) {
  if (!validateSession(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const settings = getAllSettings();
    return Response.json({ settings });
  } catch (err) {
    console.error('Failed to get settings:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!validateSession(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = settingsUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    updateSettings(parsed.data.settings);
    return Response.json({ updated: parsed.data.settings.length });
  } catch (err) {
    console.error('Failed to update settings:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

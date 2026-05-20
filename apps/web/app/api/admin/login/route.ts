import bcrypt from 'bcryptjs';
import { createSession } from '@lucky-gift/db';

// Hardcoded fallback (pre-hashed "Lucky1!")
const FALLBACK_USERNAME = 'admin';
const FALLBACK_PASSWORD = 'Lucky1!';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { username, password } = body as { username?: string; password?: string };

  if (!username || !password) {
    return Response.json({ error: 'Missing credentials' }, { status: 400 });
  }

  const envUser = process.env['ADMIN_USERNAME'];
  const envHash = process.env['ADMIN_PASSWORD_HASH'];

  let valid = false;
  if (envUser && envHash) {
    valid = username === envUser && await bcrypt.compare(password, envHash);
  } else {
    // Development fallback
    valid = username === FALLBACK_USERNAME && password === FALLBACK_PASSWORD;
  }

  if (!valid) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const sessionToken = crypto.randomUUID();
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

  try {
    createSession(sessionToken);
  } catch (err) {
    console.error('Failed to create session:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }

  return Response.json({ sessionToken, expiresAt });
}

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from '@/app/api/admin/login/route';

vi.mock('@lucky-gift/db', () => ({
  createSession: vi.fn(),
  getSession: vi.fn(),
  deleteSession: vi.fn(),
  deleteExpiredSessions: vi.fn(),
  getAllSettings: vi.fn(() => []),
  updateSettings: vi.fn(),
  getSetting: vi.fn(() => null),
  createGift: vi.fn(),
  createGiftRecipient: vi.fn(),
  getGiftWithRecipient: vi.fn(),
  markRevealed: vi.fn(),
}));

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/admin/login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it('returns 200 with sessionToken on correct fallback credentials', async () => {
    const res = await POST(makeRequest({ username: 'admin', password: 'Lucky1!' }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.sessionToken).toBeDefined();
    expect(data.expiresAt).toBeGreaterThan(Date.now());
  });

  it('returns 401 on wrong password', async () => {
    const res = await POST(makeRequest({ username: 'admin', password: 'wrongpassword' }));
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toMatch(/invalid/i);
  });

  it('returns 401 on wrong username', async () => {
    const res = await POST(makeRequest({ username: 'hacker', password: 'Lucky1!' }));
    expect(res.status).toBe(401);
  });

  it('creates session in DB on successful login', async () => {
    const { createSession } = await import('@lucky-gift/db');
    await POST(makeRequest({ username: 'admin', password: 'Lucky1!' }));
    expect(createSession).toHaveBeenCalledOnce();
  });

  it('returns 400 for missing credentials', async () => {
    const res = await POST(makeRequest({ username: 'admin' }));
    expect(res.status).toBe(400);
  });
});

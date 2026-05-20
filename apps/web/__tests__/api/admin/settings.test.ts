import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, PUT } from '@/app/api/settings/route';

const MOCK_SETTINGS = [
  { key: 'payments_enabled', value: 'false', description: 'Enable payments' },
  { key: 'max_recipients', value: '5', description: 'Max recipients' },
];

vi.mock('@lucky-gift/db', () => ({
  getAllSettings: vi.fn(() => MOCK_SETTINGS),
  updateSettings: vi.fn(),
  getSetting: vi.fn(() => null),
  getSession: vi.fn(),
  createSession: vi.fn(),
  deleteSession: vi.fn(),
  deleteExpiredSessions: vi.fn(),
  createGift: vi.fn(),
  createGiftRecipient: vi.fn(),
  getGiftWithRecipient: vi.fn(),
  markRevealed: vi.fn(),
}));

function makeRequest(method: string, headers: Record<string, string> = {}, body?: unknown): Request {
  return new Request('http://localhost/api/settings', {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

describe('GET /api/settings', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 without valid token', async () => {
    const { getSession } = await import('@lucky-gift/db');
    vi.mocked(getSession).mockReturnValue(null);
    const res = await GET(makeRequest('GET'));
    expect(res.status).toBe(401);
  });

  it('returns 200 with settings array on valid token', async () => {
    const { getSession } = await import('@lucky-gift/db');
    vi.mocked(getSession).mockReturnValue({ expiresAt: Date.now() + 3600000 });
    const res = await GET(makeRequest('GET', { Authorization: 'Bearer valid-token' }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.settings)).toBe(true);
    expect(data.settings.length).toBe(2);
  });
});

describe('PUT /api/settings', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 with invalid token', async () => {
    const { getSession } = await import('@lucky-gift/db');
    vi.mocked(getSession).mockReturnValue(null);
    const res = await PUT(makeRequest('PUT', {}, { settings: [{ key: 'max_recipients', value: '3' }] }));
    expect(res.status).toBe(401);
  });

  it('updates settings and returns 200 with count', async () => {
    const { getSession, updateSettings } = await import('@lucky-gift/db');
    vi.mocked(getSession).mockReturnValue({ expiresAt: Date.now() + 3600000 });
    const res = await PUT(makeRequest(
      'PUT',
      { Authorization: 'Bearer valid-token' },
      { settings: [{ key: 'max_recipients', value: '3' }, { key: 'payments_enabled', value: 'true' }] },
    ));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.updated).toBe(2);
    expect(updateSettings).toHaveBeenCalledOnce();
  });
});

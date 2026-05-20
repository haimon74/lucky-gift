import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { buildGiftEmailHtml, sendGiftEmail } from '@/lib/email';

// Mock settings-cache so it doesn't hit the DB
vi.mock('@/lib/settings-cache', () => ({
  getSettingValue: vi.fn((key: string) => {
    if (key === 'email_from_address') return 'noreply@luck-gift.haimazar.us';
    if (key === 'email_from_name') return 'Lucky Gift';
    return null;
  }),
  isPaymentsEnabled: vi.fn(() => false),
  getMaxRecipients: vi.fn(() => 5),
}));

describe('buildGiftEmailHtml', () => {
  it('includes sender name', () => {
    const html = buildGiftEmailHtml({ senderName: 'Alice', messagePreview: 'Hi!', revealUrl: 'https://example.com/reveal/1' });
    expect(html).toContain('Alice');
  });

  it('includes reveal URL', () => {
    const url = 'https://luck-gift.haimazar.us/reveal/abc?t=xyz';
    const html = buildGiftEmailHtml({ senderName: 'Alice', messagePreview: 'Hi!', revealUrl: url });
    expect(html).toContain(url);
  });

  it('truncates message preview to 100 chars', () => {
    const longMsg = 'x'.repeat(200);
    const html = buildGiftEmailHtml({ senderName: 'Alice', messagePreview: longMsg, revealUrl: 'https://example.com' });
    expect(html).toContain('x'.repeat(100));
    // Should not contain the 101st character run
    const truncated = html.includes('x'.repeat(101));
    expect(truncated).toBe(false);
  });

  it('escapes HTML entities in sender name', () => {
    const html = buildGiftEmailHtml({ senderName: '<script>xss</script>', messagePreview: '', revealUrl: 'https://example.com' });
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });
});

describe('sendGiftEmail', () => {
  const emailParams = {
    recipientName: 'Bob',
    recipientEmail: 'bob@example.com',
    senderName: 'Alice',
    senderEmail: 'alice@example.com',
    message: 'Happy Birthday!',
    revealUrl: 'https://luck-gift.haimazar.us/reveal/1?t=abc',
  };

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('returns false and skips when BREVO_API_KEY is not set', async () => {
    vi.stubEnv('BREVO_API_KEY', '');
    const result = await sendGiftEmail(emailParams);
    expect(result).toBe(false);
  });

  it('calls Brevo API with correct headers and returns true on success', async () => {
    vi.stubEnv('BREVO_API_KEY', 'test-key-123');
    const fetchMock = vi.fn().mockResolvedValueOnce({ ok: true, text: async () => '' });
    vi.stubGlobal('fetch', fetchMock);

    const result = await sendGiftEmail(emailParams);
    expect(result).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.brevo.com/v3/smtp/email',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'api-key': 'test-key-123' }),
      }),
    );
  });

  it('returns false on API error response and does not throw', async () => {
    vi.stubEnv('BREVO_API_KEY', 'test-key-123');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({ ok: false, status: 500, text: async () => 'Internal Server Error' }));
    const result = await sendGiftEmail(emailParams);
    expect(result).toBe(false);
  });

  it('returns false on network error and does not throw', async () => {
    vi.stubEnv('BREVO_API_KEY', 'test-key-123');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new Error('Network down')));
    const result = await sendGiftEmail(emailParams);
    expect(result).toBe(false);
  });
});

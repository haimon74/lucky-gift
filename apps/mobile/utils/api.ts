const BASE_URL = 'https://luck-gift.haimazar.us';

export interface GiftPayload {
  gameId: string;
  occasionKey: string;
  message: string;
  senderName: string;
  senderEmail: string;
  recipients: Array<{ name: string; email: string; phone?: string }>;
}

export async function submitGift(payload: GiftPayload): Promise<{ giftId: string; recipientCount: number; emailsSent: number }> {
  const res = await fetch(`${BASE_URL}/api/gifts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchReveal(giftId: string, token: string) {
  const res = await fetch(`${BASE_URL}/api/reveal/${encodeURIComponent(giftId)}?t=${encodeURIComponent(token)}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

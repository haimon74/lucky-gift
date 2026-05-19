export async function generateSeedHash(
  giftId: string,
  recipientEmail: string,
  createdAtMs: number,
): Promise<string> {
  const input = `${giftId}:${recipientEmail}:${createdAtMs}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

'use client';

import { getOccasion, OCCASIONS } from '@lucky-gift/shared';

interface GiftCardPreviewProps {
  occasionKey: string | null;
  message: string;
  senderName?: string;
  size?: 'mini' | 'full';
}

export function GiftCardPreview({
  occasionKey,
  message,
  senderName,
  size = 'full',
}: GiftCardPreviewProps) {
  const occasion = occasionKey ? getOccasion(occasionKey) : null;
  const isMini = size === 'mini';
  const gradient = occasion
    ? `linear-gradient(135deg, ${occasion.gradientColors[0]}, ${occasion.gradientColors[1]})`
    : 'linear-gradient(135deg, #1a1a2e, #12121a)';

  const previewMessage = isMini
    ? message.slice(0, 60) + (message.length > 60 ? '…' : '')
    : message.slice(0, 120) + (message.length > 120 ? '…' : '');

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-xl"
      style={{
        width: isMini ? '160px' : '100%',
        maxWidth: isMini ? '160px' : '320px',
        background: gradient,
        border: '1px solid rgba(240,192,64,0.2)',
      }}
    >
      <div className={`flex flex-col items-center text-center ${isMini ? 'p-3 gap-1' : 'p-6 gap-3'}`}>
        <div style={{ fontSize: isMini ? '2rem' : '3rem' }}>
          {occasion?.emoji ?? '🎁'}
        </div>
        <div
          className="font-bold"
          style={{ color: '#ffd700', fontSize: isMini ? '0.7rem' : '0.9rem' }}
        >
          {occasion?.displayName ?? 'Lucky Gift'}
        </div>
        {previewMessage && (
          <p
            className="italic leading-snug"
            style={{
              color: 'rgba(255,255,255,0.85)',
              fontSize: isMini ? '0.6rem' : '0.8rem',
            }}
          >
            "{previewMessage}"
          </p>
        )}
        {senderName && (
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: isMini ? '0.55rem' : '0.7rem' }}>
            from: {senderName}
          </p>
        )}
        <div
          className="rounded-full font-bold mt-1"
          style={{
            background: 'linear-gradient(135deg, #c9a227, #f0c040)',
            color: '#1a0a00',
            padding: isMini ? '4px 12px' : '8px 20px',
            fontSize: isMini ? '0.55rem' : '0.75rem',
          }}
        >
          🎁 Open Gift
        </div>
      </div>
    </div>
  );
}

'use client';

import { getOccasion } from '@lucky-gift/shared';
import { Textarea } from '@lucky-gift/ui';
import { GiftCardPreview } from '@/components/GiftCardPreview';

interface WizardStep2Props {
  occasionKey: string | null;
  message: string;
  senderName: string;
  onChangeMessage: (value: string) => void;
}

const MAX_CHARS = 500;

export function WizardStep2({ occasionKey, message, senderName, onChangeMessage }: WizardStep2Props) {
  const occasion = occasionKey ? getOccasion(occasionKey) : null;
  const gradient = occasion
    ? `linear-gradient(135deg, ${occasion.gradientColors[0]}, ${occasion.gradientColors[1]})`
    : 'linear-gradient(135deg, #1a1a2e, #0a0a0f)';

  return (
    <div className="space-y-8">
      {/* Occasion visual */}
      <div
        className="w-full rounded-2xl flex flex-col items-center justify-center py-10 gap-3"
        style={{ background: gradient, minHeight: '180px' }}
      >
        <div style={{ fontSize: '4rem' }}>{occasion?.emoji ?? '🎁'}</div>
        <div className="font-bold text-lg" style={{ color: '#ffd700' }}>
          {occasion?.displayName ?? 'Lucky Gift'}
        </div>
      </div>

      {/* Two-column layout on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Message editor */}
        <div className="space-y-2">
          <Textarea
            label="Your personal message"
            value={message}
            onChange={(e) => onChangeMessage(e.target.value)}
            placeholder={occasion?.defaultMessage ?? 'Write your message here...'}
            rows={5}
            maxLength={MAX_CHARS}
            charCount={message.length}
            maxChars={MAX_CHARS}
          />
        </div>

        {/* Live preview */}
        <div className="flex flex-col items-center gap-3">
          <p className="text-xs font-medium" style={{ color: '#6b6b80' }}>
            Preview — how recipient sees it
          </p>
          <GiftCardPreview
            occasionKey={occasionKey}
            message={message}
            senderName={senderName || 'You'}
            size="full"
          />
        </div>
      </div>
    </div>
  );
}

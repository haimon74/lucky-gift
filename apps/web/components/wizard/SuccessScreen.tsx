'use client';

import { Button } from '@lucky-gift/ui';
import type { Recipient } from '@lucky-gift/shared';

interface SuccessScreenProps {
  recipients: Recipient[];
  onReset: () => void;
}

export function SuccessScreen({ recipients, onReset }: SuccessScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 py-16">
      {/* Star burst animation */}
      <div className="relative" aria-hidden="true">
        <div
          className="text-8xl"
          style={{ animation: 'pop-in 0.5s ease-out, float 3s ease-in-out infinite' }}
        >
          🎉
        </div>
        <div
          className="absolute -top-4 -left-8 text-4xl"
          style={{ animation: 'sparkle 2s ease-in-out infinite', animationDelay: '0.2s' }}
        >
          ✨
        </div>
        <div
          className="absolute -top-4 -right-8 text-4xl"
          style={{ animation: 'sparkle 2s ease-in-out infinite', animationDelay: '0.5s' }}
        >
          🌟
        </div>
        <div
          className="absolute top-8 -left-12 text-3xl"
          style={{ animation: 'sparkle 2s ease-in-out infinite', animationDelay: '0.8s' }}
        >
          ⭐
        </div>
        <div
          className="absolute top-8 -right-12 text-3xl"
          style={{ animation: 'sparkle 2s ease-in-out infinite', animationDelay: '0.3s' }}
        >
          ✨
        </div>
      </div>

      <div className="space-y-3">
        <h1
          className="text-4xl font-bold"
          style={{ animation: 'fade-in 0.6s ease-out 0.3s both', color: '#f0c040' }}
        >
          🎊 Lucky Numbers Sent!
        </h1>
        <p
          className="text-lg"
          style={{ animation: 'fade-in 0.6s ease-out 0.5s both', color: '#a0a0b0' }}
        >
          Your gift has been sent to{' '}
          <span style={{ color: '#f5f5f0', fontWeight: 600 }}>
            {recipients.length} lucky recipient{recipients.length !== 1 ? 's' : ''}
          </span>
          !
        </p>
      </div>

      {/* Recipient list */}
      <div
        className="rounded-2xl p-6 space-y-2 w-full max-w-sm"
        style={{
          background: '#13132a',
          border: '1px solid rgba(201,162,39,0.25)',
          animation: 'fade-in 0.6s ease-out 0.7s both',
        }}
      >
        {recipients.map((r) => (
          <div key={r.id} className="flex items-center gap-3">
            <span style={{ color: '#f0c040' }}>🍀</span>
            <span style={{ color: '#f5f5f0' }}>{r.name || r.email}</span>
          </div>
        ))}
      </div>

      <div style={{ animation: 'fade-in 0.6s ease-out 0.9s both' }}>
        <Button size="lg" onClick={onReset}>
          Send Another Gift
        </Button>
      </div>
    </div>
  );
}

'use client';

import { Button } from '@lucky-gift/ui';
import type { Recipient } from '@lucky-gift/shared';

interface SuccessScreenProps {
  recipients: Recipient[];
  emailsSent?: number;
  onReset: () => void;
}

export function SuccessScreen({ recipients, emailsSent, onReset }: SuccessScreenProps) {
  const emailStatus = emailsSent === undefined ? null
    : emailsSent === recipients.length ? 'all'
    : emailsSent > 0 ? 'partial'
    : 'none';
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

      {/* Email delivery status */}
      {emailStatus && (
        <div
          className="flex items-center gap-3 rounded-xl px-5 py-3 text-sm font-medium w-full max-w-sm"
          style={{
            animation: 'fade-in 0.6s ease-out 0.6s both',
            background: emailStatus === 'all' ? 'rgba(6,95,70,0.4)'
              : emailStatus === 'partial' ? 'rgba(120,53,15,0.4)'
              : 'rgba(127,29,29,0.4)',
            border: `1px solid ${emailStatus === 'all' ? 'rgba(52,211,153,0.3)'
              : emailStatus === 'partial' ? 'rgba(251,191,36,0.3)'
              : 'rgba(248,113,113,0.3)'}`,
            color: emailStatus === 'all' ? '#6ee7b7'
              : emailStatus === 'partial' ? '#fcd34d'
              : '#fca5a5',
          }}
        >
          <span>{emailStatus === 'all' ? '✉️' : emailStatus === 'partial' ? '⚠️' : '❌'}</span>
          <span>
            {emailStatus === 'all' && `Emails sent to all ${recipients.length} recipient${recipients.length !== 1 ? 's' : ''}`}
            {emailStatus === 'partial' && `Emails sent to ${emailsSent} of ${recipients.length} recipients — check the server logs for errors`}
            {emailStatus === 'none' && 'Emails could not be sent — check BREVO_API_KEY in .env.local'}
          </span>
        </div>
      )}

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

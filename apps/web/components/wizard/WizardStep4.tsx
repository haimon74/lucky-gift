'use client';

import { useState } from 'react';
import { Button } from '@lucky-gift/ui';
import { LOTTERY_GAMES, OCCASIONS } from '@lucky-gift/shared';

interface WizardStep4Props {
  gameId: string | null;
  occasionKey: string | null;
  recipientCount: number;
  senderName: string;
  senderEmail: string;
  pendingGiftData: string;
  giftId?: string;
  priceCents?: number;
}

export function WizardStep4({
  gameId,
  occasionKey,
  recipientCount,
  senderName,
  senderEmail,
  pendingGiftData,
  giftId,
  priceCents = 1000,
}: WizardStep4Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const game = LOTTERY_GAMES.find((g) => g.gameId === gameId);
  const occasion = OCCASIONS.find((o) => o.occasionKey === occasionKey);
  const priceDisplay = `$${(priceCents / 100).toFixed(2)}`;

  async function handlePay() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          giftId,
          gameId,
          occasionKey,
          recipientCount,
          pendingGiftData,
        }),
      });

      const data = (await res.json()) as { checkoutUrl?: string; error?: string };

      if (!res.ok || !data.checkoutUrl) {
        setError(data.error ?? 'Failed to start checkout. Please try again.');
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = data.checkoutUrl;
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-1" style={{ color: '#f5f5f0' }}>
          💳 Complete Your Order
        </h2>
        <p className="text-sm" style={{ color: '#6b6b80' }}>
          Review your order and pay securely with Stripe.
        </p>
      </div>

      {/* Order Summary */}
      <div
        className="rounded-2xl p-6 space-y-4"
        style={{ background: '#13132a', border: '1px solid rgba(201,162,39,0.25)' }}
      >
        <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#c9a227' }}>
          Order Summary
        </h3>

        <dl className="space-y-3">
          <div className="flex justify-between items-center">
            <dt className="text-sm" style={{ color: '#a0a0b0' }}>
              Lottery Game
            </dt>
            <dd className="text-sm font-semibold" style={{ color: '#f5f5f0' }}>
              {game?.name ?? gameId ?? '—'}
            </dd>
          </div>

          <div className="flex justify-between items-center">
            <dt className="text-sm" style={{ color: '#a0a0b0' }}>
              Occasion
            </dt>
            <dd className="text-sm font-semibold" style={{ color: '#f5f5f0' }}>
              {occasion?.displayName ?? occasionKey ?? '—'}
            </dd>
          </div>

          <div className="flex justify-between items-center">
            <dt className="text-sm" style={{ color: '#a0a0b0' }}>
              Recipients
            </dt>
            <dd className="text-sm font-semibold" style={{ color: '#f5f5f0' }}>
              {recipientCount} {recipientCount === 1 ? 'person' : 'people'}
            </dd>
          </div>

          <div className="flex justify-between items-center">
            <dt className="text-sm" style={{ color: '#a0a0b0' }}>
              From
            </dt>
            <dd className="text-sm font-semibold" style={{ color: '#f5f5f0' }}>
              {senderName || senderEmail || '—'}
            </dd>
          </div>

          <div
            className="h-px w-full"
            style={{ background: 'rgba(201,162,39,0.2)' }}
          />

          <div className="flex justify-between items-center">
            <dt className="text-base font-bold" style={{ color: '#f5f5f0' }}>
              Total
            </dt>
            <dd className="text-xl font-bold" style={{ color: '#c9a227' }}>
              {priceDisplay}
            </dd>
          </div>
        </dl>
      </div>

      {/* Secure badge */}
      <div className="flex items-center gap-2 text-xs" style={{ color: '#6b6b80' }}>
        <span>🔒</span>
        <span>Payments are processed securely by Stripe. We never store your card details.</span>
      </div>

      {/* Pay button */}
      <div className="space-y-3">
        <Button
          variant="gold"
          size="lg"
          loading={isLoading}
          onClick={handlePay}
          className="w-full"
        >
          {isLoading ? 'Redirecting to Stripe…' : `Pay ${priceDisplay} & Send Gift 🍀`}
        </Button>

        {error && (
          <p className="text-sm text-center" style={{ color: '#ef4444' }} role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

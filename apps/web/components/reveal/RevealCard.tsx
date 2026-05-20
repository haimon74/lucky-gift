'use client';

import { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { generateLotteryNumbers } from '@lucky-gift/shared';
import type { LotteryGame } from '@lucky-gift/shared';
import { Button } from '@lucky-gift/ui';
import { NumberBall } from './NumberBall';
import { ParticleEffect } from './ParticleEffect';
import { useRevealSound } from '@/hooks/useRevealSound';
import { getOccasion } from '@lucky-gift/shared';

interface RevealData {
  gift: {
    id: string;
    gameId: string;
    occasionKey: string;
    message: string;
    senderName: string;
    createdAt: number;
  };
  recipient: {
    name: string;
    email: string;
    seedHash: string;
    isRevealed: boolean;
  };
  game: LotteryGame;
  template: {
    name: string;
    revealButtonText: string;
  };
}

interface RevealCardProps {
  data: RevealData;
}

const BONUS_LABELS: Record<string, string> = {
  PWR: 'Powerball',
  MML: 'Mega Ball',
  MFL: 'Millionaire Ball',
};

export function RevealCard({ data }: RevealCardProps) {
  const { gift, recipient, game, template } = data;
  const [isRevealed, setIsRevealed] = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);
  const { play } = useRevealSound();

  const occasion = getOccasion(gift.occasionKey);
  const gradient = occasion
    ? `linear-gradient(135deg, ${occasion.gradientColors[0]}, ${occasion.gradientColors[1]})`
    : 'linear-gradient(135deg, #1a1a2e, #0a0a0f)';

  const numbers = isRevealed
    ? generateLotteryNumbers(recipient.seedHash, game)
    : { main: [], bonus: [] };

  const allBalls = [...numbers.main, ...numbers.bonus];
  const bonusStartIdx = numbers.main.length;

  // Stagger ball appearance
  useEffect(() => {
    if (!isRevealed) return;
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setVisibleCount(count);
      if (count >= allBalls.length) clearInterval(interval);
    }, 150);
    return () => clearInterval(interval);
  }, [isRevealed, allBalls.length]);

  function handleReveal() {
    setIsRevealed(true);
    play();
  }

  // Build prefill link back to wizard (original sender becomes the new recipient)
  const prefillData = {
    senderName: gift.senderName,
    senderEmail: '',
    gameId: gift.gameId,
  };
  const prefillUrl = `/?prefill=${encodeURIComponent(JSON.stringify(prefillData))}`;

  // Sanitize greeting interpolation
  const greetingHtml =
    typeof window !== 'undefined'
      ? DOMPurify.sanitize(
          gift.message
            .replace(/\{\{recipient_name\}\}/g, recipient.name)
            .replace(/\{\{sender_name\}\}/g, gift.senderName),
        )
      : '';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <ParticleEffect isActive={isRevealed} />

      {/* Occasion visual */}
      <div
        className="w-full rounded-2xl flex flex-col items-center justify-center py-12 gap-3"
        style={{ background: gradient }}
      >
        <div style={{ fontSize: '5rem' }}>{occasion?.emoji ?? '🎁'}</div>
        <div className="font-bold text-2xl" style={{ color: '#ffd700' }}>
          {occasion?.displayName ?? 'Lucky Gift'}
        </div>
      </div>

      {/* Message */}
      <div
        className="rounded-2xl p-6 space-y-3 text-center"
        style={{ background: '#13132a', border: '1px solid rgba(201,162,39,0.25)' }}
      >
        {greetingHtml ? (
          <div
            className="text-lg italic"
            style={{ color: '#fff5e0', lineHeight: 1.6 }}
            dangerouslySetInnerHTML={{ __html: greetingHtml }}
          />
        ) : (
          <p className="text-lg italic" style={{ color: '#fff5e0' }}>
            {gift.message}
          </p>
        )}
        <p className="text-sm" style={{ color: '#a0a0b0' }}>
          from: <span style={{ color: '#f0c040' }}>{gift.senderName}</span>
        </p>
      </div>

      {/* Reveal area */}
      {!isRevealed ? (
        <div className="flex justify-center">
          <Button size="lg" onClick={handleReveal}>
            🎰 {template.revealButtonText}
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center" style={{ color: '#f0c040' }}>
            ✨ Your Lucky Numbers ✨
          </h2>

          {/* Main balls */}
          <div className="flex flex-wrap justify-center gap-3">
            {numbers.main.map((n, i) =>
              i < visibleCount ? (
                <NumberBall key={`main-${i}`} number={n} isBonus={false} gameId={game.gameId} index={i} />
              ) : null,
            )}
          </div>

          {/* Bonus ball */}
          {numbers.bonus.length > 0 && (
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b6b80' }}>
                {BONUS_LABELS[game.gameId] ?? 'Bonus'}
              </span>
              {visibleCount > bonusStartIdx && (
                <NumberBall
                  number={numbers.bonus[0]!}
                  isBonus
                  gameId={game.gameId}
                  index={bonusStartIdx}
                />
              )}
            </div>
          )}

          {/* Send back link */}
          <div className="text-center pt-4">
            <a
              href={prefillUrl}
              className="inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:underline"
              style={{ color: '#c9a227' }}
              data-prefill-link
            >
              🍀 Send a lucky gift back to {gift.senderName}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

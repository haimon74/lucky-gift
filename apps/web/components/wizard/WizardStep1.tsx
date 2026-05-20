'use client';

import { LOTTERY_GAMES, OCCASIONS } from '@lucky-gift/shared';
import { GiftCardPreview } from '@/components/GiftCardPreview';

interface WizardStep1Props {
  gameId: string | null;
  occasionKey: string | null;
  onSelectGame: (gameId: string) => void;
  onSelectOccasion: (occasionKey: string) => void;
}

const GAME_ICONS: Record<string, string> = {
  PWR: '🔴',
  MML: '🟡',
  MFL: '💎',
};

const GAME_DESCRIPTIONS: Record<string, string> = {
  PWR: 'Pick 5 (1–69) + 1 Powerball (1–26)',
  MML: 'Pick 5 (1–70) + 1 Mega Ball (1–24)',
  MFL: 'Pick 5 (1–58) + 1 Millionaire Ball (1–5)',
};

export function WizardStep1({ gameId, occasionKey, onSelectGame, onSelectOccasion }: WizardStep1Props) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-1" style={{ color: '#f5f5f0' }}>
          🎰 Choose Your Lottery Game
        </h2>
        <p className="text-sm mb-4" style={{ color: '#a0a0b0' }}>
          Select which lottery game to gift
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {LOTTERY_GAMES.map((game) => {
            const isSelected = gameId === game.gameId;
            return (
              <button
                key={game.gameId}
                type="button"
                onClick={() => onSelectGame(game.gameId)}
                className="relative rounded-xl p-5 text-left transition-all duration-200 cursor-pointer"
                style={{
                  backgroundColor: '#12121a',
                  border: isSelected ? '2px solid #c9a227' : '1px solid #2a2a3e',
                  boxShadow: isSelected
                    ? '0 0 0 2px rgba(201,162,39,0.3), 0 4px 24px rgba(201,162,39,0.2)'
                    : undefined,
                  minHeight: '120px',
                }}
                aria-pressed={isSelected}
              >
                {isSelected && (
                  <div
                    className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: '#c9a227', color: '#1a0a00' }}
                  >
                    ✓
                  </div>
                )}
                <div className="text-3xl mb-2">{GAME_ICONS[game.gameId]}</div>
                <div className="font-bold" style={{ color: '#f0c040' }}>
                  {game.name}
                </div>
                <div className="text-xs mt-1" style={{ color: '#6b6b80' }}>
                  {GAME_DESCRIPTIONS[game.gameId]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-1" style={{ color: '#f5f5f0' }}>
          🎊 What&apos;s the Occasion?
        </h2>
        <p className="text-sm mb-4" style={{ color: '#a0a0b0' }}>
          Pick the perfect occasion for your gift
        </p>
        <div className="flex flex-wrap gap-3">
          {OCCASIONS.map((occasion) => {
            const isSelected = occasionKey === occasion.occasionKey;
            return (
              <button
                key={occasion.occasionKey}
                type="button"
                onClick={() => onSelectOccasion(occasion.occasionKey)}
                className="flex items-center gap-2 px-4 rounded-full font-medium transition-all duration-200 cursor-pointer border"
                style={{
                  minHeight: '44px',
                  backgroundColor: isSelected ? '#c9a227' : 'transparent',
                  color: isSelected ? '#1a0a00' : '#a0a0b0',
                  borderColor: isSelected ? '#c9a227' : '#2a2a3e',
                  fontSize: '0.9rem',
                }}
                aria-pressed={isSelected}
              >
                <span>{occasion.emoji}</span>
                <span>{occasion.displayName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live preview */}
      <div>
        <h3 className="text-sm font-medium mb-3" style={{ color: '#a0a0b0' }}>
          Preview
        </h3>
        <div className="flex justify-center">
          {gameId && occasionKey ? (
            <GiftCardPreview occasionKey={occasionKey} message="" size="mini" />
          ) : (
            <div
              className="rounded-xl p-6 text-center text-sm"
              style={{ backgroundColor: '#12121a', border: '1px dashed #2a2a3e', color: '#6b6b80', minWidth: '160px' }}
            >
              {!gameId ? '← Select a game' : '← Pick an occasion'}
              <br />to preview
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

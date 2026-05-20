'use client';

interface NumberBallProps {
  number: number;
  isBonus?: boolean;
  /** Game ID to determine bonus ball color */
  gameId?: string;
  /** Index for stagger animation delay */
  index?: number;
}

const BONUS_COLORS: Record<string, string> = {
  PWR: '#e74c3c',  // Powerball red
  MML: '#f0c040',  // Mega Millions gold
  MFL: '#1abc9c',  // Millionaire for Life teal
};

export function NumberBall({ number, isBonus = false, gameId = '', index = 0 }: NumberBallProps) {
  const bonusColor = BONUS_COLORS[gameId] ?? '#c9a227';

  const ballStyle: React.CSSProperties = isBonus
    ? {
        backgroundColor: bonusColor,
        color: '#fff',
        boxShadow: `0 4px 16px ${bonusColor}88`,
        animationDelay: `${index * 150}ms`,
      }
    : {
        backgroundColor: '#f5f5f0',
        color: '#1a1a2e',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        animationDelay: `${index * 150}ms`,
      };

  return (
    <div
      className="number-ball"
      style={{
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.25rem',
        fontWeight: 700,
        animation: 'pop-in 0.4s ease-out both',
        ...ballStyle,
      }}
      aria-label={`${isBonus ? 'Bonus ball' : 'Ball'} ${number}`}
    >
      {number}
    </div>
  );
}

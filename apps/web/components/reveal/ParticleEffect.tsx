'use client';

import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  left: number;
  delay: number;
  duration: number;
  emoji: string;
  size: number;
}

const EMOJIS = ['✨', '⭐', '🌟', '💫', '✨', '⭐', '🌟', '✨'];

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 1.2,
    duration: 2 + Math.random() * 1.5,
    emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)]!,
    size: 16 + Math.floor(Math.random() * 20),
  }));
}

interface ParticleEffectProps {
  isActive: boolean;
}

export function ParticleEffect({ isActive }: ParticleEffectProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (isActive) {
      setParticles(generateParticles(60));
    }
  }, [isActive]);

  if (!isActive || particles.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 9999,
      }}
    >
      {particles.map((p) => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            bottom: '-10%',
            fontSize: `${p.size}px`,
            animation: `particle-rise ${p.duration}s ease-out ${p.delay}s both`,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}

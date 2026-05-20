import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NumberBall } from '@/components/reveal/NumberBall';

describe('NumberBall', () => {
  it('renders a main ball with the correct number', () => {
    render(<NumberBall number={42} isBonus={false} gameId="PWR" index={0} />);
    expect(screen.getByText('42')).toBeDefined();
    expect(screen.getByLabelText('Ball 42')).toBeDefined();
  });

  it('renders a bonus ball with correct aria label', () => {
    render(<NumberBall number={7} isBonus={true} gameId="PWR" index={5} />);
    expect(screen.getByText('7')).toBeDefined();
    expect(screen.getByLabelText('Bonus ball 7')).toBeDefined();
  });

  it('applies Powerball red background for PWR bonus ball', () => {
    const { container } = render(<NumberBall number={10} isBonus={true} gameId="PWR" index={0} />);
    const ball = container.firstChild as HTMLElement;
    expect(ball.style.backgroundColor).toBe('rgb(231, 76, 60)'); // #e74c3c
  });

  it('applies Mega Ball gold background for MML bonus ball', () => {
    const { container } = render(<NumberBall number={10} isBonus={true} gameId="MML" index={0} />);
    const ball = container.firstChild as HTMLElement;
    expect(ball.style.backgroundColor).toBe('rgb(240, 192, 64)'); // #f0c040
  });

  it('applies white background for main ball', () => {
    const { container } = render(<NumberBall number={15} isBonus={false} gameId="PWR" index={0} />);
    const ball = container.firstChild as HTMLElement;
    expect(ball.style.backgroundColor).toBe('rgb(245, 245, 240)'); // #f5f5f0
  });
});

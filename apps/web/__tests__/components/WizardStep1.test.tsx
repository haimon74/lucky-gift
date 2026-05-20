import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WizardStep1 } from '@/components/wizard/WizardStep1';
import { LOTTERY_GAMES, OCCASIONS } from '@lucky-gift/shared';

describe('WizardStep1', () => {
  const defaultProps = {
    gameId: null,
    occasionKey: null,
    onSelectGame: vi.fn(),
    onSelectOccasion: vi.fn(),
  };

  it('renders all 3 game cards', () => {
    render(<WizardStep1 {...defaultProps} />);
    for (const game of LOTTERY_GAMES) {
      expect(screen.getByText(game.name)).toBeDefined();
    }
  });

  it('renders all 5 occasion chips', () => {
    render(<WizardStep1 {...defaultProps} />);
    for (const occasion of OCCASIONS) {
      expect(screen.getByText(occasion.displayName)).toBeDefined();
    }
  });

  it('calls onSelectGame when a game card is clicked', async () => {
    const onSelectGame = vi.fn();
    render(<WizardStep1 {...defaultProps} onSelectGame={onSelectGame} />);
    await userEvent.click(screen.getByText('Powerball'));
    expect(onSelectGame).toHaveBeenCalledWith('PWR');
  });

  it('calls onSelectOccasion when an occasion chip is clicked', async () => {
    const onSelectOccasion = vi.fn();
    render(<WizardStep1 {...defaultProps} onSelectOccasion={onSelectOccasion} />);
    await userEvent.click(screen.getByText('Birthday'));
    expect(onSelectOccasion).toHaveBeenCalledWith('birthday');
  });

  it('shows selected state on game card', () => {
    render(<WizardStep1 {...defaultProps} gameId="PWR" />);
    const btns = screen.getAllByRole('button');
    const pwrBtn = btns.find((b) => b.textContent?.includes('Powerball'));
    expect(pwrBtn?.getAttribute('aria-pressed')).toBe('true');
  });

  it('shows selected state on occasion chip', () => {
    render(<WizardStep1 {...defaultProps} occasionKey="birthday" />);
    const btns = screen.getAllByRole('button');
    const birthdayBtn = btns.find((b) => b.textContent?.includes('Birthday'));
    expect(birthdayBtn?.getAttribute('aria-pressed')).toBe('true');
  });

  it('shows preview placeholder when no game selected', () => {
    render(<WizardStep1 {...defaultProps} />);
    expect(screen.getByText(/select a game/i)).toBeDefined();
  });

  it('shows preview when both game and occasion are selected', () => {
    render(<WizardStep1 {...defaultProps} gameId="PWR" occasionKey="birthday" />);
    // Birthday appears in both the occasion chip and the mini-preview card
    const els = screen.getAllByText('Birthday');
    expect(els.length).toBeGreaterThanOrEqual(1);
    // The preview placeholder should not be shown
    expect(screen.queryByText(/select a game/i)).toBeNull();
  });
});

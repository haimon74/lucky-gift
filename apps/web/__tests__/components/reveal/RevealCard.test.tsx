import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { RevealCard } from '@/components/reveal/RevealCard';

// Mock DOMPurify for jsdom
vi.mock('dompurify', () => ({
  default: { sanitize: (s: string) => s },
}));

// Mock useRevealSound
vi.mock('@/hooks/useRevealSound', () => ({
  useRevealSound: () => ({ play: vi.fn() }),
}));

const MOCK_DATA = {
  gift: {
    id: 'gift-1',
    gameId: 'PWR',
    occasionKey: 'birthday',
    message: 'Happy Birthday Bob!',
    senderName: 'Alice',
    senderEmail: 'alice@example.com',
    createdAt: 1700000000000,
  },
  recipient: {
    name: 'Bob',
    email: 'bob@example.com',
    seedHash: 'deadbeef12345678',
    isRevealed: false,
  },
  game: {
    gameId: 'PWR',
    name: 'Powerball',
    mainCount: 5,
    mainMin: 1,
    mainMax: 69,
    bonusCount: 1,
    bonusMin: 1,
    bonusMax: 26,
  },
  template: {
    name: 'Birthday',
    revealButtonText: 'Reveal your lucky Powerball numbers!',
  },
};

describe('RevealCard', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows occasion emoji before reveal', () => {
    render(<RevealCard data={MOCK_DATA} />);
    expect(screen.getByText('🎂')).toBeDefined();
  });

  it('shows the reveal button before reveal', () => {
    render(<RevealCard data={MOCK_DATA} />);
    expect(screen.getByText(/Reveal your lucky Powerball numbers!/i)).toBeDefined();
  });

  it('shows the sender message', () => {
    render(<RevealCard data={MOCK_DATA} />);
    expect(screen.getByText('Happy Birthday Bob!')).toBeDefined();
  });

  it('shows "from: Alice" before reveal', () => {
    render(<RevealCard data={MOCK_DATA} />);
    expect(screen.getByText('Alice')).toBeDefined();
  });

  it('hides reveal button and shows numbers after clicking reveal', async () => {
    render(<RevealCard data={MOCK_DATA} />);
    fireEvent.click(screen.getByText(/Reveal your lucky Powerball numbers!/i));
    // Advance timers to show all 6 balls (5 main + 1 bonus)
    await act(async () => { vi.advanceTimersByTime(1500); });
    expect(screen.queryByText(/Reveal your lucky Powerball numbers!/i)).toBeNull();
    expect(screen.getByText('✨ Your Lucky Numbers ✨')).toBeDefined();
  });

  it('shows "Send lucky back to Alice" link after reveal', async () => {
    render(<RevealCard data={MOCK_DATA} />);
    fireEvent.click(screen.getByText(/Reveal your lucky Powerball numbers!/i));
    await act(async () => { vi.advanceTimersByTime(1500); });
    expect(screen.getByText(/Send a lucky gift back to Alice/i)).toBeDefined();
  });

  it('link href includes encoded prefill data', async () => {
    render(<RevealCard data={MOCK_DATA} />);
    fireEvent.click(screen.getByText(/Reveal your lucky Powerball numbers!/i));
    await act(async () => { vi.advanceTimersByTime(1500); });
    const link = screen.getByText(/Send a lucky gift back to Alice/i).closest('a') as HTMLAnchorElement;
    expect(link.href).toContain('prefill=');
    expect(link.href).toContain('PWR');
  });
});

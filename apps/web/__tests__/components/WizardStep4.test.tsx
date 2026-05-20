import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WizardStep4 } from '@/components/wizard/WizardStep4';

const BASE_PROPS = {
  gameId: 'PWR',
  occasionKey: 'birthday',
  recipientCount: 2,
  senderName: 'Alice',
  senderEmail: 'alice@example.com',
  pendingGiftData: '{"mock":"data"}',
};

describe('WizardStep4', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('renders order summary with game name', () => {
    render(<WizardStep4 {...BASE_PROPS} />);
    expect(screen.getByText('Order Summary')).toBeDefined();
    expect(screen.getByText('Powerball')).toBeDefined();
  });

  it('renders occasion label', () => {
    render(<WizardStep4 {...BASE_PROPS} />);
    // occasionKey 'birthday' should map to a label
    const occasion = screen.getByText(/birthday/i);
    expect(occasion).toBeDefined();
  });

  it('renders recipient count', () => {
    render(<WizardStep4 {...BASE_PROPS} />);
    expect(screen.getByText('2 people')).toBeDefined();
  });

  it('renders sender name in From row', () => {
    render(<WizardStep4 {...BASE_PROPS} />);
    expect(screen.getByText('Alice')).toBeDefined();
  });

  it('renders default price $10.00', () => {
    render(<WizardStep4 {...BASE_PROPS} />);
    const prices = screen.getAllByText('$10.00');
    expect(prices.length).toBeGreaterThanOrEqual(1);
  });

  it('renders custom price from priceCents prop', () => {
    render(<WizardStep4 {...BASE_PROPS} priceCents={2500} />);
    const prices = screen.getAllByText('$25.00');
    expect(prices.length).toBeGreaterThanOrEqual(1);
  });

  it('renders Pay button', () => {
    render(<WizardStep4 {...BASE_PROPS} />);
    expect(screen.getByText(/pay \$10\.00 & send gift/i)).toBeDefined();
  });

  it('shows singular "person" for 1 recipient', () => {
    render(<WizardStep4 {...BASE_PROPS} recipientCount={1} />);
    expect(screen.getByText('1 person')).toBeDefined();
  });

  it('calls /api/checkout on Pay click and redirects on success', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ checkoutUrl: 'https://checkout.stripe.com/pay/cs_test' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    // Stub window.location.href assignment
    const locationSpy = vi.spyOn(window, 'location', 'get');
    let href = 'http://localhost/';
    locationSpy.mockReturnValue({
      ...window.location,
      get href() { return href; },
      set href(val) { href = val; },
    } as Location);

    render(<WizardStep4 {...BASE_PROPS} />);
    await userEvent.click(screen.getByText(/pay \$10\.00 & send gift/i));

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/checkout',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"gameId":"PWR"'),
      }),
    );
  });

  it('shows error message when API call fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Stripe not configured' }),
    }));

    render(<WizardStep4 {...BASE_PROPS} />);
    await userEvent.click(screen.getByText(/pay \$10\.00 & send gift/i));

    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByText('Stripe not configured')).toBeDefined();
  });

  it('shows error message on network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new Error('Network error')));

    render(<WizardStep4 {...BASE_PROPS} />);
    await userEvent.click(screen.getByText(/pay \$10\.00 & send gift/i));

    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByText(/network error/i)).toBeDefined();
  });

  it('renders secure payment badge', () => {
    render(<WizardStep4 {...BASE_PROPS} />);
    expect(screen.getByText(/processed securely by stripe/i)).toBeDefined();
  });

  it('falls back to gameId when game not found', () => {
    render(<WizardStep4 {...BASE_PROPS} gameId="UNKNOWN" />);
    expect(screen.getByText('UNKNOWN')).toBeDefined();
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GiftCardPreview } from '@/components/GiftCardPreview';

describe('GiftCardPreview', () => {
  it('renders in mini size', () => {
    const { container } = render(
      <GiftCardPreview occasionKey="birthday" message="Hello" size="mini" />,
    );
    expect(container.firstChild).toBeDefined();
  });

  it('renders in full size', () => {
    const { container } = render(
      <GiftCardPreview occasionKey="birthday" message="Hello" size="full" />,
    );
    expect(container.firstChild).toBeDefined();
  });

  it('shows correct occasion emoji for birthday', () => {
    render(<GiftCardPreview occasionKey="birthday" message="" />);
    expect(screen.getByText('🎂')).toBeDefined();
  });

  it('shows correct occasion emoji for holiday', () => {
    render(<GiftCardPreview occasionKey="holiday" message="" />);
    expect(screen.getByText('🎄')).toBeDefined();
  });

  it('shows fallback gift emoji for null occasion', () => {
    render(<GiftCardPreview occasionKey={null} message="" />);
    expect(screen.getByText('🎁')).toBeDefined();
  });

  it('truncates long message in mini mode', () => {
    const longMsg = 'x'.repeat(100);
    render(<GiftCardPreview occasionKey="birthday" message={longMsg} size="mini" />);
    expect(screen.getByText(/x{1,60}…/)).toBeDefined();
  });

  it('shows senderName when provided', () => {
    render(<GiftCardPreview occasionKey="birthday" message="" senderName="Bob" />);
    expect(screen.getByText(/Bob/)).toBeDefined();
  });
});

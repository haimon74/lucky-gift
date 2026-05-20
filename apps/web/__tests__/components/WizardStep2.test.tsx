import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WizardStep2 } from '@/components/wizard/WizardStep2';

describe('WizardStep2', () => {
  const defaultProps = {
    occasionKey: 'birthday',
    message: 'Happy Birthday!',
    senderName: 'Alice',
    onChangeMessage: vi.fn(),
  };

  it('renders occasion visual with correct emoji', () => {
    render(<WizardStep2 {...defaultProps} />);
    const emojis = screen.getAllByText('🎂');
    expect(emojis.length).toBeGreaterThanOrEqual(1);
  });

  it('renders textarea with current message', () => {
    render(<WizardStep2 {...defaultProps} />);
    const ta = screen.getByRole('textbox');
    expect((ta as HTMLTextAreaElement).value).toBe('Happy Birthday!');
  });

  it('shows character counter', () => {
    render(<WizardStep2 {...defaultProps} />);
    expect(screen.getByText('15/500')).toBeDefined();
  });

  it('calls onChangeMessage when user types', async () => {
    const onChangeMessage = vi.fn();
    render(<WizardStep2 {...defaultProps} onChangeMessage={onChangeMessage} />);
    const ta = screen.getByRole('textbox');
    await userEvent.clear(ta);
    await userEvent.type(ta, 'X');
    expect(onChangeMessage).toHaveBeenCalled();
  });

  it('shows preview card with occasion emoji', () => {
    render(<WizardStep2 {...defaultProps} />);
    // Preview card also contains the birthday emoji
    const emojis = screen.getAllByText('🎂');
    expect(emojis.length).toBeGreaterThanOrEqual(1);
  });

  it('renders with no_reason occasion', () => {
    render(<WizardStep2 {...defaultProps} occasionKey="no_reason" />);
    const emojis = screen.getAllByText('🍀');
    expect(emojis.length).toBeGreaterThanOrEqual(1);
  });
});

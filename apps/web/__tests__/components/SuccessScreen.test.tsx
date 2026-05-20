import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SuccessScreen } from '@/components/wizard/SuccessScreen';
import type { Recipient } from '@lucky-gift/shared';

function makeRecipient(name: string, email: string): Recipient {
  return { id: crypto.randomUUID(), name, email, phone: '' };
}

describe('SuccessScreen', () => {
  it('shows singular recipient count', () => {
    render(<SuccessScreen recipients={[makeRecipient('Alice', 'alice@example.com')]} onReset={vi.fn()} />);
    expect(screen.getByText(/1 lucky recipient/i)).toBeDefined();
  });

  it('shows plural recipient count', () => {
    const recipients = [
      makeRecipient('Alice', 'alice@example.com'),
      makeRecipient('Bob', 'bob@example.com'),
    ];
    render(<SuccessScreen recipients={recipients} onReset={vi.fn()} />);
    expect(screen.getByText(/2 lucky recipients/i)).toBeDefined();
  });

  it('shows recipient names', () => {
    const recipients = [
      makeRecipient('Alice', 'alice@example.com'),
      makeRecipient('Bob', 'bob@example.com'),
    ];
    render(<SuccessScreen recipients={recipients} onReset={vi.fn()} />);
    expect(screen.getByText('Alice')).toBeDefined();
    expect(screen.getByText('Bob')).toBeDefined();
  });

  it('calls onReset when Send Another Gift is clicked', async () => {
    const onReset = vi.fn();
    render(<SuccessScreen recipients={[makeRecipient('Alice', 'alice@example.com')]} onReset={onReset} />);
    await userEvent.click(screen.getByText('Send Another Gift'));
    expect(onReset).toHaveBeenCalledOnce();
  });
});

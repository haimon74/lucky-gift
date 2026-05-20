import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../Input.js';

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText('Email')).toBeDefined();
  });

  it('shows error message when error prop provided', () => {
    render(<Input label="Name" error="Name is required" />);
    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByText('Name is required')).toBeDefined();
  });

  it('does not show error when error is undefined', () => {
    render(<Input label="Name" />);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('calls onChange handler', async () => {
    const onChange = vi.fn();
    render(<Input label="Name" onChange={onChange} />);
    await userEvent.type(screen.getByLabelText('Name'), 'test');
    expect(onChange).toHaveBeenCalled();
  });
});

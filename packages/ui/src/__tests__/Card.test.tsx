import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from '../Card.js';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Hello card</Card>);
    expect(screen.getByText('Hello card')).toBeDefined();
  });

  it('renders with goldBorder style', () => {
    const { container } = render(<Card goldBorder>Content</Card>);
    const div = container.firstChild as HTMLElement;
    // Browser normalizes hex to rgb
    expect(div.style.border).toMatch(/rgb\(201,\s*162,\s*39\)|#c9a227/);
  });
});

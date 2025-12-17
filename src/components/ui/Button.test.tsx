import { render, screen } from '@testing-library/react';
import { Button } from './index';
import { describe, it, expect } from 'vitest';

describe('Button Component', () => {
  it('renders correctly with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('renders disabled state correctly', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByText('Disabled');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });
});

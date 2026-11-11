import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CountdownTimer } from '../components/holds/CountdownTimer';

describe('CountdownTimer Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders countdown remaining time properly', () => {
    // 5 minutes in future
    const futureDate = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    render(<CountdownTimer expiresAt={futureDate} />);

    expect(screen.getByText(/05:00/)).toBeInTheDocument();
  });

  it('displays expired message when expiration date is in the past', () => {
    const pastDate = new Date(Date.now() - 1000).toISOString();
    render(<CountdownTimer expiresAt={pastDate} />);

    expect(screen.getByText(/মেয়াদ শেষ হয়ে গেছে/i)).toBeInTheDocument();
  });

  it('fires onExpire callback when timer reaches zero', () => {
    const onExpireMock = vi.fn();
    // 2 seconds in future
    const futureDate = new Date(Date.now() + 2000).toISOString();
    render(<CountdownTimer expiresAt={futureDate} onExpire={onExpireMock} />);

    // Fast-forward by 3 seconds
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(onExpireMock).toHaveBeenCalled();
  });
});

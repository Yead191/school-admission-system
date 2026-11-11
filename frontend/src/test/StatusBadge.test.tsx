import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusBadge } from '../components/common/StatusBadge';

describe('StatusBadge Component', () => {
  it('renders CONFIRMED status correctly', () => {
    render(<StatusBadge status="CONFIRMED" />);
    expect(screen.getByText(/ভর্তি নিশ্চিত/i)).toBeInTheDocument();
  });

  it('renders HELD status correctly', () => {
    render(<StatusBadge status="HELD" />);
    expect(screen.getByText(/হোল্ডে আছে/i)).toBeInTheDocument();
  });

  it('renders EXPIRED status correctly', () => {
    render(<StatusBadge status="EXPIRED" />);
    expect(screen.getByText(/মেয়াদ শেষ/i)).toBeInTheDocument();
  });

  it('renders CANCELLED status correctly', () => {
    render(<StatusBadge status="CANCELLED" />);
    expect(screen.getByText(/বাতিল/i)).toBeInTheDocument();
  });
});

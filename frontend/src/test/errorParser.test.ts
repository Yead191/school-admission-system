import { describe, it, expect } from 'vitest';
import { parseApiError } from '../utils/errorParser';

describe('errorParser Utility', () => {
  it('maps FETCH_ERROR to friendly backend connection failure message', () => {
    const error = { status: 'FETCH_ERROR' };
    const parsed = parseApiError(error);

    expect(parsed.title).toContain('সার্ভার সংযোগ বিচ্ছিন্ন');
    expect(parsed.message).toContain('http://localhost:8080');
  });

  it('maps 409 conflict when seats are full', () => {
    const error = { status: 409, data: { message: 'No seats available for this class.' } };
    const parsed = parseApiError(error);

    expect(parsed.title).toContain('সিট খালি নেই');
    expect(parsed.status).toBe(409);
  });

  it('maps 409 conflict when student already has active hold', () => {
    const error = { status: 409, data: { message: 'Student already has an active hold' } };
    const parsed = parseApiError(error);

    expect(parsed.title).toContain('আবেদন সীমাবদ্ধতা');
    expect(parsed.message).toContain('একাধিক আবেদন গ্রহণযোগ্য নয়');
  });

  it('maps 400 bad request for expired hold', () => {
    const error = { status: 400, data: { message: 'Hold has expired and cannot be confirmed.' } };
    const parsed = parseApiError(error);

    expect(parsed.title).toContain('আবেদনের মেয়াদ শেষ');
  });
});

import {describe, expect, it} from 'vitest';

import {scheduledStartAt} from '@/types/Job';

describe('scheduledStartAt', () => {
  // workDate's UTC date IS the shift date (see scheduledStartAt's doc comment).
  it('combines the stored calendar date with a JST start time (09:00 JST = 00:00 UTC)', () => {
    expect(
      scheduledStartAt('2026-08-01T00:00:00.000Z', '09:00').toISOString(),
    ).toBe('2026-08-01T00:00:00.000Z');
  });

  it('handles an early start whose UTC instant falls on the previous day', () => {
    // 06:00 JST on Aug 1 is 2026-07-31T21:00Z.
    expect(
      scheduledStartAt('2026-08-01T00:00:00.000Z', '06:00').toISOString(),
    ).toBe('2026-07-31T21:00:00.000Z');
  });

  it('accepts a Date (the Prisma shape) as well as a string', () => {
    expect(
      scheduledStartAt(
        new Date('2026-08-01T00:00:00.000Z'),
        '09:00',
      ).toISOString(),
    ).toBe('2026-08-01T00:00:00.000Z');
  });
});

import {describe, expect, it} from 'vitest';

import {isStartWindowOpen, WORK_START_LEAD_MINUTES} from '@/types/Engagement';

describe('isStartWindowOpen', () => {
  // Shift starts 2026-08-01T00:00Z (09:00 JST).
  const workDate = '2026-08-01T00:00:00.000Z';
  const start = '09:00';

  it('is closed more than the lead time before the start', () => {
    const now = new Date('2026-07-31T23:29:00.000Z'); // 31 min before
    expect(isStartWindowOpen(workDate, start, now, 30)).toBe(false);
  });

  it('is open exactly at the lead-time boundary', () => {
    const now = new Date('2026-07-31T23:30:00.000Z'); // 30 min before
    expect(isStartWindowOpen(workDate, start, now, 30)).toBe(true);
  });

  it('stays open after the scheduled start (no upper bound)', () => {
    const now = new Date('2026-08-01T05:00:00.000Z'); // hours late
    expect(isStartWindowOpen(workDate, start, now, 30)).toBe(true);
  });

  it('respects a different lead time', () => {
    const now = new Date('2026-07-31T23:05:00.000Z'); // 55 min before
    expect(isStartWindowOpen(workDate, start, now, 30)).toBe(false);
    expect(isStartWindowOpen(workDate, start, now, 60)).toBe(true);
  });

  it('defaults the lead time to WORK_START_LEAD_MINUTES', () => {
    const startAt = Date.parse(workDate); // 09:00 JST == the shift's instant
    const atBoundary = new Date(startAt - WORK_START_LEAD_MINUTES * 60_000);
    const beforeBoundary = new Date(atBoundary.getTime() - 60_000);
    expect(isStartWindowOpen(workDate, start, atBoundary)).toBe(true);
    expect(isStartWindowOpen(workDate, start, beforeBoundary)).toBe(false);
  });
});

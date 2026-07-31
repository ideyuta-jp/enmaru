import {describe, expect, it} from 'vitest';

import {
  formatYearMonth,
  formatYearMonthRange,
  isStartWindowOpen,
  scheduledStartAt,
} from '@/utils/date';

describe('formatYearMonth', () => {
  it('formats a valid YYYY-MM string', () => {
    expect(formatYearMonth('2010-04')).toBe('2010年4月');
  });

  it('drops a leading zero in the month', () => {
    expect(formatYearMonth('2010-01')).toBe('2010年1月');
  });

  it('returns an empty string for a malformed input', () => {
    expect(formatYearMonth('')).toBe('');
    expect(formatYearMonth('2010')).toBe('');
  });
});

describe('formatYearMonthRange', () => {
  it('formats a complete range', () => {
    expect(formatYearMonthRange('2010-04', '2013-03', '現在')).toBe(
      '2010年4月 〜 2013年3月',
    );
  });

  it('uses the ongoing label when end is blank but start is set', () => {
    expect(formatYearMonthRange('2013-04', '', '現在')).toBe(
      '2013年4月 〜 現在',
    );
  });

  it('returns an empty string when start is blank, even if end is set', () => {
    expect(formatYearMonthRange('', '2013-03', '現在')).toBe('');
  });

  it('returns an empty string when both are blank', () => {
    expect(formatYearMonthRange('', '', '現在')).toBe('');
  });

  it('stays open-ended when end and endLabel are both blank', () => {
    expect(formatYearMonthRange('2013-04', '', '')).toBe('2013年4月 〜');
  });

  it('stays open-ended when end is malformed', () => {
    expect(formatYearMonthRange('2013-04', '2014', '現在')).toBe(
      '2013年4月 〜',
    );
  });
});

describe('scheduledStartAt', () => {
  it('combines the Tokyo date with a JST start time (09:00 JST = 00:00 UTC)', () => {
    expect(
      scheduledStartAt('2026-08-01T00:00:00.000Z', '09:00').toISOString(),
    ).toBe('2026-08-01T00:00:00.000Z');
  });

  it('uses the Asia/Tokyo calendar date, not the UTC date', () => {
    // Stored instant is 2026-07-31T15:00Z, which is already 2026-08-01 00:00 JST.
    // The shift date is Aug 1 (JST), so a 09:00 start is 2026-08-01T00:00Z.
    expect(
      scheduledStartAt('2026-07-31T15:00:00.000Z', '09:00').toISOString(),
    ).toBe('2026-08-01T00:00:00.000Z');
  });

  it('handles an early start whose UTC instant falls on the previous day', () => {
    // 06:00 JST on Aug 1 is 2026-07-31T21:00Z.
    expect(
      scheduledStartAt('2026-08-01T00:00:00.000Z', '06:00').toISOString(),
    ).toBe('2026-07-31T21:00:00.000Z');
  });
});

describe('isStartWindowOpen', () => {
  // Shift starts 2026-08-01T00:00Z (09:00 JST); lead time 30 minutes.
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
});

import {describe, expect, it} from 'vitest';

import {formatYearMonth, formatYearMonthRange} from '@/utils/date';

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

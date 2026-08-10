import {describe, expect, it} from 'vitest';

import {
  calcAge,
  formatYearMonth,
  formatYearMonthCells,
  formatYearMonthDay,
  formatYearMonthRange,
} from '@/utils/date';

describe('calcAge', () => {
  it('counts full years when the birthday has passed this year', () => {
    expect(calcAge('1995-04-01', '2026-08-10')).toBe(31);
  });

  it('subtracts a year when the birthday is still ahead this year', () => {
    expect(calcAge('1995-12-01', '2026-08-10')).toBe(30);
  });

  it('counts the birthday itself as already turned', () => {
    expect(calcAge('1995-08-10', '2026-08-10')).toBe(31);
  });

  it('returns null when either date is malformed', () => {
    expect(calcAge('', '2026-08-10')).toBeNull();
    expect(calcAge('1995-04-01', '')).toBeNull();
  });
});

describe('formatYearMonthCells', () => {
  it('splits a valid YYYY-MM string into labeled cells', () => {
    expect(formatYearMonthCells('2010-04')).toEqual({
      year: '2010年',
      month: '4月',
    });
  });

  it('returns blank cells for a malformed input', () => {
    expect(formatYearMonthCells('')).toEqual({year: '', month: ''});
    expect(formatYearMonthCells('2010')).toEqual({year: '', month: ''});
  });
});

describe('formatYearMonthDay', () => {
  it('formats a valid YYYY-MM-DD string, dropping leading zeros', () => {
    expect(formatYearMonthDay('1995-04-01')).toBe('1995年4月1日');
  });

  it('returns an empty string for a malformed input', () => {
    expect(formatYearMonthDay('')).toBe('');
    expect(formatYearMonthDay('1995-04')).toBe('');
  });
});

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

import {describe, expect, it} from 'vitest';

import {
  calcAge,
  formatDate,
  formatDateTime,
  formatMonthDayTime,
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

// Every instant formatter renders in JST no matter where the clock runs: 15:30
// UTC on Aug 31 is already Sep 1 in Japan. These expectations hold under any
// host TZ (run the file with TZ=UTC to see the pin doing its work).
describe('formatDate / formatDateTime / formatMonthDayTime', () => {
  const iso = '2026-08-31T15:30:00.000Z';

  it('formatDate renders the JST calendar date with the year', () => {
    expect(formatDate(iso)).toBe('2026/9/1');
    expect(formatDate(new Date(iso))).toBe('2026/9/1');
  });

  it("formatDate keeps a date-only 'YYYY-MM-DD' on its own day", () => {
    expect(formatDate('2026-09-01')).toBe('2026/9/1');
  });

  it('formatDateTime renders the full JST date and time', () => {
    expect(formatDateTime(iso)).toBe('2026/9/1 00:30');
  });

  it('formatMonthDayTime renders month/day and time without the year', () => {
    expect(formatMonthDayTime(iso)).toBe('9/1 00:30');
  });
});

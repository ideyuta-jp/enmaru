// Shared date/time formatting. Pure, tier-neutral helpers (no I/O, no React).

// 'HH:mm' -> minutes since midnight, for duration math (a lexicographic
// compare can order times but cannot measure a duration such as the job
// form's 1-hour minimum).
export function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

// "M/D HH:mm" in Japanese locale — the timestamp shown on chat bubbles and
// notification rows. Accepts an ISO string or a Date.
export function formatDateTime(value: string | Date): string {
  return new Date(value).toLocaleString('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Today's calendar date in JST as 'YYYY-MM-DD'. Compare calendar dates in
// the service's locale — the server clock may run in UTC, and
// toISOString-style UTC dates lag Japan by 9 hours around midnight. The
// 'en-CA' locale is what makes Intl emit the lexicographically comparable
// 'YYYY-MM-DD' shape.
export function todayInJst(): string {
  return new Intl.DateTimeFormat('en-CA', {timeZone: 'Asia/Tokyo'}).format(
    new Date(),
  );
}

// 'YYYY-MM' format check ('' also passes — an unset date isn't a format
// error, only a filled-but-malformed one is). The year/month Selects in
// ResumeForm can only ever commit a well-formed pair, but a direct action
// call bypasses that — this is the server-side backstop
// (validateResumeInput in server/resume.ts).
export function isValidYearMonth(value: string): boolean {
  return value === '' || /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

// 'YYYY-MM-DD' birth-date check ('' also passes — same convention as
// isValidYearMonth). The round trip through Date catches days that don't
// exist on the calendar: JS rolls them over instead of failing ('2001-02-29'
// parses to 2001-03-01), so a parse-only NaN check would let a silently
// different date get stored. Future dates are rejected against the JST
// calendar day. Shared by ResumeForm (inline error) and validateResumeInput
// (server backstop).
export function isValidBirthDate(value: string): boolean {
  if (value === '') return true;
  const parsed = new Date(value);
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value &&
    value <= todayInJst()
  );
}

// 'YYYY-MM-DD' birth date + 'YYYY-MM-DD' today -> age in full years, JIS
// resumes' conventional "満n歳". Returns null if either date is malformed.
// Used by the résumé PDF renderer (server/resume-pdf.tsx).
export function calcAge(birthDate: string, todayIso: string): number | null {
  const b = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate);
  const t = /^(\d{4})-(\d{2})-(\d{2})$/.exec(todayIso);
  if (!b || !t) return null;
  const [by, bm, bd] = [Number(b[1]), Number(b[2]), Number(b[3])];
  const [ty, tm, td] = [Number(t[1]), Number(t[2]), Number(t[3])];
  let age = ty - by;
  if (tm < bm || (tm === bm && td < bd)) age -= 1;
  return age;
}

// A start/end 'YYYY-MM' pair is out of order only once both halves are set —
// a still-open-ended entry (在学中/現在勤務中) has nothing to compare
// against. Shared by ResumeForm (inline error) and validateResumeInput
// (server backstop).
export function isYearMonthRangeOutOfOrder(
  start: string,
  end: string,
): boolean {
  return start !== '' && end !== '' && start > end;
}

// 'YYYY-MM-DD' -> '1995年4月1日'. Returns '' for an empty/malformed input.
// The full-date sibling of formatYearMonth — used by the résumé PDF renderer
// for the birth date and the 作成日 header.
export function formatYearMonthDay(date: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return '';
  return `${match[1]}年${Number(match[2])}月${Number(match[3])}日`;
}

// 'YYYY-MM' -> '2010年4月'. Returns '' for an empty/malformed input. Used by
// formatYearMonthRange below for ResumeForm's range summaries; the résumé PDF
// renderer instead splits the pair into separate table cells with
// formatYearMonthCells.
export function formatYearMonth(yearMonth: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(yearMonth);
  if (!match) return '';
  return `${match[1]}年${Number(match[2])}月`;
}

// 'YYYY-MM' -> {year: '2010年', month: '4月'}. Both '' for an
// empty/malformed input, so the résumé PDF's 年/月 table cells render blank
// rather than throwing. The per-cell counterpart of formatYearMonth, for the
// JIS-style tables in server/resume-pdf.tsx.
export function formatYearMonthCells(yearMonth: string): {
  year: string;
  month: string;
} {
  const match = /^(\d{4})-(\d{2})$/.exec(yearMonth);
  if (!match) return {year: '', month: ''};
  return {year: `${match[1]}年`, month: `${Number(match[2])}月`};
}

// A start/end 'YYYY-MM' pair rendered as one human range — used by
// ResumeForm to show a quick "2010年4月 〜 2013年3月" summary under each
// education/work-history row so the seeker can confirm what they entered
// without generating the PDF. `endLabel` is what to show when `end` is blank
// but `start` is set (an ongoing entry: 在学中 for education, 現在勤務中 for
// work history). Returns '' when `start` itself is blank — an ongoing label
// with no start date isn't a meaningful range. When no end text can be
// produced either (blank `endLabel`, or a malformed `end`), the range stays
// open-ended ('2010年4月 〜') instead of trailing off after a dangling
// separator.
export function formatYearMonthRange(
  start: string,
  end: string,
  endLabel: string,
): string {
  const startText = formatYearMonth(start);
  if (!startText) return '';
  const endText = end ? formatYearMonth(end) : endLabel;
  return endText ? `${startText} 〜 ${endText}` : `${startText} 〜`;
}

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

// 'YYYY-MM' -> '2010年4月'. Returns '' for an empty/malformed input. Shared by
// the résumé PDF renderer (server/resume-pdf.tsx) and ResumeForm (client) —
// kept here rather than in resume-pdf.tsx so the client form doesn't pull in
// that file's @react-pdf/renderer/Node-only dependencies.
export function formatYearMonth(yearMonth: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(yearMonth);
  if (!match) return '';
  return `${match[1]}年${Number(match[2])}月`;
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

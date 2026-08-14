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

// Absolute instant of a shift's scheduled start. `workDateIso` is the stored
// workDate — UTC midnight of the shift's calendar date (created via
// new Date('YYYY-MM-DD'); see acceptingJobWhere in server/job.ts), so the
// calendar date is read back with UTC getters, matching every other reader of
// this field. `workTimeStart` is a JST 'HH:mm' wall-clock time on that date.
// JST is a fixed UTC+9 with no DST, so the UTC instant is just the wall clock
// minus 9 hours.
export function scheduledStartAt(
  workDateIso: string,
  workTimeStart: string,
): Date {
  const workDate = new Date(workDateIso);
  const [hh, mm] = workTimeStart.split(':').map(Number);
  return new Date(
    Date.UTC(
      workDate.getUTCFullYear(),
      workDate.getUTCMonth(),
      workDate.getUTCDate(),
      hh - 9,
      mm,
    ),
  );
}

// Whether `now` has reached the point `leadMinutes` before the shift's scheduled
// start — the single gate for the "start work" action, so the button and the
// server action stay in lockstep. There is no upper bound: once open it stays
// open (a late start is allowed).
export function isStartWindowOpen(
  workDateIso: string,
  workTimeStart: string,
  now: Date,
  leadMinutes: number,
): boolean {
  const start = scheduledStartAt(workDateIso, workTimeStart);
  return now.getTime() >= start.getTime() - leadMinutes * 60_000;
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

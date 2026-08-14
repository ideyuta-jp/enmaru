import {scheduledStartAt} from '@/types/Job';

// The two axes of an Engagement, mirroring the Prisma enums. These are the
// source of truth for an engagement's state; the single status chip the UI shows
// is derived from both at the presentation layer (see StatusChip), not stored as
// a third flattened enum.

// Work lifecycle. An Engagement is born at MATCHED (matching is immediate), then
// progresses as the shift is worked and confirmed.
export type EngagementStatus = 'MATCHED' | 'WORKING' | 'COMPLETED';

export const EngagementStatus = {
  MATCHED: 'MATCHED',
  WORKING: 'WORKING',
  COMPLETED: 'COMPLETED',
} as const;

// How many minutes before a shift's scheduled start the seeker may press
// "start work" (MATCHED -> WORKING). Before this window the action is locked, to
// stop an accidental early press. Shared by the button (UX lock) and the
// startWork server action (authoritative gate) so both agree on the boundary.
// A developer-level constant, not a user/admin setting and not per-posting — the
// value may later become 60, but it is only ever changed here in code.
export const WORK_START_LEAD_MINUTES = 30;

/**
 * Decides whether the "start work" action is allowed yet — the single gate
 * shared by the button (UX lock) and the startWork server action
 * (authoritative gate).
 *
 * @param workDate The posting's stored workDate (same shape as
 *   scheduledStartAt's).
 * @param workTimeStart The shift's start time, as JST 'HH:mm'.
 * @param now The clock to judge against.
 * @param leadMinutes How long before the scheduled start the window opens.
 *   Defaults to WORK_START_LEAD_MINUTES; a parameter only so tests can pin
 *   the boundary — real call sites never pass it.
 * @returns true once `now` is within `leadMinutes` of the scheduled start.
 *
 * NOTE: There is no upper bound — once open the window stays open (a late
 * start is allowed).
 */
export function isStartWindowOpen(
  workDate: string | Date,
  workTimeStart: string,
  now: Date,
  leadMinutes: number = WORK_START_LEAD_MINUTES,
): boolean {
  const start = scheduledStartAt(workDate, workTimeStart);
  return now.getTime() >= start.getTime() - leadMinutes * 60_000;
}

// Mutual-review progress, independent of the work lifecycle: neither side has
// reviewed, one side has, or both have. Only meaningful once the work is
// COMPLETED.
export type ReviewStatus = 'NONE' | 'PARTIAL' | 'DONE';

export const ReviewStatus = {
  NONE: 'NONE',
  PARTIAL: 'PARTIAL',
  DONE: 'DONE',
} as const;

// Read-only context shown above the chat: the engagement's current stage and the
// posting details, so each party can recall what the engagement is about. The
// chat panel polls the messages (ChatThread) separately, so this is fetched once
// on page load and kept out of the polled payload.
export interface EngagementSummary {
  // The viewer's side, so the header can show the counterpart: a seeker sees the
  // nursery + city, a nursery sees the seeker's name.
  viewerParty: 'SEEKER' | 'NURSERY';
  engagementStatus: EngagementStatus;
  reviewStatus: ReviewStatus;
  jobTitle: string;
  nurseryName: string;
  nurseryCity: string | null;
  seekerName: string;
  workDate: string; // ISO 8601
  workTimeStart: string; // 'HH:mm'
  workTimeEnd: string; // 'HH:mm'
  hourlyWage: number | null;
  workContent: string;
  // Whether each party has filed its work-completion report; drives the
  // work-flow actions (start / report) shown on the detail page.
  seekerReported: boolean;
  nurseryReported: boolean;
}

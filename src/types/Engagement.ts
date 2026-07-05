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
  // nursery + area, a nursery sees the seeker's name.
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

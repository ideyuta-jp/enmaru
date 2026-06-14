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

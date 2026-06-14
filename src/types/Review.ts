// Review inputs, one shape per direction. Numeric criteria are 1-5; the server
// re-validates them. Mirrors the ReviewNurseryToSeeker / ReviewSeekerToNursery
// columns in the Prisma schema.

export interface NurseryToSeekerReviewInput {
  attitude: number;
  communication: number;
  skill: number;
  comment: string;
  wouldRehire: boolean;
}

export interface SeekerToNurseryReviewInput {
  explanation: number;
  atmosphere: number;
  support: number;
  clarity: number;
  comment: string;
  wouldWorkAgain: boolean;
}

// What a review page needs to render: who is being reviewed, the job context, and
// whether this viewer may review now (engagement COMPLETED and they are a party)
// or has already done so. The action re-checks all of this authoritatively.
export interface ReviewTarget {
  engagementId: string;
  // The party being reviewed by the viewer (nursery name for a seeker's review,
  // seeker display name for a nursery's review).
  counterpartName: string;
  jobTitle: string;
  workDate: string;
  eligible: boolean;
  alreadyReviewed: boolean;
}

// The two review tables, named by direction. The admin publication toggle uses
// this to know which table a review row lives in.
export type ReviewDirection = 'NURSERY_TO_SEEKER' | 'SEEKER_TO_NURSERY';

export const ReviewDirection = {
  NURSERY_TO_SEEKER: 'NURSERY_TO_SEEKER',
  SEEKER_TO_NURSERY: 'SEEKER_TO_NURSERY',
} as const;

// A submitted review as the admin moderation console sees it. Both directions are
// projected into this one shape (criteria flattened to labelled scores) so the
// console lists them uniformly and toggles publication.
export interface AdminReview {
  id: string;
  direction: ReviewDirection;
  nurseryName: string;
  seekerDisplayName: string;
  jobTitle: string;
  scores: {label: string; value: number}[];
  comment: string | null;
  // wouldRehire (nursery→seeker) or wouldWorkAgain (seeker→nursery).
  recommend: boolean;
  isPublished: boolean;
  reviewedAt: string;
}

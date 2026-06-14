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

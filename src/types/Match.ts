import type {EngagementStatus, ReviewStatus} from '@/types/Engagement';

// An engagement as seen by a nursery in its application inbox. Every entry is a
// matched Engagement (matching is immediate, so applying establishes the match),
// so the seeker's real name, blank-years, and work experience are disclosed to
// the nursery here. State is carried as the two real axes; StatusChip derives the
// single display badge from them.
export interface NurseryMatch {
  id: string;
  engagementStatus: EngagementStatus;
  reviewStatus: ReviewStatus;
  jobTitle: string;
  workDate: string;
  workTimeStart: string;
  workTimeEnd: string;
  seekerDisplayName: string;
  seekerRealName: string;
  seekerPreferredPeriod: string[];
  seekerPreferredTimeSlot: string[];
  seekerBlankYears: string | null;
  seekerExperience: string | null;
  applyMessage: string | null;
  lineContactOk: boolean;
  appliedAt: string;
  // Whether this nursery has already reviewed the seeker; drives the review CTA
  // once the engagement is COMPLETED.
  nurseryReviewed: boolean;
}

// An engagement as seen by an admin in the matching console. Admins can see the
// seeker's real name and the operator memo.
export interface AdminMatch {
  id: string;
  engagementStatus: EngagementStatus;
  reviewStatus: ReviewStatus;
  adminMemo: string | null;
  createdAt: string;
  jobTitle: string;
  workDate: string;
  nurseryName: string;
  nurseryCity: string | null;
  seekerDisplayName: string;
  seekerRealName: string | null;
}

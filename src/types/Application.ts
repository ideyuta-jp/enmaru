import type {SeekerDocumentType} from '@/types/Document';
import type {EngagementStatus, ReviewStatus} from '@/types/Engagement';

// One row in a seeker's application history. Each is a matched Engagement
// (matching is immediate); its state is the two real axes, from which the UI
// derives the status badge.
export interface SeekerApplication {
  id: string;
  jobTitle: string;
  nurseryName: string;
  workDate: string;
  workTimeStart: string;
  workTimeEnd: string;
  appliedAt: string;
  engagementStatus: EngagementStatus;
  reviewStatus: ReviewStatus;
  // Whether this seeker has already reviewed the nursery; drives the review CTA
  // once the engagement is COMPLETED.
  seekerReviewed: boolean;
}

// What the apply page needs to render the form and gate submission: the posting
// summary plus this seeker's eligibility. `missingDocuments` lists required
// documents that are not yet APPROVED — non-empty blocks applying.
export interface ApplyTarget {
  jobId: string;
  nurseryName: string;
  title: string;
  workDate: string;
  workTimeStart: string;
  workTimeEnd: string;
  isOpen: boolean;
  alreadyApplied: boolean;
  missingDocuments: SeekerDocumentType[];
}

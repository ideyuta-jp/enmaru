import type {SeekerDocumentType} from '@/types/Document';
import type {MatchStatus} from '@/types/Match';

// One row in a seeker's application history. Matching is immediate, so an
// application always has a status (it is born at MATCHED).
export interface SeekerApplication {
  id: string;
  jobTitle: string;
  nurseryName: string;
  workDate: string;
  workTimeStart: string;
  workTimeEnd: string;
  appliedAt: string;
  matchStatus: MatchStatus;
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

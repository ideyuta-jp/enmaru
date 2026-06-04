import type {MatchStatus} from '@/types/Match';

// One row in a seeker's application history. `matchStatus` is null until the
// operator has created a match for this application.
export interface SeekerApplication {
  id: string;
  jobTitle: string;
  nurseryName: string;
  workDate: string;
  workTimeStart: string;
  workTimeEnd: string;
  appliedAt: string;
  matchStatus: MatchStatus | null;
}

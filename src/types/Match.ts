// Display status of a match. Matching is immediate, so a match is born at MATCHED
// (there is no pre-match APPLIED/SCREENING state); the later values fold in the
// review axis. This flattening of EngagementStatus + ReviewStatus is to be
// reshaped before #31/#32 build on it (tracked in #40).
export type MatchStatus =
  | 'MATCHED'
  | 'WORKING'
  | 'COMPLETED'
  | 'REVIEW_OPEN'
  | 'REVIEW_DONE';

export interface MatchStatusStyle {
  label: string;
  bg: string;
  color: string;
}

// Display label and chip colours per status. Colours follow the design system
// (docs reference: status chip section). Keyed by every MatchStatus so a missing
// entry is a compile error rather than a silent fallback.
export const MATCH_STATUS_CONFIG: Record<MatchStatus, MatchStatusStyle> = {
  MATCHED: {label: 'マッチング成立', bg: '#E8F5E9', color: '#2E7D32'},
  WORKING: {label: '業務実施中', bg: '#E3F2FD', color: '#1565C0'},
  COMPLETED: {label: '業務完了', bg: '#F3E5F5', color: '#6A1B9A'},
  REVIEW_OPEN: {label: '評価受付中', bg: '#FFF0F3', color: '#F4A7B9'},
  REVIEW_DONE: {label: '評価完了', bg: '#F9F9F9', color: '#AAAAAA'},
};

// Derive the display status from an Engagement's stored fields. Review progress
// is a separate axis (ReviewStatus) that we fold into the single display status
// the UI shows. The parameter unions mirror the Prisma enums.
export function toMatchStatus(
  status: 'MATCHED' | 'WORKING' | 'COMPLETED',
  reviewStatus: 'NONE' | 'PARTIAL' | 'DONE',
): MatchStatus {
  if (status === 'COMPLETED') {
    if (reviewStatus === 'DONE') return 'REVIEW_DONE';
    if (reviewStatus === 'PARTIAL') return 'REVIEW_OPEN';
    return 'COMPLETED';
  }
  return status;
}

// A match as seen by a nursery in its application inbox. Every entry is a matched
// Engagement (matching is immediate, so applying establishes the match), so the
// seeker's real name is disclosed to the nursery here.
export interface NurseryMatch {
  id: string;
  status: MatchStatus;
  jobTitle: string;
  workDate: string;
  workTimeStart: string;
  workTimeEnd: string;
  seekerDisplayName: string;
  seekerRealName: string;
  seekerPreferredStyle: string[];
  applyMessage: string | null;
  lineContactOk: boolean;
  appliedAt: string;
}

// A match as seen by an admin in the matching console. Admins can see the
// seeker's real name and the operator memo.
export interface AdminMatch {
  id: string;
  status: MatchStatus;
  adminMemo: string | null;
  createdAt: string;
  jobTitle: string;
  workDate: string;
  nurseryName: string;
  nurseryArea: string;
  seekerDisplayName: string;
  seekerRealName: string | null;
}

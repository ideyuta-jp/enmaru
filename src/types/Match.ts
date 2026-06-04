// Lifecycle of a match, from application through mutual review.
export type MatchStatus =
  | 'APPLIED'
  | 'SCREENING'
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
  APPLIED: {label: '応募中', bg: '#F9F9F9', color: '#666666'},
  SCREENING: {label: '確認中', bg: '#FFF8E1', color: '#F9A825'},
  MATCHED: {label: 'マッチング成立', bg: '#E8F5E9', color: '#2E7D32'},
  WORKING: {label: '業務実施中', bg: '#E3F2FD', color: '#1565C0'},
  COMPLETED: {label: '業務完了', bg: '#F3E5F5', color: '#6A1B9A'},
  REVIEW_OPEN: {label: '評価受付中', bg: '#FFF0F3', color: '#F4A7B9'},
  REVIEW_DONE: {label: '評価完了', bg: '#F9F9F9', color: '#AAAAAA'},
};

// Status order used to populate the admin status selector and to reason about
// progression. Matches the lifecycle diagram in the basic-design doc.
export const MATCH_STATUS_ORDER: MatchStatus[] = [
  'APPLIED',
  'SCREENING',
  'MATCHED',
  'WORKING',
  'COMPLETED',
  'REVIEW_OPEN',
  'REVIEW_DONE',
];

// A match as seen by a nursery in its application inbox. The seeker's real name
// is intentionally absent until the match is established.
export interface NurseryMatch {
  id: string;
  status: MatchStatus;
  jobTitle: string;
  workDate: string;
  workTimeStart: string;
  workTimeEnd: string;
  seekerDisplayName: string;
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

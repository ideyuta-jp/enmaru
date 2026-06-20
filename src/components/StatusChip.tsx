import Chip from '@mui/material/Chip';

import type {EngagementStatus, ReviewStatus} from '@/types/Engagement';

// Presentation-only: the single badge shown for an engagement, derived from the
// two real axes (EngagementStatus + ReviewStatus). This "stage" exists only to
// render one coherent chip — it is not a domain concept and is never stored or
// passed around; the source of truth is the two axes on the engagement.
type DisplayStage =
  | 'MATCHED'
  | 'WORKING'
  | 'COMPLETED'
  | 'REVIEW_OPEN'
  | 'REVIEW_DONE';

interface StageStyle {
  label: string;
  bg: string;
  color: string;
}

// Label and chip colours per stage. Colours follow the design system (docs
// reference: status chip section).
const STAGE_CONFIG: Record<DisplayStage, StageStyle> = {
  MATCHED: {label: 'マッチング成立', bg: '#E8F5E9', color: '#2E7D32'},
  WORKING: {label: '業務実施中', bg: '#E3F2FD', color: '#1565C0'},
  COMPLETED: {label: '業務完了', bg: '#F3E5F5', color: '#6A1B9A'},
  REVIEW_OPEN: {label: '評価受付中', bg: '#FFF0F3', color: '#F4A7B9'},
  REVIEW_DONE: {label: '評価完了', bg: '#F9F9F9', color: '#AAAAAA'},
};

// Once the work is COMPLETED, the review axis takes over the badge; before that
// the work lifecycle drives it.
function toDisplayStage(
  engagementStatus: EngagementStatus,
  reviewStatus: ReviewStatus,
): DisplayStage {
  if (engagementStatus === 'COMPLETED') {
    if (reviewStatus === 'DONE') return 'REVIEW_DONE';
    if (reviewStatus === 'PARTIAL') return 'REVIEW_OPEN';
    return 'COMPLETED';
  }
  return engagementStatus;
}

interface Props {
  engagementStatus: EngagementStatus;
  reviewStatus: ReviewStatus;
}

export default function StatusChip({engagementStatus, reviewStatus}: Props) {
  const config = STAGE_CONFIG[toDisplayStage(engagementStatus, reviewStatus)];

  return (
    <Chip
      label={config.label}
      size="small"
      sx={{
        backgroundColor: config.bg,
        color: config.color,
        fontWeight: 500,
        borderRadius: '4px',
        border: 'none',
      }}
    />
  );
}

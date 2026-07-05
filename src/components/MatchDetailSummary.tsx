import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import SectionHeading from '@/components/SectionHeading';
import StatusChip from '@/components/StatusChip';
import type {EngagementSummary} from '@/types/Engagement';

// Read-only header shown above the chat: the engagement's stage and the posting
// details, so each party can recall what the conversation is about.
export default function MatchDetailSummary({
  summary,
}: {
  summary: EngagementSummary;
}) {
  // The header leads with the counterpart: a seeker sees the nursery, a nursery
  // sees the seeker.
  const counterpartName =
    summary.viewerParty === 'NURSERY'
      ? summary.seekerName
      : summary.nurseryName;

  return (
    <>
      <SectionHeading subtitle={counterpartName}>マッチング詳細</SectionHeading>

      <Box sx={{mb: 2}}>
        <StatusChip
          engagementStatus={summary.engagementStatus}
          reviewStatus={summary.reviewStatus}
        />
      </Box>

      <Box
        sx={{
          p: 2,
          bgcolor: '#FAFAFA',
          borderRadius: 2,
          border: '1px solid #E0E0E0',
          mb: 3,
        }}
      >
        <Typography variant="subtitle2" sx={{fontWeight: 700, mb: 1}}>
          {summary.jobTitle}
        </Typography>
        {summary.viewerParty === 'NURSERY' ? (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{display: 'block', mb: 0.5}}
          >
            👤 担当：{summary.seekerName}
          </Typography>
        ) : (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{display: 'block', mb: 0.5}}
          >
            📍 {summary.nurseryName}{summary.nurseryCity ? `（${summary.nurseryCity}）` : ''}
          </Typography>
        )}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{display: 'block', mb: 0.5}}
        >
          📅 {new Date(summary.workDate).toLocaleDateString('ja-JP')}{' '}
          {summary.workTimeStart}〜{summary.workTimeEnd}
        </Typography>
        {summary.hourlyWage !== null && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{display: 'block', mb: 0.5}}
          >
            💴 時給 {summary.hourlyWage.toLocaleString()}円
          </Typography>
        )}
        <Divider sx={{my: 1.5}} />
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{whiteSpace: 'pre-wrap'}}
        >
          {summary.workContent}
        </Typography>
      </Box>
    </>
  );
}

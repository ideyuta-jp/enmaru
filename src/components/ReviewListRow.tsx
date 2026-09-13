import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';

import {formatDate} from '@/utils/date';

// One row of a reviews list (seeker or nursery): the counterpart and posting
// summary, plus a 評価する button or a 評価済み chip. Shared by both reviews
// pages so the markup stays in one place.
interface Props {
  counterpartName: string;
  jobTitle: string;
  workDate: string; // ISO 8601 or 'YYYY-MM-DD'
  workTimeStart: string;
  workTimeEnd: string;
  reviewed: boolean;
  reviewHref: string;
}

export default function ReviewListRow({
  counterpartName,
  jobTitle,
  workDate,
  workTimeStart,
  workTimeEnd,
  reviewed,
  reviewHref,
}: Props) {
  return (
    <Box
      sx={{
        p: 2,
        bgcolor: '#FAFAFA',
        borderRadius: 2,
        border: '1px solid #E0E0E0',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 1,
      }}
    >
      <Box>
        <Typography variant="caption" color="text.secondary">
          {counterpartName}
        </Typography>
        <Typography variant="subtitle2" sx={{fontWeight: 700}}>
          {jobTitle}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {formatDate(workDate)} / {workTimeStart}〜{workTimeEnd}
        </Typography>
      </Box>
      <Box sx={{flexShrink: 0}}>
        {reviewed ? (
          <Chip
            label="評価済み"
            size="small"
            sx={{bgcolor: '#E8F5E9', color: '#2E7D32', fontSize: '0.75rem'}}
          />
        ) : (
          <Button href={reviewHref} variant="contained" size="small">
            評価する
          </Button>
        )}
      </Box>
    </Box>
  );
}

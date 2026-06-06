import Chip from '@mui/material/Chip';

import {MATCH_STATUS_CONFIG} from '@/types/Match';
import type {MatchStatus} from '@/types/Match';

interface Props {
  status: MatchStatus;
}

export default function StatusChip({status}: Props) {
  const config = MATCH_STATUS_CONFIG[status];

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

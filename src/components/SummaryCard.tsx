import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface Props {
  label: string;
  value: number;
  unit: string;
}

// A single metric tile used on the seeker / nursery dashboards.
export default function SummaryCard({label, value, unit}: Props) {
  return (
    <Box
      sx={{
        bgcolor: '#F9F9F9',
        borderRadius: 2,
        p: {xs: 1.5, md: 2},
        textAlign: 'center',
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{display: 'block', mb: 0.5}}
      >
        {label}
      </Typography>
      <Typography
        variant="h3"
        sx={{fontSize: {xs: '1.75rem', md: '2rem'}, color: '#F4A7B9'}}
      >
        {value}
        <Typography
          component="span"
          variant="caption"
          color="text.secondary"
          sx={{ml: 0.5}}
        >
          {unit}
        </Typography>
      </Typography>
    </Box>
  );
}

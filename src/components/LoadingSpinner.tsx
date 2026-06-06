import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

interface Props {
  fullPage?: boolean;
}

export default function LoadingSpinner({fullPage = false}: Props) {
  if (fullPage) {
    return (
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(255,255,255,0.8)',
          zIndex: 9999,
        }}
      >
        <CircularProgress sx={{color: '#F4A7B9'}} />
      </Box>
    );
  }

  return (
    <Box sx={{display: 'flex', justifyContent: 'center', py: 6}}>
      <CircularProgress sx={{color: '#F4A7B9'}} />
    </Box>
  );
}

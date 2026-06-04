import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

interface Props {
  message: string | null | undefined;
}

export default function ErrorAlert({message}: Props) {
  if (!message) return null;

  return (
    <Box sx={{mb: 2}}>
      <Alert severity="error" sx={{borderRadius: 2}}>
        {message}
      </Alert>
    </Box>
  );
}

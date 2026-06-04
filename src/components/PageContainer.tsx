import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

interface Props {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg';
  py?: number;
}

export default function PageContainer({
  children,
  maxWidth = 'lg',
  py = 4,
}: Props) {
  return (
    <Container maxWidth={maxWidth} sx={{px: {xs: 2, md: 3}}}>
      <Box sx={{py: {xs: py * 0.75, md: py}}}>{children}</Box>
    </Container>
  );
}

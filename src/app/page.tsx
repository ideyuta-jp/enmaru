import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

export default function Home() {
  return (
    <Container maxWidth="sm" sx={{py: 8}}>
      <Typography variant="h4" component="h1" gutterBottom>
        enmaru
      </Typography>
      <Typography color="text.secondary">
        Next.js + Prisma + Neon starter. Edit <code>src/app/page.tsx</code> to
        get started.
      </Typography>
    </Container>
  );
}

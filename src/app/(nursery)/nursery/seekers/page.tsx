import type {Metadata} from 'next';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import Footer from '@/components/Footer';
import PageContainer from '@/components/PageContainer';
import SectionHeading from '@/components/SectionHeading';
import SeekerCard from '@/components/SeekerCard';
import SessionHeader from '@/components/SessionHeader';
import {listPublishedSeekers} from '@/server/seeker';

export const metadata: Metadata = {
  title: '保育士を探す',
};

// Backed by a live DB query (published seekers), so it renders per-request. The
// (nursery) layout guards the whole group; listPublishedSeekers guards again.
export const dynamic = 'force-dynamic';

export default async function NurserySeekersPage() {
  const seekers = await listPublishedSeekers();

  return (
    <>
      <SessionHeader />
      <PageContainer>
        <SectionHeading subtitle="公開中の保育士バディのプロフィールを閲覧できます">
          保育士を探す
        </SectionHeading>

        {seekers.length === 0 ? (
          <Box sx={{textAlign: 'center', py: 8}}>
            <Typography color="text.secondary">
              現在公開中の保育士はいません
            </Typography>
          </Box>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
              {seekers.length}名の保育士
            </Typography>
            <Grid container spacing={{xs: 1.5, md: 2}}>
              {seekers.map((seeker) => (
                <Grid size={{xs: 12, sm: 6, md: 4}} key={seeker.id}>
                  <SeekerCard
                    seeker={seeker}
                    href={`/nursery/seekers/${seeker.id}`}
                  />
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </PageContainer>
      <Footer />
    </>
  );
}

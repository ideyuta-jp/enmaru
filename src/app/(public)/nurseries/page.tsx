import type {Metadata} from 'next';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import Footer from '@/components/Footer';
import NurseryCard from '@/components/NurseryCard';
import PageContainer from '@/components/PageContainer';
import SectionHeading from '@/components/SectionHeading';
import SiteHeader from '@/components/SiteHeader';
import {listPublishedNurseries} from '@/server/nursery';

export const metadata: Metadata = {
  title: '保育園一覧',
  description:
    '保育園・保育施設の一覧です。スポットサポートを募集している保育園を探せます。',
};

// Backed by a live DB query, so it renders per-request (still SSR'd for SEO).
export const dynamic = 'force-dynamic';

export default async function NurseriesPage() {
  const nurseries = await listPublishedNurseries();

  return (
    <>
      <SiteHeader />
      <PageContainer>
        <SectionHeading subtitle="スポットサポートを募集している保育施設">
          保育園一覧
        </SectionHeading>

        {nurseries.length === 0 ? (
          <Box sx={{textAlign: 'center', py: 8}}>
            <Typography color="text.secondary">
              現在公開中の保育園はありません
            </Typography>
          </Box>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
              {nurseries.length}件の保育園
            </Typography>
            <Grid container spacing={{xs: 1.5, md: 2}}>
              {nurseries.map((nursery) => (
                <Grid size={{xs: 12, sm: 6, md: 4}} key={nursery.id}>
                  <NurseryCard
                    nursery={nursery}
                    href={`/nurseries/${nursery.id}`}
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

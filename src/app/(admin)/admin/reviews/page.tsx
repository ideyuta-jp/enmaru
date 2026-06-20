import type {Metadata} from 'next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import AdminReviewRow from '@/components/AdminReviewRow';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import PageContainer from '@/components/PageContainer';
import SectionHeading from '@/components/SectionHeading';
import {listSubmittedReviews} from '@/server/review';

export const metadata: Metadata = {
  title: '評価確認',
};

export default async function AdminReviewsPage() {
  const reviews = await listSubmittedReviews();

  return (
    <>
      <Header role="ADMIN" />
      <PageContainer maxWidth="md">
        <SectionHeading subtitle="提出された評価を確認し、公開・非公開を切り替えます">
          評価確認
        </SectionHeading>

        {reviews.length === 0 ? (
          <Box sx={{textAlign: 'center', py: 6}}>
            <Typography color="text.secondary">
              提出された評価はありません
            </Typography>
          </Box>
        ) : (
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
            {reviews.map((review) => (
              <AdminReviewRow
                key={`${review.direction}:${review.id}`}
                review={review}
              />
            ))}
          </Box>
        )}
      </PageContainer>
      <Footer />
    </>
  );
}

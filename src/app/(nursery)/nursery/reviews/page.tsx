import type {Metadata} from 'next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import Footer from '@/components/Footer';
import PageContainer from '@/components/PageContainer';
import ReviewListRow from '@/components/ReviewListRow';
import SectionHeading from '@/components/SectionHeading';
import SessionHeader from '@/components/SessionHeader';
import {listNurseryMatches} from '@/server/match';
import {EngagementStatus} from '@/types/Engagement';

export const metadata: Metadata = {
  title: '評価を書く',
};

export default async function NurseryReviewsPage() {
  // Reuse the match list and keep the completed engagements — those are the ones
  // the nursery can review.
  const matches = await listNurseryMatches();
  const reviewable = matches.filter(
    (m) => m.engagementStatus === EngagementStatus.COMPLETED,
  );

  return (
    <>
      <SessionHeader />
      <PageContainer maxWidth="md">
        <SectionHeading subtitle="業務完了後に保育士への評価を入力してください">
          評価を書く
        </SectionHeading>

        {reviewable.length === 0 ? (
          <Box sx={{textAlign: 'center', py: 8}}>
            <Typography color="text.secondary">
              現在評価できる案件はありません
            </Typography>
          </Box>
        ) : (
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
            {reviewable.map((m) => (
              <ReviewListRow
                key={m.id}
                counterpartName={m.seekerDisplayName}
                jobTitle={m.jobTitle}
                workDate={m.workDate}
                workTimeStart={m.workTimeStart}
                workTimeEnd={m.workTimeEnd}
                reviewed={m.nurseryReviewed}
                reviewHref={`/nursery/reviews/${m.id}`}
              />
            ))}
          </Box>
        )}
      </PageContainer>
      <Footer />
    </>
  );
}

import type {Metadata} from 'next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import Footer from '@/components/Footer';
import PageContainer from '@/components/PageContainer';
import ReviewListRow from '@/components/ReviewListRow';
import SectionHeading from '@/components/SectionHeading';
import SessionHeader from '@/components/SessionHeader';
import {listSeekerApplications} from '@/server/application';
import {EngagementStatus} from '@/types/Engagement';

export const metadata: Metadata = {
  title: '評価を書く',
};

export default async function SeekerReviewsPage() {
  // Reuse the application list and keep the completed engagements — those are the
  // ones the seeker can review.
  const applications = await listSeekerApplications();
  const reviewable = applications.filter(
    (a) => a.engagementStatus === EngagementStatus.COMPLETED,
  );

  return (
    <>
      <SessionHeader />
      <PageContainer maxWidth="md">
        <SectionHeading subtitle="業務完了後に保育園への評価を入力してください">
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
            {reviewable.map((a) => (
              <ReviewListRow
                key={a.id}
                counterpartName={a.nurseryName}
                jobTitle={a.jobTitle}
                workDate={a.workDate}
                workTimeStart={a.workTimeStart}
                workTimeEnd={a.workTimeEnd}
                reviewed={a.seekerReviewed}
                reviewHref={`/reviews/${a.id}`}
              />
            ))}
          </Box>
        )}
      </PageContainer>
      <Footer />
    </>
  );
}

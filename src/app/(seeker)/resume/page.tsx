import type {Metadata} from 'next';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import Footer from '@/components/Footer';
import PageContainer from '@/components/PageContainer';
import ResumeForm from '@/components/ResumeForm';
import SectionHeading from '@/components/SectionHeading';
import SessionHeader from '@/components/SessionHeader';
import {requireRole} from '@/server/auth';
import {
  getResumeInput,
  hasResumePhoto,
  hasUnpublishedResumeChanges,
} from '@/server/resume';
import {getSeekerProfileInput} from '@/server/seeker';
import {EMPTY_RESUME} from '@/types/Resume';
import {UserRole} from '@/types/User';

export const metadata: Metadata = {
  title: 'WEB履歴書',
};

// Reads the session and the seeker's résumé, so it renders per-request.
export const dynamic = 'force-dynamic';

export default async function ResumePage() {
  await requireRole([UserRole.SEEKER]);
  const profile = await getSeekerProfileInput();
  if (!profile) {
    return (
      <>
        <SessionHeader />
        <PageContainer maxWidth="md">
          <SectionHeading>WEB履歴書</SectionHeading>
          <Box sx={{textAlign: 'center', py: 8}}>
            <Typography color="text.secondary" sx={{mb: 2}}>
              WEB履歴書を作成するには、先に保育士プロフィールを登録してください。
            </Typography>
            <Button href="/profile" variant="contained">
              プロフィールを登録する
            </Button>
          </Box>
        </PageContainer>
        <Footer />
      </>
    );
  }

  // getResumeInput only returns null when there's no SeekerProfile, which was
  // just ruled out above.
  const resume = (await getResumeInput()) ?? EMPTY_RESUME;
  const unpublishedChanges = await hasUnpublishedResumeChanges();
  const hasPhoto = await hasResumePhoto();

  return (
    <>
      <SessionHeader />
      <PageContainer maxWidth="md">
        <ResumeForm
          initial={resume}
          bio={profile.bio}
          unpublishedChanges={unpublishedChanges}
          hasPhoto={hasPhoto}
        />
      </PageContainer>
      <Footer />
    </>
  );
}

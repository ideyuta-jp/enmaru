import type {Metadata} from 'next';
import {redirect} from 'next/navigation';

import Footer from '@/components/Footer';
import PageContainer from '@/components/PageContainer';
import ResumeForm from '@/components/ResumeForm';
import SessionHeader from '@/components/SessionHeader';
import {requireRole} from '@/server/auth';
import {getResumeInput} from '@/server/resume';
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
  // A résumé belongs to a SeekerProfile — send the seeker to create one first,
  // same guard as the profile preview page.
  if (!profile) redirect('/profile');

  // getResumeInput only returns null when there's no SeekerProfile, which was
  // just ruled out above.
  const resume = (await getResumeInput()) ?? EMPTY_RESUME;

  return (
    <>
      <SessionHeader />
      <PageContainer maxWidth="md">
        <ResumeForm
          initial={resume}
          licenses={profile.licenses}
          bio={profile.bio}
        />
      </PageContainer>
      <Footer />
    </>
  );
}

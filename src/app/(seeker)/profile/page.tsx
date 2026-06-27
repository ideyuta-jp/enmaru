import Footer from '@/components/Footer';
import PageContainer from '@/components/PageContainer';
import SeekerProfileForm from '@/components/SeekerProfileForm';
import SessionHeader from '@/components/SessionHeader';
import {requireRole} from '@/server/auth';
import {getSeekerProfileInput} from '@/server/seeker';
import {UserRole} from '@/types/User';

// Reads the session and the seeker's profile, so it renders per-request.
export const dynamic = 'force-dynamic';

export default async function SeekerProfilePage() {
  await requireRole([UserRole.SEEKER]);
  const initial = await getSeekerProfileInput();

  return (
    <>
      <SessionHeader />
      <PageContainer maxWidth="md">
        <SeekerProfileForm initial={initial} />
      </PageContainer>
      <Footer />
    </>
  );
}

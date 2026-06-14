import Footer from '@/components/Footer';
import Header from '@/components/Header';
import PageContainer from '@/components/PageContainer';
import SeekerProfileForm from '@/components/SeekerProfileForm';
import {requireRole} from '@/server/auth';
import {getSeekerProfileInput} from '@/server/seeker';
import {UserRole} from '@/types/User';

// Reads the session and the seeker's profile, so it renders per-request.
export const dynamic = 'force-dynamic';

export default async function SeekerProfilePage() {
  const user = await requireRole([UserRole.SEEKER]);
  const initial = await getSeekerProfileInput();

  return (
    <>
      <Header role={user.role} />
      <PageContainer maxWidth="md">
        <SeekerProfileForm initial={initial} />
      </PageContainer>
      <Footer />
    </>
  );
}

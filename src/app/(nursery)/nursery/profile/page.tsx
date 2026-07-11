import Footer from '@/components/Footer';
import NurseryProfileForm from '@/components/NurseryProfileForm';
import PageContainer from '@/components/PageContainer';
import SessionHeader from '@/components/SessionHeader';
import {requireRole} from '@/server/auth';
import {getNurseryProfileWithPhotos} from '@/server/nursery';
import {UserRole} from '@/types/User';

// Reads the session and the nursery's profile, so it renders per-request.
export const dynamic = 'force-dynamic';

export default async function NurseryProfilePage() {
  await requireRole([UserRole.NURSERY]);
  const profileWithPhotos = await getNurseryProfileWithPhotos();
  const initial = profileWithPhotos?.input ?? null;

  return (
    <>
      <SessionHeader />
      <PageContainer maxWidth="md">
        <NurseryProfileForm
          initial={initial}
          nurseryId={profileWithPhotos?.id}
          initialMainPhoto={profileWithPhotos?.mainPhoto}
          initialSubPhotos={profileWithPhotos?.subPhotos}
        />
      </PageContainer>
      <Footer />
    </>
  );
}

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import NurseryProfileForm from '@/components/NurseryProfileForm';
import PageContainer from '@/components/PageContainer';
import {requireRole} from '@/server/auth';
import {getNurseryProfileInput} from '@/server/nursery';
import {UserRole} from '@/types/User';

// Reads the session and the nursery's profile, so it renders per-request.
export const dynamic = 'force-dynamic';

export default async function NurseryProfilePage() {
  const user = await requireRole([UserRole.NURSERY]);
  const initial = await getNurseryProfileInput();

  return (
    <>
      <Header role={user.role} />
      <PageContainer maxWidth="md">
        <NurseryProfileForm initial={initial} />
      </PageContainer>
      <Footer />
    </>
  );
}

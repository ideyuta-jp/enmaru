import Button from '@mui/material/Button';
import {notFound} from 'next/navigation';

import Footer from '@/components/Footer';
import PageContainer from '@/components/PageContainer';
import SeekerPublicProfile from '@/components/SeekerPublicProfile';
import SessionHeader from '@/components/SessionHeader';
import {getPublishedSeekerDetail} from '@/server/seeker';

// Nursery-facing seeker detail. Guarded by the (nursery) layout;
// getPublishedSeekerDetail guards again and returns null for missing/unpublished
// profiles, which we map to notFound (no existence disclosure).
export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{id: string}>;
}

export default async function NurserySeekerDetailPage({params}: Props) {
  const {id} = await params;
  const seeker = await getPublishedSeekerDetail(id);

  if (!seeker) notFound();

  return (
    <>
      <SessionHeader />
      <PageContainer maxWidth="sm">
        <SeekerPublicProfile seeker={seeker} />
        <Button href="/nursery/seekers" variant="outlined" sx={{mt: 1}}>
          ← 保育士一覧に戻る
        </Button>
      </PageContainer>
      <Footer />
    </>
  );
}

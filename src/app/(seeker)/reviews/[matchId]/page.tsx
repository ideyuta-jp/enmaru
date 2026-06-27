import {notFound} from 'next/navigation';

import Footer from '@/components/Footer';
import PageContainer from '@/components/PageContainer';
import SeekerReviewForm from '@/components/SeekerReviewForm';
import SessionHeader from '@/components/SessionHeader';
import {getReviewTarget} from '@/server/review';

interface Props {
  params: Promise<{matchId: string}>;
}

export default async function SeekerReviewPage({params}: Props) {
  const {matchId} = await params;
  const target = await getReviewTarget(matchId);
  if (!target) notFound();

  return (
    <>
      <SessionHeader />
      <PageContainer maxWidth="sm">
        <SeekerReviewForm target={target} />
      </PageContainer>
      <Footer />
    </>
  );
}

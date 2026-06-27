import {notFound} from 'next/navigation';

import Footer from '@/components/Footer';
import NurseryReviewForm from '@/components/NurseryReviewForm';
import PageContainer from '@/components/PageContainer';
import SessionHeader from '@/components/SessionHeader';
import {getReviewTarget} from '@/server/review';

interface Props {
  params: Promise<{matchId: string}>;
}

export default async function NurseryReviewPage({params}: Props) {
  const {matchId} = await params;
  const target = await getReviewTarget(matchId);
  if (!target) notFound();

  return (
    <>
      <SessionHeader />
      <PageContainer maxWidth="sm">
        <NurseryReviewForm target={target} />
      </PageContainer>
      <Footer />
    </>
  );
}

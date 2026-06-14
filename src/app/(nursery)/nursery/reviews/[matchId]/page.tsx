import {notFound} from 'next/navigation';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import NurseryReviewForm from '@/components/NurseryReviewForm';
import PageContainer from '@/components/PageContainer';
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
      <Header role="NURSERY" />
      <PageContainer maxWidth="sm">
        <NurseryReviewForm target={target} />
      </PageContainer>
      <Footer />
    </>
  );
}

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import NurseryReviewForm from '@/components/NurseryReviewForm';
import PageContainer from '@/components/PageContainer';

interface Props {
  params: Promise<{matchId: string}>;
}

export default async function NurseryReviewPage({params}: Props) {
  const {matchId} = await params;

  return (
    <>
      <Header role="NURSERY" />
      <PageContainer maxWidth="sm">
        <NurseryReviewForm matchId={matchId} />
      </PageContainer>
      <Footer />
    </>
  );
}

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import PageContainer from '@/components/PageContainer';
import SeekerReviewForm from '@/components/SeekerReviewForm';

interface Props {
  params: Promise<{matchId: string}>;
}

export default async function SeekerReviewPage({params}: Props) {
  const {matchId} = await params;

  return (
    <>
      <Header role="SEEKER" />
      <PageContainer maxWidth="sm">
        <SeekerReviewForm matchId={matchId} />
      </PageContainer>
      <Footer />
    </>
  );
}

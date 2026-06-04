import Footer from '@/components/Footer';
import Header from '@/components/Header';
import NurseryProfileForm from '@/components/NurseryProfileForm';
import PageContainer from '@/components/PageContainer';

export default function NurseryProfilePage() {
  return (
    <>
      <Header role="NURSERY" />
      <PageContainer maxWidth="md">
        <NurseryProfileForm />
      </PageContainer>
      <Footer />
    </>
  );
}

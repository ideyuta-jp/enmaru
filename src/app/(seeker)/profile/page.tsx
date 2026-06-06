import Footer from '@/components/Footer';
import Header from '@/components/Header';
import PageContainer from '@/components/PageContainer';
import SeekerProfileForm from '@/components/SeekerProfileForm';

export default function SeekerProfilePage() {
  return (
    <>
      <Header role="SEEKER" />
      <PageContainer maxWidth="md">
        <SeekerProfileForm />
      </PageContainer>
      <Footer />
    </>
  );
}

import Footer from '@/components/Footer';
import NewJobForm from '@/components/NewJobForm';
import PageContainer from '@/components/PageContainer';
import SessionHeader from '@/components/SessionHeader';

export default function NewJobPage() {
  return (
    <>
      <SessionHeader />
      <PageContainer maxWidth="md">
        <NewJobForm />
      </PageContainer>
      <Footer />
    </>
  );
}

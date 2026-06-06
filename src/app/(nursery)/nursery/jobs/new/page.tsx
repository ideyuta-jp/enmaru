import Footer from '@/components/Footer';
import Header from '@/components/Header';
import NewJobForm from '@/components/NewJobForm';
import PageContainer from '@/components/PageContainer';

export default function NewJobPage() {
  return (
    <>
      <Header role="NURSERY" />
      <PageContainer maxWidth="md">
        <NewJobForm />
      </PageContainer>
      <Footer />
    </>
  );
}

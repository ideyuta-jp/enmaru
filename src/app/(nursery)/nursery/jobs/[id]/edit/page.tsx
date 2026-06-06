import EditJobForm from '@/components/EditJobForm';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import PageContainer from '@/components/PageContainer';

interface Props {
  params: Promise<{id: string}>;
}

export default async function EditJobPage({params}: Props) {
  const {id} = await params;

  return (
    <>
      <Header role="NURSERY" />
      <PageContainer maxWidth="md">
        <EditJobForm jobId={id} />
      </PageContainer>
      <Footer />
    </>
  );
}

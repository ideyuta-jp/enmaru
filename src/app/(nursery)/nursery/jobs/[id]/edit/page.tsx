import {notFound} from 'next/navigation';

import EditJobForm from '@/components/EditJobForm';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import PageContainer from '@/components/PageContainer';
import {getNurseryJob} from '@/server/job';
import {toJobInput} from '@/types/Job';

interface Props {
  params: Promise<{id: string}>;
}

export default async function EditJobPage({params}: Props) {
  const {id} = await params;
  // Ownership-scoped: returns null if the posting isn't this nursery's.
  const job = await getNurseryJob(id);
  if (!job) notFound();

  return (
    <>
      <Header role="NURSERY" />
      <PageContainer maxWidth="md">
        <EditJobForm
          jobId={job.id}
          initial={toJobInput(job)}
          initialStatus={job.status}
        />
      </PageContainer>
      <Footer />
    </>
  );
}

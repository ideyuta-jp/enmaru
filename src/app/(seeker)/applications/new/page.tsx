import Typography from '@mui/material/Typography';

import ApplicationForm from '@/components/ApplicationForm';
import Footer from '@/components/Footer';
import PageContainer from '@/components/PageContainer';
import SectionHeading from '@/components/SectionHeading';
import SessionHeader from '@/components/SessionHeader';
import {getApplicationTarget} from '@/server/application';

interface Props {
  searchParams: Promise<{jobId?: string}>;
}

export default async function NewApplicationPage({searchParams}: Props) {
  const {jobId} = await searchParams;
  const target = jobId ? await getApplicationTarget(jobId) : null;

  return (
    <>
      <SessionHeader />
      <PageContainer maxWidth="sm">
        {target ? (
          <ApplicationForm target={target} />
        ) : (
          <>
            <SectionHeading>応募する</SectionHeading>
            <Typography color="text.secondary">
              募集が見つかりませんでした。
            </Typography>
          </>
        )}
      </PageContainer>
      <Footer />
    </>
  );
}

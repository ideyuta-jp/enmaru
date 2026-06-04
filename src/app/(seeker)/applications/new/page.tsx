import {Suspense} from 'react';

import ApplicationForm from '@/components/ApplicationForm';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import LoadingSpinner from '@/components/LoadingSpinner';
import PageContainer from '@/components/PageContainer';

export default function NewApplicationPage() {
  return (
    <>
      <Header role="SEEKER" />
      <PageContainer maxWidth="sm">
        {/* ApplicationForm reads the `jobId` query param, so it needs a Suspense
            boundary (useSearchParams). */}
        <Suspense fallback={<LoadingSpinner />}>
          <ApplicationForm />
        </Suspense>
      </PageContainer>
      <Footer />
    </>
  );
}

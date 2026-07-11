import AdminMatchesTable from '@/components/AdminMatchesTable';
import Footer from '@/components/Footer';
import PageContainer from '@/components/PageContainer';
import SessionHeader from '@/components/SessionHeader';
import {listAllMatches} from '@/server/match';

export default async function AdminMatchesPage() {
  const matches = await listAllMatches();

  return (
    <>
      <SessionHeader />
      <PageContainer maxWidth="lg">
        <AdminMatchesTable initialMatches={matches} />
      </PageContainer>
      <Footer />
    </>
  );
}

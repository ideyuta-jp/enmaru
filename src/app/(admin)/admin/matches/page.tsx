import AdminMatchesTable from '@/components/AdminMatchesTable';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import PageContainer from '@/components/PageContainer';
import {listAllMatches} from '@/server/match';

export default async function AdminMatchesPage() {
  const matches = await listAllMatches();

  return (
    <>
      <Header role="ADMIN" />
      <PageContainer maxWidth="lg">
        <AdminMatchesTable initialMatches={matches} />
      </PageContainer>
      <Footer />
    </>
  );
}

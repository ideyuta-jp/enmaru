import type {Metadata} from 'next';
import Typography from '@mui/material/Typography';

import Footer from '@/components/Footer';
import PageContainer from '@/components/PageContainer';
import SessionHeader from '@/components/SessionHeader';

export const metadata: Metadata = {
  title: 'ダミーページ',
  description:
    'これはダミーページです',
};

// Renders SessionHeader (reads the session), so it renders per-request.
export const dynamic = 'force-dynamic';


export default function DummyPage() {
  return (
    <>
      <SessionHeader />
      <PageContainer maxWidth="md">
        <Typography
          variant="h1"
          sx={{fontSize: {xs: '1.5rem', md: '2rem'}, mb: 1.5}}
        >
          ダミーページ
        </Typography>
      </PageContainer>
      <Footer />
    </>
  );
}

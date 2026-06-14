import type {Metadata} from 'next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import DocumentUploadRow from '@/components/DocumentUploadRow';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import PageContainer from '@/components/PageContainer';
import SectionHeading from '@/components/SectionHeading';
import {listMyDocuments} from '@/server/document';

export const metadata: Metadata = {
  title: '書類',
};

export default async function SeekerDocumentsPage() {
  const documents = await listMyDocuments();

  return (
    <>
      <Header role="SEEKER" />
      <PageContainer maxWidth="md">
        <SectionHeading subtitle="運営が確認・認証した書類のみ応募に使えます">
          書類の提出
        </SectionHeading>
        <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
          画像（JPEG / PNG / WebP）または PDF
          をアップロードしてください。検便結果は一部の募集でのみ必要です。
        </Typography>
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
          {documents.map((doc) => (
            <DocumentUploadRow key={doc.documentType} doc={doc} />
          ))}
        </Box>
      </PageContainer>
      <Footer />
    </>
  );
}

import type {Metadata} from 'next';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import MuiLink from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import DocumentUploadRow from '@/components/DocumentUploadRow';
import Footer from '@/components/Footer';
import PageContainer from '@/components/PageContainer';
import SectionHeading from '@/components/SectionHeading';
import SessionHeader from '@/components/SessionHeader';
import {listMyDocuments} from '@/server/document';
import {
  REQUIRED_SEEKER_DOCUMENT_TYPES,
  SeekerDocumentType,
} from '@/types/Document';

// Only the RESUME row gets a pointer to the web résumé — scanning/uploading
// stays available (and unchanged) for every document type.
const RESUME_HINT = (
  <>
    スキャンなしでOK。
    <MuiLink href="/resume">WEB履歴書</MuiLink>
    からも作成できます →
  </>
);

export const metadata: Metadata = {
  title: '書類',
};

export default async function SeekerDocumentsPage() {
  const documents = await listMyDocuments();

  // Split into the seeker-facing required / optional groups. Required follows
  // the order of REQUIRED_SEEKER_DOCUMENT_TYPES (health-check, then resume);
  // optional keeps the listMyDocuments order (license, then stool test).
  const byType = new Map(documents.map((d) => [d.documentType, d]));
  const requiredDocs = REQUIRED_SEEKER_DOCUMENT_TYPES.map((t) =>
    byType.get(t),
  ).filter((d) => d !== undefined);
  const requiredSet = new Set(REQUIRED_SEEKER_DOCUMENT_TYPES);
  const optionalDocs = documents.filter(
    (d) => !requiredSet.has(d.documentType),
  );

  return (
    <>
      <SessionHeader />
      <PageContainer maxWidth="md">
        <SectionHeading subtitle="運営が確認・認証した書類のみ応募に使えます">
          書類の提出
        </SectionHeading>

        <Typography
          variant="subtitle2"
          sx={{fontWeight: 700, color: '#C62828', mb: 1.5}}
        >
          必須書類
        </Typography>
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
          {requiredDocs.map((doc) => (
            <DocumentUploadRow
              key={doc.documentType}
              doc={doc}
              required
              hint={
                doc.documentType === SeekerDocumentType.RESUME
                  ? RESUME_HINT
                  : undefined
              }
            />
          ))}
        </Box>

        <Divider sx={{my: 2.5}} />

        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{fontWeight: 700, mb: 1.5}}
        >
          任意書類
        </Typography>
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
          {optionalDocs.map((doc) => (
            <DocumentUploadRow key={doc.documentType} doc={doc} />
          ))}
        </Box>

        <Box
          sx={{
            mt: 2.5,
            p: 2,
            bgcolor: '#F9F9F9',
            borderRadius: 2,
            border: '1px solid #E0E0E0',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            対応フォーマット: JPEG・PNG・WebP・PDF（各10MBまで）
          </Typography>
        </Box>
      </PageContainer>
      <Footer />
    </>
  );
}

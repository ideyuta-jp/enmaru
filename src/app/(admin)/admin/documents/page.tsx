import type {Metadata} from 'next';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import AdminDocumentRow from '@/components/AdminDocumentRow';
import Footer from '@/components/Footer';
import PageContainer from '@/components/PageContainer';
import SectionHeading from '@/components/SectionHeading';
import SessionHeader from '@/components/SessionHeader';
import {listSubmittedDocuments} from '@/server/document';
import {
  DOCUMENT_STATUS_LABEL,
  SeekerDocumentStatus,
  type SeekerDocumentStatus as Status,
} from '@/types/Document';

export const metadata: Metadata = {
  title: '書類確認',
};

const FILTERS: {label: string; status?: Status}[] = [
  {label: 'すべて', status: undefined},
  {label: DOCUMENT_STATUS_LABEL.PENDING, status: SeekerDocumentStatus.PENDING},
  {
    label: DOCUMENT_STATUS_LABEL.APPROVED,
    status: SeekerDocumentStatus.APPROVED,
  },
  {
    label: DOCUMENT_STATUS_LABEL.REJECTED,
    status: SeekerDocumentStatus.REJECTED,
  },
];

function parseStatus(value: string | undefined): Status | undefined {
  return value === SeekerDocumentStatus.PENDING ||
    value === SeekerDocumentStatus.APPROVED ||
    value === SeekerDocumentStatus.REJECTED
    ? value
    : undefined;
}

interface Props {
  searchParams: Promise<{status?: string}>;
}

export default async function AdminDocumentsPage({searchParams}: Props) {
  const {status} = await searchParams;
  const active = parseStatus(status);
  const documents = await listSubmittedDocuments(active);

  return (
    <>
      <SessionHeader />
      <PageContainer maxWidth="md">
        <SectionHeading subtitle="提出された書類を目視確認し、認証または差し戻します">
          書類確認
        </SectionHeading>

        <Box sx={{display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap'}}>
          {FILTERS.map((f) => (
            <Button
              key={f.label}
              href={
                f.status
                  ? `/admin/documents?status=${f.status}`
                  : '/admin/documents'
              }
              size="small"
              variant={active === f.status ? 'contained' : 'outlined'}
              sx={{fontSize: '0.75rem'}}
            >
              {f.label}
            </Button>
          ))}
        </Box>

        {documents.length === 0 ? (
          <Box sx={{textAlign: 'center', py: 6}}>
            <Typography color="text.secondary">
              該当する書類はありません
            </Typography>
          </Box>
        ) : (
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
            {documents.map((doc) => (
              <AdminDocumentRow key={doc.id} doc={doc} />
            ))}
          </Box>
        )}
      </PageContainer>
      <Footer />
    </>
  );
}

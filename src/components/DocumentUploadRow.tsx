'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import MuiLink from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import ErrorAlert from '@/components/ErrorAlert';
import {uploadDocument} from '@/server/document-actions';
import {
  DOCUMENT_STATUS_LABEL,
  DOCUMENT_TYPE_LABEL,
  SeekerDocumentStatus,
  type MyDocument,
} from '@/types/Document';

const STATUS_STYLE: Record<SeekerDocumentStatus, {bg: string; color: string}> =
  {
    PENDING: {bg: '#FFF8E1', color: '#F9A825'},
    APPROVED: {bg: '#E8F5E9', color: '#2E7D32'},
    REJECTED: {bg: '#FFEBEE', color: '#C62828'},
  };

export default function DocumentUploadRow({doc}: {doc: MyDocument}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError('ファイルを選択してください。');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('documentType', doc.documentType);
      formData.append('file', file);
      const result = await uploadDocument(formData);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setFile(null);
      router.refresh();
    } catch {
      setError('アップロードに失敗しました。時間をおいて再度お試しください。');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box
      sx={{
        p: 2,
        bgcolor: '#FAFAFA',
        borderRadius: 2,
        border: '1px solid #E0E0E0',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 1,
          flexWrap: 'wrap',
        }}
      >
        <Typography variant="subtitle2" sx={{fontWeight: 700}}>
          {DOCUMENT_TYPE_LABEL[doc.documentType]}
        </Typography>
        {doc.status ? (
          <Chip
            label={DOCUMENT_STATUS_LABEL[doc.status]}
            size="small"
            sx={{
              bgcolor: STATUS_STYLE[doc.status].bg,
              color: STATUS_STYLE[doc.status].color,
              fontSize: '0.7rem',
            }}
          />
        ) : (
          <Chip
            label="未提出"
            size="small"
            sx={{bgcolor: '#F9F9F9', color: '#AAAAAA', fontSize: '0.7rem'}}
          />
        )}
        {doc.id && (
          <MuiLink
            href={`/api/seeker-documents/${doc.id}/file`}
            target="_blank"
            rel="noopener"
            sx={{fontSize: '0.75rem'}}
          >
            提出済みファイルを表示
          </MuiLink>
        )}
      </Box>

      {doc.status === SeekerDocumentStatus.REJECTED && doc.rejectionReason && (
        <Typography
          variant="caption"
          sx={{color: '#C62828', display: 'block', mb: 1}}
        >
          差し戻し理由：{doc.rejectionReason}
        </Typography>
      )}

      <ErrorAlert message={error} />

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap'}}
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          style={{fontSize: '0.8rem'}}
        />
        <Button type="submit" variant="contained" size="small" disabled={busy}>
          {busy
            ? 'アップロード中...'
            : doc.status
              ? '再アップロード'
              : 'アップロード'}
        </Button>
      </Box>
    </Box>
  );
}

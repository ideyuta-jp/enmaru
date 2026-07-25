'use client';

import {useRef, useState} from 'react';
import {useRouter} from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import MuiLink from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import UploadFileIcon from '@mui/icons-material/UploadFile';

import ErrorAlert from '@/components/ErrorAlert';
import {uploadDocument} from '@/server/document-actions';
import {
  ALLOWED_DOCUMENT_MIME_TYPES,
  DOCUMENT_STATUS_LABEL,
  DOCUMENT_TYPE_LABEL,
  MAX_DOCUMENT_BYTES,
  SeekerDocumentStatus,
  type MyDocument,
} from '@/types/Document';

const STATUS_STYLE: Record<SeekerDocumentStatus, {bg: string; color: string}> =
  {
    PENDING: {bg: '#FFF8E1', color: '#F9A825'},
    APPROVED: {bg: '#E8F5E9', color: '#2E7D32'},
    REJECTED: {bg: '#FFEBEE', color: '#C62828'},
  };

interface Props {
  doc: MyDocument;
  required?: boolean;
  // Extra guidance shown under the type label (used for RESUME's "you can
  // also generate this from the web résumé" pointer — see documents/page.tsx).
  hint?: React.ReactNode;
}

export default function DocumentUploadRow({
  doc,
  required = false,
  hint,
}: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isApproved = doc.status === SeekerDocumentStatus.APPROVED;

  // The file picker is opened by the styled button below; uploading starts as
  // soon as a file is chosen (no separate submit step).
  async function handleFileSelected(file: File) {
    // Reject oversize files before sending, so the user gets a clear message
    // (and we never hit the Server Action body limit). The server re-checks.
    if (file.size > MAX_DOCUMENT_BYTES) {
      setError('ファイルサイズは10MBまでにしてください。');
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
        border: '1px solid',
        borderColor:
          doc.status === SeekerDocumentStatus.REJECTED ? '#FFCDD2' : '#E0E0E0',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          mb: 1,
        }}
      >
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
          <Typography variant="subtitle2" sx={{fontWeight: 700}}>
            {DOCUMENT_TYPE_LABEL[doc.documentType]}
          </Typography>
          {required && (
            <Chip
              label="必須"
              size="small"
              sx={{
                fontSize: '0.65rem',
                height: 18,
                bgcolor: '#FCE4EC',
                color: '#C62828',
              }}
            />
          )}
        </Box>
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
      </Box>

      {doc.status === SeekerDocumentStatus.REJECTED && doc.rejectionReason && (
        <Typography
          variant="caption"
          sx={{color: '#C62828', display: 'block', mb: 1}}
        >
          差し戻し理由：{doc.rejectionReason}
        </Typography>
      )}

      {hint && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{display: 'block', mb: 1}}
        >
          {hint}
        </Typography>
      )}

      <ErrorAlert message={error} />

      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_DOCUMENT_MIME_TYPES.join(',')}
        style={{display: 'none'}}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelected(file);
          e.target.value = '';
        }}
      />
      <Box
        sx={{display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap'}}
      >
        <Button
          size="small"
          variant={doc.status ? 'outlined' : 'contained'}
          startIcon={<UploadFileIcon />}
          disabled={busy || isApproved}
          onClick={() => fileInputRef.current?.click()}
          sx={{fontSize: '0.75rem'}}
        >
          {busy
            ? 'アップロード中...'
            : doc.status
              ? '再アップロード'
              : 'アップロード'}
        </Button>
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
        {isApproved && (
          <Typography variant="caption" color="text.secondary">
            認証済みのため変更できません
          </Typography>
        )}
      </Box>
    </Box>
  );
}

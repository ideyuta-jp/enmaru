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
import {
  confirmDocumentUpload,
  requestDocumentUploadUrl,
} from '@/server/document-actions';
import {
  ALLOWED_DOCUMENT_MIME_TYPES,
  DOCUMENT_STATUS_LABEL,
  DOCUMENT_TYPE_LABEL,
  MAX_DOCUMENT_BYTES,
  MAX_DOCUMENT_MB,
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
  // soon as a file is chosen (no separate submit step). Three steps (#231):
  // ask the server for a presigned R2 URL, PUT the file straight to R2 (never
  // through a Server Action body, so it isn't bound by Netlify Functions'
  // payload limit), then ask the server to confirm/promote what landed.
  async function handleFileSelected(file: File) {
    // Reject oversize files before even asking for a URL, so the user gets a
    // clear message without waiting on a request that would only fail later.
    // The server re-checks both before issuing the URL and after the upload.
    if (file.size > MAX_DOCUMENT_BYTES) {
      setError(`ファイルサイズは${MAX_DOCUMENT_MB}MBまでにしてください。`);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const urlResult = await requestDocumentUploadUrl(
        doc.documentType,
        file.type,
        file.size,
      );
      if (!urlResult.ok) {
        setError(urlResult.message);
        return;
      }
      // Must match the Content-Type the presigned URL was signed for exactly
      // — R2 verifies it as part of the signature and rejects a mismatch.
      const putRes = await fetch(urlResult.url, {
        method: 'PUT',
        headers: {'Content-Type': file.type},
        body: file,
      });
      if (!putRes.ok) {
        setError(
          'アップロードに失敗しました。時間をおいて再度お試しください。',
        );
        return;
      }
      const confirmResult = await confirmDocumentUpload(doc.documentType);
      if (!confirmResult.ok) {
        setError(confirmResult.message);
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

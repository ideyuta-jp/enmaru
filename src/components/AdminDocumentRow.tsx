'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import MuiLink from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import ErrorAlert from '@/components/ErrorAlert';
import {rejectDocument, verifyDocument} from '@/server/document-actions';
import {
  DOCUMENT_STATUS_LABEL,
  DOCUMENT_TYPE_LABEL,
  SeekerDocumentStatus,
  type AdminDocument,
} from '@/types/Document';

const STATUS_STYLE: Record<SeekerDocumentStatus, {bg: string; color: string}> =
  {
    PENDING: {bg: '#FFF8E1', color: '#F9A825'},
    APPROVED: {bg: '#E8F5E9', color: '#2E7D32'},
    REJECTED: {bg: '#FFEBEE', color: '#C62828'},
  };

export default function AdminDocumentRow({doc}: {doc: AdminDocument}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');

  async function run(fn: () => Promise<{ok: boolean; message?: string}>) {
    setBusy(true);
    setError(null);
    try {
      const result = await fn();
      if (!result.ok) {
        setError(result.message ?? '操作に失敗しました。');
        return;
      }
      router.refresh();
    } catch {
      setError('操作に失敗しました。時間をおいて再度お試しください。');
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
          gap: 1,
          alignItems: 'center',
          flexWrap: 'wrap',
          mb: 0.5,
        }}
      >
        <Typography variant="subtitle2" sx={{fontWeight: 700}}>
          {doc.seekerRealName}（{doc.seekerDisplayName}）
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {DOCUMENT_TYPE_LABEL[doc.documentType]}
        </Typography>
        <Chip
          label={DOCUMENT_STATUS_LABEL[doc.status]}
          size="small"
          sx={{
            bgcolor: STATUS_STYLE[doc.status].bg,
            color: STATUS_STYLE[doc.status].color,
            fontSize: '0.7rem',
          }}
        />
        <MuiLink
          href={`/api/seeker-documents/${doc.id}/file`}
          target="_blank"
          rel="noopener"
          sx={{fontSize: '0.75rem'}}
        >
          ファイルを表示
        </MuiLink>
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

      {rejecting ? (
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 1, mt: 1}}>
          <TextField
            label="差し戻し理由"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            size="small"
            multiline
            rows={2}
          />
          <Box sx={{display: 'flex', gap: 1}}>
            <Button
              variant="contained"
              size="small"
              disabled={busy}
              onClick={() => run(() => rejectDocument(doc.id, reason))}
            >
              差し戻しを確定
            </Button>
            <Button
              size="small"
              onClick={() => setRejecting(false)}
              disabled={busy}
            >
              キャンセル
            </Button>
          </Box>
        </Box>
      ) : (
        <Box sx={{display: 'flex', gap: 1, mt: 1}}>
          <Button
            variant="contained"
            size="small"
            disabled={busy || doc.status === SeekerDocumentStatus.APPROVED}
            onClick={() => run(() => verifyDocument(doc.id))}
          >
            認証する
          </Button>
          <Button
            variant="outlined"
            size="small"
            disabled={busy}
            onClick={() => setRejecting(true)}
            sx={{borderColor: '#C62828', color: '#C62828'}}
          >
            差し戻す
          </Button>
        </Box>
      )}
    </Box>
  );
}

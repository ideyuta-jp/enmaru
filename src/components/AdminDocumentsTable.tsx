'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

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

function StatusChip({status}: {status: SeekerDocumentStatus}) {
  return (
    <Chip
      label={DOCUMENT_STATUS_LABEL[status]}
      size="small"
      sx={{
        bgcolor: STATUS_STYLE[status].bg,
        color: STATUS_STYLE[status].color,
        fontSize: '0.7rem',
      }}
    />
  );
}

// File preview cell. We don't persist each document's MIME type, so we can't
// tell an image from a PDF up front: optimistically render a thumbnail and fall
// back to an "open" button when the image fails to decode (PDFs, etc.).
// TODO: persist the content type at upload (or HEAD the object) so the preview
// can be chosen directly instead of relying on the image load error.
function DocumentFilePreview({id}: {id: string}) {
  const [thumbnailFailed, setThumbnailFailed] = useState(false);
  const href = `/api/seeker-documents/${id}/file`;

  if (thumbnailFailed) {
    return (
      <Button
        size="small"
        endIcon={<OpenInNewIcon />}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        sx={{fontSize: '0.7rem', color: '#1565C0'}}
      >
        PDFを開く
      </Button>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {/* eslint-disable-next-line @next/next/no-img-element -- needs the native <img> onError to detect non-image files; next/image has no such fallback hook */}
      <img
        src={href}
        alt="提出書類"
        onError={() => setThumbnailFailed(true)}
        style={{
          maxWidth: 80,
          maxHeight: 60,
          objectFit: 'cover',
          borderRadius: 4,
          border: '1px solid #E0E0E0',
        }}
      />
    </a>
  );
}

function ActionButtons({
  doc,
  processingId,
  onVerify,
  onReject,
}: {
  doc: AdminDocument;
  processingId: string | null;
  onVerify: (id: string) => void;
  onReject: (doc: AdminDocument) => void;
}) {
  return (
    <Box sx={{display: 'flex', gap: 1}}>
      <Button
        size="small"
        variant="contained"
        disabled={
          processingId === doc.id ||
          doc.status === SeekerDocumentStatus.APPROVED
        }
        onClick={() => onVerify(doc.id)}
        sx={{fontSize: '0.75rem'}}
      >
        認証する
      </Button>
      <Button
        size="small"
        variant="outlined"
        disabled={
          processingId === doc.id ||
          doc.status === SeekerDocumentStatus.REJECTED
        }
        onClick={() => onReject(doc)}
        sx={{borderColor: '#C62828', color: '#C62828', fontSize: '0.75rem'}}
      >
        差し戻す
      </Button>
    </Box>
  );
}

export default function AdminDocumentsTable({
  documents,
}: {
  documents: AdminDocument[];
}) {
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<AdminDocument | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  async function run(
    id: string,
    fn: () => Promise<{ok: boolean; message?: string}>,
    onSuccess?: () => void,
  ) {
    setProcessingId(id);
    setError(null);
    try {
      const result = await fn();
      if (!result.ok) {
        setError(result.message ?? '操作に失敗しました。');
        return;
      }
      onSuccess?.();
      router.refresh();
    } catch {
      setError('操作に失敗しました。時間をおいて再度お試しください。');
    } finally {
      setProcessingId(null);
    }
  }

  function handleVerify(id: string) {
    void run(id, () => verifyDocument(id));
  }

  function handleReject() {
    if (!rejectTarget) return;
    const target = rejectTarget;
    void run(
      target.id,
      () => rejectDocument(target.id, rejectReason),
      () => {
        setRejectTarget(null);
        setRejectReason('');
      },
    );
  }

  function openReject(doc: AdminDocument) {
    setRejectTarget(doc);
    setRejectReason('');
  }

  return (
    <>
      <ErrorAlert message={error} />

      {/* Mobile: cards */}
      <Box
        sx={{
          display: {xs: 'flex', md: 'none'},
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        {documents.map((doc) => (
          <Box
            key={doc.id}
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
              <StatusChip status={doc.status} />
            </Box>
            <Box sx={{mb: 1}}>
              <DocumentFilePreview id={doc.id} />
            </Box>
            {doc.status === SeekerDocumentStatus.REJECTED &&
              doc.rejectionReason && (
                <Typography
                  variant="caption"
                  sx={{color: '#C62828', display: 'block', mb: 1}}
                >
                  差し戻し理由：{doc.rejectionReason}
                </Typography>
              )}
            <ActionButtons
              doc={doc}
              processingId={processingId}
              onVerify={handleVerify}
              onReject={openReject}
            />
          </Box>
        ))}
      </Box>

      {/* Desktop: table */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          display: {xs: 'none', md: 'block'},
          border: '1px solid #E0E0E0',
          borderRadius: 2,
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{bgcolor: '#F9F9F9'}}>
              <TableCell>保育士</TableCell>
              <TableCell>書類種別</TableCell>
              <TableCell>ステータス</TableCell>
              <TableCell>ファイル</TableCell>
              <TableCell>提出日</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id} hover>
                <TableCell>
                  <Typography variant="body2" sx={{fontWeight: 600}}>
                    {doc.seekerRealName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    （{doc.seekerDisplayName}）
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {DOCUMENT_TYPE_LABEL[doc.documentType]}
                  </Typography>
                </TableCell>
                <TableCell>
                  <StatusChip status={doc.status} />
                  {doc.status === SeekerDocumentStatus.REJECTED &&
                    doc.rejectionReason && (
                      <Typography
                        variant="caption"
                        sx={{color: '#C62828', display: 'block', mt: 0.25}}
                      >
                        差し戻し理由：{doc.rejectionReason}
                      </Typography>
                    )}
                </TableCell>
                <TableCell>
                  <DocumentFilePreview id={doc.id} />
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(doc.uploadedAt).toLocaleDateString('ja-JP')}
                  </Typography>
                </TableCell>
                <TableCell sx={{minWidth: 180}}>
                  <ActionButtons
                    doc={doc}
                    processingId={processingId}
                    onVerify={handleVerify}
                    onReject={openReject}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={rejectTarget !== null}
        onClose={() => setRejectTarget(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>差し戻し理由を入力</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
            {rejectTarget &&
              `${DOCUMENT_TYPE_LABEL[rejectTarget.documentType]} / ${rejectTarget.seekerDisplayName}`}
          </Typography>
          <TextField
            label="差し戻し理由"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            fullWidth
            multiline
            rows={3}
            placeholder="例：画像が不鮮明です。再度撮影してアップロードしてください。"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectTarget(null)}>キャンセル</Button>
          <Button
            variant="contained"
            disabled={!rejectReason.trim() || processingId === rejectTarget?.id}
            onClick={handleReject}
            sx={{bgcolor: '#C62828', '&:hover': {bgcolor: '#B71C1C'}}}
          >
            差し戻す
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

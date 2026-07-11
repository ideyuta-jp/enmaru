'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import ErrorAlert from '@/components/ErrorAlert';
import {startWork, submitWorkReport} from '@/server/work-flow-actions';
import {EngagementStatus} from '@/types/Engagement';

interface Props {
  engagementId: string;
  engagementStatus: EngagementStatus;
  // The party of the signed-in viewer of this engagement.
  viewerParty: 'SEEKER' | 'NURSERY';
  seekerReported: boolean;
  nurseryReported: boolean;
}

export default function WorkFlowActions({
  engagementId,
  engagementStatus,
  viewerParty,
  seekerReported,
  nurseryReported,
}: Props) {
  const router = useRouter();
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const myReported =
    viewerParty === 'SEEKER' ? seekerReported : nurseryReported;

  async function run(action: () => Promise<{ok: boolean; message?: string}>) {
    setBusy(true);
    setError(null);
    try {
      const result = await action();
      if (!result.ok) {
        setError(result.message ?? '処理に失敗しました。');
        return;
      }
      setComment('');
      router.refresh();
    } catch {
      setError('処理に失敗しました。時間をおいて再度お試しください。');
    } finally {
      setBusy(false);
    }
  }

  if (engagementStatus === EngagementStatus.COMPLETED) {
    return (
      <Typography variant="caption" sx={{color: '#6A1B9A'}}>
        業務完了しました
      </Typography>
    );
  }

  if (engagementStatus === EngagementStatus.MATCHED) {
    if (viewerParty === 'NURSERY') {
      return (
        <Typography variant="caption" color="text.secondary">
          保育士の業務開始を待っています
        </Typography>
      );
    }
    return (
      <Box>
        <ErrorAlert message={error} />
        <Button
          variant="contained"
          size="small"
          disabled={busy}
          onClick={() => run(() => startWork(engagementId))}
        >
          業務を開始する
        </Button>
      </Box>
    );
  }

  // WORKING
  if (myReported) {
    return (
      <Typography variant="caption" sx={{color: '#1565C0'}}>
        完了報告済み（相手の報告を待っています）
      </Typography>
    );
  }

  // WORKING, not yet reported. The comment field is shown upfront (no
  // intermediate "open the form" step), so the report button submits directly.
  return (
    <Box>
      <ErrorAlert message={error} />
      <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
        <TextField
          label="コメント（任意）"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          size="small"
          multiline
          rows={2}
          placeholder="業務の感想や気づきなど"
        />
        <Button
          variant="contained"
          size="small"
          disabled={busy}
          onClick={() => run(() => submitWorkReport(engagementId, comment))}
        >
          {busy ? '送信中...' : '業務完了を報告する'}
        </Button>
      </Box>
    </Box>
  );
}

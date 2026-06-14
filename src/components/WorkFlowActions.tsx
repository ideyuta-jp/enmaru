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
  // Whether the viewer has already reviewed the counterpart, and where their
  // review form lives — used to surface the review CTA once COMPLETED.
  viewerReviewed: boolean;
  reviewHref: string;
}

export default function WorkFlowActions({
  engagementId,
  engagementStatus,
  viewerParty,
  seekerReported,
  nurseryReported,
  viewerReviewed,
  reviewHref,
}: Props) {
  const router = useRouter();
  const [reporting, setReporting] = useState(false);
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
      setReporting(false);
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
      <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5}}>
        <Typography variant="caption" sx={{color: '#6A1B9A'}}>
          業務完了しました
        </Typography>
        {viewerReviewed ? (
          <Typography variant="caption" sx={{color: '#AAAAAA'}}>
            評価済み
          </Typography>
        ) : (
          <Button href={reviewHref} variant="contained" size="small">
            評価する
          </Button>
        )}
      </Box>
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

  return (
    <Box>
      <ErrorAlert message={error} />
      {reporting ? (
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
          <TextField
            label="補足（任意）"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            size="small"
            multiline
            rows={2}
            placeholder="業務に関する補足があれば入力してください（任意）"
          />
          <Box sx={{display: 'flex', gap: 1}}>
            <Button
              variant="contained"
              size="small"
              disabled={busy}
              onClick={() => run(() => submitWorkReport(engagementId, comment))}
            >
              {busy ? '送信中...' : '報告する'}
            </Button>
            <Button
              variant="outlined"
              size="small"
              disabled={busy}
              onClick={() => {
                setReporting(false);
                setComment('');
              }}
              sx={{borderColor: '#AAAAAA', color: '#666666'}}
            >
              キャンセル
            </Button>
          </Box>
        </Box>
      ) : (
        <Button
          variant="contained"
          size="small"
          onClick={() => setReporting(true)}
        >
          業務完了を報告する
        </Button>
      )}
    </Box>
  );
}

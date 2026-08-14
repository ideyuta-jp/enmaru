'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import ErrorAlert from '@/components/ErrorAlert';
import {startWork, submitWorkReport} from '@/server/work-flow-actions';
import {
  EngagementStatus,
  isStartWindowOpen,
  WORK_START_LEAD_MINUTES,
} from '@/types/Engagement';
import {scheduledStartAt} from '@/types/Job';

interface Props {
  engagementId: string;
  engagementStatus: EngagementStatus;
  // The party of the signed-in viewer of this engagement.
  viewerParty: 'SEEKER' | 'NURSERY';
  seekerReported: boolean;
  nurseryReported: boolean;
  // The shift's scheduled start, used to gate the "start work" button (see
  // WORK_START_LEAD_MINUTES). workDate is an ISO timestamp; workTimeStart is
  // 'HH:mm' JST.
  workDate: string;
  workTimeStart: string;
  // The gate as evaluated on the server at render time — the button's state
  // until the client clock takes over after mount, so a seeker who arrives
  // inside the window sees an enabled button on first paint instead of a false
  // "30分前から" flash (and hydration stays consistent, since the client can't
  // read its own clock during the SSR/hydration pass).
  startWindowInitiallyOpen: boolean;
}

export default function WorkFlowActions({
  engagementId,
  engagementStatus,
  viewerParty,
  seekerReported,
  nurseryReported,
  workDate,
  workTimeStart,
  startWindowInitiallyOpen,
}: Props) {
  const router = useRouter();
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Client clock, resolved after mount (null during SSR/first paint, where
  // startWindowInitiallyOpen answers instead). The first tick is deferred (not
  // set synchronously in the effect) and then repeats on an interval, so the
  // button unlocks on its own when the window opens without a page reload.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 30_000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);

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
    // Locked until WORK_START_LEAD_MINUTES before the scheduled start, to stop
    // an accidental early press. The server enforces the same gate; this is the
    // UX half. Pre-mount (`now === null`) the server-rendered answer stands in.
    const startWindowOpen =
      now === null
        ? startWindowInitiallyOpen
        : isStartWindowOpen(scheduledStartAt(workDate, workTimeStart), now);
    return (
      <Box>
        <ErrorAlert message={error} />
        <Button
          variant="contained"
          size="small"
          disabled={busy || !startWindowOpen}
          onClick={() => run(() => startWork(engagementId))}
        >
          業務を開始する
        </Button>
        {!startWindowOpen && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{display: 'block', mt: 0.5}}
          >
            業務開始予定の{WORK_START_LEAD_MINUTES}分前から開始できます
          </Typography>
        )}
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

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
import Typography from '@mui/material/Typography';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

import ErrorAlert from '@/components/ErrorAlert';
import {deleteJob} from '@/server/job-actions';
import {type Job, type JobState} from '@/types/Job';

// Chip per derived state — OPEN keeps the existing green; MATCHED gets the
// app's pink family so a formed match reads as an outcome, not a shutdown;
// the two "no longer applyable" states share the muted gray.
const STATE_CHIP: Record<
  JobState,
  {label: string; bgcolor: string; color: string}
> = {
  OPEN: {label: '公開中', bgcolor: '#E8F5E9', color: '#2E7D32'},
  MATCHED: {label: 'マッチ成立', bgcolor: '#FCE4EC', color: '#C2185B'},
  EXPIRED: {label: '期限切れ', bgcolor: '#F9F9F9', color: '#AAAAAA'},
  UNPUBLISHED: {label: '非公開', bgcolor: '#F9F9F9', color: '#AAAAAA'},
};

interface Props {
  job: Job;
}

// One posting row on the nursery's job management list. Client component (not
// the list page itself) because deleting needs a confirm dialog, a pending
// state, and an inline error — the same shape as AdminDocumentsTable's
// reject-reason dialog. A successful delete refreshes the server-rendered
// list via router rather than tracking removal locally, since the parent
// page owns the list.
export default function NurseryJobRow({job}: Props) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      const result = await deleteJob(job.id);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setConfirmOpen(false);
      router.refresh();
    } catch {
      setError('削除に失敗しました。時間をおいて再度お試しください。');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Box
        sx={{
          p: {xs: 1.5, md: 2},
          bgcolor: '#FAFAFA',
          borderRadius: 2,
          border: '1px solid #E0E0E0',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{flex: 1, minWidth: 0}}>
          <Typography variant="subtitle2" sx={{fontWeight: 700, mb: 0.5}}>
            {job.title}
          </Typography>
          <Box sx={{display: 'flex', gap: 1.5, flexWrap: 'wrap'}}>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
              <CalendarTodayIcon sx={{fontSize: 13, color: '#AAAAAA'}} />
              <Typography variant="caption" color="text.secondary">
                {new Date(job.workDate).toLocaleDateString('ja-JP')}
              </Typography>
            </Box>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
              <AccessTimeIcon sx={{fontSize: 13, color: '#AAAAAA'}} />
              <Typography variant="caption" color="text.secondary">
                {job.workTimeStart}〜{job.workTimeEnd}
              </Typography>
            </Box>
            {job.hourlyWage !== null && (
              <Typography variant="caption" color="text.secondary">
                時給{job.hourlyWage.toLocaleString()}円
              </Typography>
            )}
          </Box>
        </Box>
        <Box
          sx={{display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0}}
        >
          <Chip
            label={STATE_CHIP[job.state].label}
            size="small"
            sx={{
              bgcolor: STATE_CHIP[job.state].bgcolor,
              color: STATE_CHIP[job.state].color,
              fontSize: '0.7rem',
            }}
          />
          <Button
            href={`/nursery/jobs/${job.id}/edit`}
            size="small"
            variant="outlined"
            sx={{fontSize: '0.75rem', py: 0.5}}
          >
            編集
          </Button>
          <Button
            onClick={() => {
              setError(null);
              setConfirmOpen(true);
            }}
            size="small"
            variant="outlined"
            color="error"
            sx={{fontSize: '0.75rem', py: 0.5}}
          >
            削除
          </Button>
        </Box>
      </Box>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>この募集を削除しますか？</DialogTitle>
        <DialogContent>
          <ErrorAlert message={error} />
          <Typography variant="body2" color="text.secondary">
            「{job.title}」を削除します。この操作は取り消せません。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={deleting}>
            キャンセル
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            disabled={deleting}
          >
            {deleting ? '削除中...' : '削除する'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

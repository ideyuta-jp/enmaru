'use client';

import {useState} from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import {useRouter} from 'next/navigation';

import ErrorAlert from '@/components/ErrorAlert';
import JobForm from '@/components/JobForm';
import SectionHeading from '@/components/SectionHeading';
import {setJobStatus, updateJob} from '@/server/job-actions';
import {JobStatus, type JobInput} from '@/types/Job';

interface Props {
  jobId: string;
  initial: JobInput;
  initialStatus: JobStatus;
}

export default function EditJobForm({jobId, initial, initialStatus}: Props) {
  const router = useRouter();
  const [form, setForm] = useState<JobInput>(initial);
  const [status, setStatus] = useState<JobStatus>(initialStatus);
  const [saving, setSaving] = useState(false);
  const [updatingJobStatus, setUpdatingJobStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const result = await updateJob(jobId, form);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setToast(true);
      router.refresh();
    } catch {
      setError('保存に失敗しました。時間をおいて再度お試しください。');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus() {
    const next = status === JobStatus.OPEN ? JobStatus.CLOSED : JobStatus.OPEN;
    setUpdatingJobStatus(true);
    setError(null);
    try {
      const result = await setJobStatus(jobId, next);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setStatus(next);
      router.refresh();
    } catch {
      setError('ステータスの更新に失敗しました。');
    } finally {
      setUpdatingJobStatus(false);
    }
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
        }}
      >
        <SectionHeading>募集編集</SectionHeading>
        <Button
          variant="outlined"
          size="small"
          onClick={handleToggleStatus}
          disabled={updatingJobStatus}
          sx={{
            borderColor: status === JobStatus.OPEN ? '#AAAAAA' : '#F4A7B9',
            color: status === JobStatus.OPEN ? '#666666' : '#F4A7B9',
            fontSize: '0.75rem',
          }}
        >
          {status === JobStatus.OPEN ? '募集を終了する' : '募集を再開する'}
        </Button>
      </Box>

      <ErrorAlert message={error} />
      <JobForm
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/nursery/jobs')}
        saving={saving}
        submitLabel="保存する"
        singleDate
      />
      <Snackbar
        open={toast}
        anchorOrigin={{vertical: 'top', horizontal: 'right'}}
        autoHideDuration={3000}
        onClose={() => setToast(false)}
      >
        <Alert severity="success" onClose={() => setToast(false)}>
          保存しました
        </Alert>
      </Snackbar>
    </>
  );
}

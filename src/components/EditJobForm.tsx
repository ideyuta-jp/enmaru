'use client';

import {useState} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import {useRouter} from 'next/navigation';

import ErrorAlert from '@/components/ErrorAlert';
import JobForm, {type JobFormState} from '@/components/JobForm';
import SectionHeading from '@/components/SectionHeading';
import type {JobStatus} from '@/types/Job';

// Placeholder content so the edit form is exercisable without a backend.
const SAMPLE_FORM: JobFormState = {
  title: '午前中サポート保育スタッフ募集',
  workContent:
    '0〜2歳児クラスの保育補助。朝の受け入れと午前の活動をお願いします。',
  workDate: '2026-07-01',
  workTimeStart: '08:30',
  workTimeEnd: '12:30',
  hourlyWage: '1200',
  targetPerson: '保育士資格をお持ちの方',
  remarks: '駐車場あり、制服貸出あり',
};

interface Props {
  jobId: string;
}

export default function EditJobForm({jobId}: Props) {
  const router = useRouter();
  // TODO(#7 follow-up): load the posting identified by `jobId` instead of the
  // sample data below.
  void jobId;
  const [form, setForm] = useState<JobFormState>(SAMPLE_FORM);
  const [saving, setSaving] = useState(false);
  const [error] = useState<string | null>(null);
  const [status, setStatus] = useState<JobStatus>('OPEN');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    // TODO(#7 follow-up): persist the posting, then redirect to /nursery/jobs.
  }

  function handleToggleStatus() {
    // TODO(#7 follow-up): persist the open/closed change to the backend.
    setStatus((prev) => (prev === 'OPEN' ? 'CLOSED' : 'OPEN'));
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
          sx={{
            borderColor: status === 'OPEN' ? '#AAAAAA' : '#F4A7B9',
            color: status === 'OPEN' ? '#666666' : '#F4A7B9',
            fontSize: '0.75rem',
          }}
        >
          {status === 'OPEN' ? '募集を終了する' : '募集を再開する'}
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
      />
    </>
  );
}

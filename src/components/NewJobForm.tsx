'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';

import ErrorAlert from '@/components/ErrorAlert';
import JobForm from '@/components/JobForm';
import SectionHeading from '@/components/SectionHeading';
import {createJob} from '@/server/job-actions';
import {EMPTY_JOB, type JobInput} from '@/types/Job';

export default function NewJobForm() {
  const router = useRouter();
  const [form, setForm] = useState<JobInput>(EMPTY_JOB);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const result = await createJob(form);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.push('/nursery/jobs');
    } catch {
      setError('作成に失敗しました。時間をおいて再度お試しください。');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <SectionHeading>新規募集作成</SectionHeading>
      <ErrorAlert message={error} />
      <JobForm
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/nursery/jobs')}
        saving={saving}
        submitLabel="作成する"
      />
    </>
  );
}

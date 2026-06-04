'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';

import ErrorAlert from '@/components/ErrorAlert';
import JobForm, {type JobFormState} from '@/components/JobForm';
import SectionHeading from '@/components/SectionHeading';

const INITIAL_FORM: JobFormState = {
  title: '',
  workContent: '',
  workDate: '',
  workTimeStart: '',
  workTimeEnd: '',
  hourlyWage: '',
  targetPerson: '',
  remarks: '',
};

export default function NewJobForm() {
  const router = useRouter();
  const [form, setForm] = useState<JobFormState>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [error] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    // TODO(#7 follow-up): create the posting, then redirect to /nursery/jobs.
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

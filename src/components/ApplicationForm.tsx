'use client';

import {useState} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {useRouter, useSearchParams} from 'next/navigation';

import ErrorAlert from '@/components/ErrorAlert';
import SectionHeading from '@/components/SectionHeading';

// Sample posting summary shown above the form. TODO(#7 follow-up): fetch the
// posting identified by the `jobId` query parameter instead.
const SAMPLE_JOB = {
  nurseryName: 'さくら保育園',
  title: '午前中サポート保育スタッフ募集',
  workDate: '2026年7月1日',
  workTimeStart: '08:30',
  workTimeEnd: '12:30',
};

export default function ApplicationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId');

  const [applyMessage, setApplyMessage] = useState('');
  const [lineContactOk, setLineContactOk] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    // TODO(#7 follow-up): submit the application, then redirect to /applications.
  }

  return (
    <>
      <SectionHeading>応募する</SectionHeading>
      <ErrorAlert message={error} />

      {!jobId && (
        <Typography color="text.secondary">
          募集IDが指定されていません
        </Typography>
      )}

      {jobId && (
        <>
          <Box
            sx={{
              p: {xs: 1.5, md: 2},
              bgcolor: '#F9F9F9',
              borderRadius: 2,
              mb: 3,
            }}
          >
            <Typography variant="subtitle2" sx={{fontWeight: 700}}>
              {SAMPLE_JOB.nurseryName}
            </Typography>
            <Typography variant="body2" sx={{mt: 0.25}}>
              {SAMPLE_JOB.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {SAMPLE_JOB.workDate} / {SAMPLE_JOB.workTimeStart}〜
              {SAMPLE_JOB.workTimeEnd}
            </Typography>
          </Box>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{display: 'flex', flexDirection: 'column', gap: 2.5}}
          >
            <TextField
              label="応募メッセージ（任意）"
              value={applyMessage}
              onChange={(e) => setApplyMessage(e.target.value)}
              size="small"
              multiline
              rows={4}
              placeholder="自己紹介や意気込みを書いてください（任意）"
            />

            <Divider />

            <FormControlLabel
              control={
                <Checkbox
                  checked={lineContactOk}
                  onChange={(e) => setLineContactOk(e.target.checked)}
                  size="small"
                  sx={{color: '#F4A7B9', '&.Mui-checked': {color: '#F4A7B9'}}}
                />
              }
              label={
                <Box>
                  <Typography variant="body2">
                    LINEでの連絡を許可する
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    マッチング成立後、LINE経由で連絡を受け取ることができます
                  </Typography>
                </Box>
              }
            />

            <Box
              sx={{
                display: 'flex',
                gap: 1.5,
                flexDirection: {xs: 'column', sm: 'row'},
              }}
            >
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                fullWidth
                sx={{py: 1.25}}
              >
                {submitting ? '送信中...' : '応募する'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => router.back()}
                fullWidth
                sx={{py: 1.25, borderColor: '#AAAAAA', color: '#666666'}}
              >
                キャンセル
              </Button>
            </Box>
          </Box>
        </>
      )}
    </>
  );
}

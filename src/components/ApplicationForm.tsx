'use client';

import {useState} from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import MuiLink from '@mui/material/Link';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {useRouter} from 'next/navigation';

import SectionHeading from '@/components/SectionHeading';
import {applyToJob} from '@/server/application-actions';
import type {ApplyTarget} from '@/types/Application';
import {DOCUMENT_TYPE_LABEL} from '@/types/Document';

export default function ApplicationForm({target}: {target: ApplyTarget}) {
  const router = useRouter();

  const [applyMessage, setApplyMessage] = useState('');
  const [lineContactOk, setLineContactOk] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reasons the seeker cannot apply, judged from the server-provided target. The
  // apply action re-checks all of these authoritatively.
  const blocked =
    !target.isOpen ||
    target.alreadyApplied ||
    target.missingDocuments.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = await applyToJob({
        jobId: target.jobId,
        applyMessage,
        lineContactOk,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.push('/applications');
    } catch {
      setError('応募に失敗しました。時間をおいて再度お試しください。');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <SectionHeading>応募する</SectionHeading>

      {/* TODO: extract a shared toast component — this Snackbar+Alert structure
          is the 5th copy (EditJobForm, NewJobForm, SeekerProfileForm and
          NurseryProfileForm have the success variant). */}
      <Snackbar
        open={error !== null}
        anchorOrigin={{vertical: 'top', horizontal: 'right'}}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Box
        sx={{
          p: {xs: 1.5, md: 2},
          bgcolor: '#F9F9F9',
          borderRadius: 2,
          mb: 3,
        }}
      >
        <Typography variant="subtitle2" sx={{fontWeight: 700}}>
          {target.nurseryName}
        </Typography>
        <Typography variant="body2" sx={{mt: 0.25}}>
          {target.title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {new Date(target.workDate).toLocaleDateString('ja-JP')} /{' '}
          {target.workTimeStart}〜{target.workTimeEnd}
        </Typography>
      </Box>

      {!target.isOpen && (
        <Alert severity="info" sx={{mb: 3}}>
          この募集はすでに締め切られています。
        </Alert>
      )}

      {target.isOpen && target.alreadyApplied && (
        <Alert severity="info" sx={{mb: 3}}>
          この募集にはすでに応募済みです。
        </Alert>
      )}

      {target.isOpen &&
        !target.alreadyApplied &&
        target.missingDocuments.length > 0 && (
          <Alert severity="warning" sx={{mb: 3}}>
            応募には次の書類の認証が必要です：
            {target.missingDocuments
              .map((t) => DOCUMENT_TYPE_LABEL[t])
              .join('、')}
            。
            <MuiLink href="/documents" sx={{ml: 0.5}}>
              書類を提出する
            </MuiLink>
          </Alert>
        )}

      {!blocked && (
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
                <Typography variant="body2">LINEでの連絡を許可する</Typography>
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
      )}
    </>
  );
}

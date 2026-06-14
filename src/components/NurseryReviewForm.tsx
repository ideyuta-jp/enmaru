'use client';

import {useState} from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Rating from '@mui/material/Rating';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {useRouter} from 'next/navigation';

import ErrorAlert from '@/components/ErrorAlert';
import SectionHeading from '@/components/SectionHeading';
import {submitNurseryToSeekerReview} from '@/server/review-actions';
import type {ReviewTarget} from '@/types/Review';

const CRITERIA = [
  {key: 'attitude', label: '勤務態度'},
  {key: 'communication', label: 'コミュニケーション'},
  {key: 'skill', label: '保育スキル'},
] as const;

type Ratings = Record<'attitude' | 'communication' | 'skill', number>;

export default function NurseryReviewForm({target}: {target: ReviewTarget}) {
  const router = useRouter();
  const [ratings, setRatings] = useState<Ratings>({
    attitude: 0,
    communication: 0,
    skill: 0,
  });
  const [comment, setComment] = useState('');
  const [wouldRehire, setWouldRehire] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!target.eligible) {
    return (
      <Alert severity="info" sx={{borderRadius: 2}}>
        この業務はまだ評価できません（業務完了後に評価できます）。
      </Alert>
    );
  }
  if (target.alreadyReviewed && !success) {
    return (
      <Alert severity="info" sx={{borderRadius: 2}}>
        この業務はすでに評価済みです。
      </Alert>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    for (const c of CRITERIA) {
      if (ratings[c.key] === 0) {
        setError(`「${c.label}」を評価してください`);
        return;
      }
    }

    setError(null);
    setSubmitting(true);
    try {
      const result = await submitNurseryToSeekerReview(target.engagementId, {
        attitude: ratings.attitude,
        communication: ratings.communication,
        skill: ratings.skill,
        comment,
        wouldRehire,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setSuccess(true);
    } catch {
      setError('評価の送信に失敗しました。時間をおいて再度お試しください。');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <>
        <Alert severity="success" sx={{borderRadius: 2, mb: 2}}>
          評価を送信しました。ありがとうございます。
        </Alert>
        <Button
          variant="contained"
          fullWidth
          onClick={() => router.push('/nursery/applications')}
        >
          応募管理へ戻る
        </Button>
      </>
    );
  }

  return (
    <>
      <SectionHeading
        subtitle={`${target.counterpartName}への評価を入力してください`}
      >
        保育士を評価する
      </SectionHeading>

      <ErrorAlert message={error} />

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{display: 'flex', flexDirection: 'column', gap: 3}}
      >
        {CRITERIA.map(({key, label}) => (
          <Box key={key}>
            <Typography variant="body2" sx={{mb: 1, fontWeight: 600}}>
              {label}
            </Typography>
            <Rating
              value={ratings[key]}
              onChange={(_, val) =>
                setRatings((prev) => ({...prev, [key]: val ?? 0}))
              }
              size="large"
              sx={{
                '& .MuiRating-iconFilled': {color: '#F4A7B9'},
                '& .MuiRating-iconEmpty': {color: '#AAAAAA'},
              }}
            />
          </Box>
        ))}

        <TextField
          label="コメント（任意）"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          size="small"
          multiline
          rows={4}
          placeholder="一緒に働いての感想を自由に書いてください"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={wouldRehire}
              onChange={(e) => setWouldRehire(e.target.checked)}
              size="small"
              sx={{color: '#F4A7B9', '&.Mui-checked': {color: '#F4A7B9'}}}
            />
          }
          label={
            <Typography variant="body2">またこの保育士に依頼したい</Typography>
          }
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={submitting}
          sx={{py: 1.25}}
        >
          {submitting ? '送信中...' : '評価を送信する'}
        </Button>
      </Box>
    </>
  );
}

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
import {submitSeekerToNurseryReview} from '@/server/review-actions';
import type {ReviewTarget} from '@/types/Review';

const CRITERIA = [
  {key: 'explanation', label: '説明のわかりやすさ'},
  {key: 'atmosphere', label: '職場の雰囲気'},
  {key: 'support', label: 'サポート体制'},
  {key: 'clarity', label: '業務内容の明確さ'},
] as const;

type Ratings = Record<
  'explanation' | 'atmosphere' | 'support' | 'clarity',
  number
>;

export default function SeekerReviewForm({target}: {target: ReviewTarget}) {
  const router = useRouter();
  const [ratings, setRatings] = useState<Ratings>({
    explanation: 0,
    atmosphere: 0,
    support: 0,
    clarity: 0,
  });
  const [comment, setComment] = useState('');
  const [wouldWorkAgain, setWouldWorkAgain] = useState(false);
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
      const result = await submitSeekerToNurseryReview(target.engagementId, {
        explanation: ratings.explanation,
        atmosphere: ratings.atmosphere,
        support: ratings.support,
        clarity: ratings.clarity,
        comment,
        wouldWorkAgain,
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
          onClick={() => router.push('/applications')}
        >
          応募履歴へ戻る
        </Button>
      </>
    );
  }

  return (
    <>
      <SectionHeading
        subtitle={`${target.counterpartName}への評価を入力してください`}
      >
        保育園を評価する
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
              checked={wouldWorkAgain}
              onChange={(e) => setWouldWorkAgain(e.target.checked)}
              size="small"
              sx={{color: '#F4A7B9', '&.Mui-checked': {color: '#F4A7B9'}}}
            />
          }
          label={
            <Typography variant="body2">またこの保育園で働きたい</Typography>
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

'use client';

import {useState} from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

import ErrorAlert from '@/components/ErrorAlert';
import {setReviewPublication} from '@/server/review-actions';
import {ReviewDirection, type AdminReview} from '@/types/Review';

const DIRECTION_LABEL: Record<ReviewDirection, string> = {
  NURSERY_TO_SEEKER: '保育園 → 保育士',
  SEEKER_TO_NURSERY: '保育士 → 保育園',
};

export default function AdminReviewRow({review}: {review: AdminReview}) {
  const [published, setPublished] = useState(review.isPublished);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function togglePublication(next: boolean) {
    setBusy(true);
    setError(null);
    // Optimistic; revert on failure.
    setPublished(next);
    try {
      const result = await setReviewPublication(
        review.direction,
        review.id,
        next,
      );
      if (!result.ok) {
        setPublished(!next);
        setError(result.message);
      }
    } catch {
      setPublished(!next);
      setError(
        '公開状態の更新に失敗しました。時間をおいて再度お試しください。',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box
      sx={{
        p: 2,
        bgcolor: '#FAFAFA',
        borderRadius: 2,
        border: '1px solid #E0E0E0',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 1,
          mb: 1,
        }}
      >
        <Box>
          <Chip
            label={DIRECTION_LABEL[review.direction]}
            size="small"
            sx={{bgcolor: '#F0F0F0', color: '#666666', fontSize: '0.7rem'}}
          />
          <Typography variant="subtitle2" sx={{fontWeight: 700, mt: 0.5}}>
            {review.nurseryName} ／ {review.seekerDisplayName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {review.jobTitle} ・{' '}
            {new Date(review.reviewedAt).toLocaleDateString('ja-JP')}
          </Typography>
        </Box>
        <FormControlLabel
          control={
            <Switch
              checked={published}
              onChange={(e) => togglePublication(e.target.checked)}
              disabled={busy}
              size="small"
            />
          }
          label={
            <Typography variant="caption">
              {published ? '公開中' : '非公開'}
            </Typography>
          }
          labelPlacement="start"
        />
      </Box>

      <ErrorAlert message={error} />

      <Box sx={{display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 1}}>
        {review.scores.map((s) => (
          <Typography key={s.label} variant="caption" color="text.secondary">
            {s.label}: {s.value}
          </Typography>
        ))}
        {review.recommend && (
          <Typography variant="caption" sx={{color: '#2E7D32'}}>
            また依頼/勤務したい
          </Typography>
        )}
      </Box>

      {review.comment && (
        <Typography
          variant="body2"
          sx={{fontSize: '0.8rem', whiteSpace: 'pre-wrap'}}
        >
          {review.comment}
        </Typography>
      )}
    </Box>
  );
}

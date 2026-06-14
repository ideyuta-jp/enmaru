'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import ErrorAlert from '@/components/ErrorAlert';
import SectionHeading from '@/components/SectionHeading';
import {saveNurseryProfile} from '@/server/nursery-actions';
import {EMPTY_NURSERY_PROFILE, type NurseryProfileInput} from '@/types/Nursery';

interface Props {
  // The nursery's existing profile, or null when creating one for the first time.
  initial: NurseryProfileInput | null;
}

export default function NurseryProfileForm({initial}: Props) {
  const router = useRouter();
  const [form, setForm] = useState<NurseryProfileInput>(
    initial ?? EMPTY_NURSERY_PROFILE,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const result = await saveNurseryProfile(form);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError('保存に失敗しました。時間をおいて再度お試しください。');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <SectionHeading subtitle="公開情報と非公開情報があります">
        園プロフィール編集
      </SectionHeading>

      <ErrorAlert message={error} />
      {saved && (
        <Alert severity="success" sx={{mb: 2}}>
          保存しました
        </Alert>
      )}

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{display: 'flex', flexDirection: 'column', gap: 3}}
      >
        <Box>
          <Typography
            variant="subtitle1"
            sx={{fontWeight: 700, mb: 1.5, color: '#666666'}}
          >
            基本情報（公開）
          </Typography>
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
            <TextField
              label="園名"
              value={form.nurseryName}
              onChange={(e) => setForm({...form, nurseryName: e.target.value})}
              size="small"
              required
            />
            <TextField
              label="エリア"
              value={form.area}
              onChange={(e) => setForm({...form, area: e.target.value})}
              size="small"
              required
              placeholder="例：長崎市"
            />
          </Box>
        </Box>

        <Divider />

        <Box>
          <Typography
            variant="subtitle1"
            sx={{fontWeight: 700, mb: 1.5, color: '#666666'}}
          >
            連絡先情報（マッチング成立後に開示）
          </Typography>
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
            <TextField
              label="住所"
              value={form.address}
              onChange={(e) => setForm({...form, address: e.target.value})}
              size="small"
            />
            <TextField
              label="担当者名"
              value={form.contactName}
              onChange={(e) => setForm({...form, contactName: e.target.value})}
              size="small"
              required
            />
            <TextField
              label="電話番号"
              value={form.phone}
              onChange={(e) => setForm({...form, phone: e.target.value})}
              size="small"
              type="tel"
            />
          </Box>
        </Box>

        <Divider />

        <Box>
          <Typography
            variant="subtitle1"
            sx={{fontWeight: 700, mb: 1.5, color: '#666666'}}
          >
            コンセプト・保育方針（公開）
          </Typography>
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
            <TextField
              label="コンセプト"
              value={form.concept}
              onChange={(e) => setForm({...form, concept: e.target.value})}
              size="small"
              multiline
              rows={3}
              placeholder="園のコンセプトや特色を教えてください"
            />
            <TextField
              label="保育方針"
              value={form.policy}
              onChange={(e) => setForm({...form, policy: e.target.value})}
              size="small"
              multiline
              rows={3}
              placeholder="保育への姿勢や大切にしていることを教えてください"
            />
          </Box>
        </Box>

        <Divider />

        <FormControlLabel
          control={
            <Checkbox
              checked={form.isPublished}
              onChange={(e) =>
                setForm({...form, isPublished: e.target.checked})
              }
              size="small"
              sx={{color: '#F4A7B9', '&.Mui-checked': {color: '#F4A7B9'}}}
            />
          }
          label={
            <Typography variant="body2">
              プロフィールを公開する（保育士が閲覧できるようになります）
            </Typography>
          }
        />

        <Button
          type="submit"
          variant="contained"
          disabled={saving}
          sx={{
            py: 1.25,
            alignSelf: {xs: 'stretch', md: 'flex-start'},
            minWidth: {md: 200},
          }}
        >
          {saving ? '保存中...' : '保存する'}
        </Button>
      </Box>
    </>
  );
}

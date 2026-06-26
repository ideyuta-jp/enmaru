'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import FormLabel from '@mui/material/FormLabel';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import ErrorAlert from '@/components/ErrorAlert';
import SectionHeading from '@/components/SectionHeading';
import {saveSeekerProfile} from '@/server/seeker-actions';
import {EMPTY_SEEKER_PROFILE, type SeekerProfileInput} from '@/types/Seeker';

const PREFERRED_STYLE_OPTIONS = [
  '午前のみ',
  '午後のみ',
  '短時間',
  '単発',
  '週1',
  '週2〜3',
  '長期',
];

interface Props {
  // The seeker's existing profile, or null when creating one for the first time.
  initial: SeekerProfileInput | null;
}

export default function SeekerProfileForm({initial}: Props) {
  const router = useRouter();
  const [form, setForm] = useState<SeekerProfileInput>(
    initial ?? EMPTY_SEEKER_PROFILE,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function toggleStyle(style: string) {
    setForm((prev) => ({
      ...prev,
      preferredStyle: prev.preferredStyle.includes(style)
        ? prev.preferredStyle.filter((s) => s !== style)
        : [...prev.preferredStyle, style],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const result = await saveSeekerProfile(form);
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
      <SectionHeading subtitle="一部の情報はマッチング相手の保育園のみに開示されます">
        プロフィール編集
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
            基本情報
          </Typography>
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
            <TextField
              label="本名（非公開）"
              value={form.realName}
              onChange={(e) => setForm({...form, realName: e.target.value})}
              size="small"
              required
              helperText="マッチング成立後、保育園に開示されます"
            />
            <TextField
              label="表示名（公開）"
              value={form.displayName}
              onChange={(e) => setForm({...form, displayName: e.target.value})}
              size="small"
              required
              helperText="保育園に表示される名前です"
            />
            <TextField
              label="希望エリア"
              value={form.preferredArea}
              onChange={(e) =>
                setForm({...form, preferredArea: e.target.value})
              }
              size="small"
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
            資格・経験
          </Typography>
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.license}
                  onChange={(e) =>
                    setForm({...form, license: e.target.checked})
                  }
                  size="small"
                  sx={{color: '#F4A7B9', '&.Mui-checked': {color: '#F4A7B9'}}}
                />
              }
              label={<Typography variant="body2">保育士資格あり</Typography>}
            />
            <TextField
              label="ブランク期間（マッチング相手のみ）"
              value={form.blankYears}
              onChange={(e) => setForm({...form, blankYears: e.target.value})}
              size="small"
              placeholder="例：2年、なし"
            />
            <TextField
              label="経験・スキル（公開）"
              value={form.skills}
              onChange={(e) => setForm({...form, skills: e.target.value})}
              size="small"
              multiline
              rows={2}
              placeholder="例：製作活動、リトミック、乳児保育"
            />
            <TextField
              label="職務経歴（マッチング相手のみ）"
              value={form.experience}
              onChange={(e) => setForm({...form, experience: e.target.value})}
              size="small"
              multiline
              rows={3}
              placeholder="例：認可保育所で0〜5歳児クラスを5年担当"
            />
          </Box>
        </Box>

        <Divider />

        <Box>
          <FormControl component="fieldset" fullWidth>
            <FormLabel
              component="legend"
              sx={{
                mb: 1,
                fontSize: '0.875rem',
                fontWeight: 700,
                color: '#666666',
              }}
            >
              希望勤務スタイル（複数選択可）
            </FormLabel>
            <FormGroup row>
              {PREFERRED_STYLE_OPTIONS.map((style) => (
                <FormControlLabel
                  key={style}
                  control={
                    <Checkbox
                      checked={form.preferredStyle.includes(style)}
                      onChange={() => toggleStyle(style)}
                      size="small"
                      sx={{
                        color: '#F4A7B9',
                        '&.Mui-checked': {color: '#F4A7B9'},
                      }}
                    />
                  }
                  label={<Typography variant="body2">{style}</Typography>}
                />
              ))}
            </FormGroup>
          </FormControl>
        </Box>

        <Divider />

        <Box>
          <Typography
            variant="subtitle1"
            sx={{fontWeight: 700, mb: 1.5, color: '#666666'}}
          >
            自己紹介・その他
          </Typography>
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
            <TextField
              label="自己紹介（公開）"
              value={form.bio}
              onChange={(e) => setForm({...form, bio: e.target.value})}
              size="small"
              multiline
              rows={4}
              placeholder="あなたの強みや保育への思いを教えてください"
            />
            <TextField
              label="NGな条件（非公開）"
              value={form.ngConditions}
              onChange={(e) => setForm({...form, ngConditions: e.target.value})}
              size="small"
              multiline
              rows={2}
              placeholder="例：遠距離移動が難しい、特定の業務が困難"
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
            <Typography variant="body2">プロフィールを公開する</Typography>
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

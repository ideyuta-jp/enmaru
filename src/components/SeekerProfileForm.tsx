'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import CheckboxGroup from '@/components/CheckboxGroup';
import ErrorAlert from '@/components/ErrorAlert';
import SectionHeading from '@/components/SectionHeading';
import TagSelector from '@/components/TagSelector';
import {saveSeekerProfile} from '@/server/seeker-actions';
import {CITIES_BY_PREFECTURE, PREFECTURES} from '@/types/Area';
import {EMPTY_SEEKER_PROFILE, type SeekerProfileInput} from '@/types/Seeker';

const LICENSE_OPTIONS = ['保育士資格', '幼稚園教諭免許', '子育て支援員'];

const EXPERIENCE_YEARS_OPTIONS = [
  '未経験',
  '1年未満',
  '1〜3年',
  '3〜5年',
  '5〜10年',
  '10年以上',
];

const BLANK_YEARS_OPTIONS = ['なし', '1年未満', '1〜3年', '3〜5年', '5年以上'];

const SKILLS_OPTIONS = [
  '室内遊び（手遊び・絵本・おままごとなど）',
  '戸外遊び（公園・鬼ごっこ・探索活動など）',
  '製作（季節や行事の飾り・工作など）',
  '運動（リズム遊び・体操など）',
  '音楽（ピアノ・リトミック・歌など）',
  '行事のサポート（誕生日会・園内イベントなど）',
  '事務・パソコン作業（お便り作成・掲示物作成など）',
  '専門支援（発達支援・食育など）',
];

const PERIOD_OPTIONS = ['単発・短期', '週1', '週2〜3', '長期'];

const TIME_SLOT_OPTIONS = [
  '早番（6:00〜9:30頃）',
  '午前（9:00〜13:00頃）',
  '午後（13:00〜16:00頃）',
  '午睡中（11:30〜15:30頃）',
  '遅番（16:00〜18:00以降）',
];

const AGE_GROUP_OPTIONS = [
  '0歳児：目覚ましい成長に合わせ、一人ひとりの発達の土台を支えたい',
  '1歳児：あふれ出す自我と好奇心を受け止め、全身で表現する喜びを共有したい',
  '2歳児：「自分でしたい！」という葛藤に寄り添い、自立へ向かう心を見守りたい',
  '3歳児：友達への関わりが広がる時期。初めての集団生活での育ちを支えたい',
  '4歳児：想像力が豊かになり、仲間と工夫して遊びを展開する楽しさを分かち合いたい',
  '5歳児：共通の目的に向かって力を合わせる協同性や、就学に向けた意欲を育みたい',
  '異年齢：年齢の枠を超えた育ち合いの中で生まれる、憧れやいたわりの心を大切にしたい',
  'フリー：特定のクラスを決めず、園全体のサポートをしながら自分に合う年齢層を見つけたい',
];

const VALUES_CHIPS = [
  '子どもの主体性を大切にしています',
  '子どものペースに寄り添います',
  '安全を第一に考えています',
  'コミュニケーションを大切にしています',
  'チームワークを大切にしています',
  '笑顔で接することを心がけています',
];

const NG_OPTIONS = [
  '遠距離移動が難しい',
  '力仕事が困難',
  '土日対応不可',
  '長時間勤務不可',
  'アレルギー対応が難しい',
];

const CHECKBOX_SX = {color: '#F4A7B9', '&.Mui-checked': {color: '#F4A7B9'}};
const TAG_SELECTED_COLOR = '#F4A7B9';
const TAG_SELECTED_HOVER_COLOR = '#E0899E';

interface LabeledSelectProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

function LabeledSelect({label, options, value, onChange}: LabeledSelectProps) {
  return (
    <FormControl size="small" sx={{maxWidth: 220}}>
      <FormLabel sx={{fontSize: '0.8rem', color: '#666666', mb: 0.5}}>
        {label}
      </FormLabel>
      <Select
        displayEmpty
        value={value}
        onChange={(e) => onChange(e.target.value)}
        renderValue={(v) => v || '選択してください'}
      >
        <MenuItem value="">未選択</MenuItem>
        {options.map((opt) => (
          <MenuItem key={opt} value={opt}>
            {opt}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

interface Props {
  initial: SeekerProfileInput | null;
}

export default function SeekerProfileForm({initial}: Props) {
  const router = useRouter();
  const [form, setForm] = useState<SeekerProfileInput>(
    initial ?? EMPTY_SEEKER_PROFILE,
  );
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof SeekerProfileInput>(
    key: K,
    value: SeekerProfileInput[K],
  ) {
    setForm((prev) => ({...prev, [key]: value}));
  }

  function toggle(field: keyof SeekerProfileInput, value: string) {
    setForm((prev) => {
      const current = prev[field] as string[];
      return {
        ...prev,
        [field]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    });
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

  async function handlePreview() {
    setPreviewing(true);
    setError(null);
    // The preview page reads from the DB, so the form must be persisted before
    // showing it. The tab is opened synchronously here because window.open
    // after an await loses the user-gesture context and gets popup-blocked.
    const previewTab = window.open('', '_blank');
    try {
      const result = await saveSeekerProfile(form);
      if (!result.ok) {
        previewTab?.close();
        setError(result.message);
        return;
      }
      if (previewTab) {
        previewTab.location.href = '/profile/preview';
      } else {
        // Popup blocked even for the synchronous open — fall back to same-tab
        // navigation so the button still works.
        router.push('/profile/preview');
      }
    } catch {
      previewTab?.close();
      setError('保存に失敗しました。時間をおいて再度お試しください。');
    } finally {
      setPreviewing(false);
    }
  }

  const sectionLabel = (text: string) => (
    <Typography
      variant="subtitle1"
      sx={{fontWeight: 700, mb: 1.5, color: '#666666'}}
    >
      {text}
    </Typography>
  );

  const visibilityNote = (text: string) => (
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{display: 'block', mb: 1}}
    >
      {text}
    </Typography>
  );

  return (
    <>
      <SectionHeading subtitle="一部の情報はマッチング相手の保育園のみに開示されます">
        プロフィール編集
      </SectionHeading>

      <ErrorAlert message={error} />

      <Snackbar
        open={saved}
        autoHideDuration={3000}
        onClose={() => setSaved(false)}
        anchorOrigin={{vertical: 'top', horizontal: 'right'}}
      >
        <Alert severity="success" onClose={() => setSaved(false)}>
          保存しました
        </Alert>
      </Snackbar>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{display: 'flex', flexDirection: 'column', gap: 3}}
      >
        {/* 基本情報 */}
        <Box>
          {sectionLabel('基本情報')}
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
            <TextField
              label="本名"
              value={form.realName}
              onChange={(e) => set('realName', e.target.value)}
              size="small"
              required
              helperText="マッチング相手のみ — マッチング成立後に保育園に開示されます"
            />
            <TextField
              label="表示名"
              value={form.displayName}
              onChange={(e) => set('displayName', e.target.value)}
              size="small"
              required
              helperText="公開 — 保育園の一覧に表示される名前です"
            />
          </Box>
        </Box>

        <Divider />

        {/* 希望エリア */}
        <Box>
          {sectionLabel('希望エリア')}
          {visibilityNote('公開')}
          <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap'}}>
            <FormControl size="small" sx={{minWidth: 160}}>
              <Select
                displayEmpty
                value={form.preferredPrefecture}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    preferredPrefecture: e.target.value,
                    preferredCity: '',
                  }))
                }
                renderValue={(v) => v || '都道府県を選択'}
              >
                <MenuItem value="">未選択</MenuItem>
                {PREFECTURES.map((p) => (
                  <MenuItem key={p} value={p}>
                    {p}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{minWidth: 160}}>
              <Select
                displayEmpty
                value={form.preferredCity}
                onChange={(e) => set('preferredCity', e.target.value)}
                renderValue={(v) => v || '市区町村を選択'}
                disabled={!form.preferredPrefecture}
              >
                <MenuItem value="">未選択</MenuItem>
                {(CITIES_BY_PREFECTURE[form.preferredPrefecture] ?? []).map(
                  (c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ),
                )}
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Divider />

        {/* 資格・経験 */}
        <Box>
          {sectionLabel('資格・経験')}
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
            <CheckboxGroup
              label="保有資格（公開・複数選択可）"
              options={LICENSE_OPTIONS}
              selected={form.licenses}
              onToggle={(v) => toggle('licenses', v)}
            />
            <LabeledSelect
              label="保育経験（公開）"
              options={EXPERIENCE_YEARS_OPTIONS}
              value={form.experienceYears}
              onChange={(v) => set('experienceYears', v)}
            />
            <LabeledSelect
              label="ブランク期間（マッチング相手のみ）"
              options={BLANK_YEARS_OPTIONS}
              value={form.blankYears}
              onChange={(v) => set('blankYears', v)}
            />
          </Box>
        </Box>

        <Divider />

        {/* 得意分野 */}
        <Box>
          {sectionLabel('あなたの「好き」や「得意」を活かせる分野')}
          {visibilityNote('公開')}
          <Box sx={{mb: 2}}>
            <TagSelector
              tags={SKILLS_OPTIONS}
              selected={form.skills}
              onChange={(v) => set('skills', v)}
              selectedColor={TAG_SELECTED_COLOR}
              selectedHoverColor={TAG_SELECTED_HOVER_COLOR}
            />
          </Box>
          <TextField
            label="補足（任意）"
            value={form.skillsNote}
            onChange={(e) => set('skillsNote', e.target.value)}
            size="small"
            multiline
            rows={2}
            fullWidth
            placeholder="得意分野について補足があれば記入してください"
          />
        </Box>

        <Divider />

        {/* 職務経歴 */}
        <Box>
          {sectionLabel('職務経歴')}
          {visibilityNote('マッチング相手のみ')}
          <TextField
            value={form.experience}
            onChange={(e) => set('experience', e.target.value)}
            size="small"
            multiline
            rows={3}
            fullWidth
            placeholder="例：認可保育所で0〜5歳児クラスを5年担当"
          />
        </Box>

        <Divider />

        {/* 希望勤務スタイル */}
        <Box>
          {sectionLabel('希望勤務スタイル')}
          {visibilityNote('公開')}
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
            <CheckboxGroup
              label="期間・働き方（複数選択可）"
              options={PERIOD_OPTIONS}
              selected={form.preferredPeriod}
              onToggle={(v) => toggle('preferredPeriod', v)}
            />
            <CheckboxGroup
              label="時間帯（複数選択可）"
              options={TIME_SLOT_OPTIONS}
              selected={form.preferredTimeSlot}
              onToggle={(v) => toggle('preferredTimeSlot', v)}
              note="※施設によって前後する場合があります"
            />
          </Box>
        </Box>

        <Divider />

        {/* 関わりたい年齢層 */}
        <Box>
          {sectionLabel('関わりたい年齢層')}
          {visibilityNote('公開')}
          <CheckboxGroup
            label="複数選択可"
            options={AGE_GROUP_OPTIONS}
            selected={form.preferredAgeGroups}
            onToggle={(v) => toggle('preferredAgeGroups', v)}
            row={false}
          />
        </Box>

        <Divider />

        {/* 大切にしていること */}
        <Box>
          {sectionLabel('大切にしていること')}
          {visibilityNote('公開')}
          <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2}}>
            {VALUES_CHIPS.map((chip) => (
              <Chip
                key={chip}
                label={chip}
                size="small"
                clickable
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    values: prev.values === chip ? '' : chip,
                  }))
                }
                variant={form.values === chip ? 'filled' : 'outlined'}
                sx={{
                  fontSize: '0.75rem',
                  ...(form.values === chip && {
                    bgcolor: '#F4A7B9',
                    color: '#fff',
                    borderColor: '#F4A7B9',
                  }),
                }}
              />
            ))}
          </Box>
          <TextField
            label="または自由に入力"
            value={VALUES_CHIPS.includes(form.values) ? '' : form.values}
            onChange={(e) => set('values', e.target.value)}
            size="small"
            fullWidth
            placeholder="大切にしていることを自由に記入してください"
          />
        </Box>

        <Divider />

        {/* 自己紹介 */}
        <Box>
          {sectionLabel('自己紹介')}
          {visibilityNote('公開')}
          <TextField
            value={form.bio}
            onChange={(e) => set('bio', e.target.value)}
            size="small"
            multiline
            rows={4}
            fullWidth
            placeholder="あなたの強みや保育への思いを教えてください"
          />
        </Box>

        <Divider />

        {/* 園の方へひとこと */}
        <Box>
          {sectionLabel('園の方へひとこと')}
          {visibilityNote('公開')}
          <TextField
            value={form.messageToNursery}
            onChange={(e) => set('messageToNursery', e.target.value)}
            size="small"
            multiline
            rows={3}
            fullWidth
            placeholder="保育園の方へ伝えたいことを自由に記入してください"
          />
        </Box>

        <Divider />

        {/* NGな条件 */}
        <Box>
          {sectionLabel('NGな条件')}
          {visibilityNote('非公開 — 本人のみ閲覧できます')}
          <Box sx={{mb: 2}}>
            <TagSelector
              tags={NG_OPTIONS}
              selected={form.ngConditions}
              onChange={(v) => set('ngConditions', v)}
              selectedColor={TAG_SELECTED_COLOR}
              selectedHoverColor={TAG_SELECTED_HOVER_COLOR}
            />
          </Box>
          <TextField
            label="補足（任意）"
            value={form.ngConditionsNote}
            onChange={(e) => set('ngConditionsNote', e.target.value)}
            size="small"
            multiline
            rows={2}
            fullWidth
            placeholder="NGな条件について補足があれば記入してください"
          />
        </Box>

        <Divider />

        <FormControlLabel
          control={
            <Checkbox
              checked={form.isPublished}
              onChange={(e) => set('isPublished', e.target.checked)}
              size="small"
              sx={CHECKBOX_SX}
            />
          }
          label={
            <Typography variant="body2">プロフィールを公開する</Typography>
          }
        />

        <Box sx={{display: 'flex', gap: 1.5, flexWrap: 'wrap'}}>
          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            sx={{py: 1.25, flexGrow: {xs: 1, md: 0}, minWidth: {md: 200}}}
          >
            {saving ? '保存中...' : '保存する'}
          </Button>
          <Button
            type="button"
            onClick={handlePreview}
            variant="outlined"
            disabled={previewing}
            sx={{py: 1.25, flexGrow: {xs: 1, md: 0}}}
          >
            {previewing ? '保存中...' : 'プレビューを表示'}
          </Button>
        </Box>
      </Box>
    </>
  );
}

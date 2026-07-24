'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import MenuItem from '@mui/material/MenuItem';
import MuiLink from '@mui/material/Link';
import Select from '@mui/material/Select';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import ErrorAlert from '@/components/ErrorAlert';
import RepeatableEntryList from '@/components/RepeatableEntryList';
import SectionHeading from '@/components/SectionHeading';
import {saveResume} from '@/server/resume-actions';
import {CITIES_BY_PREFECTURE, PREFECTURES} from '@/types/Area';
import {
  EMPTY_RESUME,
  type EducationEntryInput,
  type ResumeInput,
  type WorkHistoryEntryInput,
} from '@/types/Resume';
import {formatYearMonthRange} from '@/utils/date';

const GRADUATION_STATUS_OPTIONS = ['卒業', '中退', '卒業見込み'];

const EMPLOYMENT_TYPE_OPTIONS = [
  '正社員',
  '契約社員',
  '派遣社員',
  'パート・アルバイト',
  '業務委託',
  'その他',
];

const CURRENT_YEAR = new Date().getFullYear();
// Direct 過去〜現在 range covers any realistic education/work-history date;
// resumes don't need future dates.
const YEARS = Array.from({length: 61}, (_, i) => CURRENT_YEAR - i);
const MONTHS = Array.from({length: 12}, (_, i) => i + 1);
const DAYS = Array.from({length: 31}, (_, i) => i + 1);

function newEducationEntry(): EducationEntryInput {
  return {
    _key: crypto.randomUUID(),
    schoolName: '',
    graduationStatus: '',
    startYearMonth: '',
    endYearMonth: '',
  };
}

function newWorkHistoryEntry(): WorkHistoryEntryInput {
  return {
    _key: crypto.randomUUID(),
    companyName: '',
    employmentType: '',
    description: '',
    startYearMonth: '',
    endYearMonth: '',
  };
}

interface YearMonthSelectProps {
  label: string;
  value: string; // 'YYYY-MM', '' = unset
  onChange: (value: string) => void;
}

// Year + month as two independent pull-down Selects (not a calendar grid) —
// faster to fill in on mobile than tapping through a month picker, and maps
// directly onto the 'YYYY-MM' string the rest of the form/server use.
function YearMonthSelect({label, value, onChange}: YearMonthSelectProps) {
  const [year, month] = value ? value.split('-') : ['', ''];

  function set(nextYear: string, nextMonth: string) {
    onChange(nextYear && nextMonth ? `${nextYear}-${nextMonth}` : '');
  }

  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{display: 'block', mb: 0.5}}
      >
        {label}
      </Typography>
      <Box sx={{display: 'flex', gap: 1}}>
        <Select
          value={year}
          onChange={(e) => set(e.target.value, month)}
          displayEmpty
          size="small"
          sx={{minWidth: 100}}
        >
          <MenuItem value="">年</MenuItem>
          {YEARS.map((y) => (
            <MenuItem key={y} value={String(y)}>
              {y}年
            </MenuItem>
          ))}
        </Select>
        <Select
          value={month}
          onChange={(e) => set(year, e.target.value)}
          displayEmpty
          size="small"
          sx={{minWidth: 90}}
        >
          <MenuItem value="">月</MenuItem>
          {MONTHS.map((m) => (
            <MenuItem key={m} value={String(m).padStart(2, '0')}>
              {m}月
            </MenuItem>
          ))}
        </Select>
      </Box>
    </Box>
  );
}

interface BirthDateSelectProps {
  value: string; // 'YYYY-MM-DD', '' = unset
  onChange: (value: string) => void;
}

function BirthDateSelect({value, onChange}: BirthDateSelectProps) {
  const [year, month, day] = value ? value.split('-') : ['', '', ''];

  function set(nextYear: string, nextMonth: string, nextDay: string) {
    onChange(
      nextYear && nextMonth && nextDay
        ? `${nextYear}-${nextMonth}-${nextDay}`
        : '',
    );
  }

  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{display: 'block', mb: 0.5}}
      >
        生年月日
      </Typography>
      <Box sx={{display: 'flex', gap: 1}}>
        <Select
          value={year}
          onChange={(e) => set(e.target.value, month, day)}
          displayEmpty
          size="small"
          sx={{minWidth: 100}}
        >
          <MenuItem value="">年</MenuItem>
          {YEARS.map((y) => (
            <MenuItem key={y} value={String(y)}>
              {y}年
            </MenuItem>
          ))}
        </Select>
        <Select
          value={month}
          onChange={(e) => set(year, e.target.value, day)}
          displayEmpty
          size="small"
          sx={{minWidth: 90}}
        >
          <MenuItem value="">月</MenuItem>
          {MONTHS.map((m) => (
            <MenuItem key={m} value={String(m).padStart(2, '0')}>
              {m}月
            </MenuItem>
          ))}
        </Select>
        <Select
          value={day}
          onChange={(e) => set(year, month, e.target.value)}
          displayEmpty
          size="small"
          sx={{minWidth: 90}}
        >
          <MenuItem value="">日</MenuItem>
          {DAYS.map((d) => (
            <MenuItem key={d} value={String(d).padStart(2, '0')}>
              {d}日
            </MenuItem>
          ))}
        </Select>
      </Box>
    </Box>
  );
}

interface OptionSelectProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

function OptionSelect({label, options, value, onChange}: OptionSelectProps) {
  return (
    <FormControl size="small" sx={{minWidth: 160}}>
      <FormLabel sx={{fontSize: '0.75rem', color: '#666666', mb: 0.5}}>
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
  initial: ResumeInput;
  // Read-only, sourced from the seeker's existing profile (single source of
  // truth — not duplicated as editable fields here).
  licenses: string[];
  bio: string;
}

export default function ResumeForm({initial, licenses, bio}: Props) {
  const router = useRouter();
  const [form, setForm] = useState<ResumeInput>(initial ?? EMPTY_RESUME);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof ResumeInput>(key: K, value: ResumeInput[K]) {
    setForm((prev) => ({...prev, [key]: value}));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const result = await saveResume(form);
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

  const sectionLabel = (text: string) => (
    <Typography
      variant="subtitle1"
      sx={{fontWeight: 700, mb: 1.5, color: '#666666'}}
    >
      {text}
    </Typography>
  );

  return (
    <>
      <SectionHeading subtitle="入力内容から履歴書PDFを自動生成し、書類提出の履歴書としてそのまま使用されます">
        WEB履歴書
      </SectionHeading>

      <Alert severity="info" sx={{mb: 3}}>
        この情報は管理者のみが閲覧します。
      </Alert>

      <ErrorAlert message={error} />

      <Snackbar
        open={saved}
        autoHideDuration={3000}
        onClose={() => setSaved(false)}
        anchorOrigin={{vertical: 'top', horizontal: 'right'}}
      >
        <Alert severity="success" onClose={() => setSaved(false)}>
          保存し、履歴書PDFを生成しました
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
            <BirthDateSelect
              value={form.birthDate}
              onChange={(v) => set('birthDate', v)}
            />
            <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap'}}>
              <TextField
                label="郵便番号"
                value={form.postalCode}
                onChange={(e) => set('postalCode', e.target.value)}
                size="small"
                placeholder="850-0000"
                sx={{width: 160}}
              />
              <FormControl size="small" sx={{minWidth: 160}}>
                <Select
                  displayEmpty
                  value={form.prefecture}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      prefecture: e.target.value,
                      city: '',
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
                  value={form.city}
                  onChange={(e) => set('city', e.target.value)}
                  renderValue={(v) => v || '市区町村を選択'}
                  disabled={!form.prefecture}
                >
                  <MenuItem value="">未選択</MenuItem>
                  {(CITIES_BY_PREFECTURE[form.prefecture] ?? []).map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <TextField
              label="番地・建物名など"
              value={form.addressLine}
              onChange={(e) => set('addressLine', e.target.value)}
              size="small"
              fullWidth
            />
            <TextField
              label="電話番号"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              size="small"
              placeholder="090-1234-5678"
              sx={{maxWidth: 220}}
            />
          </Box>
        </Box>

        <Divider />

        {/* 学歴 */}
        <Box>
          {sectionLabel('学歴')}
          <RepeatableEntryList<EducationEntryInput>
            label="学校ごとに1件追加してください"
            items={form.education}
            onChange={(next) => set('education', next)}
            createEmpty={newEducationEntry}
            addButtonLabel="学歴を追加する"
            renderRow={(entry, update) => (
              <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
                <TextField
                  label="学校名"
                  value={entry.schoolName}
                  onChange={(e) => update({schoolName: e.target.value})}
                  size="small"
                  fullWidth
                />
                <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap'}}>
                  <YearMonthSelect
                    label="入学年月"
                    value={entry.startYearMonth}
                    onChange={(v) => update({startYearMonth: v})}
                  />
                  <YearMonthSelect
                    label="卒業年月（在学中は空欄）"
                    value={entry.endYearMonth}
                    onChange={(v) => update({endYearMonth: v})}
                  />
                  <OptionSelect
                    label="区分"
                    options={GRADUATION_STATUS_OPTIONS}
                    value={entry.graduationStatus}
                    onChange={(v) => update({graduationStatus: v})}
                  />
                </Box>
                {formatYearMonthRange(
                  entry.startYearMonth,
                  entry.endYearMonth,
                  '在学中',
                ) && (
                  <Typography variant="caption" color="text.secondary">
                    {formatYearMonthRange(
                      entry.startYearMonth,
                      entry.endYearMonth,
                      '在学中',
                    )}
                  </Typography>
                )}
              </Box>
            )}
          />
        </Box>

        <Divider />

        {/* 職歴 */}
        <Box>
          {sectionLabel('職歴')}
          <RepeatableEntryList<WorkHistoryEntryInput>
            label="勤務先ごとに1件追加してください"
            items={form.workHistory}
            onChange={(next) => set('workHistory', next)}
            createEmpty={newWorkHistoryEntry}
            addButtonLabel="職歴を追加する"
            renderRow={(entry, update) => (
              <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
                <TextField
                  label="会社名"
                  value={entry.companyName}
                  onChange={(e) => update({companyName: e.target.value})}
                  size="small"
                  fullWidth
                />
                <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap'}}>
                  <YearMonthSelect
                    label="入社年月"
                    value={entry.startYearMonth}
                    onChange={(v) => update({startYearMonth: v})}
                  />
                  <YearMonthSelect
                    label="退社年月（現在勤務中は空欄）"
                    value={entry.endYearMonth}
                    onChange={(v) => update({endYearMonth: v})}
                  />
                  <OptionSelect
                    label="雇用形態"
                    options={EMPLOYMENT_TYPE_OPTIONS}
                    value={entry.employmentType}
                    onChange={(v) => update({employmentType: v})}
                  />
                </Box>
                <TextField
                  label="業務内容（任意）"
                  value={entry.description}
                  onChange={(e) => update({description: e.target.value})}
                  size="small"
                  multiline
                  rows={2}
                  fullWidth
                />
                {formatYearMonthRange(
                  entry.startYearMonth,
                  entry.endYearMonth,
                  '現在勤務中',
                ) && (
                  <Typography variant="caption" color="text.secondary">
                    {formatYearMonthRange(
                      entry.startYearMonth,
                      entry.endYearMonth,
                      '現在勤務中',
                    )}
                  </Typography>
                )}
              </Box>
            )}
          />
        </Box>

        <Divider />

        {/* 免許・資格（読み取り専用） */}
        <Box>
          {sectionLabel('免許・資格')}
          {licenses.length > 0 ? (
            <Box sx={{display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1}}>
              {licenses.map((l) => (
                <Chip key={l} label={l} size="small" />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{mb: 1}}>
              未登録です
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary">
            <MuiLink href="/profile">プロフィール編集</MuiLink>
            から変更できます
          </Typography>
        </Box>

        <Divider />

        {/* 自己PR（読み取り専用） */}
        <Box>
          {sectionLabel('自己PR')}
          <Typography
            variant="body2"
            sx={{whiteSpace: 'pre-wrap', mb: 1}}
            color={bio ? 'text.primary' : 'text.secondary'}
          >
            {bio || '未登録です'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            <MuiLink href="/profile">プロフィール編集</MuiLink>
            から変更できます
          </Typography>
        </Box>

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
            disabled={saving}
            sx={{py: 1.25, flexGrow: {xs: 1, md: 0}, minWidth: {md: 200}}}
          >
            {saving ? '保存中...' : '保存する'}
          </Button>
        </Box>
      </Box>
    </>
  );
}

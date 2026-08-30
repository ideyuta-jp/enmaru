'use client';

import {useRef, useState} from 'react';
import {useRouter} from 'next/navigation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
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
import LinkBehavior from '@/components/LinkBehavior';
import PrefectureCitySelect from '@/components/PrefectureCitySelect';
import RepeatableEntryList from '@/components/RepeatableEntryList';
import SectionHeading from '@/components/SectionHeading';
import {saveResume} from '@/server/resume-actions';
import {lookupPostalAddress} from '@/services/address';
import {resolveCity} from '@/types/Area';
import {
  EMPTY_RESUME,
  type EducationEntryInput,
  type LicenseEntryInput,
  MAX_RESUME_DESCRIPTION_LENGTH,
  MAX_RESUME_HISTORY_ENTRIES,
  type ResumeInput,
  type WorkHistoryEntryInput,
} from '@/types/Resume';
import {
  formatYearMonth,
  formatYearMonthRange,
  isValidBirthDate,
  isYearMonthRangeOutOfOrder,
} from '@/utils/date';
import {
  isValidAddressFurigana,
  isValidEmail,
  isValidPhoneNumber,
  isValidPostalCode,
} from '@/utils/string';

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

function newLicenseEntry(): LicenseEntryInput {
  return {
    _key: crypto.randomUUID(),
    licenseName: '',
    acquiredYearMonth: '',
    fromProfile: false,
  };
}

interface DateUnitSelectProps {
  unit: string; // '年' | '月' | '日' — placeholder and option suffix at once
  options: number[];
  // Zero-pad the stored value ('04') — months/days, to keep 'YYYY-MM(-DD)'
  // strings well-formed. Years stay unpadded.
  pad?: boolean;
  value: string;
  onChange: (value: string) => void;
  minWidth?: number;
  error?: boolean;
}

// One unit of a date ('2010年', '4月', '1日') as a single pull-down Select.
// YearMonthSelect and BirthDateSelect are compositions of this.
function DateUnitSelect({
  unit,
  options,
  pad = false,
  value,
  onChange,
  minWidth = 90,
  error = false,
}: DateUnitSelectProps) {
  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      displayEmpty
      size="small"
      error={error}
      sx={{minWidth}}
    >
      <MenuItem value="">{unit}</MenuItem>
      {options.map((n) => (
        <MenuItem key={n} value={pad ? String(n).padStart(2, '0') : String(n)}>
          {n}
          {unit}
        </MenuItem>
      ))}
    </Select>
  );
}

interface YearMonthSelectProps {
  label: string;
  value: string; // 'YYYY-MM', '' = unset
  onChange: (value: string) => void;
  error?: boolean;
}

// Year + month as two independent pull-down Selects (not a calendar grid) —
// faster to fill in on mobile than tapping through a month picker, and maps
// directly onto the 'YYYY-MM' string the rest of the form/server use.
function YearMonthSelect({
  label,
  value,
  onChange,
  error = false,
}: YearMonthSelectProps) {
  // The halves live in local state because a half-picked pair (year chosen,
  // month not yet) cannot be represented in the committed 'YYYY-MM' string —
  // deriving them from `value` would bounce a single pick straight back to
  // empty. Only a complete pair reaches onChange; an incomplete one commits
  // '' (= unset).
  const initial = value ? value.split('-') : ['', ''];
  const [year, setYear] = useState(initial[0]);
  const [month, setMonth] = useState(initial[1]);

  function set(nextYear: string, nextMonth: string) {
    setYear(nextYear);
    setMonth(nextMonth);
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
        <DateUnitSelect
          unit="年"
          options={YEARS}
          minWidth={100}
          value={year}
          onChange={(y) => set(y, month)}
          error={error}
        />
        <DateUnitSelect
          unit="月"
          options={MONTHS}
          pad
          value={month}
          onChange={(m) => set(year, m)}
          error={error}
        />
      </Box>
    </Box>
  );
}

interface BirthDateSelectProps {
  value: string; // 'YYYY-MM-DD', '' = unset
  onChange: (value: string) => void;
  error?: boolean;
}

function BirthDateSelect({
  value,
  onChange,
  error = false,
}: BirthDateSelectProps) {
  // Same local-state reasoning as YearMonthSelect, with three parts.
  const initial = value ? value.split('-') : ['', '', ''];
  const [year, setYear] = useState(initial[0]);
  const [month, setMonth] = useState(initial[1]);
  const [day, setDay] = useState(initial[2]);

  function set(nextYear: string, nextMonth: string, nextDay: string) {
    setYear(nextYear);
    setMonth(nextMonth);
    setDay(nextDay);
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
        <DateUnitSelect
          unit="年"
          options={YEARS}
          minWidth={100}
          value={year}
          onChange={(y) => set(y, month, day)}
          error={error}
        />
        <DateUnitSelect
          unit="月"
          options={MONTHS}
          pad
          value={month}
          onChange={(m) => set(year, m, day)}
          error={error}
        />
        <DateUnitSelect
          unit="日"
          options={DAYS}
          pad
          value={day}
          onChange={(d) => set(year, month, d)}
          error={error}
        />
      </Box>
      {error && (
        <Typography
          variant="caption"
          color="error"
          sx={{display: 'block', mt: 0.5}}
        >
          生年月日が正しくありません
        </Typography>
      )}
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
  // truth — not duplicated as an editable field here). Unlike licenses
  // (#195), bio has no résumé-specific copy: the résumé always shows
  // whatever the profile currently says.
  bio: string;
}

export default function ResumeForm({initial, bio}: Props) {
  const router = useRouter();
  const [form, setForm] = useState<ResumeInput>(initial ?? EMPTY_RESUME);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [zipLoading, setZipLoading] = useState(false);
  // Gates inline field errors — same pattern as JobForm: nothing is marked
  // invalid until the seeker actually tries to submit.
  const [submitted, setSubmitted] = useState(false);
  // 住所フリガナだけは submitted ではなくこちらでゲートする。IME を通す
  // フィールドなので、別のフィールド起因で submitted が立った状態から
  // 入力を始めると、変換確定前のひらがなに反応して入力中に赤くなる。
  // true になるのは blur 時と、送信時に値が不正だったときだけ。
  const [addressFuriganaTouched, setAddressFuriganaTouched] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function set<K extends keyof ResumeInput>(key: K, value: ResumeInput[K]) {
    setForm((prev) => ({...prev, [key]: value}));
  }

  // Updates a single fromProfile license row's acquired date by _key —
  // the only field those rows allow editing (licenseName is server-derived,
  // see syncLicenseHistoryWithProfile in server/resume.ts).
  function setProfileLicenseAcquiredDate(key: string, value: string) {
    setForm((prev) => ({
      ...prev,
      licenseHistory: prev.licenseHistory.map((l) =>
        l._key === key ? {...l, acquiredYearMonth: value} : l,
      ),
    }));
  }

  // TODO: extract a shared postal-code field — NurseryProfileForm carries the
  // same zipLoading + onBlur lookup + spinner adornment as this one.
  async function handlePostalCodeBlur() {
    // Same shape rule as the submit validation — a code the form would
    // reject shouldn't trigger a lookup either.
    if (form.postalCode === '' || !isValidPostalCode(form.postalCode)) return;
    setZipLoading(true);
    try {
      const address = await lookupPostalAddress(form.postalCode);
      if (address) {
        // The city is a fixed dropdown, so an unmatched lookup leaves it empty
        // for manual selection rather than guessing.
        const city = resolveCity(address.prefecture, address.city);
        setForm((prev) => ({...prev, prefecture: address.prefecture, city}));
      }
    } catch {
      // silently ignore — user can fill in manually
    } finally {
      setZipLoading(false);
    }
  }

  const birthDateInvalid = !isValidBirthDate(form.birthDate);
  const postalCodeInvalid = !isValidPostalCode(form.postalCode);
  const addressFuriganaInvalid = !isValidAddressFurigana(form.addressFurigana);
  const phoneInvalid = !isValidPhoneNumber(form.phone);
  const emailInvalid = !isValidEmail(form.email);
  const educationInvalid = form.education.some(
    (e) =>
      !e.schoolName.trim() ||
      isYearMonthRangeOutOfOrder(e.startYearMonth, e.endYearMonth),
  );
  const workHistoryInvalid = form.workHistory.some(
    (w) =>
      !w.companyName.trim() ||
      isYearMonthRangeOutOfOrder(w.startYearMonth, w.endYearMonth),
  );
  const licenseHistoryInvalid = form.licenseHistory.some(
    (l) => !l.licenseName.trim() || !l.acquiredYearMonth,
  );
  // Split for rendering only — submitted as one combined array. Profile rows
  // (server-synced against SeekerProfileInput.licenses) are shown read-only
  // except for their date; custom rows keep the existing add/remove editor.
  const profileLicenseRows = form.licenseHistory.filter((l) => l.fromProfile);
  const customLicenseRows = form.licenseHistory.filter((l) => !l.fromProfile);

  // Reports only whether the save succeeded — failures surface through
  // `error`, so what happens next (toast, navigation) is the caller's call.
  async function save(): Promise<boolean> {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const result = await saveResume(form);
      if (!result.ok) {
        setError(result.message);
        return false;
      }
      return true;
    } catch {
      setError('保存に失敗しました。時間をおいて再度お試しください。');
      return false;
    } finally {
      setSaving(false);
    }
  }

  // Validated here so errors surface inline next to each field (and the page
  // scrolls to the first one) instead of as a generic banner. The server
  // (validateResumeInput in server/resume.ts, called from saveResume)
  // re-validates everything as the backstop. Every save entry point (submit
  // button, profile-link autosave) goes through this gate so invalid input
  // surfaces the same way on each.
  function validateLocally(): boolean {
    setSubmitted(true);
    if (addressFuriganaInvalid) setAddressFuriganaTouched(true);

    if (
      birthDateInvalid ||
      postalCodeInvalid ||
      addressFuriganaInvalid ||
      phoneInvalid ||
      emailInvalid ||
      educationInvalid ||
      workHistoryInvalid ||
      licenseHistoryInvalid
    ) {
      // Defer to the next tick: the error classes queried below are set by
      // the re-render that setSubmitted(true) triggers, so they are not in
      // the DOM yet in this handler.
      setTimeout(() => {
        const first = formRef.current?.querySelector<HTMLElement>(
          '.Mui-error, [aria-invalid="true"]',
        );
        first?.scrollIntoView({behavior: 'smooth', block: 'center'});
      }, 50);
      return false;
    }
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateLocally()) return;
    if (await save()) {
      setSaved(true);
      router.refresh();
    }
  }

  // A real <a href="/profile">, but in-app navigation is intercepted: following
  // the link would drop the form's unsaved changes (#175), so save first and
  // navigate only once that succeeds. Modified clicks (Cmd/Ctrl+click, middle
  // click) never reach onNavigate — next/link leaves those to the browser, so
  // they open a new tab and this tab keeps the form as it is.
  async function handleProfileLinkNavigate(e: {preventDefault: () => void}) {
    e.preventDefault();
    // next/link navigates as soon as this returns, so cancel above before
    // bailing out when a save is already running (this link or the submit
    // button — a link cannot be disabled). A second saveResume would share
    // `saving`, and whichever finished first would flip it back — re-enabling
    // the submit button mid-save — besides queueing another PDF render.
    // Same for an in-flight postal lookup as on the submit button, except a
    // link cannot be disabled — bail out here instead.
    if (saving || zipLoading) return;
    // Invalid input blocks the navigation with the same inline errors as the
    // submit button — navigating away silently would drop the fixes #175
    // exists to preserve.
    if (!validateLocally()) return;
    if (await save()) router.push('/profile');
  }

  const sectionLabel = (text: string) => (
    <Typography
      variant="subtitle1"
      sx={{fontWeight: 700, mb: 1.5, color: '#666666'}}
    >
      {text}
    </Typography>
  );

  // Shared by the 免許・資格 profile-derived rows and the 自己PR section —
  // both show profile-sourced content the seeker can only change on /profile.
  const profileEditNote = (
    <Typography variant="caption" color="text.secondary">
      <MuiLink
        // The theme wires MuiLink to LinkBehavior already; naming it here is
        // what makes next/link's onNavigate visible to the type checker.
        component={LinkBehavior}
        href="/profile"
        onNavigate={handleProfileLinkNavigate}
      >
        プロフィール編集
      </MuiLink>
      から変更できます
    </Typography>
  );

  return (
    <>
      <SectionHeading subtitle="入力内容から履歴書PDFを自動生成し、書類提出の履歴書としてそのまま使用されます">
        WEB履歴書
      </SectionHeading>

      <Alert severity="info" sx={{mb: 3}}>
        入力内容は運営が確認します。マッチング成立後は保育園にも共有されます。
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
        ref={formRef}
        onSubmit={handleSubmit}
        // Suppress the browser's native validation UI — errors are rendered
        // via MUI's error state and the scroll-to-first-error handling above.
        noValidate
        sx={{display: 'flex', flexDirection: 'column', gap: 3}}
      >
        {/* 基本情報 */}
        <Box>
          {sectionLabel('基本情報')}
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
            <BirthDateSelect
              value={form.birthDate}
              onChange={(v) => set('birthDate', v)}
              error={submitted && birthDateInvalid}
            />
            <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap'}}>
              <TextField
                label="郵便番号"
                value={form.postalCode}
                onChange={(e) => set('postalCode', e.target.value)}
                onBlur={handlePostalCodeBlur}
                size="small"
                placeholder="850-0000"
                error={submitted && postalCodeInvalid}
                // helperText rather than a sibling caption so the hint is tied
                // to the input through aria-describedby. Its default 14px side
                // margins would push the hint onto a second line, so drop them
                // and let it use the field's full width. The validation error
                // takes the hint's slot while it applies.
                helperText={
                  submitted && postalCodeInvalid
                    ? '「850-0000」の形式で入力してください'
                    : '入力すると住所を自動補完します'
                }
                sx={{width: 220, '& .MuiFormHelperText-root': {mx: 0}}}
                slotProps={{
                  input: {
                    endAdornment: zipLoading ? (
                      <CircularProgress size={16} sx={{mr: 0.5}} />
                    ) : null,
                  },
                }}
              />
              <PrefectureCitySelect
                prefecture={form.prefecture}
                city={form.city}
                onChange={(prefecture, city) =>
                  setForm((prev) => ({...prev, prefecture, city}))
                }
              />
            </Box>
            <TextField
              label="番地・建物名など"
              value={form.addressLine}
              onChange={(e) => set('addressLine', e.target.value)}
              size="small"
              fullWidth
            />
            <TextField
              label="住所フリガナ"
              value={form.addressFurigana}
              onChange={(e) => set('addressFurigana', e.target.value)}
              size="small"
              fullWidth
              placeholder="ナガサキケン ナガサキシ サクラマチ"
              onBlur={() => setAddressFuriganaTouched(true)}
              error={addressFuriganaTouched && addressFuriganaInvalid}
              helperText={
                addressFuriganaTouched && addressFuriganaInvalid
                  ? 'カタカナで入力してください'
                  : '任意 — 難読地名の場合にご記入ください'
              }
            />
            <TextField
              label="電話番号"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              size="small"
              placeholder="090-1234-5678"
              sx={{maxWidth: 220}}
              error={submitted && phoneInvalid}
              helperText={
                submitted && phoneInvalid
                  ? '電話番号の形式が正しくありません'
                  : undefined
              }
            />
            <TextField
              label="メールアドレス（任意）"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              size="small"
              type="email"
              placeholder="yamada@example.com"
              sx={{maxWidth: 320}}
              error={submitted && emailInvalid}
              helperText={
                submitted && emailInvalid
                  ? 'メールアドレスの形式が正しくありません'
                  : '連絡はメールが良い方はご記入ください'
              }
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
            maxItems={MAX_RESUME_HISTORY_ENTRIES}
            renderRow={(entry, update) => {
              const rangeText = formatYearMonthRange(
                entry.startYearMonth,
                entry.endYearMonth,
                '在学中',
              );
              const nameMissing = submitted && !entry.schoolName.trim();
              const rangeInvalid =
                submitted &&
                isYearMonthRangeOutOfOrder(
                  entry.startYearMonth,
                  entry.endYearMonth,
                );
              return (
                <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
                  <TextField
                    label="学校名"
                    value={entry.schoolName}
                    onChange={(e) => update({schoolName: e.target.value})}
                    size="small"
                    fullWidth
                    error={nameMissing}
                    helperText={nameMissing ? '入力してください' : undefined}
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
                      error={rangeInvalid}
                    />
                    <OptionSelect
                      label="区分"
                      options={GRADUATION_STATUS_OPTIONS}
                      value={entry.graduationStatus}
                      onChange={(v) => update({graduationStatus: v})}
                    />
                  </Box>
                  {rangeInvalid && (
                    <Typography variant="caption" color="error">
                      卒業年月は入学年月より後にしてください
                    </Typography>
                  )}
                  {!rangeInvalid && rangeText && (
                    <Typography variant="caption" color="text.secondary">
                      {rangeText}
                    </Typography>
                  )}
                </Box>
              );
            }}
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
            maxItems={MAX_RESUME_HISTORY_ENTRIES}
            renderRow={(entry, update) => {
              const rangeText = formatYearMonthRange(
                entry.startYearMonth,
                entry.endYearMonth,
                '現在勤務中',
              );
              const nameMissing = submitted && !entry.companyName.trim();
              const rangeInvalid =
                submitted &&
                isYearMonthRangeOutOfOrder(
                  entry.startYearMonth,
                  entry.endYearMonth,
                );
              return (
                <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
                  <TextField
                    label="会社名"
                    value={entry.companyName}
                    onChange={(e) => update({companyName: e.target.value})}
                    size="small"
                    fullWidth
                    error={nameMissing}
                    helperText={nameMissing ? '入力してください' : undefined}
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
                      error={rangeInvalid}
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
                    slotProps={{
                      htmlInput: {maxLength: MAX_RESUME_DESCRIPTION_LENGTH},
                    }}
                  />
                  {rangeInvalid && (
                    <Typography variant="caption" color="error">
                      退社年月は入社年月より後にしてください
                    </Typography>
                  )}
                  {!rangeInvalid && rangeText && (
                    <Typography variant="caption" color="text.secondary">
                      {rangeText}
                    </Typography>
                  )}
                </Box>
              );
            }}
          />
        </Box>

        <Divider />

        {/* 免許・資格 */}
        <Box>
          {sectionLabel('免許・資格')}

          {/* プロフィールの保有資格（自動反映・資格名は編集不可、取得年月のみ入力） */}
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2}}>
            {profileLicenseRows.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                プロフィールで保有資格が選択されていません
              </Typography>
            ) : (
              profileLicenseRows.map((entry) => {
                const dateMissing = submitted && !entry.acquiredYearMonth;
                const acquiredText = formatYearMonth(entry.acquiredYearMonth);
                return (
                  <Box
                    key={entry._key}
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      gap: 2,
                      p: 1.5,
                      bgcolor: '#FAFAFA',
                      borderRadius: 1,
                      border: '1px solid #E0E0E0',
                    }}
                  >
                    <Typography sx={{fontWeight: 700, minWidth: 160}}>
                      {entry.licenseName}
                    </Typography>
                    <Box>
                      <YearMonthSelect
                        label="取得年月"
                        value={entry.acquiredYearMonth}
                        onChange={(v) =>
                          setProfileLicenseAcquiredDate(entry._key, v)
                        }
                        error={dateMissing}
                      />
                      {dateMissing ? (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{display: 'block', mt: 0.5}}
                        >
                          取得年月を入力してください
                        </Typography>
                      ) : (
                        acquiredText && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{display: 'block', mt: 0.5}}
                          >
                            取得：{acquiredText}
                          </Typography>
                        )
                      )}
                    </Box>
                  </Box>
                );
              })
            )}
            {profileEditNote}
          </Box>

          <Divider sx={{my: 2}} />

          {/* 追加の免許・資格（保育に限らず自由に追加可能） */}
          <RepeatableEntryList<LicenseEntryInput>
            label="保育に関わらない資格も含め、資格ごとに1件追加してください"
            items={customLicenseRows}
            onChange={(next) =>
              setForm((prev) => ({
                ...prev,
                licenseHistory: [
                  ...prev.licenseHistory.filter((l) => l.fromProfile),
                  ...next,
                ],
              }))
            }
            createEmpty={newLicenseEntry}
            addButtonLabel="免許・資格を追加する"
            maxItems={MAX_RESUME_HISTORY_ENTRIES - profileLicenseRows.length}
            renderRow={(entry, update) => {
              const nameMissing = submitted && !entry.licenseName.trim();
              const dateMissing = submitted && !entry.acquiredYearMonth;
              const acquiredText = formatYearMonth(entry.acquiredYearMonth);
              return (
                <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
                  <TextField
                    label="免許・資格名"
                    value={entry.licenseName}
                    onChange={(e) => update({licenseName: e.target.value})}
                    size="small"
                    fullWidth
                    placeholder="普通自動車第一種運転免許"
                    error={nameMissing}
                    helperText={nameMissing ? '入力してください' : undefined}
                  />
                  <YearMonthSelect
                    label="取得年月"
                    value={entry.acquiredYearMonth}
                    onChange={(v) => update({acquiredYearMonth: v})}
                    error={dateMissing}
                  />
                  {dateMissing ? (
                    <Typography variant="caption" color="error">
                      取得年月を入力してください
                    </Typography>
                  ) : (
                    acquiredText && (
                      <Typography variant="caption" color="text.secondary">
                        取得：{acquiredText}
                      </Typography>
                    )
                  )}
                </Box>
              );
            }}
          />
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
          {profileEditNote}
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
            // Also blocked while an autofill is in flight: clicking here blurs
            // the postal-code field, and save() would read the form before the
            // looked-up address lands — saving a blank address under a success
            // toast. The spinner in the field shows why the click is refused.
            disabled={saving || zipLoading}
            sx={{py: 1.25, flexGrow: {xs: 1, md: 0}, minWidth: {md: 200}}}
          >
            {saving ? '保存中...' : '保存する'}
          </Button>
        </Box>
      </Box>
    </>
  );
}

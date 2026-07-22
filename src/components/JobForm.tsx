'use client';

import {useRef, useState, type Dispatch, type SetStateAction} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {DateCalendar} from '@mui/x-date-pickers/DateCalendar';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {PickerDay, type PickerDayProps} from '@mui/x-date-pickers/PickerDay';
import dayjs, {type Dayjs} from 'dayjs';

import CheckboxGroup from '@/components/CheckboxGroup';
import TagSelector from '@/components/TagSelector';
import {
  ALL_DOCUMENT_TYPES,
  DOCUMENT_TYPE_LABEL,
  type SeekerDocumentType,
} from '@/types/Document';
import type {JobInput} from '@/types/Job';
import {toMinutes} from '@/utils/date';

const TITLE_CHIPS = [
  '午前中の保育補助',
  '早番・遅番対応可能な方',
  '土曜日対応可能な方',
  '行事前後のサポート',
  '延長保育サポート',
  'クラス担任補助',
];

const WORK_CONTENT_TAGS = [
  'クラス運営サポート',
  '行事前後のサポート',
  '食事・午睡補助',
  '散歩の引率',
  '制作活動のサポート',
  '事務補助',
  '保育全般',
];

const QUALIFICATION_OPTIONS = [
  '保育士資格必須',
  '幼稚園教諭免許可',
  '資格不問（保育補助可）',
];

const DRESSCODE_CHIPS = [
  'エプロン着用（貸出あり）',
  'エプロン着用（自己持参）',
  '動きやすい服装',
  '清潔感のある服装',
  '制服あり（貸出あり）',
];

const TARGET_PERSON_TAGS = [
  '明るく元気な方',
  '子ども好きな方',
  '主体性を持って動ける方',
  '丁寧なコミュニケーションができる方',
  'チームワークを大切にできる方',
  '臨機応変に対応できる方',
];

// 30分刻みの時刻リスト（06:00〜22:00）
const TIME_OPTIONS: string[] = [];
for (let h = 6; h <= 22; h++) {
  TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:00`);
  if (h < 22) TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:30`);
}

const CHECKBOX_SX = {color: '#F4A7B9', '&.Mui-checked': {color: '#F4A7B9'}};

const SECTION_LABEL_SX = {
  fontSize: '0.875rem',
  fontWeight: 700,
  color: '#666666',
  mb: 0.75,
};

interface SelectableDayProps extends PickerDayProps {
  // Injected via slotProps.day — the multi-selected dates to paint.
  selectedDates?: string[];
}

// DateCalendar's day cell, painted from the form's multi-date selection.
// DateCalendar itself only models a single value, so its built-in selection
// stays suppressed (selected={false}) and both the paint and the ARIA state
// come from selectedDates instead. Declared at top level so the slot keeps a
// stable component identity — an inline slot function would remount every day
// cell on each JobForm re-render (i.e. on every keystroke elsewhere in the
// form).
function SelectableDay({selectedDates = [], ...props}: SelectableDayProps) {
  const key = (props.day as Dayjs).format('YYYY-MM-DD');
  const selected = selectedDates.includes(key);
  return (
    <PickerDay
      {...props}
      selected={false}
      aria-selected={selected}
      sx={{
        ...(selected && {
          // !important because PickerDay's own state styles (hover/focus)
          // otherwise out-specify this sx override.
          bgcolor: '#F05A22 !important',
          color: '#FFFFFF !important',
          borderRadius: '50%',
        }),
      }}
    />
  );
}

interface SuggestionChipRowProps {
  options: string[];
  value: string;
  onSelect: (value: string) => void;
}

// Single-select suggestion chips that replace a text field's whole value.
// Clicking the chip that matches the current value highlights it; free edits
// in the field simply leave every chip unhighlighted.
function SuggestionChipRow({options, value, onSelect}: SuggestionChipRowProps) {
  return (
    <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1}}>
      {options.map((chip) => (
        <Chip
          key={chip}
          label={chip}
          size="small"
          onClick={() => onSelect(chip)}
          sx={{
            cursor: 'pointer',
            bgcolor: value === chip ? '#F05A22' : '#F5F5F5',
            color: value === chip ? '#FFFFFF' : '#555555',
            fontSize: '0.75rem',
            '&:hover': {
              bgcolor: value === chip ? '#D94D19' : '#EBEBEB',
            },
          }}
        />
      ))}
    </Box>
  );
}

interface TimeSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  submitted: boolean;
  // Extra error shown under the select (used for the end-time ordering error).
  extraError?: string | null;
}

function TimeSelect({
  label,
  value,
  onChange,
  submitted,
  extraError = null,
}: TimeSelectProps) {
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{display: 'block', mb: 0.5}}
      >
        {label}
      </Typography>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        size="small"
        fullWidth
        displayEmpty
        error={submitted && (!value || extraError !== null)}
      >
        <MenuItem value="" disabled>
          選択してください
        </MenuItem>
        {TIME_OPTIONS.map((t) => (
          <MenuItem key={t} value={t}>
            {t}
          </MenuItem>
        ))}
      </Select>
      {submitted && !value && (
        <FormHelperText error sx={{mx: 0, mt: 0.5}}>
          選択してください
        </FormHelperText>
      )}
      {extraError && (
        <FormHelperText error sx={{mx: 0, mt: 0.5}}>
          {extraError}
        </FormHelperText>
      )}
    </Box>
  );
}

interface Props {
  form: JobInput;
  setForm: Dispatch<SetStateAction<JobInput>>;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  saving: boolean;
  submitLabel: string;
  // The edit form updates exactly one posting, so it locks the calendar to a
  // single date; the create form fans out one posting per selected date.
  singleDate?: boolean;
}

export default function JobForm({
  form,
  setForm,
  onSubmit,
  onCancel,
  saving,
  submitLabel,
  singleDate = false,
}: Props) {
  const [timeError, setTimeError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function set<K extends keyof JobInput>(key: K, value: JobInput[K]) {
    setForm((prev) => ({...prev, [key]: value}));
  }

  function toggleRequiredDocument(type: SeekerDocumentType) {
    setForm((prev) => ({
      ...prev,
      requiredDocuments: prev.requiredDocuments.includes(type)
        ? prev.requiredDocuments.filter((d) => d !== type)
        : [...prev.requiredDocuments, type],
    }));
  }

  function toggleQualification(value: string) {
    setForm((prev) => ({
      ...prev,
      qualification: prev.qualification.includes(value)
        ? prev.qualification.filter((q) => q !== value)
        : [...prev.qualification, value],
    }));
  }

  function toggleDate(date: Dayjs) {
    const key = date.format('YYYY-MM-DD');
    setForm((prev) => {
      if (singleDate) return {...prev, workDates: [key]};
      const next = prev.workDates.includes(key)
        ? prev.workDates.filter((d) => d !== key)
        : [...prev.workDates, key].sort();
      return {...prev, workDates: next};
    });
  }

  const workContentMissing =
    form.workContentTags.length === 0 && !form.workContentNote.trim();

  // Validate here so errors surface inline next to each field (and the page
  // scrolls to the first one) instead of as a generic banner. The server
  // (job-actions.ts) re-validates everything as the backstop.
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setTimeError(null);

    const hasEmpty =
      !form.title ||
      workContentMissing ||
      form.workDates.length === 0 ||
      !form.workTimeStart ||
      !form.workTimeEnd ||
      !form.hourlyWage.trim();
    // Duration in minutes — ordering alone isn't enough since a posting must
    // be at least one hour long (mirrors job-actions.ts).
    const timeDiff =
      form.workTimeStart && form.workTimeEnd
        ? toMinutes(form.workTimeEnd) - toMinutes(form.workTimeStart)
        : null;
    const hasTimeError = timeDiff !== null && timeDiff < 60;

    if (hasEmpty || hasTimeError) {
      if (hasTimeError)
        setTimeError(
          timeDiff <= 0
            ? '終了時刻は開始時刻より後に設定してください'
            : '勤務時間は1時間以上に設定してください',
        );
      // Defer to the next tick: the error classes queried below are set by the
      // re-render that setSubmitted(true) triggers, so they are not in the DOM
      // yet in this handler.
      setTimeout(() => {
        const first = formRef.current?.querySelector<HTMLElement>(
          '.Mui-error, [aria-invalid="true"]',
        );
        first?.scrollIntoView({behavior: 'smooth', block: 'center'});
      }, 50);
      return;
    }
    onSubmit(e);
  }

  return (
    <Box
      component="form"
      ref={formRef}
      onSubmit={handleSubmit}
      // Suppress the browser's native validation UI — errors are rendered via
      // MUI's error state and the scroll-to-first-error handling above.
      noValidate
      sx={{display: 'flex', flexDirection: 'column', gap: 3}}
    >
      {/* タイトル */}
      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{display: 'block', mb: 0.75}}
        >
          候補から選んで入力できます
        </Typography>
        <SuggestionChipRow
          options={TITLE_CHIPS}
          value={form.title}
          onSelect={(v) => set('title', v)}
        />
        <TextField
          label="タイトル"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          required
          size="small"
          fullWidth
          placeholder="例：午前中サポート保育スタッフ募集"
          error={submitted && !form.title}
          helperText={submitted && !form.title ? '入力してください' : undefined}
        />
      </Box>

      <Divider />

      {/* 勤務内容 */}
      <Box>
        <FormLabel component="legend" sx={SECTION_LABEL_SX}>
          勤務内容 *
        </FormLabel>
        <Box sx={{mb: 1}}>
          <TagSelector
            tags={WORK_CONTENT_TAGS}
            selected={form.workContentTags}
            onChange={(v) => set('workContentTags', v)}
          />
        </Box>
        <TextField
          label="補足・詳細（任意）"
          value={form.workContentNote}
          onChange={(e) => set('workContentNote', e.target.value)}
          size="small"
          multiline
          rows={2}
          fullWidth
          placeholder="タグ選択に加えて補足があれば追記してください"
          error={submitted && workContentMissing}
          helperText={
            submitted && workContentMissing
              ? 'タグを選択するか補足を入力してください'
              : undefined
          }
        />
      </Box>

      <Divider />

      {/* 勤務日・勤務時間 */}
      <Box>
        <FormLabel component="legend" sx={{...SECTION_LABEL_SX, mb: 1}}>
          勤務日・勤務時間 *
        </FormLabel>
        <Box sx={{mb: 2}}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{display: 'block', mb: 0.5}}
          >
            勤務日 *{!singleDate && '（複数選択可）'}
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar
              disablePast
              // Open on the month of the prefilled date (the edit flow's
              // posting can be months away); default to the current month
              // when nothing is selected yet. Only read at mount, so the view
              // never jumps while picking.
              referenceDate={
                form.workDates.length > 0 ? dayjs(form.workDates[0]) : undefined
              }
              onChange={(date: Dayjs | null) => date && toggleDate(date)}
              slots={{day: SelectableDay}}
              slotProps={{
                day: {selectedDates: form.workDates} as SelectableDayProps,
              }}
              sx={{
                width: '100%',
                maxWidth: 360,
                mx: 0,
                border:
                  submitted && form.workDates.length === 0
                    ? '1px solid #d32f2f'
                    : '1px solid #E0E0E0',
                borderRadius: 1,
              }}
            />
          </LocalizationProvider>
          {submitted && form.workDates.length === 0 && (
            <FormHelperText error sx={{mx: 0, mt: 0.5}}>
              勤務日を選択してください
            </FormHelperText>
          )}
          {form.workDates.length > 0 && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{display: 'block', mt: 0.5}}
            >
              {!singleDate && `${form.workDates.length}日選択中`}
              {!singleDate &&
                form.workDates.length > 1 &&
                `（${form.workDates.length}件の募集が作成されます）`}
              {singleDate && form.workDates[0]}
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {xs: '1fr', sm: '1fr 1fr'},
            gap: 2,
            maxWidth: 360,
          }}
        >
          <TimeSelect
            label="開始時刻 *"
            value={form.workTimeStart}
            onChange={(v) => {
              setTimeError(null);
              set('workTimeStart', v);
            }}
            submitted={submitted}
          />
          <TimeSelect
            label="終了時刻 *"
            value={form.workTimeEnd}
            onChange={(v) => {
              setTimeError(null);
              set('workTimeEnd', v);
            }}
            submitted={submitted}
            extraError={timeError}
          />
        </Box>
      </Box>

      <Divider />

      {/* 時給 */}
      <TextField
        label="時給（円・必須）"
        type="number"
        value={form.hourlyWage}
        onChange={(e) => set('hourlyWage', e.target.value)}
        required
        size="small"
        slotProps={{htmlInput: {min: 1}}}
        error={submitted && !form.hourlyWage.trim()}
        helperText={
          submitted && !form.hourlyWage.trim() ? '入力してください' : undefined
        }
      />

      <Divider />

      {/* 募集に必要な資格 */}
      <CheckboxGroup
        label="募集に必要な資格"
        options={QUALIFICATION_OPTIONS}
        selected={form.qualification}
        onToggle={toggleQualification}
        row={false}
      />

      <Divider />

      {/* 交通費 */}
      <Box>
        <FormLabel component="legend" sx={{...SECTION_LABEL_SX, mb: 0.5}}>
          交通費
        </FormLabel>
        <RadioGroup
          value={form.transportationExpense}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              transportationExpense: e.target.value,
              transportationExpenseNote: '',
            }))
          }
          row
        >
          <FormControlLabel
            value="yes"
            control={
              <Radio size="small" sx={{'&.Mui-checked': {color: '#F05A22'}}} />
            }
            label={<span style={{fontSize: '0.875rem'}}>あり</span>}
          />
          <FormControlLabel
            value="no"
            control={
              <Radio size="small" sx={{'&.Mui-checked': {color: '#F05A22'}}} />
            }
            label={<span style={{fontSize: '0.875rem'}}>なし</span>}
          />
        </RadioGroup>
        {form.transportationExpense === 'yes' && (
          <TextField
            label="詳細（例：実費支給・上限500円）"
            value={form.transportationExpenseNote}
            onChange={(e) => set('transportationExpenseNote', e.target.value)}
            size="small"
            fullWidth
            sx={{mt: 1}}
          />
        )}
      </Box>

      <Divider />

      {/* 勤務時の服装 */}
      <Box>
        <FormLabel component="legend" sx={SECTION_LABEL_SX}>
          勤務時の服装（任意）
        </FormLabel>
        <SuggestionChipRow
          options={DRESSCODE_CHIPS}
          value={form.dresscode}
          onSelect={(v) => set('dresscode', v)}
        />
        <TextField
          label="自由入力（任意）"
          value={form.dresscode}
          onChange={(e) => set('dresscode', e.target.value)}
          size="small"
          fullWidth
          placeholder="その他の服装規定があれば"
        />
      </Box>

      <Divider />

      {/* 求める人物像 */}
      <Box>
        <FormLabel component="legend" sx={SECTION_LABEL_SX}>
          求める人物像（任意）
        </FormLabel>
        <Box sx={{mb: 1}}>
          <TagSelector
            tags={TARGET_PERSON_TAGS}
            selected={form.targetPersonTags}
            onChange={(v) => set('targetPersonTags', v)}
          />
        </Box>
        <TextField
          label="補足（任意）"
          value={form.targetPersonNote}
          onChange={(e) => set('targetPersonNote', e.target.value)}
          size="small"
          fullWidth
          multiline
          rows={2}
        />
      </Box>

      <Divider />

      {/* 応募に必要な書類 */}
      <Box>
        <FormLabel component="legend" sx={{...SECTION_LABEL_SX, mb: 0}}>
          応募に必要な書類
        </FormLabel>
        <FormGroup row>
          {ALL_DOCUMENT_TYPES.map((type) => (
            <FormControlLabel
              key={type}
              control={
                <Checkbox
                  checked={form.requiredDocuments.includes(type)}
                  onChange={() => toggleRequiredDocument(type)}
                  size="small"
                  sx={CHECKBOX_SX}
                />
              }
              label={
                <span style={{fontSize: '0.875rem'}}>
                  {DOCUMENT_TYPE_LABEL[type]}
                </span>
              }
            />
          ))}
        </FormGroup>
      </Box>

      <Divider />

      {/* 備考 */}
      <TextField
        label="備考・補足事項（任意）"
        value={form.remarks}
        onChange={(e) => set('remarks', e.target.value)}
        size="small"
        multiline
        rows={2}
        fullWidth
        placeholder="例：駐車場あり、制服貸出あり"
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
          disabled={saving}
          sx={{py: 1.25, flex: {sm: 1}}}
        >
          {saving ? '処理中...' : submitLabel}
        </Button>
        <Button
          variant="outlined"
          onClick={onCancel}
          sx={{
            py: 1.25,
            flex: {sm: 1},
            borderColor: '#AAAAAA',
            color: '#666666',
          }}
        >
          キャンセル
        </Button>
      </Box>
    </Box>
  );
}

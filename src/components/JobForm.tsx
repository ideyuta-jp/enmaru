'use client';

import {useRef, useState} from 'react';
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

import {
  ALL_DOCUMENT_TYPES,
  DOCUMENT_TYPE_LABEL,
  type SeekerDocumentType,
} from '@/types/Document';
import type {JobInput} from '@/types/Job';

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

interface Props {
  form: JobInput;
  setForm: (form: JobInput) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  saving: boolean;
  submitLabel: string;
}

export default function JobForm({
  form,
  setForm,
  onSubmit,
  onCancel,
  saving,
  submitLabel,
}: Props) {
  const [timeError, setTimeError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const today = new Date().toISOString().slice(0, 10);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setTimeError(null);

    const hasEmpty =
      !form.title ||
      !form.workContent ||
      !form.workDate ||
      !form.workTimeStart ||
      !form.workTimeEnd;
    const isPastDate = form.workDate && form.workDate < today;
    const hasTimeError =
      form.workTimeStart &&
      form.workTimeEnd &&
      form.workTimeEnd <= form.workTimeStart;

    if (hasEmpty || isPastDate || hasTimeError) {
      if (hasTimeError)
        setTimeError('終了時刻は開始時刻より後に設定してください');
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

  function toggleRequiredDocument(type: SeekerDocumentType) {
    const has = form.requiredDocuments.includes(type);
    setForm({
      ...form,
      requiredDocuments: has
        ? form.requiredDocuments.filter((d) => d !== type)
        : [...form.requiredDocuments, type],
    });
  }

  function toggleQualification(value: string) {
    const has = form.qualification.includes(value);
    setForm({
      ...form,
      qualification: has
        ? form.qualification.filter((q) => q !== value)
        : [...form.qualification, value],
    });
  }

  function toggleWorkContentTag(tag: string) {
    const current = form.workContent
      .split('・')
      .map((s) => s.trim())
      .filter(Boolean);
    const has = current.includes(tag);
    const next = has ? current.filter((t) => t !== tag) : [...current, tag];
    setForm({...form, workContent: next.join('・')});
  }

  function toggleTargetPersonTag(tag: string) {
    const current = form.targetPerson
      .split('・')
      .map((s) => s.trim())
      .filter(Boolean);
    const has = current.includes(tag);
    const next = has ? current.filter((t) => t !== tag) : [...current, tag];
    setForm({...form, targetPerson: next.join('・')});
  }

  const workContentTags = form.workContent
    .split('・')
    .map((s) => s.trim())
    .filter(Boolean);

  const targetPersonTags = form.targetPerson
    .split('・')
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <Box
      component="form"
      ref={formRef}
      onSubmit={handleSubmit}
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
        <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1}}>
          {TITLE_CHIPS.map((chip) => (
            <Chip
              key={chip}
              label={chip}
              size="small"
              onClick={() => setForm({...form, title: chip})}
              sx={{
                cursor: 'pointer',
                bgcolor: form.title === chip ? '#F05A22' : '#F5F5F5',
                color: form.title === chip ? '#FFFFFF' : '#555555',
                fontSize: '0.75rem',
                '&:hover': {
                  bgcolor: form.title === chip ? '#D94D19' : '#EBEBEB',
                },
              }}
            />
          ))}
        </Box>
        <TextField
          label="タイトル"
          value={form.title}
          onChange={(e) => setForm({...form, title: e.target.value})}
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
        <FormLabel
          component="legend"
          sx={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: '#666666',
            mb: 0.75,
          }}
        >
          勤務内容 *
        </FormLabel>
        <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1}}>
          {WORK_CONTENT_TAGS.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              onClick={() => toggleWorkContentTag(tag)}
              sx={{
                cursor: 'pointer',
                bgcolor: workContentTags.includes(tag) ? '#F05A22' : '#F5F5F5',
                color: workContentTags.includes(tag) ? '#FFFFFF' : '#555555',
                fontSize: '0.75rem',
                '&:hover': {
                  bgcolor: workContentTags.includes(tag)
                    ? '#D94D19'
                    : '#EBEBEB',
                },
              }}
            />
          ))}
        </Box>
        <TextField
          label="補足・詳細（任意）"
          value={form.workContent}
          onChange={(e) => setForm({...form, workContent: e.target.value})}
          required
          size="small"
          multiline
          rows={2}
          fullWidth
          placeholder="タグ選択後に補足があれば追記してください"
          error={submitted && !form.workContent}
          helperText={
            submitted && !form.workContent
              ? '勤務内容を入力するかタグを選択してください'
              : undefined
          }
        />
      </Box>

      <Divider />

      {/* 勤務日・勤務時間 */}
      <Box>
        <FormLabel
          component="legend"
          sx={{fontSize: '0.875rem', fontWeight: 700, color: '#666666', mb: 1}}
        >
          勤務日・勤務時間 *
        </FormLabel>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {xs: '1fr', sm: '1fr 1fr 1fr'},
            gap: 2,
            alignItems: 'end',
          }}
        >
          <TextField
            label="勤務日"
            type="date"
            value={form.workDate}
            onChange={(e) => setForm({...form, workDate: e.target.value})}
            required
            size="small"
            slotProps={{inputLabel: {shrink: true}}}
            error={submitted && (!form.workDate || form.workDate < today)}
            helperText={
              submitted && !form.workDate
                ? '入力してください'
                : submitted && form.workDate < today
                  ? '過去の日付は指定できません'
                  : undefined
            }
          />
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{display: 'block', mb: 0.5}}
            >
              開始時刻 *
            </Typography>
            <Select
              value={form.workTimeStart}
              onChange={(e) => {
                setTimeError(null);
                setForm({...form, workTimeStart: e.target.value});
              }}
              required
              size="small"
              fullWidth
              displayEmpty
              error={submitted && !form.workTimeStart}
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
            {submitted && !form.workTimeStart && (
              <FormHelperText error sx={{mx: 0, mt: 0.5}}>
                選択してください
              </FormHelperText>
            )}
          </Box>
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{display: 'block', mb: 0.5}}
            >
              終了時刻 *
            </Typography>
            <Select
              value={form.workTimeEnd}
              onChange={(e) => {
                setTimeError(null);
                setForm({...form, workTimeEnd: e.target.value});
              }}
              required
              size="small"
              fullWidth
              displayEmpty
              error={submitted && (!form.workTimeEnd || timeError !== null)}
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
            {submitted && !form.workTimeEnd && (
              <FormHelperText error sx={{mx: 0, mt: 0.5}}>
                選択してください
              </FormHelperText>
            )}
            {timeError && (
              <FormHelperText error sx={{mx: 0, mt: 0.5}}>
                {timeError}
              </FormHelperText>
            )}
          </Box>
        </Box>
      </Box>

      <Divider />

      {/* 時給 */}
      <TextField
        label="時給（円・任意）"
        type="number"
        value={form.hourlyWage}
        onChange={(e) => setForm({...form, hourlyWage: e.target.value})}
        size="small"
        slotProps={{htmlInput: {min: 1}}}
        helperText="未定の場合は空欄のままにしてください"
      />

      <Divider />

      {/* 募集に必要な資格 */}
      <Box>
        <FormLabel
          component="legend"
          sx={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: '#666666',
            mb: 0.5,
          }}
        >
          募集に必要な資格
        </FormLabel>
        <FormGroup>
          {QUALIFICATION_OPTIONS.map((opt) => (
            <FormControlLabel
              key={opt}
              control={
                <Checkbox
                  checked={form.qualification.includes(opt)}
                  onChange={() => toggleQualification(opt)}
                  size="small"
                  sx={{color: '#F4A7B9', '&.Mui-checked': {color: '#F4A7B9'}}}
                />
              }
              label={<span style={{fontSize: '0.875rem'}}>{opt}</span>}
            />
          ))}
        </FormGroup>
      </Box>

      <Divider />

      {/* 交通費 */}
      <Box>
        <FormLabel
          component="legend"
          sx={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: '#666666',
            mb: 0.5,
          }}
        >
          交通費
        </FormLabel>
        <RadioGroup
          value={form.transportationExpense}
          onChange={(e) =>
            setForm({
              ...form,
              transportationExpense: e.target.value,
              transportationExpenseNote: '',
            })
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
            onChange={(e) =>
              setForm({...form, transportationExpenseNote: e.target.value})
            }
            size="small"
            fullWidth
            sx={{mt: 1}}
          />
        )}
      </Box>

      <Divider />

      {/* 勤務時の服装 */}
      <Box>
        <FormLabel
          component="legend"
          sx={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: '#666666',
            mb: 0.75,
          }}
        >
          勤務時の服装（任意）
        </FormLabel>
        <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1}}>
          {DRESSCODE_CHIPS.map((chip) => (
            <Chip
              key={chip}
              label={chip}
              size="small"
              onClick={() => setForm({...form, dresscode: chip})}
              sx={{
                cursor: 'pointer',
                bgcolor: form.dresscode === chip ? '#F05A22' : '#F5F5F5',
                color: form.dresscode === chip ? '#FFFFFF' : '#555555',
                fontSize: '0.75rem',
                '&:hover': {
                  bgcolor: form.dresscode === chip ? '#D94D19' : '#EBEBEB',
                },
              }}
            />
          ))}
        </Box>
        <TextField
          label="自由入力（任意）"
          value={form.dresscode}
          onChange={(e) => setForm({...form, dresscode: e.target.value})}
          size="small"
          fullWidth
          placeholder="その他の服装規定があれば"
        />
      </Box>

      <Divider />

      {/* 求める人物像 */}
      <Box>
        <FormLabel
          component="legend"
          sx={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: '#666666',
            mb: 0.75,
          }}
        >
          求める人物像（任意）
        </FormLabel>
        <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1}}>
          {TARGET_PERSON_TAGS.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              onClick={() => toggleTargetPersonTag(tag)}
              sx={{
                cursor: 'pointer',
                bgcolor: targetPersonTags.includes(tag) ? '#F05A22' : '#F5F5F5',
                color: targetPersonTags.includes(tag) ? '#FFFFFF' : '#555555',
                fontSize: '0.75rem',
                '&:hover': {
                  bgcolor: targetPersonTags.includes(tag)
                    ? '#D94D19'
                    : '#EBEBEB',
                },
              }}
            />
          ))}
        </Box>
        <TextField
          label="補足（任意）"
          value={form.targetPerson}
          onChange={(e) => setForm({...form, targetPerson: e.target.value})}
          size="small"
          fullWidth
          multiline
          rows={2}
        />
      </Box>

      <Divider />

      {/* 応募に必要な書類 */}
      <Box>
        <FormLabel
          component="legend"
          sx={{fontSize: '0.875rem', fontWeight: 700, color: '#666666'}}
        >
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
                  sx={{color: '#F4A7B9', '&.Mui-checked': {color: '#F4A7B9'}}}
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
        onChange={(e) => setForm({...form, remarks: e.target.value})}
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

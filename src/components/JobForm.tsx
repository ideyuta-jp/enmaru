'use client';

import {useState} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import TextField from '@mui/material/TextField';

import {
  ALL_DOCUMENT_TYPES,
  DOCUMENT_TYPE_LABEL,
  type SeekerDocumentType,
} from '@/types/Document';
import type {JobInput} from '@/types/Job';

interface Props {
  form: JobInput;
  setForm: (form: JobInput) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  saving: boolean;
  submitLabel: string;
}

// Field set shared by the new / edit job pages. Form state and the actual submit
// (create / update) live in the parent; this component only validates the
// start/end time order before delegating, so that error can be shown inline on
// the end-time field rather than as a generic banner.
export default function JobForm({
  form,
  setForm,
  onSubmit,
  onCancel,
  saving,
  submitLabel,
}: Props) {
  const [timeError, setTimeError] = useState<string | null>(null);

  // End must be after start. Validate here (before delegating to the parent's
  // submit) so the error shows inline on the end-time field rather than as a
  // generic server-error banner. The server re-checks as the backstop.
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTimeError(null);
    if (
      form.workTimeStart &&
      form.workTimeEnd &&
      form.workTimeEnd <= form.workTimeStart
    ) {
      setTimeError('終了時刻は開始時刻より後に設定してください');
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

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{display: 'flex', flexDirection: 'column', gap: 2}}
    >
      <TextField
        label="タイトル"
        value={form.title}
        onChange={(e) => setForm({...form, title: e.target.value})}
        required
        size="small"
        placeholder="例：午前中サポート保育スタッフ募集"
      />
      <TextField
        label="業務内容"
        value={form.workContent}
        onChange={(e) => setForm({...form, workContent: e.target.value})}
        required
        size="small"
        multiline
        rows={3}
        placeholder="担当してもらう業務の詳細を記載してください"
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {xs: '1fr', sm: '1fr 1fr 1fr'},
          gap: 2,
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
        />
        <TextField
          label="開始時刻"
          type="time"
          value={form.workTimeStart}
          onChange={(e) => {
            setTimeError(null);
            setForm({...form, workTimeStart: e.target.value});
          }}
          required
          size="small"
          slotProps={{inputLabel: {shrink: true}}}
        />
        <TextField
          label="終了時刻"
          type="time"
          value={form.workTimeEnd}
          onChange={(e) => {
            setTimeError(null);
            setForm({...form, workTimeEnd: e.target.value});
          }}
          required
          size="small"
          slotProps={{inputLabel: {shrink: true}}}
          error={timeError !== null}
        />
      </Box>
      {timeError && (
        <FormHelperText error sx={{mx: 0, mt: -1}}>
          {timeError}
        </FormHelperText>
      )}

      <TextField
        label="時給（円・任意）"
        type="number"
        value={form.hourlyWage}
        onChange={(e) => setForm({...form, hourlyWage: e.target.value})}
        size="small"
        slotProps={{htmlInput: {min: 1}}}
        helperText="未定の場合は空欄のままにしてください"
      />
      <TextField
        label="対象者（任意）"
        value={form.targetPerson}
        onChange={(e) => setForm({...form, targetPerson: e.target.value})}
        size="small"
        placeholder="例：保育士資格をお持ちの方"
      />
      <TextField
        label="備考（任意）"
        value={form.remarks}
        onChange={(e) => setForm({...form, remarks: e.target.value})}
        size="small"
        multiline
        rows={2}
        placeholder="例：駐車場あり、制服貸出あり"
      />

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

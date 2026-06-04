'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

export interface JobFormState {
  title: string;
  workContent: string;
  workDate: string;
  workTimeStart: string;
  workTimeEnd: string;
  hourlyWage: string;
  targetPerson: string;
  remarks: string;
}

interface Props {
  form: JobFormState;
  setForm: (form: JobFormState) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  saving: boolean;
  submitLabel: string;
}

// Presentational field set shared by the new / edit job pages. State and submit
// handling live in the parent.
export default function JobForm({
  form,
  setForm,
  onSubmit,
  onCancel,
  saving,
  submitLabel,
}: Props) {
  return (
    <Box
      component="form"
      onSubmit={onSubmit}
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
          onChange={(e) => setForm({...form, workTimeStart: e.target.value})}
          required
          size="small"
          slotProps={{inputLabel: {shrink: true}}}
        />
        <TextField
          label="終了時刻"
          type="time"
          value={form.workTimeEnd}
          onChange={(e) => setForm({...form, workTimeEnd: e.target.value})}
          required
          size="small"
          slotProps={{inputLabel: {shrink: true}}}
        />
      </Box>

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

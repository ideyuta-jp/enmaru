'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

interface Props<T> {
  label: string;
  items: T[];
  onChange: (next: T[]) => void;
  createEmpty: () => T;
  renderRow: (
    item: T,
    update: (patch: Partial<T>) => void,
    remove: () => void,
  ) => React.ReactNode;
  addButtonLabel?: string;
}

// A client-staged array of structured sub-forms with add/remove rows,
// submitted as part of one whole-form save (unlike NurseryPhotoUpload's
// per-item immediate server round trips — these rows are plain text with no
// per-row upload/verification step, so they belong in the same submission as
// the rest of the form). Shared by ResumeForm's 学歴 and 職歴 sections; only
// each row's own fields differ, so the add/remove/list mechanics live here
// once.
export default function RepeatableEntryList<T>({
  label,
  items,
  onChange,
  createEmpty,
  renderRow,
  addButtonLabel = '追加する',
}: Props<T>) {
  function updateAt(index: number, patch: Partial<T>) {
    onChange(
      items.map((item, i) => (i === index ? {...item, ...patch} : item)),
    );
  }

  function removeAt(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function add() {
    onChange([...items, createEmpty()]);
  }

  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{display: 'block', mb: 1}}
      >
        {label}
      </Typography>

      <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
        {items.map((item, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              gap: 1,
              alignItems: 'flex-start',
              p: 1.5,
              bgcolor: '#FAFAFA',
              borderRadius: 1,
              border: '1px solid #E0E0E0',
            }}
          >
            <Box sx={{flex: 1, minWidth: 0}}>
              {renderRow(
                item,
                (patch) => updateAt(index, patch),
                () => removeAt(index),
              )}
            </Box>
            <IconButton
              size="small"
              onClick={() => removeAt(index)}
              aria-label="この行を削除"
              sx={{color: '#AAAAAA', '&:hover': {color: '#d32f2f'}}}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
      </Box>

      {items.length > 0 && <Divider sx={{my: 1.5}} />}

      <Button
        onClick={add}
        startIcon={<AddIcon />}
        size="small"
        variant="outlined"
        sx={{mt: items.length > 0 ? 0 : 1.5}}
      >
        {addButtonLabel}
      </Button>
    </Box>
  );
}

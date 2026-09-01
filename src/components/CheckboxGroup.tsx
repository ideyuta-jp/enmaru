'use client';

import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import FormLabel from '@mui/material/FormLabel';
import Typography from '@mui/material/Typography';

const CHECKBOX_SX = {color: '#F4A7B9', '&.Mui-checked': {color: '#F4A7B9'}};

interface Props {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  note?: string;
  row?: boolean;
}

// Labeled checkbox group over a fixed string vocabulary, toggling membership
// in a string[] field. Shared by the profile and job forms.
export default function CheckboxGroup({
  label,
  options,
  selected,
  onToggle,
  note,
  row = true,
}: Props) {
  return (
    <FormControl component="fieldset" fullWidth>
      <FormLabel
        component="legend"
        sx={{
          fontSize: '0.8rem',
          fontWeight: 700,
          color: '#666666',
          mb: 0.5,
          // MUI paints a FormLabel with the theme's primary color while any
          // input inside the FormControl has focus; for a checkbox-group
          // heading that reads as a glitch, so keep the color stable.
          '&.Mui-focused': {color: '#666666'},
        }}
      >
        {label}
      </FormLabel>
      {note && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{display: 'block', mb: 0.5}}
        >
          {note}
        </Typography>
      )}
      <FormGroup row={row}>
        {options.map((opt) => (
          <FormControlLabel
            key={opt}
            control={
              <Checkbox
                checked={selected.includes(opt)}
                onChange={() => onToggle(opt)}
                size="small"
                sx={CHECKBOX_SX}
              />
            }
            label={<Typography variant="body2">{opt}</Typography>}
          />
        ))}
      </FormGroup>
    </FormControl>
  );
}

'use client';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';

interface Props {
  tags: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  // Selection cap; leave undefined for unlimited. When the cap is reached the
  // remaining chips render disabled instead of silently ignoring clicks.
  max?: number;
  selectedColor?: string;
  selectedHoverColor?: string;
}

// Chip-based multi-select over a fixed tag vocabulary, for profile forms.
export default function TagSelector({
  tags,
  selected,
  onChange,
  max,
  selectedColor = '#F05A22',
  selectedHoverColor = '#D94D19',
}: Props) {
  const atCapacity = max !== undefined && selected.length >= max;

  function toggle(tag: string) {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
    } else if (!atCapacity) {
      onChange([...selected, tag]);
    }
  }

  return (
    <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.75}}>
      {tags.map((tag) => {
        const active = selected.includes(tag);
        const disabled = !active && atCapacity;
        return (
          <Chip
            key={tag}
            label={tag}
            onClick={() => toggle(tag)}
            size="small"
            sx={{
              cursor: disabled ? 'default' : 'pointer',
              bgcolor: active
                ? selectedColor
                : disabled
                  ? '#F5F5F5'
                  : '#FAFAFA',
              color: active ? '#FFFFFF' : disabled ? '#BBBBBB' : '#444444',
              border: '1px solid',
              borderColor: active ? selectedColor : '#E0E0E0',
              fontSize: '0.75rem',
              '&:hover': {
                bgcolor: active
                  ? selectedHoverColor
                  : disabled
                    ? '#F5F5F5'
                    : '#F0F0F0',
              },
            }}
          />
        );
      })}
    </Box>
  );
}

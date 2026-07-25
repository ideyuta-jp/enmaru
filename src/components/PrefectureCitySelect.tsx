'use client';

import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

import {CITIES_BY_PREFECTURE, PREFECTURES} from '@/types/Area';

interface Props {
  prefecture: string;
  city: string;
  // Fired with the new pair; picking a different prefecture clears the city.
  onChange: (prefecture: string, city: string) => void;
}

// 都道府県→市区町村の連動プルダウン: 市区町村リストは選択済み都道府県に追従し、
// 未選択の間は disabled、都道府県が変わればリセットされる。ResumeForm（住所）と
// SeekerProfileForm（希望エリア）で共用。
export default function PrefectureCitySelect({
  prefecture,
  city,
  onChange,
}: Props) {
  return (
    <>
      <FormControl size="small" sx={{minWidth: 160}}>
        <Select
          displayEmpty
          value={prefecture}
          onChange={(e) => onChange(e.target.value, '')}
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
          value={city}
          onChange={(e) => onChange(prefecture, e.target.value)}
          renderValue={(v) => v || '市区町村を選択'}
          disabled={!prefecture}
        >
          <MenuItem value="">未選択</MenuItem>
          {(CITIES_BY_PREFECTURE[prefecture] ?? []).map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
}

// Trim a form text value, returning null when it is blank. For optional text
// columns that should store null rather than an empty string.
export function blankToNull(value: string): string | null {
  return value.trim() || null;
}

// JP postal code, hyphen optional ('850-0000' or '8500000'). '' also passes —
// these are optional fields, so a blank value isn't a format error, only a
// filled-but-malformed one is.
export function isValidPostalCode(value: string): boolean {
  return value === '' || /^\d{3}-?\d{4}$/.test(value);
}

// JP phone number: leading 0, hyphens optional between groups (090-1234-5678,
// 09012345678, 03-1234-5678). Same '' convention as isValidPostalCode.
export function isValidPhoneNumber(value: string): boolean {
  return value === '' || /^0\d{1,4}-?\d{1,4}-?\d{3,4}$/.test(value);
}

// フリガナ fields (name/address) must be katakana only — that's what the label
// itself signals in Japanese business convention (フリガナ = katakana,
// ふりがな = hiragana). '' also passes — these fields are optional, so a blank
// value isn't a format error, only a filled-but-non-katakana one is. The
// Katakana Unicode block (U+30A0–U+30FF) already includes the middle dot (・)
// and prolonged sound mark (ー); the two space characters are listed
// explicitly rather than via \s, which would also admit tabs and newlines.
export function isKatakanaOnly(value: string): boolean {
  return value === '' || /^[゠-ヿ 　]+$/.test(value);
}

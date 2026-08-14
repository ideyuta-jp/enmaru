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

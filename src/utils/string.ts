// Trim a form text value, returning null when it is blank. For optional text
// columns that should store null rather than an empty string.
export function blankToNull(value: string): string | null {
  return value.trim() || null;
}

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

// A permissive "looks like an email" check — one '@', something on both sides,
// at least one '.' after it. Same '' convention as isValidPostalCode.
export function isValidEmail(value: string): boolean {
  return value === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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

// 住所のフリガナ用。氏名と違い読みに番地が入る (「サクラマチ1-2-3」) ので、
// isKatakanaOnly に数字とダッシュ類を足した述語を別に用意する。'' の扱いは
// isKatakanaOnly と同じ。
//
// 半角/全角も、ダッシュに見える文字も種類を問わず通す。どれが入力されるかは
// IME と OS で決まり (全角の「-」は macOS だと U+2212、MS-IME だと U+FF0D)、
// 利用者が意識して選べるものではないため。読みの中でダッシュの種類に意味は
// 無いので区別せず受け入れる。見た目が区別できない文字が並ぶので、字面では
// なくコードポイントで書いている。長音符「ー」(U+30FC) はカタカナブロックに
// 含まれるので挙げる必要はない。半角カタカナの「ｰ」(U+FF70) は半角カタカナ
// 自体を弾く方針に合わせて意図的に除外している。
export function isValidAddressFurigana(value: string): boolean {
  return (
    value === '' ||
    /^[゠-ヿ 　0-9０-９\u002D\u2010\u2011\u2013\u2014\u2015\u2212\uFF0D]+$/.test(
      value,
    )
  );
}

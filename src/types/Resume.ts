// The editable shape of a seeker's web résumé — what the edit form holds and
// sends, and what the page prefills it with. Dates are plain 'YYYY-MM-DD' /
// 'YYYY-MM' strings (empty = unset) so the form can bind to them directly; the
// server maps empty strings to null when persisting. Mirrors SeekerProfileInput
// (src/types/Seeker.ts)'s conventions.

// One 学歴 entry — one row per school (not one row per 入学/卒業 transition).
// _key is a client-only React list key (crypto.randomUUID() on add); it is
// never sent to the server — order is derived from array position instead.
export interface EducationEntryInput {
  _key: string;
  schoolName: string;
  // '' | '卒業' | '中退' | '卒業見込み' — a fixed vocabulary presented as a
  // dropdown in ResumeForm, same "free-form nullable column + form-side
  // options list" pattern as SeekerProfileForm's experienceYears/blankYears.
  graduationStatus: string;
  startYearMonth: string; // 'YYYY-MM', '' = unset
  endYearMonth: string; // 'YYYY-MM', '' = 在学中 (currently enrolled)
}

// One 職歴 entry — one row per employer. Distinct from
// SeekerProfileInput.experience (a free-text career blurb shown to a matched
// nursery) — this is the résumé's own dated, structured history.
export interface WorkHistoryEntryInput {
  _key: string;
  companyName: string;
  // '' | '正社員' | '契約社員' | '派遣社員' | 'パート・アルバイト' | '業務委託' | 'その他'
  employmentType: string;
  description: string; // 業務内容など（任意・自由記述）
  startYearMonth: string;
  endYearMonth: string; // '' = 現在勤務中 (currently employed)
}

// One 免許・資格 entry — one row per license/certification. When fromProfile
// is true, this row mirrors one of the checked boxes in
// SeekerProfileInput.licenses (the public profile's fixed 3-choice checkbox
// list) — licenseName is server-derived and read-only in ResumeForm, only
// acquiredYearMonth is editable. When false, it is a résumé-only row added
// via ResumeForm's "＋免許・資格を追加する" (e.g. a driver's license) with
// both fields freely editable. See syncLicenseHistoryWithProfile
// (server/resume.ts) for how fromProfile rows stay in sync with the profile.
export interface LicenseEntryInput {
  _key: string;
  licenseName: string;
  acquiredYearMonth: string; // 'YYYY-MM', '' = unset (rejected at save — #210)
  fromProfile: boolean;
}

export interface ResumeInput {
  birthDate: string; // 'YYYY-MM-DD', '' = unset
  postalCode: string;
  prefecture: string;
  city: string;
  addressLine: string;
  addressFurigana: string; // see isValidAddressFurigana
  phone: string;
  // 履歴書上の連絡先（任意）。ログイン用アカウントのメールアドレスとは別物。
  email: string;
  education: EducationEntryInput[];
  workHistory: WorkHistoryEntryInput[];
  licenseHistory: LicenseEntryInput[];
}

// Row cap for 学歴/職歴 — RepeatableEntryList otherwise lets a client add rows
// without limit; ResumeForm disables its "add" button at this count and
// saveResume rejects a direct call that exceeds it anyway.
export const MAX_RESUME_HISTORY_ENTRIES = 20;

// Char cap for 職歴 the free-text description (業務内容) — ResumeForm enforces
// via the TextField's native maxLength, saveResume re-checks as the backstop.
export const MAX_RESUME_DESCRIPTION_LENGTH = 1000;

export const EMPTY_RESUME: ResumeInput = {
  birthDate: '',
  postalCode: '',
  prefecture: '',
  city: '',
  addressLine: '',
  addressFurigana: '',
  phone: '',
  email: '',
  education: [],
  workHistory: [],
  licenseHistory: [],
};

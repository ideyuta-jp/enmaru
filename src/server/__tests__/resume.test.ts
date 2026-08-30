import {describe, expect, it, vi} from 'vitest';

// resume.ts pulls in Prisma and the auth/Logto chain at import time; neither
// is needed to exercise the pure validateResumeInput predicate (same
// isolation approach as chat.test.ts/application.test.ts).
vi.mock('@/lib/prisma', () => ({prisma: {}}));
vi.mock('@/server/auth', () => ({getCurrentUser: vi.fn()}));

import {validateResumeInput} from '@/server/resume';
import {
  EMPTY_RESUME,
  MAX_RESUME_DESCRIPTION_LENGTH,
  MAX_RESUME_HISTORY_ENTRIES,
  type ResumeInput,
} from '@/types/Resume';

function education(overrides: Partial<ResumeInput['education'][number]> = {}) {
  return {
    _key: '1',
    schoolName: '長崎県立長崎高等学校',
    graduationStatus: '卒業',
    startYearMonth: '2010-04',
    endYearMonth: '2013-03',
    ...overrides,
  };
}

function workHistory(
  overrides: Partial<ResumeInput['workHistory'][number]> = {},
) {
  return {
    _key: '1',
    companyName: '株式会社サンプル保育園',
    employmentType: '正社員',
    description: '0〜5歳児クラスの保育業務全般',
    startYearMonth: '2013-04',
    endYearMonth: '',
    ...overrides,
  };
}

describe('validateResumeInput', () => {
  it('accepts a fully blank résumé (first-time seeker)', () => {
    expect(validateResumeInput(EMPTY_RESUME)).toEqual({ok: true});
  });

  it('accepts a fully populated, well-formed résumé', () => {
    const input: ResumeInput = {
      ...EMPTY_RESUME,
      birthDate: '1995-04-01',
      postalCode: '850-0000',
      addressFurigana: 'ナガサキケン ナガサキシ',
      phone: '090-1234-5678',
      email: 'yamada@example.com',
      education: [education()],
      workHistory: [workHistory()],
    };
    expect(validateResumeInput(input)).toEqual({ok: true});
  });

  it('rejects a future birth date', () => {
    const result = validateResumeInput({
      ...EMPTY_RESUME,
      birthDate: '2099-01-01',
    });
    expect(result.ok).toBe(false);
  });

  it('rejects a calendar-impossible birth date (JS Date would roll it over)', () => {
    const result = validateResumeInput({
      ...EMPTY_RESUME,
      birthDate: '2001-02-29',
    });
    expect(result.ok).toBe(false);
  });

  it('rejects a malformed postal code', () => {
    const result = validateResumeInput({...EMPTY_RESUME, postalCode: '850'});
    expect(result.ok).toBe(false);
  });

  it('accepts a postal code without a hyphen', () => {
    expect(
      validateResumeInput({...EMPTY_RESUME, postalCode: '8500000'}).ok,
    ).toBe(true);
  });

  it('rejects a malformed phone number', () => {
    const result = validateResumeInput({...EMPTY_RESUME, phone: 'abc-defg'});
    expect(result.ok).toBe(false);
  });

  it('rejects a malformed email address', () => {
    const result = validateResumeInput({
      ...EMPTY_RESUME,
      email: 'yamada.example.com',
    });
    expect(result.ok).toBe(false);
  });

  it('rejects a non-katakana address furigana', () => {
    const result = validateResumeInput({
      ...EMPTY_RESUME,
      addressFurigana: 'ながさきけん',
    });
    expect(result.ok).toBe(false);
  });

  it('rejects an education row with a blank school name', () => {
    const result = validateResumeInput({
      ...EMPTY_RESUME,
      education: [education({schoolName: '   '})],
    });
    expect(result.ok).toBe(false);
  });

  it('rejects an education row whose graduation predates enrollment', () => {
    const result = validateResumeInput({
      ...EMPTY_RESUME,
      education: [
        education({startYearMonth: '2013-04', endYearMonth: '2010-03'}),
      ],
    });
    expect(result.ok).toBe(false);
  });

  it('accepts an education row still in progress (blank end)', () => {
    const result = validateResumeInput({
      ...EMPTY_RESUME,
      education: [education({endYearMonth: ''})],
    });
    expect(result.ok).toBe(true);
  });

  it('rejects a work-history row with a blank company name', () => {
    const result = validateResumeInput({
      ...EMPTY_RESUME,
      workHistory: [workHistory({companyName: ''})],
    });
    expect(result.ok).toBe(false);
  });

  it('rejects a work-history row whose end predates its start', () => {
    const result = validateResumeInput({
      ...EMPTY_RESUME,
      workHistory: [
        workHistory({startYearMonth: '2020-04', endYearMonth: '2019-03'}),
      ],
    });
    expect(result.ok).toBe(false);
  });

  it('rejects a work-history description over the max length', () => {
    const result = validateResumeInput({
      ...EMPTY_RESUME,
      workHistory: [
        workHistory({
          description: 'あ'.repeat(MAX_RESUME_DESCRIPTION_LENGTH + 1),
        }),
      ],
    });
    expect(result.ok).toBe(false);
  });

  it('rejects more than the max number of education rows', () => {
    const result = validateResumeInput({
      ...EMPTY_RESUME,
      education: Array.from({length: MAX_RESUME_HISTORY_ENTRIES + 1}, () =>
        education(),
      ),
    });
    expect(result.ok).toBe(false);
  });

  it('rejects more than the max number of work-history rows', () => {
    const result = validateResumeInput({
      ...EMPTY_RESUME,
      workHistory: Array.from({length: MAX_RESUME_HISTORY_ENTRIES + 1}, () =>
        workHistory(),
      ),
    });
    expect(result.ok).toBe(false);
  });
});

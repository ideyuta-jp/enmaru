import {describe, expect, it, vi} from 'vitest';

// resume.ts pulls in Prisma and the auth/Logto chain at import time; neither
// is needed to exercise the pure validateResumeInput predicate (same
// isolation approach as chat.test.ts/application.test.ts).
vi.mock('@/lib/prisma', () => ({prisma: {}}));
vi.mock('@/server/auth', () => ({getCurrentUser: vi.fn()}));

import {
  syncLicenseHistoryWithProfile,
  validateResumeInput,
} from '@/server/resume';
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

function license(
  overrides: Partial<ResumeInput['licenseHistory'][number]> = {},
) {
  return {
    _key: '1',
    licenseName: '保育士資格',
    acquiredYearMonth: '2013-03',
    fromProfile: false,
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

  it('rejects a license-history row with a blank license name', () => {
    const result = validateResumeInput({
      ...EMPTY_RESUME,
      licenseHistory: [license({licenseName: '   '})],
    });
    expect(result.ok).toBe(false);
  });

  it('rejects a license-history row with no acquired date (#210)', () => {
    const result = validateResumeInput({
      ...EMPTY_RESUME,
      licenseHistory: [license({acquiredYearMonth: ''})],
    });
    expect(result.ok).toBe(false);
  });

  it('rejects a malformed license acquired year-month', () => {
    const result = validateResumeInput({
      ...EMPTY_RESUME,
      licenseHistory: [license({acquiredYearMonth: '2013/03'})],
    });
    expect(result.ok).toBe(false);
  });

  it('rejects more than the max number of license-history rows', () => {
    const result = validateResumeInput({
      ...EMPTY_RESUME,
      licenseHistory: Array.from({length: MAX_RESUME_HISTORY_ENTRIES + 1}, () =>
        license(),
      ),
    });
    expect(result.ok).toBe(false);
  });
});

describe('syncLicenseHistoryWithProfile', () => {
  it('creates a blank fromProfile row per checked profile license', () => {
    const result = syncLicenseHistoryWithProfile(
      [],
      ['保育士資格', '子育て支援員'],
    );
    expect(result).toEqual([
      expect.objectContaining({
        licenseName: '保育士資格',
        acquiredYearMonth: '',
        fromProfile: true,
      }),
      expect.objectContaining({
        licenseName: '子育て支援員',
        acquiredYearMonth: '',
        fromProfile: true,
      }),
    ]);
  });

  it('preserves an existing fromProfile row’s acquired date', () => {
    const result = syncLicenseHistoryWithProfile(
      [
        license({
          licenseName: '保育士資格',
          acquiredYearMonth: '2013-03',
          fromProfile: true,
        }),
      ],
      ['保育士資格'],
    );
    expect(result).toEqual([
      expect.objectContaining({
        licenseName: '保育士資格',
        acquiredYearMonth: '2013-03',
        fromProfile: true,
      }),
    ]);
  });

  it('drops a fromProfile row whose license was unchecked on the profile', () => {
    const result = syncLicenseHistoryWithProfile(
      [
        license({
          licenseName: '子育て支援員',
          acquiredYearMonth: '2020-01',
          fromProfile: true,
        }),
      ],
      [],
    );
    expect(result).toEqual([]);
  });

  it('keeps custom (non-profile) rows untouched and after the profile rows', () => {
    const custom = license({
      licenseName: '普通自動車第一種運転免許',
      acquiredYearMonth: '2011-05',
      fromProfile: false,
    });
    const result = syncLicenseHistoryWithProfile([custom], ['保育士資格']);
    expect(result).toEqual([
      expect.objectContaining({licenseName: '保育士資格', fromProfile: true}),
      custom,
    ]);
  });
});

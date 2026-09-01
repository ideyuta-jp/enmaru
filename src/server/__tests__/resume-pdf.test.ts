import {describe, expect, it} from 'vitest';

import {renderResumePdf} from '@/server/resume-pdf';

// resume-pdf.tsx has no Prisma/auth imports (pure render logic), so no
// vi.mock(...) isolation is needed here, unlike chat.test.ts/application.test.ts.

// Minimal valid 1x1 JPEG — enough for @react-pdf/renderer's <Image> to decode
// without throwing, without needing a real photo fixture on disk.
const MINIMAL_JPEG = Buffer.from(
  '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMDAwMDAwMDAwMEAwMEBQYFBQUFBggHBgYGBwoIBwcHBwcICQoKCgoKCQwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAAAP/EABQBAQAAAAAAAAAAAAAAAAAAAAX/2gAIAQEAAD8AKv/Z',
  'base64',
);

describe('renderResumePdf', () => {
  it('renders a valid PDF (magic bytes) for a minimal résumé', async () => {
    const buf = await renderResumePdf({
      realName: '山田花子',
      furigana: '',
      birthDate: '',
      postalCode: '',
      prefecture: '',
      city: '',
      addressLine: '',
      addressFurigana: '',
      phone: '',
      email: '',
      bio: '',
      education: [],
      workHistory: [],
      licenseHistory: [],
      photo: null,
    });
    expect(buf.subarray(0, 4).toString('ascii')).toBe('%PDF');
  });

  it('embeds an uploaded 証明写真 without throwing', async () => {
    const buf = await renderResumePdf({
      realName: '山田花子',
      furigana: '',
      birthDate: '',
      postalCode: '',
      prefecture: '',
      city: '',
      addressLine: '',
      addressFurigana: '',
      phone: '',
      email: '',
      bio: '',
      education: [],
      workHistory: [],
      licenseHistory: [],
      photo: {data: MINIMAL_JPEG, format: 'jpg'},
    });
    expect(buf.subarray(0, 4).toString('ascii')).toBe('%PDF');
  });

  it('does not throw with populated Japanese-text education/work history', async () => {
    const buf = await renderResumePdf({
      realName: '山田花子',
      furigana: 'ヤマダハナコ',
      birthDate: '1995-04-01',
      postalCode: '850-0000',
      prefecture: '長崎県',
      city: '長崎市',
      addressLine: '桜町1-2-3',
      addressFurigana: 'ナガサキケン ナガサキシ サクラマチ1-2-3',
      phone: '090-1234-5678',
      email: 'yamada@example.com',
      bio: '子どもたちと笑顔で向き合うことを大切にしています。',
      education: [
        {
          _key: '1',
          schoolName: '長崎県立長崎高等学校',
          graduationStatus: '卒業',
          startYearMonth: '2010-04',
          endYearMonth: '2013-03',
        },
      ],
      workHistory: [
        {
          _key: '1',
          companyName: '株式会社サンプル保育園',
          employmentType: '正社員',
          description: '0〜5歳児クラスの保育業務全般',
          startYearMonth: '2013-04',
          endYearMonth: '',
        },
      ],
      licenseHistory: [
        {
          _key: '1',
          licenseName: '保育士資格',
          acquiredYearMonth: '2013-03',
          fromProfile: true,
        },
        {
          _key: '2',
          licenseName: '普通自動車第一種運転免許',
          acquiredYearMonth: '2011-05',
          fromProfile: false,
        },
      ],
      photo: null,
    });
    expect(buf.subarray(0, 4).toString('ascii')).toBe('%PDF');
  });
});

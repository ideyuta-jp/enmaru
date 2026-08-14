import {describe, expect, it, vi} from 'vitest';

// saveResumeDraft/publishResume touch Prisma, auth, storage, and the PDF
// renderer — mock all four so this test exercises only resume-actions.ts's
// own wiring (whether each action generates/submits a PDF), the same
// isolation approach as chat.test.ts/application.test.ts use for pure
// predicates, just with more collaborators since these are full server
// actions rather than pure functions. vi.mock factories are hoisted above
// imports, so any shared state they reference must go through vi.hoisted.
const {mockProfile, renderResumePdf, storeSeekerDocument} = vi.hoisted(() => ({
  mockProfile: {
    id: 'profile-1',
    realName: '山田花子',
    licenses: ['保育士資格'],
    bio: '自己PRです',
  },
  renderResumePdf: vi.fn().mockResolvedValue(Buffer.from('%PDF-fake')),
  storeSeekerDocument: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    seekerProfile: {findUnique: vi.fn().mockResolvedValue(mockProfile)},
    $transaction: vi.fn(async (fn) =>
      fn({
        seekerResume: {upsert: vi.fn().mockResolvedValue({id: 'resume-1'})},
        seekerEducationHistory: {
          deleteMany: vi.fn().mockResolvedValue({}),
          createMany: vi.fn().mockResolvedValue({}),
        },
        seekerWorkHistory: {
          deleteMany: vi.fn().mockResolvedValue({}),
          createMany: vi.fn().mockResolvedValue({}),
        },
        seekerLicenseHistory: {
          deleteMany: vi.fn().mockResolvedValue({}),
          createMany: vi.fn().mockResolvedValue({}),
        },
      }),
    ),
  },
}));
vi.mock('@/server/auth', () => ({
  requireRole: vi.fn().mockResolvedValue({id: 'user-1'}),
}));
vi.mock('@/server/document', () => ({storeSeekerDocument}));
vi.mock('@/server/resume-pdf', () => ({renderResumePdf}));

import {publishResume, saveResumeDraft} from '@/server/resume-actions';
import {EMPTY_RESUME} from '@/types/Resume';

describe('saveResumeDraft', () => {
  it('persists successfully without generating or submitting a PDF (#208)', async () => {
    const result = await saveResumeDraft({
      ...EMPTY_RESUME,
      phone: '090-1234-5678',
    });

    expect(result).toEqual({ok: true});
    expect(renderResumePdf).not.toHaveBeenCalled();
    expect(storeSeekerDocument).not.toHaveBeenCalled();
  });

  // mockProfile.licenses から取得年月が空の fromProfile 行が同期されるが、
  // それは一時保存を妨げない — ユーザーが自分で追加した行ではないため。
  it('saves even though a synced profile license has no acquired date', async () => {
    const result = await saveResumeDraft({
      ...EMPTY_RESUME,
      phone: '090-1234-5678',
    });

    expect(result).toEqual({ok: true});
  });
});

describe('publishResume', () => {
  it('persists and generates/submits the PDF (#208)', async () => {
    const result = await publishResume({
      ...EMPTY_RESUME,
      phone: '090-1234-5678',
      // mockProfile.licenses から fromProfile 行が同期されるので、発行に
      // 必要な取得年月をここで与える (#210)。
      licenseHistory: [
        {
          _key: '1',
          licenseName: '保育士資格',
          acquiredYearMonth: '2020-04',
          fromProfile: true,
        },
      ],
    });

    expect(result).toEqual({ok: true});
    expect(renderResumePdf).toHaveBeenCalledWith(
      expect.objectContaining({realName: '山田花子'}),
    );
    expect(storeSeekerDocument).toHaveBeenCalledWith(
      'profile-1',
      'RESUME',
      expect.any(Buffer),
      'application/pdf',
    );
  });
});

import {describe, expect, it, vi} from 'vitest';

// 写真の差し替えが事務局への提出を引き起こさないことを固定するテスト (#208)。
// 提出してしまうと、承認済みの SeekerDocument(RESUME) が PENDING に戻され、
// 本人に知らされないまま応募できなくなる。
const {mockProfile, storeSeekerDocument, renderResumePdf, putObject} =
  vi.hoisted(() => ({
    mockProfile: {
      id: 'profile-1',
      resume: {id: 'resume-1', photoFileKey: null},
    },
    storeSeekerDocument: vi.fn().mockResolvedValue(undefined),
    renderResumePdf: vi.fn().mockResolvedValue(Buffer.from('%PDF-fake')),
    putObject: vi.fn().mockResolvedValue(undefined),
  }));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    seekerProfile: {findUnique: vi.fn().mockResolvedValue(mockProfile)},
    seekerResume: {
      upsert: vi.fn().mockResolvedValue({id: 'resume-1', photoFileKey: null}),
      update: vi.fn().mockResolvedValue({}),
    },
  },
}));
vi.mock('@/server/auth', () => ({
  requireRole: vi.fn().mockResolvedValue({id: 'user-1'}),
}));
vi.mock('@/lib/storage', () => ({
  putObject,
  deleteObject: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('@/server/document', () => ({storeSeekerDocument}));
vi.mock('@/server/resume-pdf', () => ({renderResumePdf}));

import {uploadResumePhoto} from '@/server/resume-photo-actions';

describe('uploadResumePhoto', () => {
  it('stores the photo without generating or submitting a PDF (#208)', async () => {
    const formData = new FormData();
    formData.append(
      'file',
      new File([new Uint8Array([1, 2, 3])], 'photo.jpg', {type: 'image/jpeg'}),
    );

    const result = await uploadResumePhoto(formData);

    expect(result).toEqual({ok: true});
    expect(putObject).toHaveBeenCalled();
    // 提出は「発行する」だけが行う。
    expect(renderResumePdf).not.toHaveBeenCalled();
    expect(storeSeekerDocument).not.toHaveBeenCalled();
  });
});

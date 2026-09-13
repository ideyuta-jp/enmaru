import {describe, expect, it, vi} from 'vitest';

// requestDocumentUploadUrl/confirmDocumentUpload implement #231's permanent
// fix (direct-to-R2 presigned upload) — mock Prisma, auth, and the storage
// layer so this exercises only document-actions.ts's own wiring, the same
// isolation approach as resume-photo-actions.test.ts.
const {
  mockProfile,
  createPresignedUploadUrl,
  deleteObject,
  getObjectMetadata,
  moveObject,
  recordSeekerDocumentUpload,
} = vi.hoisted(() => ({
  mockProfile: {id: 'profile-1'},
  createPresignedUploadUrl: vi
    .fn()
    .mockResolvedValue('https://r2.example.com/presigned'),
  deleteObject: vi.fn().mockResolvedValue(undefined),
  getObjectMetadata: vi
    .fn()
    .mockResolvedValue({size: 1024, contentType: 'application/pdf'}),
  moveObject: vi.fn().mockResolvedValue(undefined),
  recordSeekerDocumentUpload: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    seekerProfile: {findUnique: vi.fn().mockResolvedValue(mockProfile)},
  },
}));
vi.mock('@/server/auth', () => ({
  requireRole: vi.fn().mockResolvedValue({id: 'user-1'}),
}));
vi.mock('@/lib/storage', () => ({
  createPresignedUploadUrl,
  deleteObject,
  getObjectMetadata,
  moveObject,
}));
// seekerDocumentKey is a trivial pure template — keep the real one so the
// pending/final key assertions below can't silently drift from it; only the
// Prisma-touching half needs mocking.
vi.mock('@/server/document', async () => {
  const actual =
    await vi.importActual<typeof import('@/server/document')>(
      '@/server/document',
    );
  return {...actual, recordSeekerDocumentUpload};
});

import {
  confirmDocumentUpload,
  requestDocumentUploadUrl,
} from '@/server/document-actions';
import {MAX_DOCUMENT_BYTES} from '@/types/Document';

describe('requestDocumentUploadUrl', () => {
  it('rejects an invalid document type', async () => {
    const result = await requestDocumentUploadUrl(
      'NOT_A_TYPE',
      'application/pdf',
      1024,
    );
    expect(result.ok).toBe(false);
    expect(createPresignedUploadUrl).not.toHaveBeenCalled();
  });

  it('rejects a zero/negative size', async () => {
    const result = await requestDocumentUploadUrl(
      'RESUME',
      'application/pdf',
      0,
    );
    expect(result.ok).toBe(false);
  });

  it('rejects a size over the limit', async () => {
    const result = await requestDocumentUploadUrl(
      'RESUME',
      'application/pdf',
      MAX_DOCUMENT_BYTES + 1,
    );
    expect(result.ok).toBe(false);
  });

  it('rejects a disallowed content type', async () => {
    const result = await requestDocumentUploadUrl(
      'RESUME',
      'application/zip',
      1024,
    );
    expect(result.ok).toBe(false);
  });

  it('issues a presigned URL for the pending (not final) key', async () => {
    const result = await requestDocumentUploadUrl(
      'RESUME',
      'application/pdf',
      1024,
    );
    expect(result).toEqual({ok: true, url: 'https://r2.example.com/presigned'});
    expect(createPresignedUploadUrl).toHaveBeenCalledWith(
      'seeker-documents/profile-1/RESUME.pending',
      'application/pdf',
    );
  });
});

describe('confirmDocumentUpload', () => {
  it('rejects when nothing was actually uploaded to the pending key', async () => {
    getObjectMetadata.mockResolvedValueOnce(null);
    const result = await confirmDocumentUpload('RESUME');
    expect(result.ok).toBe(false);
    expect(moveObject).not.toHaveBeenCalled();
    expect(recordSeekerDocumentUpload).not.toHaveBeenCalled();
  });

  // The authoritative check: the app never saw these bytes, so this is the
  // first time their real size is known. An oversized pending upload must be
  // rejected AND cleaned up, without ever touching the seeker's existing
  // (possibly already-approved) document at the stable key.
  it('rejects and deletes an oversized pending upload without promoting it', async () => {
    getObjectMetadata.mockResolvedValueOnce({
      size: MAX_DOCUMENT_BYTES + 1,
      contentType: 'application/pdf',
    });
    const result = await confirmDocumentUpload('RESUME');
    expect(result.ok).toBe(false);
    expect(deleteObject).toHaveBeenCalledWith(
      'seeker-documents/profile-1/RESUME.pending',
    );
    expect(moveObject).not.toHaveBeenCalled();
    expect(recordSeekerDocumentUpload).not.toHaveBeenCalled();
  });

  it('promotes a valid pending upload to the stable key and records it', async () => {
    const result = await confirmDocumentUpload('RESUME');
    expect(result).toEqual({ok: true});
    expect(moveObject).toHaveBeenCalledWith(
      'seeker-documents/profile-1/RESUME.pending',
      'seeker-documents/profile-1/RESUME',
    );
    expect(recordSeekerDocumentUpload).toHaveBeenCalledWith(
      'profile-1',
      'RESUME',
      'seeker-documents/profile-1/RESUME',
    );
  });
});

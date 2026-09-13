'use server';

import {
  createPresignedUploadUrl,
  deleteObject,
  getObjectMetadata,
  moveObject,
} from '@/lib/storage';
import {prisma} from '@/lib/prisma';
import {requireRole} from '@/server/auth';
import {recordSeekerDocumentUpload, seekerDocumentKey} from '@/server/document';
import {notify} from '@/server/notification';
import type {ActionResult} from '@/types/ActionResult';
import {
  ALL_DOCUMENT_TYPES,
  ALLOWED_DOCUMENT_MIME_TYPES,
  DOCUMENT_TYPE_LABEL,
  MAX_DOCUMENT_BYTES,
  MAX_DOCUMENT_MB,
  SeekerDocumentStatus,
  type SeekerDocumentType,
  type UploadUrlResult,
} from '@/types/Document';
import {NotificationType} from '@/types/Notification';
import {UserRole} from '@/types/User';

// A staging key, not the final `seekerDocumentKey` — so a rejected or
// abandoned re-upload attempt (oversized file, never confirmed, etc.) can
// never clobber whatever the seeker already had approved at the stable key.
// confirmDocumentUpload only promotes this to the final key once it has
// verified what actually landed (#231).
function pendingSeekerDocumentKey(
  seekerId: string,
  documentType: SeekerDocumentType,
): string {
  return `${seekerDocumentKey(seekerId, documentType)}.pending`;
}

// Step 1 of the direct-to-R2 upload flow (#231): validates the declared
// documentType/contentType/size and, if they pass, returns a presigned URL
// the browser can PUT the file's bytes to directly — never through this
// Server Action's own request body, so upload size is no longer bound by
// Netlify Functions' payload limit. This check is only a fast pre-filter on
// what the client *claims*; confirmDocumentUpload re-verifies what actually
// landed, since the app never sees these bytes itself.
export async function requestDocumentUploadUrl(
  documentType: string,
  contentType: string,
  size: number,
): Promise<UploadUrlResult> {
  const user = await requireRole([UserRole.SEEKER]);
  const profile = await prisma.seekerProfile.findUnique({
    where: {userId: user.id},
  });
  if (!profile) {
    return {ok: false, message: '先にプロフィールを作成してください。'};
  }
  if (!ALL_DOCUMENT_TYPES.includes(documentType as SeekerDocumentType)) {
    return {ok: false, message: '書類の種類が不正です。'};
  }
  if (size <= 0) {
    return {ok: false, message: 'ファイルを選択してください。'};
  }
  if (size > MAX_DOCUMENT_BYTES) {
    return {
      ok: false,
      message: `ファイルサイズは${MAX_DOCUMENT_MB}MBまでにしてください。`,
    };
  }
  if (!ALLOWED_DOCUMENT_MIME_TYPES.includes(contentType)) {
    return {
      ok: false,
      message: '画像（JPEG/PNG/WebP）またはPDFをアップロードしてください。',
    };
  }

  const key = pendingSeekerDocumentKey(
    profile.id,
    documentType as SeekerDocumentType,
  );
  const url = await createPresignedUploadUrl(key, contentType);
  return {ok: true, url};
}

// Step 2 (#231): the app never saw the bytes the browser just PUT straight to
// R2, so this is the first authoritative check of what actually landed —
// HEAD the staging object, reject (and clean it up) if it is missing or over
// the size limit, otherwise promote it to the seeker's stable document key
// and record the submission the same way a manual upload always has.
export async function confirmDocumentUpload(
  documentType: string,
): Promise<ActionResult> {
  const user = await requireRole([UserRole.SEEKER]);
  const profile = await prisma.seekerProfile.findUnique({
    where: {userId: user.id},
  });
  if (!profile) {
    return {ok: false, message: '先にプロフィールを作成してください。'};
  }
  if (!ALL_DOCUMENT_TYPES.includes(documentType as SeekerDocumentType)) {
    return {ok: false, message: '書類の種類が不正です。'};
  }

  const type = documentType as SeekerDocumentType;
  const pendingKey = pendingSeekerDocumentKey(profile.id, type);
  const meta = await getObjectMetadata(pendingKey);
  if (!meta) {
    return {
      ok: false,
      message: 'アップロードが完了していないようです。もう一度お試しください。',
    };
  }
  if (meta.size > MAX_DOCUMENT_BYTES) {
    await deleteObject(pendingKey);
    return {
      ok: false,
      message: `ファイルサイズは${MAX_DOCUMENT_MB}MBまでにしてください。`,
    };
  }

  const finalKey = seekerDocumentKey(profile.id, type);
  await moveObject(pendingKey, finalKey);
  await recordSeekerDocumentUpload(profile.id, type, finalKey);
  return {ok: true};
}

// Admin marks a document verified.
export async function verifyDocument(id: string): Promise<ActionResult> {
  await requireRole([UserRole.ADMIN]);
  const doc = await prisma.seekerDocument.findUnique({
    where: {id},
    include: {seeker: {select: {userId: true}}},
  });
  if (!doc) return {ok: false, message: '対象の書類が見つかりません。'};

  await prisma.seekerDocument.update({
    where: {id},
    data: {
      status: SeekerDocumentStatus.APPROVED,
      rejectionReason: null,
      verifiedAt: new Date(),
    },
  });

  await notify({
    userId: doc.seeker.userId,
    type: NotificationType.DOCUMENT_APPROVED,
    title: '書類が認証されました',
    body: `${DOCUMENT_TYPE_LABEL[doc.documentType]}が認証されました。`,
    linkUrl: '/documents',
  });
  return {ok: true};
}

// Admin rejects a document with a reason (shown to the seeker).
export async function rejectDocument(
  id: string,
  reason: string,
): Promise<ActionResult> {
  await requireRole([UserRole.ADMIN]);
  const trimmed = reason.trim();
  if (!trimmed) return {ok: false, message: '差し戻し理由を入力してください。'};

  const doc = await prisma.seekerDocument.findUnique({
    where: {id},
    include: {seeker: {select: {userId: true}}},
  });
  if (!doc) return {ok: false, message: '対象の書類が見つかりません。'};

  await prisma.seekerDocument.update({
    where: {id},
    data: {
      status: SeekerDocumentStatus.REJECTED,
      rejectionReason: trimmed,
      verifiedAt: new Date(),
    },
  });

  await notify({
    userId: doc.seeker.userId,
    type: NotificationType.DOCUMENT_REJECTED,
    title: '書類が差し戻されました',
    body: `${DOCUMENT_TYPE_LABEL[doc.documentType]}が差し戻されました。理由：${trimmed}`,
    linkUrl: '/documents',
  });
  return {ok: true};
}

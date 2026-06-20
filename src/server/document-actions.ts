'use server';

import {prisma} from '@/lib/prisma';
import {putObject} from '@/lib/storage';
import {requireRole} from '@/server/auth';
import {notify} from '@/server/notification';
import type {ActionResult} from '@/types/ActionResult';
import {
  ALL_DOCUMENT_TYPES,
  ALLOWED_DOCUMENT_MIME_TYPES,
  DOCUMENT_TYPE_LABEL,
  MAX_DOCUMENT_BYTES,
  SeekerDocumentStatus,
  type SeekerDocumentType,
} from '@/types/Document';
import {NotificationType} from '@/types/Notification';
import {UserRole} from '@/types/User';

// Seeker uploads (or replaces) one document. Stored in R2 under a key keyed by
// seeker + type, so a re-upload overwrites the object and resets the row to
// PENDING for re-review.
export async function uploadDocument(
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireRole([UserRole.SEEKER]);
  const profile = await prisma.seekerProfile.findUnique({
    where: {userId: user.id},
  });
  if (!profile) {
    return {ok: false, message: '先にプロフィールを作成してください。'};
  }

  const documentType = formData.get('documentType');
  const file = formData.get('file');
  if (
    typeof documentType !== 'string' ||
    !ALL_DOCUMENT_TYPES.includes(documentType as SeekerDocumentType)
  ) {
    return {ok: false, message: '書類の種類が不正です。'};
  }
  if (!(file instanceof File) || file.size === 0) {
    return {ok: false, message: 'ファイルを選択してください。'};
  }
  if (file.size > MAX_DOCUMENT_BYTES) {
    return {ok: false, message: 'ファイルサイズは10MBまでにしてください。'};
  }
  if (!ALLOWED_DOCUMENT_MIME_TYPES.includes(file.type)) {
    return {
      ok: false,
      message: '画像（JPEG/PNG/WebP）またはPDFをアップロードしてください。',
    };
  }

  const type = documentType as SeekerDocumentType;
  const key = `seeker-documents/${profile.id}/${type}`;
  await putObject(key, new Uint8Array(await file.arrayBuffer()), file.type);

  await prisma.seekerDocument.upsert({
    where: {seekerId_documentType: {seekerId: profile.id, documentType: type}},
    update: {
      fileKey: key,
      status: SeekerDocumentStatus.PENDING,
      rejectionReason: null,
      uploadedAt: new Date(),
      verifiedAt: null,
    },
    create: {seekerId: profile.id, documentType: type, fileKey: key},
  });
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

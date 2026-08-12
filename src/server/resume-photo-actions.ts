'use server';

import {prisma} from '@/lib/prisma';
import {deleteObject, putObject} from '@/lib/storage';
import {requireRole} from '@/server/auth';
import type {ActionResult} from '@/types/ActionResult';
import {
  ALLOWED_RESUME_PHOTO_MIME_TYPES,
  MAX_RESUME_PHOTO_BYTES,
} from '@/types/Resume';
import {UserRole} from '@/types/User';

// Upload/replace the current seeker's 証明写真 (#167). Unlike
// nursery-photo-actions.ts there is no isMain/multi-photo concept — a résumé
// has exactly one photo, so a new upload always replaces whatever was there,
// and the R2 key is stable per seeker (no placeholder-row dance needed since
// there's no separate photo id to embed in it). Guarded to SEEKER.
export async function uploadResumePhoto(
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireRole([UserRole.SEEKER]);
  const profile = await prisma.seekerProfile.findUnique({
    where: {userId: user.id},
  });
  if (!profile) {
    return {ok: false, message: '先にプロフィールを作成してください。'};
  }

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return {ok: false, message: 'ファイルを選択してください。'};
  }
  if (file.size > MAX_RESUME_PHOTO_BYTES) {
    return {ok: false, message: '5MBまでにしてください。'};
  }
  if (!ALLOWED_RESUME_PHOTO_MIME_TYPES.includes(file.type)) {
    return {
      ok: false,
      message: '画像（JPEG/PNG/WebP）をアップロードしてください。',
    };
  }

  // The résumé row may not exist yet — the photo isn't gated behind a first
  // saveResume() the way education/workHistory rows are.
  const resume = await prisma.seekerResume.upsert({
    where: {seekerId: profile.id},
    update: {},
    create: {seekerId: profile.id},
  });

  if (resume.photoFileKey) {
    await deleteObject(resume.photoFileKey);
  }

  const key = `resume-photos/${profile.id}`;
  await putObject(key, new Uint8Array(await file.arrayBuffer()), file.type);
  await prisma.seekerResume.update({
    where: {id: resume.id},
    data: {photoFileKey: key},
  });

  // ここでPDFは作らない。事務局への提出は「発行する」だけが行う (#208) —
  // 写真を替えただけで提出物が差し替わると、承認済みの書類が PENDING に
  // 戻され、本人に知らされないまま応募できなくなる。発行するまでは
  // ResumeForm が「まだ発行されていません」と表示する。
  return {ok: true};
}

export async function deleteResumePhoto(): Promise<ActionResult> {
  const user = await requireRole([UserRole.SEEKER]);
  const profile = await prisma.seekerProfile.findUnique({
    where: {userId: user.id},
    include: {resume: {select: {id: true, photoFileKey: true}}},
  });
  if (!profile?.resume?.photoFileKey) {
    return {ok: false, message: '証明写真が見つかりません。'};
  }

  await deleteObject(profile.resume.photoFileKey);
  await prisma.seekerResume.update({
    where: {id: profile.resume.id},
    data: {photoFileKey: null},
  });

  // アップロードと同じ理由でPDFは作らない (#208)。
  return {ok: true};
}

'use server';

import {prisma} from '@/lib/prisma';
import {deleteObject, putObject} from '@/lib/storage';
import {requireRole} from '@/server/auth';
import {ensureNurseryProfile} from '@/server/nursery';
import type {ActionResult} from '@/types/ActionResult';
import {
  ALLOWED_NURSERY_PHOTO_MIME_TYPES,
  MAX_NURSERY_PHOTO_BYTES,
  MAX_NURSERY_SUB_PHOTOS,
} from '@/types/Nursery';
import {UserRole} from '@/types/User';

// Success carries the created photo so the client can update its local list
// without a full reload.
type UploadNurseryPhotoResult =
  | {ok: true; photo: {id: string; order: number}}
  | {ok: false; message: string};

export async function uploadNurseryPhoto(
  formData: FormData,
  isMain: boolean,
): Promise<UploadNurseryPhotoResult> {
  const user = await requireRole([UserRole.NURSERY]);
  // Guarantees the profile row exists before we depend on it below (#143).
  await ensureNurseryProfile();
  const profile = await prisma.nurseryProfile.findUnique({
    where: {userId: user.id},
    include: {
      photos: {select: {id: true, isMain: true, fileKey: true, order: true}},
    },
  });
  if (!profile) {
    // Unreachable: ensureNurseryProfile() above guarantees the row exists.
    return {ok: false, message: '園プロフィールの取得に失敗しました。'};
  }

  const subPhotos = profile.photos.filter((p) => !p.isMain);
  if (!isMain && subPhotos.length >= MAX_NURSERY_SUB_PHOTOS) {
    return {
      ok: false,
      message: `サブ写真は最大${MAX_NURSERY_SUB_PHOTOS}枚までです。`,
    };
  }

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return {ok: false, message: 'ファイルを選択してください。'};
  }
  if (file.size > MAX_NURSERY_PHOTO_BYTES) {
    return {ok: false, message: '1枚あたり5MBまでにしてください。'};
  }
  if (!ALLOWED_NURSERY_PHOTO_MIME_TYPES.includes(file.type)) {
    return {
      ok: false,
      message: '画像（JPEG/PNG/WebP）をアップロードしてください。',
    };
  }

  if (isMain) {
    const existingMain = profile.photos.find((p) => p.isMain);
    if (existingMain) {
      await deleteObject(existingMain.fileKey);
      await prisma.nurseryPhoto.delete({where: {id: existingMain.id}});
    }
  }

  // Sub-photo orders can be sparse after deletions, so allocate max + 1 —
  // counting rows would reuse an existing order and make the display order
  // unstable (orderBy ties are unordered).
  const order = isMain
    ? 0
    : subPhotos.reduce((max, p) => Math.max(max, p.order), -1) + 1;

  // The R2 key embeds photo.id, which Prisma assigns on create, so the row is
  // created first with a placeholder fileKey and updated once the object is
  // stored.
  const photo = await prisma.nurseryPhoto.create({
    data: {nurseryId: profile.id, fileKey: '', isMain, order},
  });
  const key = `nursery-photos/${profile.id}/${photo.id}`;
  try {
    await putObject(key, new Uint8Array(await file.arrayBuffer()), file.type);
  } catch (err) {
    // Roll back the placeholder row so a failed upload doesn't leave a broken
    // thumbnail that also counts toward the sub-photo cap.
    await prisma.nurseryPhoto.delete({where: {id: photo.id}});
    throw err;
  }
  await prisma.nurseryPhoto.update({
    where: {id: photo.id},
    data: {fileKey: key},
  });

  return {ok: true, photo: {id: photo.id, order}};
}

export async function deleteNurseryPhoto(
  photoId: string,
): Promise<ActionResult> {
  const user = await requireRole([UserRole.NURSERY]);
  const photo = await prisma.nurseryPhoto.findUnique({
    where: {id: photoId},
    include: {nursery: {select: {userId: true}}},
  });
  if (!photo || photo.nursery.userId !== user.id) {
    return {ok: false, message: '対象の写真が見つかりません。'};
  }

  await deleteObject(photo.fileKey);
  await prisma.nurseryPhoto.delete({where: {id: photoId}});
  return {ok: true};
}

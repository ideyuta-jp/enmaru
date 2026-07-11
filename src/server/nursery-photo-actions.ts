'use server';

import {prisma} from '@/lib/prisma';
import {deleteObject, putObject} from '@/lib/storage';
import {requireRole} from '@/server/auth';
import type {ActionResult} from '@/types/ActionResult';
import {UserRole} from '@/types/User';

const MAX_SUB_PHOTOS = 5;
const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];

export async function uploadNurseryPhoto(
  formData: FormData,
  isMain: boolean,
): Promise<ActionResult> {
  const user = await requireRole([UserRole.NURSERY]);
  const profile = await prisma.nurseryProfile.findUnique({
    where: {userId: user.id},
    include: {photos: {select: {id: true, isMain: true, fileKey: true}}},
  });
  if (!profile) {
    return {ok: false, message: '先にプロフィールを保存してください。'};
  }

  const subPhotos = profile.photos.filter((p) => !p.isMain);
  if (!isMain && subPhotos.length >= MAX_SUB_PHOTOS) {
    return {ok: false, message: `サブ写真は最大${MAX_SUB_PHOTOS}枚までです。`};
  }

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return {ok: false, message: 'ファイルを選択してください。'};
  }
  if (file.size > MAX_BYTES) {
    return {ok: false, message: '1枚あたり5MBまでにしてください。'};
  }
  if (!ALLOWED_MIME.includes(file.type)) {
    return {ok: false, message: '画像（JPEG/PNG/WebP）をアップロードしてください。'};
  }

  // メイン写真の場合、既存のメイン写真を先に削除する
  if (isMain) {
    const existingMain = profile.photos.find((p) => p.isMain);
    if (existingMain) {
      await deleteObject(existingMain.fileKey);
      await prisma.nurseryPhoto.delete({where: {id: existingMain.id}});
    }
  }

  const order = isMain ? 0 : subPhotos.length;
  const photo = await prisma.nurseryPhoto.create({
    data: {nurseryId: profile.id, fileKey: '', isMain, order},
  });
  const key = `nursery-photos/${profile.id}/${photo.id}`;
  await putObject(key, new Uint8Array(await file.arrayBuffer()), file.type);
  await prisma.nurseryPhoto.update({where: {id: photo.id}, data: {fileKey: key}});

  return {ok: true};
}

export async function deleteNurseryPhoto(photoId: string): Promise<ActionResult> {
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

export async function getNurseryPhotos(
  nurseryId: string,
): Promise<{id: string; order: number; isMain: boolean}[]> {
  const photos = await prisma.nurseryPhoto.findMany({
    where: {nurseryId},
    orderBy: {order: 'asc'},
    select: {id: true, order: true, isMain: true},
  });
  return photos;
}

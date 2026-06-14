'use server';

import {prisma} from '@/lib/prisma';
import {requireRole} from '@/server/auth';
import type {ActionResult} from '@/types/ActionResult';
import type {NurseryProfileInput} from '@/types/Nursery';
import {blankToNull} from '@/utils/string';

// Create or update the current nursery's profile. Guarded to NURSERY. Keyed by
// userId, so the same action serves both first save and edits.
export async function saveNurseryProfile(
  input: NurseryProfileInput,
): Promise<ActionResult> {
  const user = await requireRole(['NURSERY']);

  const nurseryName = input.nurseryName.trim();
  const area = input.area.trim();
  const contactName = input.contactName.trim();
  if (!nurseryName || !area || !contactName) {
    return {ok: false, message: '園名・エリア・担当者名は必須です。'};
  }

  const data = {
    nurseryName,
    area,
    contactName,
    address: blankToNull(input.address),
    phone: blankToNull(input.phone),
    concept: blankToNull(input.concept),
    policy: blankToNull(input.policy),
    isPublished: input.isPublished,
  };

  await prisma.nurseryProfile.upsert({
    where: {userId: user.id},
    update: data,
    create: {userId: user.id, ...data},
  });

  return {ok: true};
}

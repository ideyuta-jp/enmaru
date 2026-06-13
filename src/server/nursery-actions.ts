'use server';

import {prisma} from '@/lib/prisma';
import {requireRole} from '@/server/auth';
import type {NurseryProfileInput} from '@/types/Nursery';

// Empty string -> null for optional text columns.
function orNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

// Create or update the current nursery's profile. Guarded to NURSERY. Keyed by
// userId, so the same action serves both first save and edits.
export async function saveNurseryProfile(input: NurseryProfileInput) {
  const user = await requireRole(['NURSERY']);

  const nurseryName = input.nurseryName.trim();
  const area = input.area.trim();
  const contactName = input.contactName.trim();
  if (!nurseryName || !area || !contactName) {
    throw new Error('園名・エリア・担当者名は必須です。');
  }

  const data = {
    nurseryName,
    area,
    contactName,
    address: orNull(input.address),
    phone: orNull(input.phone),
    concept: orNull(input.concept),
    policy: orNull(input.policy),
    isPublished: input.isPublished,
  };

  await prisma.nurseryProfile.upsert({
    where: {userId: user.id},
    update: data,
    create: {userId: user.id, ...data},
  });
}

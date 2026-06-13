'use server';

import {prisma} from '@/lib/prisma';
import {requireRole} from '@/server/auth';
import type {SeekerProfileInput} from '@/types/Seeker';

// Empty string -> null for optional text columns.
function orNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

// Create or update the current seeker's profile. Guarded to SEEKER. Keyed by
// userId, so the same action serves both first save and edits.
export async function saveSeekerProfile(input: SeekerProfileInput) {
  const user = await requireRole(['SEEKER']);

  const realName = input.realName.trim();
  const displayName = input.displayName.trim();
  if (!realName || !displayName) {
    throw new Error('本名と表示名は必須です。');
  }

  const data = {
    realName,
    displayName,
    license: input.license,
    blankYears: orNull(input.blankYears),
    preferredArea: orNull(input.preferredArea),
    preferredStyle: input.preferredStyle,
    bio: orNull(input.bio),
    experience: orNull(input.experience),
    skills: orNull(input.skills),
    ngConditions: orNull(input.ngConditions),
    isPublished: input.isPublished,
  };

  await prisma.seekerProfile.upsert({
    where: {userId: user.id},
    update: data,
    create: {userId: user.id, ...data},
  });
}

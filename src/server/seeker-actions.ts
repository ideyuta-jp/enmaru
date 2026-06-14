'use server';

import {prisma} from '@/lib/prisma';
import {requireRole} from '@/server/auth';
import type {ActionResult} from '@/types/ActionResult';
import type {SeekerProfileInput} from '@/types/Seeker';
import {blankToNull} from '@/utils/string';

// Create or update the current seeker's profile. Guarded to SEEKER. Keyed by
// userId, so the same action serves both first save and edits.
export async function saveSeekerProfile(
  input: SeekerProfileInput,
): Promise<ActionResult> {
  const user = await requireRole(['SEEKER']);

  const realName = input.realName.trim();
  const displayName = input.displayName.trim();
  if (!realName || !displayName) {
    return {ok: false, message: '本名と表示名は必須です。'};
  }

  const data = {
    realName,
    displayName,
    license: input.license,
    blankYears: blankToNull(input.blankYears),
    preferredArea: blankToNull(input.preferredArea),
    preferredStyle: input.preferredStyle,
    bio: blankToNull(input.bio),
    experience: blankToNull(input.experience),
    skills: blankToNull(input.skills),
    ngConditions: blankToNull(input.ngConditions),
    isPublished: input.isPublished,
  };

  await prisma.seekerProfile.upsert({
    where: {userId: user.id},
    update: data,
    create: {userId: user.id, ...data},
  });

  return {ok: true};
}

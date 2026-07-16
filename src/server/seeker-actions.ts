'use server';

import {prisma} from '@/lib/prisma';
import {requireRole} from '@/server/auth';
import type {ActionResult} from '@/types/ActionResult';
import type {SeekerProfileInput} from '@/types/Seeker';
import {UserRole} from '@/types/User';
import {blankToNull} from '@/utils/string';

// Create or update the current seeker's profile. Guarded to SEEKER. Keyed by
// userId, so the same action serves both first save and edits.
export async function saveSeekerProfile(
  input: SeekerProfileInput,
): Promise<ActionResult> {
  const user = await requireRole([UserRole.SEEKER]);

  const realName = input.realName.trim();
  const displayName = input.displayName.trim();
  if (!realName || !displayName) {
    return {ok: false, message: '本名と表示名は必須です。'};
  }

  const data = {
    realName,
    displayName,
    preferredPrefecture: blankToNull(input.preferredPrefecture),
    preferredCity: blankToNull(input.preferredCity),
    licenses: input.licenses,
    experienceYears: blankToNull(input.experienceYears),
    blankYears: blankToNull(input.blankYears),
    skills: input.skills,
    skillsNote: blankToNull(input.skillsNote),
    experience: blankToNull(input.experience),
    preferredPeriod: input.preferredPeriod,
    preferredTimeSlot: input.preferredTimeSlot,
    preferredAgeGroups: input.preferredAgeGroups,
    values: blankToNull(input.values),
    bio: blankToNull(input.bio),
    messageToNursery: blankToNull(input.messageToNursery),
    ngConditions: input.ngConditions,
    ngConditionsNote: blankToNull(input.ngConditionsNote),
    isPublished: input.isPublished,
  };

  await prisma.seekerProfile.upsert({
    where: {userId: user.id},
    update: data,
    create: {userId: user.id, ...data},
  });

  return {ok: true};
}

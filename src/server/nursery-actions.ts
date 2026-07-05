'use server';

import {prisma} from '@/lib/prisma';
import {requireRole} from '@/server/auth';
import type {ActionResult} from '@/types/ActionResult';
import type {NurseryProfileInput} from '@/types/Nursery';
import {UserRole} from '@/types/User';
import {blankToNull} from '@/utils/string';

// Create or update the current nursery's profile. Guarded to NURSERY. Keyed by
// userId, so the same action serves both first save and edits.
export async function saveNurseryProfile(
  input: NurseryProfileInput,
): Promise<ActionResult> {
  const user = await requireRole([UserRole.NURSERY]);

  const nurseryName = input.nurseryName.trim();
  const contactName = input.contactName.trim();
  if (!nurseryName || !contactName) {
    return {ok: false, message: '園名・担当者名は必須です。'};
  }

  const data = {
    nurseryName,
    postalCode: blankToNull(input.postalCode),
    prefecture: blankToNull(input.prefecture),
    city: blankToNull(input.city),
    addressLine: blankToNull(input.addressLine),
    phone: blankToNull(input.phone),
    contactName,
    homepageUrl: blankToNull(input.homepageUrl),
    instagramUrl: blankToNull(input.instagramUrl),
    twitterUrl: blankToNull(input.twitterUrl),
    facebookUrl: blankToNull(input.facebookUrl),
    otherSnsUrl: blankToNull(input.otherSnsUrl),
    featureTags: input.featureTags,
    featureNote: blankToNull(input.featureNote),
    receptionTags: input.receptionTags,
    receptionNote: blankToNull(input.receptionNote),
    joinReason: blankToNull(input.joinReason),
    idealPartner: blankToNull(input.idealPartner),
    additionalNotes: blankToNull(input.additionalNotes),
    isPublished: input.isPublished,
  };

  await prisma.nurseryProfile.upsert({
    where: {userId: user.id},
    update: data,
    create: {userId: user.id, ...data},
  });

  return {ok: true};
}

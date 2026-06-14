'use server';

import type {Prisma} from '@/generated/prisma/client';
import {prisma} from '@/lib/prisma';
import {requireRole} from '@/server/auth';
import {isUniqueViolation} from '@/server/prisma-error';
import type {ActionResult} from '@/types/ActionResult';
import {EngagementStatus, ReviewStatus} from '@/types/Engagement';
import type {
  NurseryToSeekerReviewInput,
  SeekerToNurseryReviewInput,
} from '@/types/Review';
import {UserRole} from '@/types/User';

// Numeric criteria are 1-5 integers.
function isValidScore(n: number): boolean {
  return Number.isInteger(n) && n >= 1 && n <= 5;
}

// Recompute the engagement's review axis from how many of the two reviews now
// exist: none → NONE, one → PARTIAL, both → DONE. Called inside the transaction
// that just created a review, under the engagement row lock, so concurrent
// submissions from both directions settle on DONE rather than racing to PARTIAL.
async function syncReviewStatus(
  tx: Prisma.TransactionClient,
  engagementId: string,
): Promise<void> {
  const n2s = await tx.reviewNurseryToSeeker.findUnique({
    where: {engagementId},
    select: {id: true},
  });
  const s2n = await tx.reviewSeekerToNursery.findUnique({
    where: {engagementId},
    select: {id: true},
  });
  const count = (n2s ? 1 : 0) + (s2n ? 1 : 0);
  const reviewStatus =
    count >= 2
      ? ReviewStatus.DONE
      : count === 1
        ? ReviewStatus.PARTIAL
        : ReviewStatus.NONE;
  await tx.engagement.update({
    where: {id: engagementId},
    data: {reviewStatus},
  });
}

// Seeker reviews the nursery. Allowed only when the engagement is COMPLETED and
// only by that engagement's seeker; one review per direction. Starts unpublished
// (admin controls publication, #32 part 2).
export async function submitSeekerToNurseryReview(
  engagementId: string,
  input: SeekerToNurseryReviewInput,
): Promise<ActionResult> {
  const user = await requireRole([UserRole.SEEKER]);

  const engagement = await prisma.engagement.findUnique({
    where: {id: engagementId},
    select: {status: true, seeker: {select: {userId: true}}},
  });
  if (!engagement || engagement.seeker.userId !== user.id) {
    return {ok: false, message: '対象の業務が見つかりません。'};
  }
  if (engagement.status !== EngagementStatus.COMPLETED) {
    return {ok: false, message: '業務完了後に評価できます。'};
  }
  if (
    !isValidScore(input.explanation) ||
    !isValidScore(input.atmosphere) ||
    !isValidScore(input.support) ||
    !isValidScore(input.clarity)
  ) {
    return {ok: false, message: '各項目を1〜5で評価してください。'};
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Engagement" WHERE id = ${engagementId} FOR UPDATE`;
      await tx.reviewSeekerToNursery.create({
        data: {
          engagementId,
          explanation: input.explanation,
          atmosphere: input.atmosphere,
          support: input.support,
          clarity: input.clarity,
          comment: input.comment.trim() || null,
          wouldWorkAgain: input.wouldWorkAgain,
        },
      });
      await syncReviewStatus(tx, engagementId);
    });
  } catch (e) {
    if (isUniqueViolation(e)) {
      return {ok: false, message: 'すでに評価を送信済みです。'};
    }
    throw e;
  }
  return {ok: true};
}

// Nursery reviews the seeker. Same gate, mirrored to the nursery party.
export async function submitNurseryToSeekerReview(
  engagementId: string,
  input: NurseryToSeekerReviewInput,
): Promise<ActionResult> {
  const user = await requireRole([UserRole.NURSERY]);

  const engagement = await prisma.engagement.findUnique({
    where: {id: engagementId},
    select: {
      status: true,
      job: {select: {nursery: {select: {userId: true}}}},
    },
  });
  if (!engagement || engagement.job.nursery.userId !== user.id) {
    return {ok: false, message: '対象の業務が見つかりません。'};
  }
  if (engagement.status !== EngagementStatus.COMPLETED) {
    return {ok: false, message: '業務完了後に評価できます。'};
  }
  if (
    !isValidScore(input.attitude) ||
    !isValidScore(input.communication) ||
    !isValidScore(input.skill)
  ) {
    return {ok: false, message: '各項目を1〜5で評価してください。'};
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Engagement" WHERE id = ${engagementId} FOR UPDATE`;
      await tx.reviewNurseryToSeeker.create({
        data: {
          engagementId,
          attitude: input.attitude,
          communication: input.communication,
          skill: input.skill,
          comment: input.comment.trim() || null,
          wouldRehire: input.wouldRehire,
        },
      });
      await syncReviewStatus(tx, engagementId);
    });
  } catch (e) {
    if (isUniqueViolation(e)) {
      return {ok: false, message: 'すでに評価を送信済みです。'};
    }
    throw e;
  }
  return {ok: true};
}

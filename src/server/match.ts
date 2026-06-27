import {prisma} from '@/lib/prisma';
import {requireRole} from '@/server/auth';
import type {AdminMatch, NurseryMatch} from '@/types/Match';
import {UserRole} from '@/types/User';

// Engagements on the signed-in nursery's postings (newest first) — its
// application inbox. Every entry is a matched Engagement, so the seeker's real
// name is disclosed to the nursery (matching is immediate; applying establishes
// the match). Guarded to NURSERY; empty until the nursery has a profile.
export async function listNurseryMatches(): Promise<NurseryMatch[]> {
  const user = await requireRole([UserRole.NURSERY]);
  const profile = await prisma.nurseryProfile.findUnique({
    where: {userId: user.id},
  });
  if (!profile) return [];

  const engagements = await prisma.engagement.findMany({
    where: {job: {nurseryId: profile.id}},
    include: {
      job: {
        select: {
          title: true,
          workDate: true,
          workTimeStart: true,
          workTimeEnd: true,
        },
      },
      seeker: {
        select: {displayName: true, realName: true, preferredStyle: true},
      },
      reviewNurseryToSeeker: {select: {id: true}},
    },
    orderBy: {createdAt: 'desc'},
  });

  return engagements.map((e) => ({
    id: e.id,
    engagementStatus: e.status,
    reviewStatus: e.reviewStatus,
    jobTitle: e.job.title,
    workDate: e.job.workDate.toISOString().slice(0, 10),
    workTimeStart: e.job.workTimeStart,
    workTimeEnd: e.job.workTimeEnd,
    seekerDisplayName: e.seeker.displayName,
    seekerRealName: e.seeker.realName,
    seekerPreferredStyle: e.seeker.preferredStyle,
    applyMessage: e.applyMessage,
    lineContactOk: e.lineContactOk,
    appliedAt: e.createdAt.toISOString(),
    nurseryReviewed: e.reviewNurseryToSeeker !== null,
  }));
}

// All engagements for the admin matching console (newest first). Admins see both
// parties' real names and the operator memo. Guarded to ADMIN.
//
// Unbounded by design for now: this loads every engagement ever, with includes,
// on each view. Engagements are never deleted, so this is the one query that
// grows without limit — needs a limit / pagination once the console sees real
// volume (#41).
export async function listAllMatches(): Promise<AdminMatch[]> {
  await requireRole([UserRole.ADMIN]);

  const engagements = await prisma.engagement.findMany({
    include: {
      job: {
        include: {nursery: {select: {nurseryName: true, area: true}}},
      },
      seeker: {select: {displayName: true, realName: true}},
    },
    orderBy: {createdAt: 'desc'},
  });

  return engagements.map((e) => ({
    id: e.id,
    engagementStatus: e.status,
    reviewStatus: e.reviewStatus,
    adminMemo: e.adminMemo,
    createdAt: e.createdAt.toISOString(),
    jobTitle: e.job.title,
    workDate: e.job.workDate.toISOString().slice(0, 10),
    nurseryName: e.job.nursery.nurseryName,
    nurseryArea: e.job.nursery.area,
    seekerDisplayName: e.seeker.displayName,
    seekerRealName: e.seeker.realName,
  }));
}

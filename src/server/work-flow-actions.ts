'use server';

import {prisma} from '@/lib/prisma';
import {requireRole} from '@/server/auth';
import type {ActionResult} from '@/types/ActionResult';
import {UserRole} from '@/types/User';

// Which party (if any) the signed-in user is to this engagement. The seeker party
// is the engagement's seeker; the nursery party owns the posting. Anyone else is
// not a party and may not act on it.
async function partyForEngagement(
  engagementId: string,
  userId: string,
): Promise<'SEEKER' | 'NURSERY' | null> {
  const engagement = await prisma.engagement.findUnique({
    where: {id: engagementId},
    select: {
      seeker: {select: {userId: true}},
      job: {select: {nursery: {select: {userId: true}}}},
    },
  });
  if (!engagement) return null;
  if (engagement.seeker.userId === userId) return 'SEEKER';
  if (engagement.job.nursery.userId === userId) return 'NURSERY';
  return null;
}

// Seeker starts the shift: MATCHED -> WORKING. Only the engagement's own seeker,
// and only from MATCHED.
export async function startWork(engagementId: string): Promise<ActionResult> {
  const user = await requireRole([UserRole.SEEKER]);

  const engagement = await prisma.engagement.findUnique({
    where: {id: engagementId},
    select: {status: true, seeker: {select: {userId: true}}},
  });
  if (!engagement || engagement.seeker.userId !== user.id) {
    return {ok: false, message: '対象の業務が見つかりません。'};
  }
  if (engagement.status !== 'MATCHED') {
    return {ok: false, message: 'この業務はすでに開始されています。'};
  }

  // Guard the status in the write so two concurrent starts can't race; the check
  // above is for the friendly message.
  await prisma.engagement.updateMany({
    where: {id: engagementId, status: 'MATCHED'},
    data: {status: 'WORKING'},
  });
  return {ok: true};
}

// Either party files its work-completion report once the shift is underway.
// Filing is the confirmation that the work happened (completed = true). When both
// parties have reported, the engagement moves WORKING -> COMPLETED — done in one
// transaction so two concurrent reports cannot both miss the transition.
export async function submitWorkReport(
  engagementId: string,
  comment: string,
): Promise<ActionResult> {
  const user = await requireRole([UserRole.SEEKER, UserRole.NURSERY]);

  const party = await partyForEngagement(engagementId, user.id);
  if (!party) return {ok: false, message: '対象の業務が見つかりません。'};

  const engagement = await prisma.engagement.findUnique({
    where: {id: engagementId},
    select: {status: true},
  });
  if (!engagement) return {ok: false, message: '対象の業務が見つかりません。'};
  if (engagement.status === 'MATCHED') {
    return {ok: false, message: '業務開始後に完了報告できます。'};
  }
  if (engagement.status === 'COMPLETED') {
    return {ok: false, message: 'この業務はすでに完了しています。'};
  }

  const trimmed = comment.trim() || null;

  await prisma.$transaction(async (tx) => {
    // Lock the engagement row first so the report read-modify-write is
    // serialized. Without this, under READ COMMITTED two concurrent reports each
    // upsert their own (different) row and neither sees the other's uncommitted
    // row, so both compute bothReported=false and the engagement is stuck at
    // WORKING forever. The lock makes the second report wait, then see both.
    await tx.$queryRaw`SELECT id FROM "Engagement" WHERE id = ${engagementId} FOR UPDATE`;

    await tx.workReport.upsert({
      where: {engagementId_reporter: {engagementId, reporter: party}},
      update: {completed: true, comment: trimmed},
      create: {
        engagementId,
        reporter: party,
        completed: true,
        comment: trimmed,
      },
    });

    const reports = await tx.workReport.findMany({
      where: {engagementId, completed: true},
      select: {reporter: true},
    });
    const bothReported =
      reports.some((r) => r.reporter === 'SEEKER') &&
      reports.some((r) => r.reporter === 'NURSERY');
    if (bothReported) {
      // Guard on WORKING so the transition is idempotent under a race.
      await tx.engagement.updateMany({
        where: {id: engagementId, status: 'WORKING'},
        data: {status: 'COMPLETED', completedAt: new Date()},
      });
    }
  });

  return {ok: true};
}

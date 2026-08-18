'use server';

import {prisma} from '@/lib/prisma';
import {requireRole} from '@/server/auth';
import {
  findApplicationConflict,
  missingRequiredDocuments,
} from '@/server/application';
import {deriveJobState} from '@/server/job';
import {notify} from '@/server/notification';
import {isUniqueViolation} from '@/server/prisma-error';
import type {ActionResult} from '@/types/ActionResult';
import {DOCUMENT_TYPE_LABEL} from '@/types/Document';
import {JobState} from '@/types/Job';
import {NotificationType} from '@/types/Notification';
import {UserRole} from '@/types/User';
import {todayInJst} from '@/utils/date';

// Thrown inside the transaction when the seeker's existing engagements clash
// with this posting; carries the user-facing reason from
// findApplicationConflict.
class ApplicationConflict extends Error {}

// A seeker applies to a posting. Matching is immediate and first-come:
// creating the Engagement (MATCHED) IS the match — jobId is unique, so of two
// concurrent applicants the second one's insert fails at the database and
// cannot also match. The transaction also rejects the apply if it clashes
// with the seeker's existing shifts (see findApplicationConflict).
export async function applyToJob(input: {
  jobId: string;
  applyMessage: string;
  lineContactOk: boolean;
}): Promise<ActionResult> {
  const user = await requireRole([UserRole.SEEKER]);
  const profile = await prisma.seekerProfile.findUnique({
    where: {userId: user.id},
  });
  if (!profile) {
    return {ok: false, message: '先にプロフィールを作成してください。'};
  }

  const job = await prisma.jobPosting.findUnique({
    where: {id: input.jobId},
    include: {
      nursery: {select: {userId: true, nurseryName: true}},
      engagement: {select: {seekerId: true}},
    },
  });
  if (!job) return {ok: false, message: '募集が見つかりません。'};
  if (job.engagement?.seekerId === profile.id) {
    return {ok: false, message: 'すでにこの募集に応募済みです。'};
  }
  const state = deriveJobState({
    isPublished: job.isPublished,
    matched: job.engagement !== null,
    workDate: job.workDate.toISOString().slice(0, 10),
    todayJst: todayInJst(),
  });
  if (state !== JobState.OPEN) {
    return {ok: false, message: 'この募集はすでに締め切られています。'};
  }

  // Application gate: every document the posting requires must already be
  // APPROVED for this seeker.
  const missing = await missingRequiredDocuments(
    profile.id,
    job.requiredDocuments,
  );
  if (missing.length > 0) {
    const labels = missing.map((t) => DOCUMENT_TYPE_LABEL[t]).join('、');
    return {ok: false, message: `応募には次の書類の認証が必要です：${labels}`};
  }

  const applyMessage = input.applyMessage.trim() || null;

  try {
    await prisma.$transaction(async (tx) => {
      // Serialize this seeker's applies before the conflict check: two
      // concurrent applies to mutually clashing postings would each miss the
      // other's not-yet-committed Engagement and both pass. The row lock makes
      // the second apply wait and then see the first one's committed rows.
      await tx.$queryRaw`SELECT id FROM "SeekerProfile" WHERE id = ${profile.id} FOR UPDATE`;

      const conflict = await findApplicationConflict(tx, profile.id, job);
      if (conflict) throw new ApplicationConflict(conflict);

      // The insert is the atomic claim: Engagement.jobId is unique, so a
      // concurrent applicant's insert raises a unique violation (mapped to a
      // "closed" message below) instead of double-matching.
      await tx.engagement.create({
        data: {
          jobId: input.jobId,
          seekerId: profile.id,
          applyMessage,
          lineContactOk: input.lineContactOk,
        },
      });
    });
  } catch (e) {
    if (e instanceof ApplicationConflict) {
      return {ok: false, message: e.message};
    }
    // Unique violation on Engagement.jobId: another applicant (or a double
    // submit of this one) matched between the pre-check and the insert.
    if (isUniqueViolation(e)) {
      return {ok: false, message: 'この募集はすでに締め切られています。'};
    }
    throw e;
  }

  // Match formed (applying is the match). Notify both parties after commit so a
  // notification failure can't roll back the match.
  await notify({
    userId: job.nursery.userId,
    type: NotificationType.MATCH_FORMED,
    title: 'マッチング成立',
    body: `「${job.title}」に保育士がマッチングしました`,
    linkUrl: '/nursery/applications',
  });
  await notify({
    userId: user.id,
    type: NotificationType.MATCH_FORMED,
    title: 'マッチング成立',
    body: `${job.nursery.nurseryName}「${job.title}」のマッチングが成立しました`,
    linkUrl: '/applications',
  });

  return {ok: true};
}

import type {Prisma} from '@/generated/prisma/client';
import {prisma} from '@/lib/prisma';
import {requireRole} from '@/server/auth';
import type {ApplyTarget, SeekerApplication} from '@/types/Application';
import type {SeekerDocumentType} from '@/types/Document';
import {UserRole} from '@/types/User';
import {toMinutes} from '@/utils/date';

// The signed-in seeker's application history (newest first). Each application is
// an Engagement; the nursery is reached through the posting. Guarded to SEEKER;
// empty until the seeker has a profile.
export async function listSeekerApplications(): Promise<SeekerApplication[]> {
  const user = await requireRole([UserRole.SEEKER]);
  const profile = await prisma.seekerProfile.findUnique({
    where: {userId: user.id},
  });
  if (!profile) return [];

  const engagements = await prisma.engagement.findMany({
    where: {seekerId: profile.id},
    include: {
      job: {include: {nursery: {select: {nurseryName: true}}}},
      reviewSeekerToNursery: {select: {id: true}},
    },
    orderBy: {createdAt: 'desc'},
  });

  return engagements.map((e) => ({
    id: e.id,
    jobTitle: e.job.title,
    nurseryName: e.job.nursery.nurseryName,
    workDate: e.job.workDate.toISOString().slice(0, 10),
    workTimeStart: e.job.workTimeStart,
    workTimeEnd: e.job.workTimeEnd,
    appliedAt: e.createdAt.toISOString(),
    engagementStatus: e.status,
    reviewStatus: e.reviewStatus,
    seekerReviewed: e.reviewSeekerToNursery !== null,
  }));
}

// Everything the apply page needs for a posting: its summary plus this seeker's
// eligibility (already applied? required documents approved?). The authoritative
// checks are re-run in applyToJob; this just drives the form's display and lets
// it block obviously-ineligible submissions up front. Guarded to SEEKER; returns
// null when the posting does not exist.
export async function getApplicationTarget(
  jobId: string,
): Promise<ApplyTarget | null> {
  const user = await requireRole([UserRole.SEEKER]);
  const job = await prisma.jobPosting.findUnique({
    where: {id: jobId},
    include: {nursery: {select: {nurseryName: true}}},
  });
  if (!job) return null;

  const profile = await prisma.seekerProfile.findUnique({
    where: {userId: user.id},
  });

  let alreadyApplied = false;
  let missingDocuments: SeekerDocumentType[] = job.requiredDocuments;
  if (profile) {
    const existing = await prisma.engagement.findUnique({
      where: {jobId_seekerId: {jobId, seekerId: profile.id}},
      select: {id: true},
    });
    alreadyApplied = existing !== null;
    missingDocuments = await missingRequiredDocuments(
      profile.id,
      job.requiredDocuments,
    );
  }

  return {
    jobId: job.id,
    nurseryName: job.nursery.nurseryName,
    title: job.title,
    workDate: job.workDate.toISOString().slice(0, 10),
    workTimeStart: job.workTimeStart,
    workTimeEnd: job.workTimeEnd,
    isOpen: job.status === 'OPEN',
    alreadyApplied,
    missingDocuments,
  };
}

// Required document types that are not yet APPROVED for this seeker. Empty means
// the seeker clears the application gate. Shared by the apply page and the apply
// action so both judge eligibility the same way.
export async function missingRequiredDocuments(
  seekerId: string,
  required: SeekerDocumentType[],
): Promise<SeekerDocumentType[]> {
  if (required.length === 0) return [];
  const approved = await prisma.seekerDocument.findMany({
    where: {seekerId, documentType: {in: required}, status: 'APPROVED'},
    select: {documentType: true},
  });
  const approvedTypes = new Set(approved.map((d) => d.documentType));
  return required.filter((t) => !approvedTypes.has(t));
}

// The subset of a JobPosting the conflict check needs.
interface ConflictCheckJob {
  nurseryId: string;
  workDate: Date;
  workTimeStart: string;
  workTimeEnd: string;
}

// Whether `a` and `b` would clash for one seeker (#164's two rules). Different
// days never clash. Same day: same-nursery postings clash only if their work
// times actually overlap (a seeker can work two non-overlapping shifts for one
// nursery in a day); different-nursery postings clash regardless of time — a
// business rule specified as-is in #164 (no rationale recorded). Pure and
// exported so the two rules can be unit-tested without a database.
export function jobsConflict(
  a: ConflictCheckJob,
  b: ConflictCheckJob,
): boolean {
  const sameDate =
    a.workDate.toISOString().slice(0, 10) ===
    b.workDate.toISOString().slice(0, 10);
  if (!sameDate) return false;
  if (a.nurseryId !== b.nurseryId) return true;

  const aStart = toMinutes(a.workTimeStart);
  const aEnd = toMinutes(a.workTimeEnd);
  const bStart = toMinutes(b.workTimeStart);
  const bEnd = toMinutes(b.workTimeEnd);
  return bStart < aEnd && aStart < bEnd;
}

// A reason the seeker cannot take `job` because it clashes with a shift
// they're already committed to, or null if there's no conflict. Only MATCHED
// and WORKING engagements count — COMPLETED ones are past and can't clash.
// Takes the caller's transaction client: applyToJob runs it inside its
// transaction under the seeker-row lock, so two concurrent applies can't both
// miss each other's Engagement (#164).
export async function findApplicationConflict(
  tx: Prisma.TransactionClient,
  seekerId: string,
  job: ConflictCheckJob,
): Promise<string | null> {
  const active = await tx.engagement.findMany({
    where: {seekerId, status: {in: ['MATCHED', 'WORKING']}},
    select: {
      job: {
        select: {
          nurseryId: true,
          workDate: true,
          workTimeStart: true,
          workTimeEnd: true,
        },
      },
    },
  });

  for (const {job: existing} of active) {
    if (!jobsConflict(existing, job)) continue;
    return existing.nurseryId === job.nurseryId
      ? '同じ日に勤務時間が重複する募集へすでに応募しています。'
      : '同じ日に別の保育園の募集へすでに応募しています。';
  }

  return null;
}

import {prisma} from '@/lib/prisma';
import {requireRole} from '@/server/auth';
import {hasReported} from '@/server/work-report';
import type {ApplyTarget, SeekerApplication} from '@/types/Application';
import type {SeekerDocumentType} from '@/types/Document';
import {UserRole} from '@/types/User';

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
      workReports: {select: {reporter: true, completed: true}},
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
    seekerReported: hasReported(e.workReports, 'SEEKER'),
    nurseryReported: hasReported(e.workReports, 'NURSERY'),
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

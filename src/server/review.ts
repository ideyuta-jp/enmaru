import {prisma} from '@/lib/prisma';
import {requireRole} from '@/server/auth';
import {EngagementStatus} from '@/types/Engagement';
import type {ReviewTarget} from '@/types/Review';
import {UserRole} from '@/types/User';

// What the review page needs for an engagement: the counterpart and job context,
// plus whether this viewer may review (engagement COMPLETED and they are a party)
// and whether they already have. Returns null when the engagement does not exist
// or the viewer is not one of its two parties. Guarded to SEEKER / NURSERY; the
// submit action re-checks all of this authoritatively.
export async function getReviewTarget(
  engagementId: string,
): Promise<ReviewTarget | null> {
  const user = await requireRole([UserRole.SEEKER, UserRole.NURSERY]);

  const engagement = await prisma.engagement.findUnique({
    where: {id: engagementId},
    include: {
      job: {
        select: {
          title: true,
          workDate: true,
          nursery: {select: {userId: true, nurseryName: true}},
        },
      },
      seeker: {select: {userId: true, displayName: true}},
      reviewNurseryToSeeker: {select: {id: true}},
      reviewSeekerToNursery: {select: {id: true}},
    },
  });
  if (!engagement) return null;

  const isSeeker = engagement.seeker.userId === user.id;
  const isNursery = engagement.job.nursery.userId === user.id;
  if (!isSeeker && !isNursery) return null;

  const alreadyReviewed = isSeeker
    ? engagement.reviewSeekerToNursery !== null
    : engagement.reviewNurseryToSeeker !== null;

  return {
    engagementId: engagement.id,
    counterpartName: isSeeker
      ? engagement.job.nursery.nurseryName
      : engagement.seeker.displayName,
    jobTitle: engagement.job.title,
    workDate: engagement.job.workDate.toISOString().slice(0, 10),
    eligible: engagement.status === EngagementStatus.COMPLETED,
    alreadyReviewed,
  };
}

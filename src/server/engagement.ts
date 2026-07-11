import {prisma} from '@/lib/prisma';
import {requireRole} from '@/server/auth';
import {hasReported} from '@/server/work-report';
import type {EngagementSummary} from '@/types/Engagement';
import {formatTagsWithNote} from '@/types/Job';
import {UserRole} from '@/types/User';

// The read-only context shown above the chat (stage + posting details). Returns
// null when the engagement does not exist or the viewer is not one of its two
// parties. Fetched once on page load — the chat panel polls getChatThread (see
// server/chat.ts), not this — so it is kept out of that polled payload.
export async function getEngagementSummary(
  engagementId: string,
): Promise<EngagementSummary | null> {
  const user = await requireRole([UserRole.SEEKER, UserRole.NURSERY]);

  const engagement = await prisma.engagement.findUnique({
    where: {id: engagementId},
    include: {
      job: {
        select: {
          title: true,
          workContentTags: true,
          workContentNote: true,
          workDate: true,
          workTimeStart: true,
          workTimeEnd: true,
          hourlyWage: true,
          nursery: {select: {userId: true, nurseryName: true, city: true}},
        },
      },
      seeker: {select: {userId: true, displayName: true}},
      workReports: {select: {reporter: true, completed: true}},
    },
  });
  if (!engagement) return null;

  const isSeeker = engagement.seeker.userId === user.id;
  const isNursery = engagement.job.nursery.userId === user.id;
  if (!isSeeker && !isNursery) return null;

  return {
    viewerParty: isSeeker ? 'SEEKER' : 'NURSERY',
    engagementStatus: engagement.status,
    reviewStatus: engagement.reviewStatus,
    jobTitle: engagement.job.title,
    nurseryName: engagement.job.nursery.nurseryName,
    nurseryCity: engagement.job.nursery.city,
    seekerName: engagement.seeker.displayName,
    workDate: engagement.job.workDate.toISOString(),
    workTimeStart: engagement.job.workTimeStart,
    workTimeEnd: engagement.job.workTimeEnd,
    hourlyWage: engagement.job.hourlyWage,
    // The summary keeps a single display string; the tags+note split only
    // matters to the edit form.
    workContent: formatTagsWithNote(
      engagement.job.workContentTags,
      engagement.job.workContentNote,
    ),
    seekerReported: hasReported(engagement.workReports, 'SEEKER'),
    nurseryReported: hasReported(engagement.workReports, 'NURSERY'),
  };
}

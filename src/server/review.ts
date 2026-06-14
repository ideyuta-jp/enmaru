import {prisma} from '@/lib/prisma';
import {requireRole} from '@/server/auth';
import {EngagementStatus} from '@/types/Engagement';
import type {NurseryRating, NurseryReview} from '@/types/Nursery';
import {
  type AdminReview,
  ReviewDirection,
  type ReviewTarget,
} from '@/types/Review';
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

// All submitted reviews for the admin moderation console, both directions, newest
// first. Admins read every review (published or not) and control publication.
// Guarded to ADMIN.
export async function listSubmittedReviews(): Promise<AdminReview[]> {
  await requireRole([UserRole.ADMIN]);

  const [nurseryToSeeker, seekerToNursery] = await Promise.all([
    prisma.reviewNurseryToSeeker.findMany({
      include: {
        engagement: {
          select: {
            job: {
              select: {title: true, nursery: {select: {nurseryName: true}}},
            },
            seeker: {select: {displayName: true}},
          },
        },
      },
    }),
    prisma.reviewSeekerToNursery.findMany({
      include: {
        engagement: {
          select: {
            job: {
              select: {title: true, nursery: {select: {nurseryName: true}}},
            },
            seeker: {select: {displayName: true}},
          },
        },
      },
    }),
  ]);

  const reviews: AdminReview[] = [
    ...nurseryToSeeker.map((r) => ({
      id: r.id,
      direction: ReviewDirection.NURSERY_TO_SEEKER,
      nurseryName: r.engagement.job.nursery.nurseryName,
      seekerDisplayName: r.engagement.seeker.displayName,
      jobTitle: r.engagement.job.title,
      scores: [
        {label: '勤務態度', value: r.attitude},
        {label: 'コミュニケーション', value: r.communication},
        {label: '保育スキル', value: r.skill},
      ],
      comment: r.comment,
      recommend: r.wouldRehire,
      isPublished: r.isPublished,
      reviewedAt: r.reviewedAt.toISOString(),
    })),
    ...seekerToNursery.map((r) => ({
      id: r.id,
      direction: ReviewDirection.SEEKER_TO_NURSERY,
      nurseryName: r.engagement.job.nursery.nurseryName,
      seekerDisplayName: r.engagement.seeker.displayName,
      jobTitle: r.engagement.job.title,
      scores: [
        {label: '説明のわかりやすさ', value: r.explanation},
        {label: '職場の雰囲気', value: r.atmosphere},
        {label: 'サポート体制', value: r.support},
        {label: '業務内容の明確さ', value: r.clarity},
      ],
      comment: r.comment,
      recommend: r.wouldWorkAgain,
      isPublished: r.isPublished,
      reviewedAt: r.reviewedAt.toISOString(),
    })),
  ];

  return reviews.sort((a, b) => b.reviewedAt.localeCompare(a.reviewedAt));
}

// Public nursery ratings, aggregated from PUBLISHED seeker→nursery reviews only.
// Bulk by nursery id (one query) to avoid an N+1 from the nursery list. Public —
// no role guard; reads only published rows.
export async function getNurseryRatings(
  nurseryIds: string[],
): Promise<Map<string, NurseryRating>> {
  if (nurseryIds.length === 0) return new Map();

  const reviews = await prisma.reviewSeekerToNursery.findMany({
    where: {
      isPublished: true,
      engagement: {job: {nurseryId: {in: nurseryIds}}},
    },
    select: {
      explanation: true,
      atmosphere: true,
      support: true,
      clarity: true,
      engagement: {select: {job: {select: {nurseryId: true}}}},
    },
  });

  const acc = new Map<string, {sum: number; count: number}>();
  for (const r of reviews) {
    const id = r.engagement.job.nurseryId;
    const mean = (r.explanation + r.atmosphere + r.support + r.clarity) / 4;
    const cur = acc.get(id) ?? {sum: 0, count: 0};
    acc.set(id, {sum: cur.sum + mean, count: cur.count + 1});
  }

  const ratings = new Map<string, NurseryRating>();
  for (const [id, {sum, count}] of acc) {
    ratings.set(id, {total: sum / count, count});
  }
  return ratings;
}

// One nursery's rating, or null when it has no published reviews.
export async function getNurseryRating(
  nurseryId: string,
): Promise<NurseryRating | null> {
  const ratings = await getNurseryRatings([nurseryId]);
  return ratings.get(nurseryId) ?? null;
}

// Published reviews of one nursery for its public detail page, newest first.
export async function listPublishedNurseryReviews(
  nurseryId: string,
): Promise<NurseryReview[]> {
  const reviews = await prisma.reviewSeekerToNursery.findMany({
    where: {isPublished: true, engagement: {job: {nurseryId}}},
    select: {id: true, comment: true, reviewedAt: true},
    orderBy: {reviewedAt: 'desc'},
  });
  return reviews.map((r) => ({
    id: r.id,
    comment: r.comment,
    reviewedAt: r.reviewedAt.toISOString(),
  }));
}

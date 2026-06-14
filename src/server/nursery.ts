import {prisma} from '@/lib/prisma';
import {getCurrentUser} from '@/server/auth';
import {listOpenJobsByNursery} from '@/server/job';
import {
  getNurseryRating,
  getNurseryRatings,
  listPublishedNurseryReviews,
} from '@/server/review';
import type {
  NurseryDashboard,
  NurseryProfileInput,
  PublicNursery,
  PublicNurseryDetail,
} from '@/types/Nursery';

// Published nurseries for the public list. Maps to the public projection only —
// address / phone / contactName are never included (personal-info boundary).
// Ratings come from published reviews, fetched in bulk to avoid an N+1.
export async function listPublishedNurseries(): Promise<PublicNursery[]> {
  const nurseries = await prisma.nurseryProfile.findMany({
    where: {isPublished: true},
    orderBy: {createdAt: 'desc'},
  });

  const ratings = await getNurseryRatings(nurseries.map((n) => n.id));

  return nurseries.map((n) => ({
    id: n.id,
    nurseryName: n.nurseryName,
    area: n.area,
    concept: n.concept,
    policy: n.policy,
    rating: ratings.get(n.id) ?? null,
  }));
}

// One published nursery's public detail: profile + open postings + the rating and
// published reviews aggregated from seeker→nursery reviews.
export async function getPublishedNursery(
  id: string,
): Promise<PublicNurseryDetail | null> {
  const n = await prisma.nurseryProfile.findFirst({
    where: {id, isPublished: true},
  });
  if (!n) return null;

  return {
    id: n.id,
    nurseryName: n.nurseryName,
    area: n.area,
    concept: n.concept,
    policy: n.policy,
    rating: await getNurseryRating(n.id),
    jobPostings: await listOpenJobsByNursery(n.id),
    reviews: await listPublishedNurseryReviews(n.id),
  };
}

// The current nursery's profile as form-ready input, or null if none yet.
export async function getNurseryProfileInput(): Promise<NurseryProfileInput | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const p = await prisma.nurseryProfile.findUnique({where: {userId: user.id}});
  if (!p) return null;

  return {
    nurseryName: p.nurseryName,
    area: p.area,
    address: p.address ?? '',
    contactName: p.contactName,
    phone: p.phone ?? '',
    concept: p.concept ?? '',
    policy: p.policy ?? '',
    isPublished: p.isPublished,
  };
}

// Summary for the nursery dashboard. Job / application counts are real queries
// that return 0 until the posting/engagement verticals create any rows.
export async function getNurseryDashboard(): Promise<NurseryDashboard> {
  const user = await getCurrentUser();
  const profile = user
    ? await prisma.nurseryProfile.findUnique({where: {userId: user.id}})
    : null;

  if (!profile) {
    return {
      hasProfile: false,
      nurseryName: null,
      isPublished: false,
      openJobCount: 0,
      newApplicationCount: 0,
    };
  }

  const [openJobCount, newApplicationCount] = await Promise.all([
    prisma.jobPosting.count({
      where: {nurseryId: profile.id, status: 'OPEN'},
    }),
    prisma.engagement.count({where: {job: {nurseryId: profile.id}}}),
  ]);

  return {
    hasProfile: true,
    nurseryName: profile.nurseryName,
    isPublished: profile.isPublished,
    openJobCount,
    newApplicationCount,
  };
}

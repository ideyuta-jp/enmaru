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

// Assemble a nursery's public detail (profile + open postings + rating and
// published reviews). Shared by the public read and the owner preview so both
// render exactly the same projection. Independent queries run together to cut
// round-trips.
async function buildNurseryDetail(n: {
  id: string;
  nurseryName: string;
  area: string;
  concept: string | null;
  policy: string | null;
}): Promise<PublicNurseryDetail> {
  const [rating, jobPostings, reviews] = await Promise.all([
    getNurseryRating(n.id),
    listOpenJobsByNursery(n.id),
    listPublishedNurseryReviews(n.id),
  ]);

  return {
    id: n.id,
    nurseryName: n.nurseryName,
    area: n.area,
    concept: n.concept,
    policy: n.policy,
    rating,
    jobPostings,
    reviews,
  };
}

// The nursery detail page's data, scoped to who is viewing. A published nursery
// is visible to anyone; an unpublished one is visible only to its owner, as a
// preview before publishing (see #47). Returns null when the nursery does not
// exist, or it is unpublished and the viewer is not its owner — the page maps
// that to notFound. `isOwnerPreview` lets the page flag the not-yet-public state.
export async function getNurseryDetailForViewer(
  id: string,
): Promise<{detail: PublicNurseryDetail; isOwnerPreview: boolean} | null> {
  const n = await prisma.nurseryProfile.findUnique({where: {id}});
  if (!n) return null;

  if (n.isPublished) {
    return {detail: await buildNurseryDetail(n), isOwnerPreview: false};
  }

  const user = await getCurrentUser();
  if (!user || n.userId !== user.id) return null;
  return {detail: await buildNurseryDetail(n), isOwnerPreview: true};
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
      id: null,
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
    id: profile.id,
    nurseryName: profile.nurseryName,
    isPublished: profile.isPublished,
    openJobCount,
    newApplicationCount,
  };
}

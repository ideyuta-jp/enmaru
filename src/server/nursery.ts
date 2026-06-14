import {prisma} from '@/lib/prisma';
import {getCurrentUser} from '@/server/auth';
import {listOpenJobsByNursery} from '@/server/job';
import type {
  NurseryDashboard,
  NurseryProfileInput,
  PublicNursery,
  PublicNurseryDetail,
} from '@/types/Nursery';

// Published nurseries for the public list. Maps to the public projection only —
// address / phone / contactName are never included (personal-info boundary).
// rating is null for now; it is computed from published reviews in the review
// vertical.
export async function listPublishedNurseries(): Promise<PublicNursery[]> {
  const nurseries = await prisma.nurseryProfile.findMany({
    where: {isPublished: true},
    orderBy: {createdAt: 'desc'},
  });

  return nurseries.map((n) => ({
    id: n.id,
    nurseryName: n.nurseryName,
    area: n.area,
    concept: n.concept,
    policy: n.policy,
    rating: null,
  }));
}

// One published nursery's public detail. Only the profile portion is wired here;
// jobPostings / reviews / rating are populated by the posting and review
// verticals and are empty until then.
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
    rating: null,
    jobPostings: await listOpenJobsByNursery(n.id),
    reviews: [],
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

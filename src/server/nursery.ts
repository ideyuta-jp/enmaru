import type {NurseryProfile} from '@/generated/prisma/client';
import {prisma} from '@/lib/prisma';
import {getObjectStream} from '@/lib/storage';
import {getCurrentUser, requireRole} from '@/server/auth';
import {listOpenJobsByNursery} from '@/server/job';
import {isUniqueViolation} from '@/server/prisma-error';
import {
  getNurseryRating,
  getNurseryRatings,
  listPublishedNurseryReviews,
} from '@/server/review';
import type {
  NurseryDashboard,
  NurseryProfileInput,
  NurseryRating,
  PublicNursery,
  PublicNurseryDetail,
} from '@/types/Nursery';
import {UserRole} from '@/types/User';

type NurseryPublicFields = Pick<
  NurseryProfile,
  | 'id'
  | 'nurseryName'
  | 'prefecture'
  | 'city'
  | 'featureTags'
  | 'featureNote'
  | 'receptionTags'
  | 'receptionNote'
  | 'joinReason'
  | 'idealPartner'
  | 'additionalNotes'
  | 'homepageUrl'
  | 'instagramUrl'
  | 'twitterUrl'
  | 'facebookUrl'
  | 'otherSnsUrl'
>;

function toPublicNursery(
  n: NurseryPublicFields,
  rating: NurseryRating | null,
  mainPhotoId: string | null = null,
): PublicNursery {
  return {
    id: n.id,
    nurseryName: n.nurseryName,
    prefecture: n.prefecture,
    city: n.city,
    featureTags: n.featureTags ?? [],
    featureNote: n.featureNote,
    receptionTags: n.receptionTags ?? [],
    receptionNote: n.receptionNote,
    joinReason: n.joinReason,
    idealPartner: n.idealPartner,
    additionalNotes: n.additionalNotes,
    homepageUrl: n.homepageUrl,
    instagramUrl: n.instagramUrl,
    twitterUrl: n.twitterUrl,
    facebookUrl: n.facebookUrl,
    otherSnsUrl: n.otherSnsUrl,
    rating,
    mainPhotoId,
  };
}

// Published nurseries for the public list. Maps to the public projection only —
// postalCode / addressLine / phone / contactName are never included
// (personal-info boundary; prefecture / city are public).
// Ratings come from published reviews, fetched in bulk to avoid an N+1.
export async function listPublishedNurseries(): Promise<PublicNursery[]> {
  const nurseries = await prisma.nurseryProfile.findMany({
    where: {isPublished: true},
    orderBy: {createdAt: 'desc'},
  });

  const ids = nurseries.map((n) => n.id);
  const [ratings, mainPhotos] = await Promise.all([
    getNurseryRatings(ids),
    prisma.nurseryPhoto.findMany({
      where: {nurseryId: {in: ids}, isMain: true},
      select: {id: true, nurseryId: true},
    }),
  ]);

  const mainPhotoMap = new Map(mainPhotos.map((p) => [p.nurseryId, p.id]));

  return nurseries.map((n) =>
    toPublicNursery(
      n,
      ratings.get(n.id) ?? null,
      mainPhotoMap.get(n.id) ?? null,
    ),
  );
}

// Assemble a nursery's public detail (profile + open postings + rating and
// published reviews). Shared by the public read and the owner preview so both
// render exactly the same projection. Independent queries run together to cut
// round-trips.
async function buildNurseryDetail(
  n: NurseryPublicFields,
): Promise<PublicNurseryDetail> {
  const [rating, jobPostings, reviews, allPhotos] = await Promise.all([
    getNurseryRating(n.id),
    listOpenJobsByNursery(n.id),
    listPublishedNurseryReviews(n.id),
    prisma.nurseryPhoto.findMany({
      where: {nurseryId: n.id},
      select: {id: true, isMain: true, order: true},
      orderBy: {order: 'asc'},
    }),
  ]);

  const mainPhoto = allPhotos.find((p) => p.isMain);
  const subPhotos = allPhotos.filter((p) => !p.isMain);

  return {
    ...toPublicNursery(n, rating, mainPhoto?.id ?? null),
    jobPostings,
    reviews,
    photos: subPhotos.map((p) => ({id: p.id})),
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

// File bytes for the photo-serving route. A published nursery's photos are
// visible to anyone; an unpublished nursery's photos only to its owner (the
// profile edit page and the pre-publish preview), mirroring the visibility
// rule of getNurseryDetailForViewer. Returns null when the photo does not
// exist or the viewer is not allowed — the route maps that to 404 (no
// existence disclosure). isPubliclyVisible lets the route pick a cache policy.
export async function getAccessibleNurseryPhotoFile(id: string): Promise<{
  body: ReadableStream;
  contentType: string;
  isPubliclyVisible: boolean;
} | null> {
  const photo = await prisma.nurseryPhoto.findUnique({
    where: {id},
    include: {nursery: {select: {isPublished: true, userId: true}}},
  });
  if (!photo || !photo.fileKey) return null;

  if (!photo.nursery.isPublished) {
    const user = await getCurrentUser();
    if (!user || photo.nursery.userId !== user.id) return null;
  }

  try {
    const file = await getObjectStream(photo.fileKey);
    return {...file, isPubliclyVisible: photo.nursery.isPublished};
  } catch {
    // Row exists but the R2 object is missing (drift) — treat as not found so
    // the route keeps its 404-for-everything contract instead of 500-ing.
    return null;
  }
}

// Creates the current nursery's profile row as an empty draft if none exists.
// A photo upload can arrive before the profile has ever been saved — the photo
// needs the row up front (NurseryPhoto.nurseryId is a required FK and the R2
// key embeds the profile id), so uploadNurseryPhoto ensures it on demand
// (#143). The draft is invisible to seekers — isPublished stays false until an
// explicit save flips it — and an existing row is never modified here.
export async function ensureNurseryProfile(): Promise<void> {
  const user = await requireRole([UserRole.NURSERY]);

  const existing = await prisma.nurseryProfile.findUnique({
    where: {userId: user.id},
    select: {id: true},
  });
  if (existing) return;

  try {
    await prisma.nurseryProfile.create({
      data: {userId: user.id, nurseryName: '', contactName: ''},
    });
  } catch (e) {
    // Two pre-save uploads can race here (a main and a sub photo dropped in
    // quick succession): both pass the existence check above and the loser's
    // create hits the unique userId constraint. The row exists either way —
    // which is all this function promises — so treat that as success instead
    // of failing the upload.
    if (!isUniqueViolation(e)) throw e;
  }
}

// Whether the nursery has actually saved its profile, as opposed to the row
// being an empty draft auto-created by ensureNurseryProfile. Blank nurseryName
// can only mean the draft — saveNurseryProfile rejects it — so this predicate
// is the single source of truth for the draft-vs-saved distinction; check it
// instead of mere row existence wherever "has a profile" means "saved one".
export function isSavedNurseryProfile(
  profile: Pick<NurseryProfile, 'nurseryName'>,
): boolean {
  return profile.nurseryName !== '';
}

// The current nursery's profile with photo data for the profile edit page.
export async function getNurseryProfileWithPhotos(): Promise<{
  input: NurseryProfileInput;
  id: string;
  mainPhoto: {id: string; order: number} | null;
  subPhotos: {id: string; order: number}[];
} | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const p = await prisma.nurseryProfile.findUnique({
    where: {userId: user.id},
    include: {
      photos: {
        select: {id: true, isMain: true, order: true},
        orderBy: {order: 'asc'},
      },
    },
  });
  if (!p) return null;

  const mainPhoto = p.photos.find((ph) => ph.isMain) ?? null;
  const subPhotos = p.photos.filter((ph) => !ph.isMain);

  return {
    id: p.id,
    mainPhoto: mainPhoto ? {id: mainPhoto.id, order: mainPhoto.order} : null,
    subPhotos: subPhotos.map((ph) => ({id: ph.id, order: ph.order})),
    input: {
      nurseryName: p.nurseryName,
      postalCode: p.postalCode ?? '',
      prefecture: p.prefecture ?? '',
      city: p.city ?? '',
      addressLine: p.addressLine ?? '',
      phone: p.phone ?? '',
      contactName: p.contactName,
      homepageUrl: p.homepageUrl ?? '',
      instagramUrl: p.instagramUrl ?? '',
      twitterUrl: p.twitterUrl ?? '',
      facebookUrl: p.facebookUrl ?? '',
      otherSnsUrl: p.otherSnsUrl ?? '',
      featureTags: p.featureTags ?? [],
      featureNote: p.featureNote ?? '',
      receptionTags: p.receptionTags ?? [],
      receptionNote: p.receptionNote ?? '',
      joinReason: p.joinReason ?? '',
      idealPartner: p.idealPartner ?? '',
      additionalNotes: p.additionalNotes ?? '',
      isPublished: p.isPublished,
    },
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
    postalCode: p.postalCode ?? '',
    prefecture: p.prefecture ?? '',
    city: p.city ?? '',
    addressLine: p.addressLine ?? '',
    phone: p.phone ?? '',
    contactName: p.contactName,
    homepageUrl: p.homepageUrl ?? '',
    instagramUrl: p.instagramUrl ?? '',
    twitterUrl: p.twitterUrl ?? '',
    facebookUrl: p.facebookUrl ?? '',
    otherSnsUrl: p.otherSnsUrl ?? '',
    featureTags: p.featureTags ?? [],
    featureNote: p.featureNote ?? '',
    receptionTags: p.receptionTags ?? [],
    receptionNote: p.receptionNote ?? '',
    joinReason: p.joinReason ?? '',
    idealPartner: p.idealPartner ?? '',
    additionalNotes: p.additionalNotes ?? '',
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

  // An auto-created draft keeps the dashboard in its onboarding state (#143).
  if (!profile || !isSavedNurseryProfile(profile)) {
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

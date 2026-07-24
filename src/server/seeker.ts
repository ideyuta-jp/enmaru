import {prisma} from '@/lib/prisma';
import {missingRequiredDocuments} from '@/server/application';
import {getCurrentUser, requireRole} from '@/server/auth';
import {REQUIRED_SEEKER_DOCUMENT_TYPES} from '@/types/Document';
import type {
  PublicSeeker,
  PublicSeekerDetail,
  SeekerDashboard,
  SeekerProfileInput,
} from '@/types/Seeker';
import {UserRole} from '@/types/User';

// The current seeker's profile as form-ready input, or null if they have no
// profile yet. Maps the stored row (nullable text) to the form shape (empty
// strings). Used by both the edit form and the read-only profile preview page.
export async function getSeekerProfileInput(): Promise<SeekerProfileInput | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const p = await prisma.seekerProfile.findUnique({where: {userId: user.id}});
  if (!p) return null;

  return {
    realName: p.realName,
    displayName: p.displayName,
    preferredPrefecture: p.preferredPrefecture ?? '',
    preferredCity: p.preferredCity ?? '',
    licenses: p.licenses,
    experienceYears: p.experienceYears ?? '',
    blankYears: p.blankYears ?? '',
    skills: p.skills,
    skillsNote: p.skillsNote ?? '',
    experience: p.experience ?? '',
    preferredPeriod: p.preferredPeriod,
    preferredTimeSlot: p.preferredTimeSlot,
    preferredAgeGroups: p.preferredAgeGroups,
    values: p.values ?? '',
    bio: p.bio ?? '',
    messageToNursery: p.messageToNursery ?? '',
    ngConditions: p.ngConditions,
    ngConditionsNote: p.ngConditionsNote ?? '',
    isPublished: p.isPublished,
  };
}

// Row -> public card projection. The whole point of this function is the
// omission: only public fields are copied out, so realName / blankYears /
// experience / ngConditions* physically cannot reach a nursery through the
// browse. Accepts the full profile row (extra fields are dropped by the
// explicit copy). Shared by the list and detail reads so both project the same
// public subset.
function toPublicSeeker(p: {
  id: string;
  displayName: string;
  preferredPrefecture: string | null;
  preferredCity: string | null;
  licenses: string[];
  experienceYears: string | null;
  skills: string[];
  preferredAgeGroups: string[];
}): PublicSeeker {
  return {
    id: p.id,
    displayName: p.displayName,
    preferredPrefecture: p.preferredPrefecture,
    preferredCity: p.preferredCity,
    licenses: p.licenses,
    experienceYears: p.experienceYears,
    skills: p.skills,
    preferredAgeGroups: p.preferredAgeGroups,
  };
}

// Published seekers for the nursery-facing browse list. Nursery-only: guarded
// here as defense-in-depth on top of the (nursery) route-group layout, since
// this returns other users' profile data. Only isPublished profiles, newest
// first. Public projection only (see toPublicSeeker / the SeekerProfile field
// comments) — the private boundary mirrors listPublishedNurseries in nursery.ts.
export async function listPublishedSeekers(): Promise<PublicSeeker[]> {
  await requireRole([UserRole.NURSERY]);
  const seekers = await prisma.seekerProfile.findMany({
    where: {isPublished: true},
    orderBy: {createdAt: 'desc'},
  });
  return seekers.map(toPublicSeeker);
}

// One published seeker's public detail for the nursery-facing detail page.
// Nursery-only (same rationale as listPublishedSeekers). Returns null when the
// profile does not exist or is not published, so the page maps both to notFound
// without disclosing existence (mirrors getNurseryDetailForViewer's contract,
// minus the owner-preview branch — a nursery is never a seeker's owner).
export async function getPublishedSeekerDetail(
  id: string,
): Promise<PublicSeekerDetail | null> {
  await requireRole([UserRole.NURSERY]);
  const p = await prisma.seekerProfile.findUnique({where: {id}});
  if (!p || !p.isPublished) return null;

  return {
    ...toPublicSeeker(p),
    skillsNote: p.skillsNote,
    preferredPeriod: p.preferredPeriod,
    preferredTimeSlot: p.preferredTimeSlot,
    values: p.values,
    bio: p.bio,
    messageToNursery: p.messageToNursery,
  };
}

// Summary for the seeker dashboard. Engagement-based counts are real queries;
// they return 0 until the posting/engagement verticals create any rows.
export async function getSeekerDashboard(): Promise<SeekerDashboard> {
  const user = await getCurrentUser();
  const profile = user
    ? await prisma.seekerProfile.findUnique({where: {userId: user.id}})
    : null;

  if (!profile) {
    return {
      hasProfile: false,
      displayName: null,
      applicationCount: 0,
      activeEngagementCount: 0,
      hasMissingRequiredDocuments: false,
      hasPendingDocuments: false,
    };
  }

  const [
    applicationCount,
    activeEngagementCount,
    missingDocuments,
    pendingCount,
  ] = await Promise.all([
    prisma.engagement.count({where: {seekerId: profile.id}}),
    prisma.engagement.count({
      where: {seekerId: profile.id, status: {in: ['MATCHED', 'WORKING']}},
    }),
    missingRequiredDocuments(profile.id, REQUIRED_SEEKER_DOCUMENT_TYPES),
    prisma.seekerDocument.count({
      where: {seekerId: profile.id, status: 'PENDING'},
    }),
  ]);

  return {
    hasProfile: true,
    displayName: profile.displayName,
    applicationCount,
    activeEngagementCount,
    hasMissingRequiredDocuments: missingDocuments.length > 0,
    hasPendingDocuments: pendingCount > 0,
  };
}

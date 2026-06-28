import {prisma} from '@/lib/prisma';
import {missingRequiredDocuments} from '@/server/application';
import {getCurrentUser} from '@/server/auth';
import {REQUIRED_SEEKER_DOCUMENT_TYPES} from '@/types/Document';
import type {SeekerDashboard, SeekerProfileInput} from '@/types/Seeker';

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
    license: p.license,
    blankYears: p.blankYears ?? '',
    preferredArea: p.preferredArea ?? '',
    preferredStyle: p.preferredStyle,
    bio: p.bio ?? '',
    experience: p.experience ?? '',
    skills: p.skills ?? '',
    ngConditions: p.ngConditions ?? '',
    isPublished: p.isPublished,
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

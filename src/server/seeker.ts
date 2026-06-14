import {prisma} from '@/lib/prisma';
import {getCurrentUser} from '@/server/auth';
import type {SeekerDashboard, SeekerProfileInput} from '@/types/Seeker';

// The current seeker's profile as form-ready input, or null if they have no
// profile yet. Maps the stored row (nullable text) to the form shape (empty
// strings), so the page can hand it straight to the edit form.
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
    };
  }

  const [applicationCount, activeEngagementCount] = await Promise.all([
    prisma.engagement.count({where: {seekerId: profile.id}}),
    prisma.engagement.count({
      where: {seekerId: profile.id, status: {in: ['MATCHED', 'WORKING']}},
    }),
  ]);

  return {
    hasProfile: true,
    displayName: profile.displayName,
    applicationCount,
    activeEngagementCount,
  };
}

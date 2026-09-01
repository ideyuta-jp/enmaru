import {prisma} from '@/lib/prisma';
import {requireRole} from '@/server/auth';
import {SeekerDocumentStatus} from '@/types/Document';
import {
  AdminUserFilter,
  AdminUserSort,
  deriveProfileState,
  dormantCutoff,
  type AdminUser,
  UserRole,
} from '@/types/User';
import type {Prisma} from '@/generated/prisma/client';

// How many accounts the admin list loads. Bounded from the start: accounts are
// never deleted, so an unbounded query here would grow forever — the mistake
// listAllMatches has to be walked back from (#41).
export const ADMIN_USER_LIST_LIMIT = 200;

// Stamp the moment a sign-in completed. Called from the Logto callback, the one
// place every sign-in passes through. Best-effort by design: a failure here must
// never break the sign-in that already succeeded, so it is logged and swallowed
// (same stance as server/notification.ts's notify).
export async function recordSignIn(userId: string): Promise<void> {
  try {
    await prisma.user.update({
      where: {id: userId},
      data: {lastSignInAt: new Date()},
    });
  } catch (e) {
    console.error('recordSignIn: failed to stamp lastSignInAt', {userId, e});
  }
}

// Filter -> Prisma where-fragment. Kept beside the query so the filter's meaning
// lives in one place; DORMANT deliberately excludes users whose lastSignInAt is
// null (missing data, not evidence of absence — see types/User.ts).
function whereForFilter(
  filter: AdminUserFilter | undefined,
  now: Date,
): Prisma.UserWhereInput | undefined {
  switch (filter) {
    case AdminUserFilter.SEEKER:
      return {role: UserRole.SEEKER};
    case AdminUserFilter.NURSERY:
      return {role: UserRole.NURSERY};
    case AdminUserFilter.ADMIN:
      return {role: UserRole.ADMIN};
    case AdminUserFilter.DOCUMENT_PENDING:
      return {
        seekerProfile: {
          documents: {some: {status: SeekerDocumentStatus.PENDING}},
        },
      };
    case AdminUserFilter.DORMANT:
      return {lastSignInAt: {lt: dormantCutoff(now)}};
    default:
      return undefined;
  }
}

// Engagement tallies for one party (a seeker profile or a nursery profile).
interface EngagementStats {
  engagementCount: number;
  completedCount: number;
  lastWorkDate: string | null;
}

const NO_ENGAGEMENTS: EngagementStats = {
  engagementCount: 0,
  completedCount: 0,
  lastWorkDate: null,
};

// Engagement tallies keyed by profile id, for both sides at once: a seeker
// reaches its engagements directly, a nursery through its postings. One query
// for the whole page rather than one per row (the N+1 the nursery ratings query
// avoids the same way).
async function engagementStatsByProfile(
  seekerIds: string[],
  nurseryIds: string[],
): Promise<Map<string, EngagementStats>> {
  const stats = new Map<string, EngagementStats>();
  if (seekerIds.length === 0 && nurseryIds.length === 0) return stats;

  const engagements = await prisma.engagement.findMany({
    where: {
      OR: [{seekerId: {in: seekerIds}}, {job: {nurseryId: {in: nurseryIds}}}],
    },
    select: {
      seekerId: true,
      status: true,
      job: {select: {nurseryId: true, workDate: true}},
    },
  });

  const tally = (profileId: string, completed: boolean, workDate: string) => {
    const cur = stats.get(profileId) ?? {...NO_ENGAGEMENTS};
    cur.engagementCount += 1;
    if (completed) {
      cur.completedCount += 1;
      // 'YYYY-MM-DD' compares lexicographically (utils/date.ts's convention).
      if (!cur.lastWorkDate || workDate > cur.lastWorkDate) {
        cur.lastWorkDate = workDate;
      }
    }
    stats.set(profileId, cur);
  };

  for (const e of engagements) {
    const completed = e.status === 'COMPLETED';
    const workDate = e.job.workDate.toISOString().slice(0, 10);
    tally(e.seekerId, completed, workDate);
    tally(e.job.nurseryId, completed, workDate);
  }
  return stats;
}

// Verified-document tallies per seeker profile, in one grouped query.
async function documentCountsBySeeker(
  seekerIds: string[],
): Promise<Map<string, AdminUser['documentCounts']>> {
  const counts = new Map<string, AdminUser['documentCounts']>();
  if (seekerIds.length === 0) return counts;

  const grouped = await prisma.seekerDocument.groupBy({
    by: ['seekerId', 'status'],
    where: {seekerId: {in: seekerIds}},
    _count: {_all: true},
  });

  for (const row of grouped) {
    const cur = counts.get(row.seekerId) ?? {
      approved: 0,
      pending: 0,
      rejected: 0,
    };
    const n = row._count._all;
    if (row.status === SeekerDocumentStatus.APPROVED) cur.approved += n;
    else if (row.status === SeekerDocumentStatus.PENDING) cur.pending += n;
    else cur.rejected += n;
    counts.set(row.seekerId, cur);
  }
  return counts;
}

// Every account for the admin user list, with the state an operator needs to see
// at a glance: how far the profile got, what documents are waiting, whether LINE
// can reach them, and how much work they have actually done. Read-only — role
// changes stay with scripts/grant-admin.mjs and withdrawal with #105. Guarded to
// ADMIN, which is also what makes showing real names and emails here correct.
export async function listAllUsers(options?: {
  filter?: AdminUserFilter;
  sort?: AdminUserSort;
}): Promise<AdminUser[]> {
  await requireRole([UserRole.ADMIN]);

  const users = await prisma.user.findMany({
    where: whereForFilter(options?.filter, new Date()),
    include: {
      seekerProfile: {
        select: {
          id: true,
          isPublished: true,
          displayName: true,
          realName: true,
        },
      },
      nurseryProfile: {
        select: {
          id: true,
          isPublished: true,
          nurseryName: true,
          contactName: true,
        },
      },
    },
    // Never-signed-in rows sort last either way: they carry no timestamp to
    // rank, and burying them keeps the head of the list meaningful.
    orderBy:
      options?.sort === AdminUserSort.LAST_SIGN_IN
        ? {lastSignInAt: {sort: 'desc', nulls: 'last'}}
        : {createdAt: 'desc'},
    take: ADMIN_USER_LIST_LIMIT,
  });

  const seekerIds = users.flatMap((u) =>
    u.seekerProfile ? [u.seekerProfile.id] : [],
  );
  const nurseryIds = users.flatMap((u) =>
    u.nurseryProfile ? [u.nurseryProfile.id] : [],
  );
  const [engagementStats, documentCounts] = await Promise.all([
    engagementStatsByProfile(seekerIds, nurseryIds),
    documentCountsBySeeker(seekerIds),
  ]);

  return users.map((u) => {
    const profile = u.seekerProfile ?? u.nurseryProfile ?? null;
    const profileId = profile?.id;
    return {
      id: u.id,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
      name:
        u.seekerProfile?.displayName ?? u.nurseryProfile?.nurseryName ?? null,
      realName:
        u.seekerProfile?.realName ?? u.nurseryProfile?.contactName ?? null,
      profileState: deriveProfileState(profile),
      createdAt: u.createdAt.toISOString(),
      lastSignInAt: u.lastSignInAt?.toISOString() ?? null,
      agreedAt: u.agreedAt?.toISOString() ?? null,
      lineLinked: u.lineUserId !== null,
      documentCounts: (u.seekerProfile &&
        documentCounts.get(u.seekerProfile.id)) || {
        approved: 0,
        pending: 0,
        rejected: 0,
      },
      ...(profileId
        ? (engagementStats.get(profileId) ?? NO_ENGAGEMENTS)
        : NO_ENGAGEMENTS),
    };
  });
}

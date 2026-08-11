import {prisma} from '@/lib/prisma';
import {requireRole} from '@/server/auth';
import {JobState, type Job} from '@/types/Job';
import {UserRole} from '@/types/User';
import {todayInJst} from '@/utils/date';
import type {JobPosting} from '@/generated/prisma/client';

// A posting's availability, derived from the three independent facts instead
// of a stored status (#185): published is the nursery's choice (the one stored
// bit), matched is the Engagement's existence, expired is the calendar.
// Precedence when several apply: matched and expired are permanent facts while
// unpublished is reversible, and matched is the one the nursery acted on — so
// MATCHED > EXPIRED > UNPUBLISHED. Pure and exported for unit tests; dates are
// 'YYYY-MM-DD' strings compared lexicographically (the codebase-wide
// convention, see utils/date.ts).
export function deriveJobState(args: {
  isPublished: boolean;
  matched: boolean;
  workDate: string;
  todayJst: string;
}): JobState {
  if (args.matched) return JobState.MATCHED;
  // A posting stays open through its work date itself; it expires the day
  // after (#185's agreed cutoff).
  if (args.workDate < args.todayJst) return JobState.EXPIRED;
  if (!args.isPublished) return JobState.UNPUBLISHED;
  return JobState.OPEN;
}

// Prisma where-fragment for "still accepts applications" — the query-side
// twin of deriveJobState's OPEN, shared by every listing/count that shows
// only applyable postings. workDate is stored as UTC midnight of its calendar
// date (created via new Date('YYYY-MM-DD')) and new Date(todayInJst()) is UTC
// midnight of today's JST date, so gte keeps postings through their work date.
export function acceptingJobWhere() {
  return {
    isPublished: true,
    engagement: null,
    workDate: {gte: new Date(todayInJst())},
  };
}

// JobPosting row (+ its Engagement, for the matched fact) -> display Job
// (DateTime -> 'YYYY-MM-DD').
function toJob(p: JobPosting & {engagement: {id: string} | null}): Job {
  const workDate = p.workDate.toISOString().slice(0, 10);
  return {
    id: p.id,
    title: p.title,
    workContentTags: p.workContentTags,
    workContentNote: p.workContentNote,
    workDate,
    workTimeStart: p.workTimeStart,
    workTimeEnd: p.workTimeEnd,
    hourlyWage: p.hourlyWage,
    transportationExpense: p.transportationExpense,
    transportationExpenseNote: p.transportationExpenseNote,
    dresscode: p.dresscode,
    targetPersonTags: p.targetPersonTags,
    targetPersonNote: p.targetPersonNote,
    remarks: p.remarks,
    requiredDocuments: p.requiredDocuments,
    state: deriveJobState({
      isPublished: p.isPublished,
      matched: p.engagement !== null,
      workDate,
      todayJst: todayInJst(),
    }),
    isPublished: p.isPublished,
  };
}

// The signed-in nursery's own postings (newest first). Guarded to NURSERY; empty
// until the nursery has a profile (a posting belongs to a NurseryProfile).
export async function listNurseryJobs(): Promise<Job[]> {
  const user = await requireRole([UserRole.NURSERY]);
  const profile = await prisma.nurseryProfile.findUnique({
    where: {userId: user.id},
  });
  if (!profile) return [];

  const jobs = await prisma.jobPosting.findMany({
    where: {nurseryId: profile.id},
    include: {engagement: {select: {id: true}}},
    orderBy: {postedAt: 'desc'},
  });
  return jobs.map(toJob);
}

// One of the signed-in nursery's postings, scoped by ownership (returns null if
// it is not theirs). Used to prefill the edit form.
export async function getNurseryJob(id: string): Promise<Job | null> {
  const user = await requireRole([UserRole.NURSERY]);
  const job = await prisma.jobPosting.findFirst({
    where: {id, nursery: {userId: user.id}},
    include: {engagement: {select: {id: true}}},
  });
  return job ? toJob(job) : null;
}

// Public: a nursery's postings that still accept applications, for the public
// nursery detail page.
export async function listOpenJobsByNursery(nurseryId: string): Promise<Job[]> {
  const jobs = await prisma.jobPosting.findMany({
    where: {nurseryId, ...acceptingJobWhere()},
    include: {engagement: {select: {id: true}}},
    orderBy: {workDate: 'asc'},
  });
  return jobs.map(toJob);
}

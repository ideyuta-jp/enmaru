import {prisma} from '@/lib/prisma';
import {requireRole} from '@/server/auth';
import type {Job} from '@/types/Job';
import {UserRole} from '@/types/User';
import type {JobPosting} from '@/generated/prisma/client';

// JobPosting row -> display Job (DateTime -> 'YYYY-MM-DD').
function toJob(p: JobPosting): Job {
  return {
    id: p.id,
    title: p.title,
    workContentTags: p.workContentTags,
    workContentNote: p.workContentNote,
    workDate: p.workDate.toISOString().slice(0, 10),
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
    status: p.status,
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
  });
  return job ? toJob(job) : null;
}

// Public: a nursery's open postings, for the public nursery detail page.
export async function listOpenJobsByNursery(nurseryId: string): Promise<Job[]> {
  const jobs = await prisma.jobPosting.findMany({
    where: {nurseryId, status: 'OPEN'},
    orderBy: {workDate: 'asc'},
  });
  return jobs.map(toJob);
}

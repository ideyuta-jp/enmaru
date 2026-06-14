// A spot-work posting created by a nursery.
export type JobStatus = 'OPEN' | 'CLOSED';

// Status values, so call sites reference these instead of bare string literals
// (same type+value name pattern as UserRole).
export const JobStatus = {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
} as const;

export interface Job {
  id: string;
  title: string;
  workContent: string;
  // ISO date string (YYYY-MM-DD). Kept as a string so the type stays wire-shaped
  // and tier-neutral; format for display at the edge.
  workDate: string;
  // 'HH:mm'
  workTimeStart: string;
  workTimeEnd: string;
  hourlyWage: number | null;
  targetPerson: string | null;
  remarks: string | null;
  status: JobStatus;
}

// The editable shape of a posting — what the create/edit form holds and sends.
// All text fields are plain strings (hourlyWage too, empty = unset) so the form
// can bind directly; the server parses/validates and maps empty to null.
export interface JobInput {
  title: string;
  workContent: string;
  workDate: string; // 'YYYY-MM-DD'
  workTimeStart: string; // 'HH:mm'
  workTimeEnd: string;
  hourlyWage: string;
  targetPerson: string;
  remarks: string;
}

export const EMPTY_JOB: JobInput = {
  title: '',
  workContent: '',
  workDate: '',
  workTimeStart: '',
  workTimeEnd: '',
  hourlyWage: '',
  targetPerson: '',
  remarks: '',
};

// Display posting -> form input (number/null -> string/empty), for prefilling the
// edit form from a loaded posting.
export function toJobInput(job: Job): JobInput {
  return {
    title: job.title,
    workContent: job.workContent,
    workDate: job.workDate,
    workTimeStart: job.workTimeStart,
    workTimeEnd: job.workTimeEnd,
    hourlyWage: job.hourlyWage?.toString() ?? '',
    targetPerson: job.targetPerson ?? '',
    remarks: job.remarks ?? '',
  };
}

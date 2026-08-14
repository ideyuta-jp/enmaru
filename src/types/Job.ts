import {SeekerDocumentType} from '@/types/Document';
import {toMinutes} from '@/utils/date';

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
  // Tag selection + free note, kept separate so free text can never collide
  // with tag parsing. Compose for display with formatTagsWithNote.
  workContentTags: string[];
  workContentNote: string | null;
  // ISO date string (YYYY-MM-DD). Kept as a string so the type stays wire-shaped
  // and tier-neutral; format for display at the edge.
  workDate: string;
  // 'HH:mm'
  workTimeStart: string;
  workTimeEnd: string;
  hourlyWage: number | null;
  // true = paid, false = not paid, null = unset.
  transportationExpense: boolean | null;
  transportationExpenseNote: string | null;
  dresscode: string | null;
  // Same tags+note split as workContent (both parts optional).
  targetPersonTags: string[];
  targetPersonNote: string | null;
  remarks: string | null;
  // Document types that must be verified before a seeker may apply.
  requiredDocuments: SeekerDocumentType[];
  status: JobStatus;
}

// Compose a tags+note pair into one string for read-only display. The result
// is never parsed back, so the delimiter is purely presentational.
export function formatTagsWithNote(
  tags: string[],
  note: string | null,
): string {
  return [...tags, ...(note && note.trim() ? [note] : [])].join('・');
}

// Absolute instant of a posting's scheduled start. `workDate` is the stored
// workDate — UTC midnight of the shift's calendar date (created via
// new Date('YYYY-MM-DD'); see acceptingJobWhere in server/job.ts) — or any of
// its string forms ('YYYY-MM-DD' or full ISO), so the calendar date is read
// back with UTC getters, matching every other reader of this field.
// `workTimeStart` is a JST 'HH:mm' wall-clock time on that date. JST is a
// fixed UTC+9 with no DST, so the UTC instant is just the wall clock minus 9
// hours — expressed in minutes so Date.UTC normalizes the carry.
export function scheduledStartAt(
  workDate: string | Date,
  workTimeStart: string,
): Date {
  const date = new Date(workDate);
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      0,
      toMinutes(workTimeStart) - 9 * 60,
    ),
  );
}

// The editable shape of a posting — what the create/edit form holds and sends.
// All text fields are plain strings (hourlyWage too) so the form can bind
// directly; the server parses/validates (hourlyWage is required — empty is
// rejected, not mapped to null).
export interface JobInput {
  title: string;
  workContentTags: string[];
  workContentNote: string;
  workDates: string[]; // ['YYYY-MM-DD', ...]
  workTimeStart: string; // 'HH:mm'
  workTimeEnd: string;
  hourlyWage: string;
  transportationExpense: string; // '' | 'yes' | 'no'
  transportationExpenseNote: string;
  dresscode: string;
  targetPersonTags: string[];
  targetPersonNote: string;
  remarks: string;
  requiredDocuments: SeekerDocumentType[];
}

// The form's tri-state radio value <-> the DB's nullable boolean. The form
// side stays stringly-typed for direct radio binding; the DB side keeps a
// Boolean? so invalid values are unrepresentable (same encode/decode-in-types
// pattern as documented in docs/conventions).
export function encodeTransportationExpense(value: string): boolean | null {
  if (value === 'yes') return true;
  if (value === 'no') return false;
  // Anything else (including '') means the radio was never chosen.
  return null;
}

export function decodeTransportationExpense(
  value: boolean | null,
): '' | 'yes' | 'no' {
  if (value === null) return '';
  return value ? 'yes' : 'no';
}

export const EMPTY_JOB: JobInput = {
  title: '',
  workContentTags: [],
  workContentNote: '',
  workDates: [],
  workTimeStart: '',
  workTimeEnd: '',
  hourlyWage: '',
  transportationExpense: '',
  transportationExpenseNote: '',
  dresscode: '',
  targetPersonTags: [],
  targetPersonNote: '',
  remarks: '',
  // The baseline always-required documents; the nursery can add the stool test.
  requiredDocuments: [
    SeekerDocumentType.RESUME,
    SeekerDocumentType.LICENSE,
    SeekerDocumentType.HEALTH_CHECK,
  ],
};

// Display posting -> form input (number/null -> string/empty), for prefilling the
// edit form from a loaded posting.
export function toJobInput(job: Job): JobInput {
  return {
    title: job.title,
    workContentTags: job.workContentTags,
    workContentNote: job.workContentNote ?? '',
    workDates: [job.workDate],
    workTimeStart: job.workTimeStart,
    workTimeEnd: job.workTimeEnd,
    hourlyWage: job.hourlyWage?.toString() ?? '',
    transportationExpense: decodeTransportationExpense(
      job.transportationExpense,
    ),
    transportationExpenseNote: job.transportationExpenseNote ?? '',
    dresscode: job.dresscode ?? '',
    targetPersonTags: job.targetPersonTags,
    targetPersonNote: job.targetPersonNote ?? '',
    remarks: job.remarks ?? '',
    requiredDocuments: job.requiredDocuments,
  };
}

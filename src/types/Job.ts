import {SeekerDocumentType} from '@/types/Document';

// A spot-work posting created by a nursery.
//
// A posting's availability is derived, not stored (#185): OPEN means it still
// accepts applications; the other three name why it doesn't. Derivation lives
// in server/job.ts (deriveJobState) — the client only ever reads the result.
export type JobState = 'OPEN' | 'MATCHED' | 'EXPIRED' | 'UNPUBLISHED';

// State values, so call sites reference these instead of bare string literals
// (same type+value name pattern as UserRole).
export const JobState = {
  OPEN: 'OPEN',
  MATCHED: 'MATCHED',
  EXPIRED: 'EXPIRED',
  UNPUBLISHED: 'UNPUBLISHED',
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
  // Derived availability (see JobState above).
  state: JobState;
  // The nursery's own publish choice — the input the publish toggle edits,
  // carried alongside the derived state so the form can show the toggle's
  // current position even when `state` is decided by a stronger fact.
  isPublished: boolean;
}

// Compose a tags+note pair into one string for read-only display. The result
// is never parsed back, so the delimiter is purely presentational.
export function formatTagsWithNote(
  tags: string[],
  note: string | null,
): string {
  return [...tags, ...(note && note.trim() ? [note] : [])].join('・');
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

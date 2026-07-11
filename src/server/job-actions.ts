'use server';

import {prisma} from '@/lib/prisma';
import {requireRole} from '@/server/auth';
import type {ActionResult} from '@/types/ActionResult';
import {ALL_DOCUMENT_TYPES, type SeekerDocumentType} from '@/types/Document';
import {
  encodeTransportationExpense,
  type JobInput,
  type JobStatus,
} from '@/types/Job';
import {UserRole} from '@/types/User';
import {blankToNull} from '@/utils/string';

// Validate + normalize a posting form. Required fields mirror the non-null
// columns in the schema; hourlyWage is optional and stored as Int? (null = TBD).
function parseJobInput(
  input: JobInput,
): {ok: true; data: ValidJob} | {ok: false; message: string} {
  const title = input.title.trim();
  const workContentNote = input.workContentNote.trim();
  // Work content needs at least one of the tag selection and the free note.
  const hasWorkContent = input.workContentTags.length > 0 || !!workContentNote;
  if (!title || !hasWorkContent || !input.workDate) {
    return {ok: false, message: 'タイトル・勤務内容・勤務日は必須です。'};
  }
  // Backstop for the form's inline past-date check. Compare calendar dates in
  // JST (the service's locale) — the server clock may run in UTC, and
  // toISOString-style UTC dates lag Japan by 9 hours around midnight.
  const todayJst = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
  }).format(new Date());
  if (input.workDate < todayJst) {
    return {ok: false, message: '過去の日付は指定できません。'};
  }
  if (!input.workTimeStart || !input.workTimeEnd) {
    return {ok: false, message: '勤務時間（開始・終了）は必須です。'};
  }
  // Both are zero-padded 'HH:mm', so a lexicographic compare orders them.
  if (input.workTimeStart >= input.workTimeEnd) {
    return {ok: false, message: '終了時刻は開始時刻より後に設定してください'};
  }

  let hourlyWage: number | null = null;
  const wageText = input.hourlyWage.trim();
  if (wageText !== '') {
    const n = Number(wageText);
    if (!Number.isInteger(n) || n < 0) {
      return {ok: false, message: '時給は0以上の整数で入力してください。'};
    }
    hourlyWage = n;
  }

  // Drop any unknown values, then de-duplicate the requested document types.
  const requiredDocuments = [...new Set(input.requiredDocuments)].filter(
    (d): d is SeekerDocumentType => ALL_DOCUMENT_TYPES.includes(d),
  );

  return {
    ok: true,
    data: {
      title,
      workContentTags: input.workContentTags,
      workContentNote: workContentNote || null,
      workDate: new Date(input.workDate),
      workTimeStart: input.workTimeStart,
      workTimeEnd: input.workTimeEnd,
      hourlyWage,
      qualification: input.qualification,
      transportationExpense: encodeTransportationExpense(
        input.transportationExpense,
      ),
      transportationExpenseNote: blankToNull(input.transportationExpenseNote),
      dresscode: blankToNull(input.dresscode),
      targetPersonTags: input.targetPersonTags,
      targetPersonNote: blankToNull(input.targetPersonNote),
      remarks: blankToNull(input.remarks),
      requiredDocuments,
    },
  };
}

interface ValidJob {
  title: string;
  workContentTags: string[];
  workContentNote: string | null;
  workDate: Date;
  workTimeStart: string;
  workTimeEnd: string;
  hourlyWage: number | null;
  qualification: string[];
  transportationExpense: boolean | null;
  transportationExpenseNote: string | null;
  dresscode: string | null;
  targetPersonTags: string[];
  targetPersonNote: string | null;
  remarks: string | null;
  requiredDocuments: SeekerDocumentType[];
}

// Create a posting for the signed-in nursery. Requires a nursery profile (a
// posting belongs to one).
export async function createJob(input: JobInput): Promise<ActionResult> {
  const user = await requireRole([UserRole.NURSERY]);
  const profile = await prisma.nurseryProfile.findUnique({
    where: {userId: user.id},
  });
  if (!profile) {
    return {ok: false, message: '先に園プロフィールを作成してください。'};
  }

  const parsed = parseJobInput(input);
  if (!parsed.ok) return parsed;

  await prisma.jobPosting.create({
    data: {nurseryId: profile.id, ...parsed.data},
  });
  return {ok: true};
}

// Update one of the signed-in nursery's postings (ownership-checked).
export async function updateJob(
  id: string,
  input: JobInput,
): Promise<ActionResult> {
  const user = await requireRole([UserRole.NURSERY]);
  const owned = await prisma.jobPosting.findFirst({
    where: {id, nursery: {userId: user.id}},
    select: {id: true},
  });
  if (!owned) return {ok: false, message: '対象の募集が見つかりません。'};

  const parsed = parseJobInput(input);
  if (!parsed.ok) return parsed;

  await prisma.jobPosting.update({where: {id}, data: parsed.data});
  return {ok: true};
}

// Open/close one of the signed-in nursery's postings (ownership-checked).
export async function setJobStatus(
  id: string,
  status: JobStatus,
): Promise<ActionResult> {
  const user = await requireRole([UserRole.NURSERY]);
  const owned = await prisma.jobPosting.findFirst({
    where: {id, nursery: {userId: user.id}},
    select: {id: true},
  });
  if (!owned) return {ok: false, message: '対象の募集が見つかりません。'};

  await prisma.jobPosting.update({where: {id}, data: {status}});
  return {ok: true};
}

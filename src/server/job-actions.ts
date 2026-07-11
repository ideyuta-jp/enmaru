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
import {toMinutes} from '@/utils/date';
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
  if (!title || !hasWorkContent || input.workDates.length === 0) {
    return {ok: false, message: 'タイトル・勤務内容・勤務日は必須です。'};
  }
  // Backstop for the calendar's disablePast. Compare calendar dates in JST
  // (the service's locale) — the server clock may run in UTC, and
  // toISOString-style UTC dates lag Japan by 9 hours around midnight.
  const todayJst = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
  }).format(new Date());
  if (input.workDates.some((d) => d < todayJst)) {
    return {ok: false, message: '過去の日付は指定できません。'};
  }
  if (!input.workTimeStart || !input.workTimeEnd) {
    return {ok: false, message: '勤務時間（開始・終了）は必須です。'};
  }
  const timeDiff =
    toMinutes(input.workTimeEnd) - toMinutes(input.workTimeStart);
  if (timeDiff <= 0) {
    return {ok: false, message: '終了時刻は開始時刻より後に設定してください'};
  }
  if (timeDiff < 60) {
    return {ok: false, message: '勤務時間は1時間以上に設定してください'};
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

// The date-independent part of a posting; createJob fans it out over the
// selected dates.
interface ValidJob {
  title: string;
  workContentTags: string[];
  workContentNote: string | null;
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

// Create one posting per selected date for the signed-in nursery. Requires a
// nursery profile (a posting belongs to one).
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

  // One posting per selected date — each date is an independent recruitment.
  await prisma.jobPosting.createMany({
    data: input.workDates.map((date) => ({
      nurseryId: profile.id,
      ...parsed.data,
      workDate: new Date(date),
    })),
  });
  return {ok: true, count: input.workDates.length};
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

  // The edit form locks its calendar to one date, but enforce the contract
  // here rather than trusting the UI — extra dates would silently be dropped.
  if (input.workDates.length !== 1) {
    return {ok: false, message: '勤務日は1件のみ指定してください。'};
  }

  const parsed = parseJobInput(input);
  if (!parsed.ok) return parsed;

  await prisma.jobPosting.update({
    where: {id},
    data: {...parsed.data, workDate: new Date(input.workDates[0])},
  });
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

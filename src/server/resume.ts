import {prisma} from '@/lib/prisma';
import {getCurrentUser} from '@/server/auth';
import {
  EMPTY_RESUME,
  MAX_RESUME_DESCRIPTION_LENGTH,
  MAX_RESUME_HISTORY_ENTRIES,
  type ResumeInput,
} from '@/types/Resume';
import {
  isValidBirthDate,
  isValidYearMonth,
  isYearMonthRangeOutOfOrder,
} from '@/utils/date';
import {
  isValidAddressFurigana,
  isValidEmail,
  isValidPhoneNumber,
  isValidPostalCode,
} from '@/utils/string';

// Validate a résumé submission. ResumeForm's date Selects and row cap already
// keep well-formed input from the UI, but this is the authoritative backstop
// saveResume (resume-actions.ts) runs before writing — same relationship as
// parseJobInput/job-actions.ts. Lives here rather than in resume-actions.ts
// because a 'use server' module may only export async server actions.
export function validateResumeInput(
  input: ResumeInput,
): {ok: true} | {ok: false; message: string} {
  if (!isValidBirthDate(input.birthDate)) {
    return {ok: false, message: '生年月日が正しくありません。'};
  }
  if (!isValidPostalCode(input.postalCode)) {
    return {
      ok: false,
      message: '郵便番号は「850-0000」の形式で入力してください。',
    };
  }
  if (!isValidAddressFurigana(input.addressFurigana)) {
    return {ok: false, message: '住所のフリガナはカタカナで入力してください。'};
  }
  if (!isValidPhoneNumber(input.phone)) {
    return {ok: false, message: '電話番号の形式が正しくありません。'};
  }
  if (!isValidEmail(input.email)) {
    return {ok: false, message: 'メールアドレスの形式が正しくありません。'};
  }
  if (
    input.education.length > MAX_RESUME_HISTORY_ENTRIES ||
    input.workHistory.length > MAX_RESUME_HISTORY_ENTRIES
  ) {
    return {
      ok: false,
      message: `学歴・職歴はそれぞれ${MAX_RESUME_HISTORY_ENTRIES}件までです。`,
    };
  }
  for (const e of input.education) {
    if (!e.schoolName.trim()) {
      return {ok: false, message: '学歴には学校名を入力してください。'};
    }
    if (
      !isValidYearMonth(e.startYearMonth) ||
      !isValidYearMonth(e.endYearMonth)
    ) {
      return {ok: false, message: '学歴の年月が正しくありません。'};
    }
    if (isYearMonthRangeOutOfOrder(e.startYearMonth, e.endYearMonth)) {
      return {
        ok: false,
        message: '学歴の卒業年月は入学年月より後にしてください。',
      };
    }
  }
  for (const w of input.workHistory) {
    if (!w.companyName.trim()) {
      return {ok: false, message: '職歴には会社名を入力してください。'};
    }
    if (
      !isValidYearMonth(w.startYearMonth) ||
      !isValidYearMonth(w.endYearMonth)
    ) {
      return {ok: false, message: '職歴の年月が正しくありません。'};
    }
    if (isYearMonthRangeOutOfOrder(w.startYearMonth, w.endYearMonth)) {
      return {
        ok: false,
        message: '職歴の退社年月は入社年月より後にしてください。',
      };
    }
    if (w.description.length > MAX_RESUME_DESCRIPTION_LENGTH) {
      return {
        ok: false,
        message: `業務内容は${MAX_RESUME_DESCRIPTION_LENGTH}文字以内で入力してください。`,
      };
    }
  }
  return {ok: true};
}

// The current seeker's résumé as form-ready input, or null if they have no
// profile yet (a résumé belongs to a SeekerProfile). Maps the stored rows
// (nullable, ordered relations) to the form shape (empty strings/arrays).
// Mirrors getSeekerProfileInput (src/server/seeker.ts).
export async function getResumeInput(): Promise<ResumeInput | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const profile = await prisma.seekerProfile.findUnique({
    where: {userId: user.id},
  });
  if (!profile) return null;

  const resume = await prisma.seekerResume.findUnique({
    where: {seekerId: profile.id},
    include: {
      education: {orderBy: {order: 'asc'}},
      workHistory: {orderBy: {order: 'asc'}},
    },
  });
  if (!resume) {
    // First-time default only — once a résumé row exists its own (possibly
    // blank) email is used as-is below, so an intentional clear stays cleared
    // rather than springing back to the login address on reload.
    return {...EMPTY_RESUME, email: user.email};
  }

  return {
    birthDate: resume.birthDate?.toISOString().slice(0, 10) ?? '',
    postalCode: resume.postalCode ?? '',
    prefecture: resume.prefecture ?? '',
    city: resume.city ?? '',
    addressLine: resume.addressLine ?? '',
    addressFurigana: resume.addressFurigana ?? '',
    phone: resume.phone ?? '',
    email: resume.email ?? '',
    education: resume.education.map((e) => ({
      _key: e.id,
      schoolName: e.schoolName,
      graduationStatus: e.graduationStatus ?? '',
      startYearMonth: e.startYearMonth ?? '',
      endYearMonth: e.endYearMonth ?? '',
    })),
    workHistory: resume.workHistory.map((w) => ({
      _key: w.id,
      companyName: w.companyName,
      employmentType: w.employmentType ?? '',
      description: w.description ?? '',
      startYearMonth: w.startYearMonth ?? '',
      endYearMonth: w.endYearMonth ?? '',
    })),
  };
}

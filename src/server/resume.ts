import {prisma} from '@/lib/prisma';
import {getCurrentUser} from '@/server/auth';
import type {ValidationResult} from '@/types/ActionResult';
import {SeekerDocumentType} from '@/types/Document';
import {
  EMPTY_RESUME,
  type LicenseEntryInput,
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

// Keeps the fromProfile rows of a résumé's license history in lockstep with
// the seeker's current profile.licenses (the public "保有資格" checkboxes,
// SeekerProfileForm.tsx). One row per currently-checked license, in profile
// order, reusing an existing row's _key/acquiredYearMonth when its name
// still matches (so an already-entered date survives an unrelated résumé
// edit) and starting a fresh blank row otherwise. A fromProfile row for a
// license the seeker has since unchecked is dropped — its acquired date
// cannot be re-attached if the box is re-checked later, which is an
// accepted trade-off for keeping the two in sync automatically (#209).
// Non-profile ("＋免許・資格を追加する") rows are untouched and returned
// after, preserving their relative order. Called from both getResumeInput
// (so the form always shows the current checkbox state) and saveResume (so
// a save reflects the profile as of the moment it runs, not as of page load).
export function syncLicenseHistoryWithProfile(
  current: LicenseEntryInput[],
  profileLicenses: string[],
): LicenseEntryInput[] {
  const existingByName = new Map(
    current.filter((l) => l.fromProfile).map((l) => [l.licenseName, l]),
  );
  const profileRows = profileLicenses.map((licenseName) => {
    const existing = existingByName.get(licenseName);
    return {
      _key: existing?._key ?? crypto.randomUUID(),
      licenseName,
      acquiredYearMonth: existing?.acquiredYearMonth ?? '',
      fromProfile: true,
    };
  });
  const customRows = current.filter((l) => !l.fromProfile);
  return [...profileRows, ...customRows];
}

// 一時保存時の検証。入力済みの値の形式と、ユーザーが自分で追加した行
// (学歴・職歴・自由入力の資格) の名前が埋まっていることだけを見る。履歴書は
// 書きかけの状態で保存できるべきなので、それ以外の未入力は通す。
//
// ResumeForm 側でも同じ内容を検証してインラインにエラーを出すが、こちらが
// 権威ある backstop で、persistResumeData (resume-actions.ts) が書き込み前に
// 必ず通す — parseJobInput/job-actions.ts と同じ関係。resume-actions.ts では
// なくここに置くのは、'use server' モジュールが async な server action しか
// export できないため。
export function validateResumeDraft(input: ResumeInput): ValidationResult {
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
  if (input.licenseHistory.length > MAX_RESUME_HISTORY_ENTRIES) {
    return {
      ok: false,
      message: `免許・資格は${MAX_RESUME_HISTORY_ENTRIES}件までです。`,
    };
  }
  for (const l of input.licenseHistory) {
    if (!l.licenseName.trim()) {
      return {ok: false, message: '免許・資格には資格名を入力してください。'};
    }
    if (!isValidYearMonth(l.acquiredYearMonth)) {
      return {ok: false, message: '免許・資格の取得年月が正しくありません。'};
    }
  }
  return {ok: true};
}

// 発行時の検証。事務局へ提出する段階なので、下書き時の検証に加えて、提出物と
// して埋まっていなければならない項目を確認する。
export function validateResumeForPublish(input: ResumeInput): ValidationResult {
  const draft = validateResumeDraft(input);
  if (!draft.ok) return draft;

  // 取得年月は必須 (#210)。下書き側に置けないのは、プロフィール由来の行が
  // syncLicenseHistoryWithProfile で自動生成されるため — 自分では1行も
  // 追加していない人が、身に覚えのない行のせいで一時保存すらできなくなる。
  for (const l of input.licenseHistory) {
    if (!l.acquiredYearMonth) {
      return {ok: false, message: '免許・資格には取得年月を入力してください。'};
    }
  }
  return {ok: true};
}

// The current seeker's résumé as form-ready input, or null if they have no
// profile yet (a résumé belongs to a SeekerProfile). Maps the stored rows
// (nullable, ordered relations) to the form shape (empty strings/arrays).
// Mirrors getSeekerProfileInput (src/server/seeker.ts).
// 保存済みの内容が、事務局に提出済みのPDFに反映されていないかどうか。
//
// SeekerResume.updatedAt は一時保存でも写真の差し替えでも動く (saveResume は
// 毎回 upsert の update を通すので、学歴などの子テーブルだけの変更でも動く)。
// SeekerDocument(RESUME).uploadedAt は「発行する」でのみ動く。よって前者が
// 後者より新しければ、提出済みPDFは古い。提出物がまだ無い場合も未発行とする。
// 専用のフラグ列を足さずに済むよう、この2つの時刻の比較で判定している。
export async function hasUnpublishedResumeChanges(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const profile = await prisma.seekerProfile.findUnique({
    where: {userId: user.id},
    select: {id: true},
  });
  if (!profile) return false;

  const resume = await prisma.seekerResume.findUnique({
    where: {seekerId: profile.id},
    select: {updatedAt: true},
  });
  // 履歴書そのものが未保存なら、発行されていない変更も無い。
  if (!resume) return false;

  const published = await prisma.seekerDocument.findUnique({
    where: {
      seekerId_documentType: {
        seekerId: profile.id,
        documentType: SeekerDocumentType.RESUME,
      },
    },
    select: {uploadedAt: true},
  });
  if (!published) return true;

  return resume.updatedAt > published.uploadedAt;
}

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
      licenseHistory: {orderBy: {order: 'asc'}},
    },
  });
  if (!resume) {
    // First-time default only — once a résumé row exists its own (possibly
    // blank) email is used as-is below, so an intentional clear stays cleared
    // rather than springing back to the login address on reload.
    return {
      ...EMPTY_RESUME,
      email: user.email,
      licenseHistory: syncLicenseHistoryWithProfile([], profile.licenses),
    };
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
    licenseHistory: syncLicenseHistoryWithProfile(
      resume.licenseHistory.map((l) => ({
        _key: l.id,
        licenseName: l.licenseName,
        acquiredYearMonth: l.acquiredYearMonth ?? '',
        fromProfile: l.fromProfile,
      })),
      profile.licenses,
    ),
  };
}

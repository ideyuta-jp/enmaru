'use server';

import {prisma} from '@/lib/prisma';
import {requireRole} from '@/server/auth';
import {renderResumePdf} from '@/server/resume-pdf';
import {storeSeekerDocument} from '@/server/document';
import {
  loadResumePhoto,
  syncLicenseHistoryWithProfile,
  validateResumeDraft,
  validateResumeForPublish,
} from '@/server/resume';
import type {ActionResult, ValidationResult} from '@/types/ActionResult';
import {SeekerDocumentType} from '@/types/Document';
import {type ResumeInput} from '@/types/Resume';
import {UserRole} from '@/types/User';
import {blankToNull} from '@/utils/string';

function findProfile(userId: string) {
  return prisma.seekerProfile.findUnique({where: {userId}});
}

// 履歴書本体と、学歴・職歴・免許の3つの子リストを1トランザクションで置き換える。
// 各リストは行単位の差分を取らず丸ごと入れ替える — onDelete: Cascade により、
// 親を触った時点で取り残された行が生き残ることはない。
async function writeResume(profileId: string, input: ResumeInput) {
  const resumeData = {
    birthDate: input.birthDate ? new Date(input.birthDate) : null,
    postalCode: blankToNull(input.postalCode),
    prefecture: blankToNull(input.prefecture),
    city: blankToNull(input.city),
    addressLine: blankToNull(input.addressLine),
    addressFurigana: blankToNull(input.addressFurigana),
    phone: blankToNull(input.phone),
    email: blankToNull(input.email),
  };

  await prisma.$transaction(async (tx) => {
    const resume = await tx.seekerResume.upsert({
      where: {seekerId: profileId},
      update: resumeData,
      create: {seekerId: profileId, ...resumeData},
    });

    await tx.seekerEducationHistory.deleteMany({where: {resumeId: resume.id}});
    await tx.seekerEducationHistory.createMany({
      data: input.education.map((e, i) => ({
        resumeId: resume.id,
        schoolName: e.schoolName.trim(),
        graduationStatus: blankToNull(e.graduationStatus),
        startYearMonth: blankToNull(e.startYearMonth),
        endYearMonth: blankToNull(e.endYearMonth),
        order: i,
      })),
    });

    await tx.seekerWorkHistory.deleteMany({where: {resumeId: resume.id}});
    await tx.seekerWorkHistory.createMany({
      data: input.workHistory.map((w, i) => ({
        resumeId: resume.id,
        companyName: w.companyName.trim(),
        employmentType: blankToNull(w.employmentType),
        description: blankToNull(w.description),
        startYearMonth: blankToNull(w.startYearMonth),
        endYearMonth: blankToNull(w.endYearMonth),
        order: i,
      })),
    });

    await tx.seekerLicenseHistory.deleteMany({where: {resumeId: resume.id}});
    await tx.seekerLicenseHistory.createMany({
      data: input.licenseHistory.map((l, i) => ({
        resumeId: resume.id,
        licenseName: l.licenseName.trim(),
        acquiredYearMonth: blankToNull(l.acquiredYearMonth),
        fromProfile: l.fromProfile,
        order: i,
      })),
    });
  });
}

// 保存が通ったあと publishResume が引き継ぐ文脈。resume は同期・検証を通した
// 入力そのもので、PDF にはこれを渡す — ページ読込時のスナップショットではなく
// 実際に保存された内容を描くため。
type PersistedResume = {
  profile: NonNullable<Awaited<ReturnType<typeof findProfile>>>;
  resume: ResumeInput;
};

// saveResumeDraft と publishResume が同じように行う部分 — 認可・資格の同期・
// 検証・保存。両者で違うのは `validate` だけ (#208): 一時保存は形式が整って
// いれば通り、発行は提出物として完成している必要がある。
async function persistResumeData(
  input: ResumeInput,
  validate: (input: ResumeInput) => ValidationResult,
): Promise<({ok: true} & PersistedResume) | {ok: false; message: string}> {
  const user = await requireRole([UserRole.SEEKER]);
  const profile = await findProfile(user.id);
  if (!profile) {
    return {ok: false, message: '先にプロフィールを作成してください。'};
  }

  // 資格行はページ読込時ではなく「いま」のプロフィールに合わせ直す。以降の
  // 検証・保存・PDF描画はすべてこの resume を見る。
  const resume = {
    ...input,
    licenseHistory: syncLicenseHistoryWithProfile(
      input.licenseHistory,
      profile.licenses,
    ),
  };

  const validation = validate(resume);
  if (!validation.ok) return validation;

  await writeResume(profile.id, resume);
  return {ok: true, profile, resume};
}

// Persists the résumé's fields without generating or submitting a PDF (#208)
// — lets a seeker save in-progress work without it reaching the office's
// review queue. Also used by ResumeForm's profile-link autosave (#175),
// since navigating away isn't an explicit "発行する" action either.
export async function saveResumeDraft(
  input: ResumeInput,
): Promise<ActionResult> {
  const result = await persistResumeData(input, validateResumeDraft);
  if (!result.ok) return result;
  return {ok: true};
}

// Persists the résumé's fields (same as saveResumeDraft), then generates the
// PDF and submits it as SeekerDocument(RESUME) — the "発行する" action (#208).
// Guarded to SEEKER via persistResumeData. Keyed by seekerId, so the same
// action serves both first publish and re-publish — mirrors saveSeekerProfile
// (src/server/seeker-actions.ts).
export async function publishResume(input: ResumeInput): Promise<ActionResult> {
  const result = await persistResumeData(input, validateResumeForPublish);
  if (!result.ok) return result;
  const {profile, resume} = result;

  const pdf = await renderResumePdf({
    ...resume,
    realName: profile.realName,
    furigana: profile.furigana ?? '',
    bio: profile.bio ?? '',
    // 写真は resume-photo-actions.ts が別経路で更新するので、発行のたびに
    // 保存済みの最新を読み直す (#167)。
    photo: await loadResumePhoto(profile.id),
  });

  // Submitted through the same path as a manual upload (storeSeekerDocument),
  // so the application gate and admin verification keep working unchanged —
  // whichever path (upload or web résumé) the seeker used most recently wins.
  await storeSeekerDocument(
    profile.id,
    SeekerDocumentType.RESUME,
    pdf,
    'application/pdf',
  );

  return {ok: true};
}

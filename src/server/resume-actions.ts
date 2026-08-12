'use server';

import {prisma} from '@/lib/prisma';
import {renderResumePdf} from '@/server/resume-pdf';
import {requireRole} from '@/server/auth';
import {storeSeekerDocument} from '@/server/document';
import {
  syncLicenseHistoryWithProfile,
  validateResumeInput,
} from '@/server/resume';
import type {ActionResult} from '@/types/ActionResult';
import {SeekerDocumentType} from '@/types/Document';
import {type ResumeInput} from '@/types/Resume';
import {UserRole} from '@/types/User';
import {blankToNull} from '@/utils/string';

// Create or update the current seeker's résumé. Guarded to SEEKER. Keyed by
// seekerId, so the same action serves both first save and edits — mirrors
// saveSeekerProfile (src/server/seeker-actions.ts). All SeekerResume scalar
// fields stay optional: a first-time seeker legitimately has no work history
// yet, so nothing here is hard-required — validateResumeInput only rejects
// filled-but-malformed values (and history rows missing their name).
export async function saveResume(input: ResumeInput): Promise<ActionResult> {
  const user = await requireRole([UserRole.SEEKER]);
  const profile = await prisma.seekerProfile.findUnique({
    where: {userId: user.id},
  });
  if (!profile) {
    return {ok: false, message: '先にプロフィールを作成してください。'};
  }

  // Re-synced against the profile as of right now (not as of page load) —
  // a fromProfile row is added/dropped here to match the current checkbox
  // state before validating (#210 requires every row to carry a date) and
  // persisting.
  const licenseHistory = syncLicenseHistoryWithProfile(
    input.licenseHistory,
    profile.licenses,
  );
  const validation = validateResumeInput({...input, licenseHistory});
  if (!validation.ok) return validation;

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
      where: {seekerId: profile.id},
      update: resumeData,
      create: {seekerId: profile.id, ...resumeData},
    });

    // The whole list is submitted and replaced atomically each save — no
    // row-level diffing needed. onDelete: Cascade means a stale row can never
    // survive its parent resume being touched.
    await tx.seekerEducationHistory.deleteMany({
      where: {resumeId: resume.id},
    });
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
      data: licenseHistory.map((l, i) => ({
        resumeId: resume.id,
        licenseName: l.licenseName.trim(),
        acquiredYearMonth: blankToNull(l.acquiredYearMonth),
        fromProfile: l.fromProfile,
        order: i,
      })),
    });
  });

  const pdf = await renderResumePdf({
    ...input,
    realName: profile.realName,
    furigana: profile.furigana ?? '',
    bio: profile.bio ?? '',
    // Overrides the spread above: `input.licenseHistory` is the page-load
    // snapshot, this is the copy re-synced against the profile just now.
    licenseHistory,
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

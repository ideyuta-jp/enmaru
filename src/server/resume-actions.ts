'use server';

import {prisma} from '@/lib/prisma';
import {putObject} from '@/lib/storage';
import {renderResumePdf} from '@/server/resume-pdf';
import {requireRole} from '@/server/auth';
import type {ActionResult} from '@/types/ActionResult';
import {SeekerDocumentStatus} from '@/types/Document';
import type {ResumeInput} from '@/types/Resume';
import {UserRole} from '@/types/User';
import {blankToNull} from '@/utils/string';

// Create or update the current seeker's résumé. Guarded to SEEKER. Keyed by
// seekerId, so the same action serves both first save and edits — mirrors
// saveSeekerProfile (src/server/seeker-actions.ts). All SeekerResume scalar
// fields stay optional: a first-time seeker legitimately has no work history
// yet, so nothing here is hard-required.
export async function saveResume(input: ResumeInput): Promise<ActionResult> {
  const user = await requireRole([UserRole.SEEKER]);
  const profile = await prisma.seekerProfile.findUnique({
    where: {userId: user.id},
  });
  if (!profile) {
    return {ok: false, message: '先にプロフィールを作成してください。'};
  }

  const resumeData = {
    birthDate: input.birthDate ? new Date(input.birthDate) : null,
    postalCode: blankToNull(input.postalCode),
    prefecture: blankToNull(input.prefecture),
    city: blankToNull(input.city),
    addressLine: blankToNull(input.addressLine),
    phone: blankToNull(input.phone),
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
  });

  const pdf = await renderResumePdf({
    realName: profile.realName,
    birthDate: input.birthDate,
    postalCode: input.postalCode,
    prefecture: input.prefecture,
    city: input.city,
    addressLine: input.addressLine,
    phone: input.phone,
    licenses: profile.licenses,
    bio: profile.bio ?? '',
    education: input.education,
    workHistory: input.workHistory,
  });

  // Same key scheme and status-reset-on-change semantics as
  // document-actions.ts's uploadDocument, so the manual-upload path, the
  // application gate, and admin verification all keep working unchanged —
  // whichever path (upload or web résumé) the seeker used most recently wins.
  const key = `seeker-documents/${profile.id}/RESUME`;
  await putObject(key, pdf, 'application/pdf');
  await prisma.seekerDocument.upsert({
    where: {
      seekerId_documentType: {seekerId: profile.id, documentType: 'RESUME'},
    },
    update: {
      fileKey: key,
      status: SeekerDocumentStatus.PENDING,
      rejectionReason: null,
      uploadedAt: new Date(),
      verifiedAt: null,
    },
    create: {seekerId: profile.id, documentType: 'RESUME', fileKey: key},
  });

  return {ok: true};
}

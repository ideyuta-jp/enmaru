import {prisma} from '@/lib/prisma';
import {getCurrentUser} from '@/server/auth';
import type {ResumeInput} from '@/types/Resume';

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
    return {
      birthDate: '',
      postalCode: '',
      prefecture: '',
      city: '',
      addressLine: '',
      phone: '',
      education: [],
      workHistory: [],
    };
  }

  return {
    birthDate: resume.birthDate?.toISOString().slice(0, 10) ?? '',
    postalCode: resume.postalCode ?? '',
    prefecture: resume.prefecture ?? '',
    city: resume.city ?? '',
    addressLine: resume.addressLine ?? '',
    phone: resume.phone ?? '',
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

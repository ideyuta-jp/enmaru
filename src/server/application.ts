import type {SeekerApplication} from '@/types/Application';

// UI-only placeholder. TODO(#7 follow-up): replace with a real Prisma query
// scoped to the signed-in seeker.

const SAMPLE_APPLICATIONS: SeekerApplication[] = [
  {
    id: 'a1',
    jobTitle: '午前中サポート保育スタッフ募集',
    nurseryName: 'さくら保育園',
    workDate: '2026-07-01',
    workTimeStart: '08:30',
    workTimeEnd: '12:30',
    appliedAt: '2026-06-01T00:00:00.000Z',
    matchStatus: 'SCREENING',
  },
  {
    id: 'a2',
    jobTitle: '行事準備サポート（単発）',
    nurseryName: 'あおぞらこども園',
    workDate: '2026-07-20',
    workTimeStart: '09:00',
    workTimeEnd: '15:00',
    appliedAt: '2026-05-28T00:00:00.000Z',
    matchStatus: 'MATCHED',
  },
  {
    id: 'a3',
    jobTitle: '春の遠足引率サポート',
    nurseryName: 'にじいろナーサリー',
    workDate: '2026-04-15',
    workTimeStart: '08:00',
    workTimeEnd: '16:00',
    appliedAt: '2026-03-30T00:00:00.000Z',
    matchStatus: 'REVIEW_DONE',
  },
];

export async function listSeekerApplications(): Promise<SeekerApplication[]> {
  return SAMPLE_APPLICATIONS;
}

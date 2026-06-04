import type {Job} from '@/types/Job';

// UI-only placeholder. TODO(#7 follow-up): replace with a real Prisma query
// scoped to the signed-in nursery.

const SAMPLE_JOBS: Job[] = [
  {
    id: 'j1',
    title: '午前中サポート保育スタッフ募集',
    workContent: '0〜2歳児クラスの保育補助。',
    workDate: '2026-07-01',
    workTimeStart: '08:30',
    workTimeEnd: '12:30',
    hourlyWage: 1200,
    targetPerson: '保育士資格をお持ちの方',
    remarks: null,
    status: 'OPEN',
  },
  {
    id: 'j2',
    title: '行事準備サポート（単発）',
    workContent: '夏祭りの準備・当日運営の補助。',
    workDate: '2026-07-20',
    workTimeStart: '09:00',
    workTimeEnd: '15:00',
    hourlyWage: null,
    targetPerson: null,
    remarks: null,
    status: 'OPEN',
  },
  {
    id: 'j3',
    title: '春の遠足引率サポート',
    workContent: '遠足の引率補助。',
    workDate: '2026-04-15',
    workTimeStart: '08:00',
    workTimeEnd: '16:00',
    hourlyWage: 1100,
    targetPerson: null,
    remarks: null,
    status: 'CLOSED',
  },
];

export async function listNurseryJobs(): Promise<Job[]> {
  return SAMPLE_JOBS;
}

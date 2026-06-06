import type {AdminMatch, NurseryMatch} from '@/types/Match';

// UI-only placeholder. TODO(#7 follow-up): replace with real Prisma queries.

const SAMPLE_NURSERY_MATCHES: NurseryMatch[] = [
  {
    id: 'm1',
    status: 'APPLIED',
    jobTitle: '午前中サポート保育スタッフ募集',
    workDate: '2026-07-01',
    workTimeStart: '08:30',
    workTimeEnd: '12:30',
    seekerDisplayName: 'みき',
    seekerPreferredStyle: ['午前のみ', '週2〜3'],
    applyMessage:
      'ブランクはありますが、乳児保育の経験があります。よろしくお願いします。',
    lineContactOk: true,
    appliedAt: '2026-06-01T00:00:00.000Z',
  },
  {
    id: 'm2',
    status: 'MATCHED',
    jobTitle: '行事準備サポート（単発）',
    workDate: '2026-07-20',
    workTimeStart: '09:00',
    workTimeEnd: '15:00',
    seekerDisplayName: 'はるか',
    seekerPreferredStyle: ['単発'],
    applyMessage: null,
    lineContactOk: false,
    appliedAt: '2026-05-29T00:00:00.000Z',
  },
];

export async function listNurseryMatches(): Promise<NurseryMatch[]> {
  return SAMPLE_NURSERY_MATCHES;
}

const SAMPLE_ADMIN_MATCHES: AdminMatch[] = [
  {
    id: 'm1',
    status: 'APPLIED',
    adminMemo: null,
    createdAt: '2026-06-01T00:00:00.000Z',
    jobTitle: '午前中サポート保育スタッフ募集',
    workDate: '2026-07-01',
    nurseryName: 'さくら保育園',
    nurseryArea: '長崎市',
    seekerDisplayName: 'みき',
    seekerRealName: '佐藤 美希',
  },
  {
    id: 'm2',
    status: 'SCREENING',
    adminMemo: '園と日程調整中',
    createdAt: '2026-05-29T00:00:00.000Z',
    jobTitle: '行事準備サポート（単発）',
    workDate: '2026-07-20',
    nurseryName: 'あおぞらこども園',
    nurseryArea: '長崎市',
    seekerDisplayName: 'はるか',
    seekerRealName: '田中 春香',
  },
  {
    id: 'm3',
    status: 'REVIEW_DONE',
    adminMemo: null,
    createdAt: '2026-03-30T00:00:00.000Z',
    jobTitle: '春の遠足引率サポート',
    workDate: '2026-04-15',
    nurseryName: 'にじいろナーサリー',
    nurseryArea: '諫早市',
    seekerDisplayName: 'ゆい',
    seekerRealName: '鈴木 結衣',
  },
];

export async function listAllMatches(): Promise<AdminMatch[]> {
  return SAMPLE_ADMIN_MATCHES;
}

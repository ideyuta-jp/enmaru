import type {PublicNursery, PublicNurseryDetail} from '@/types/Nursery';

// NOTE: This module is a UI-only placeholder. Every function returns sample data
// so the pages render without a database. TODO(#7 follow-up): replace each body
// with a real Prisma query against the Neon database (this is the only layer
// allowed to import the Prisma client).

const SAMPLE_NURSERIES: PublicNursery[] = [
  {
    id: 'n1',
    nurseryName: 'さくら保育園',
    area: '長崎市',
    concept:
      '一人ひとりの「やってみたい」を大切に、自然に囲まれた環境でのびのびと過ごせる園です。',
    policy: null,
    rating: {total: 4.6, count: 12},
  },
  {
    id: 'n2',
    nurseryName: 'あおぞらこども園',
    area: '長崎市',
    concept:
      '地域とのつながりを大切にし、四季の行事を通じて豊かな心を育みます。',
    policy: null,
    rating: {total: 4.2, count: 5},
  },
  {
    id: 'n3',
    nurseryName: 'にじいろナーサリー',
    area: '諫早市',
    concept:
      '少人数制で、家庭的な雰囲気の中ひとりひとりに寄り添う保育を行っています。',
    policy: null,
    rating: null,
  },
];

export async function listPublishedNurseries(): Promise<PublicNursery[]> {
  return SAMPLE_NURSERIES;
}

export async function getPublishedNursery(
  id: string,
): Promise<PublicNurseryDetail | null> {
  const base = SAMPLE_NURSERIES.find((n) => n.id === id) ?? SAMPLE_NURSERIES[0];

  return {
    ...base,
    id,
    policy:
      '子どもの主体性を尊重し、「待つ保育」を心がけています。ブランクのある方も安心して入っていただけるよう、丁寧に引き継ぎを行います。',
    jobPostings: [
      {
        id: 'j1',
        title: '午前中サポート保育スタッフ募集',
        workContent:
          '0〜2歳児クラスの保育補助。朝の受け入れと午前の活動をお願いします。',
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
        workContent: '夏祭りの準備・当日運営の補助をお願いします。',
        workDate: '2026-07-20',
        workTimeStart: '09:00',
        workTimeEnd: '15:00',
        hourlyWage: null,
        targetPerson: null,
        remarks: null,
        status: 'OPEN',
      },
    ],
    reviews: [
      {
        comment:
          '受け入れの説明が丁寧で、ブランクがあっても安心して働けました。',
        reviewedAt: '2026-05-10T00:00:00.000Z',
      },
      {
        comment: '先生方が温かく、現場の雰囲気がとても良かったです。',
        reviewedAt: '2026-04-22T00:00:00.000Z',
      },
    ],
  };
}

export interface NurseryDashboard {
  nurseryName: string | null;
  isPublished: boolean;
  openJobCount: number;
  newApplicationCount: number;
}

export async function getNurseryDashboard(): Promise<NurseryDashboard> {
  return {
    nurseryName: 'さくら保育園',
    isPublished: true,
    openJobCount: 2,
    newApplicationCount: 1,
  };
}

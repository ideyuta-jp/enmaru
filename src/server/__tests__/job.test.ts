import {describe, expect, it, vi} from 'vitest';

// job.ts pulls in the Prisma client and the auth/Logto chain at import time;
// neither is needed to exercise the pure deriveJobState predicate (same
// isolation approach as application.test.ts).
vi.mock('@/lib/prisma', () => ({prisma: {}}));
vi.mock('@/server/auth', () => ({requireRole: vi.fn()}));

import {deriveJobState} from '@/server/job';
import {JobState} from '@/types/Job';

// #185: availability is derived from three independent facts. OPEN only when
// published, unmatched, and not expired; otherwise the strongest applicable
// fact names the state (MATCHED > EXPIRED > UNPUBLISHED).
describe('deriveJobState', () => {
  const today = '2026-08-11';
  const open = {
    isPublished: true,
    matched: false,
    workDate: today,
    todayJst: today,
  };

  it('is OPEN when published, unmatched, and not expired', () => {
    expect(deriveJobState(open)).toBe(JobState.OPEN);
    expect(deriveJobState({...open, workDate: '2026-08-12'})).toBe(
      JobState.OPEN,
    );
  });

  it('stays OPEN through the work date itself (expires the day after)', () => {
    expect(deriveJobState({...open, workDate: today})).toBe(JobState.OPEN);
    expect(deriveJobState({...open, workDate: '2026-08-10'})).toBe(
      JobState.EXPIRED,
    );
  });

  it('is UNPUBLISHED when the nursery pulled it', () => {
    expect(deriveJobState({...open, isPublished: false})).toBe(
      JobState.UNPUBLISHED,
    );
  });

  it('is MATCHED once an Engagement exists', () => {
    expect(deriveJobState({...open, matched: true})).toBe(JobState.MATCHED);
  });

  it('MATCHED wins over EXPIRED and UNPUBLISHED', () => {
    expect(
      deriveJobState({
        isPublished: false,
        matched: true,
        workDate: '2026-08-01',
        todayJst: today,
      }),
    ).toBe(JobState.MATCHED);
  });

  it('EXPIRED wins over UNPUBLISHED', () => {
    expect(
      deriveJobState({
        ...open,
        isPublished: false,
        workDate: '2026-08-10',
      }),
    ).toBe(JobState.EXPIRED);
  });
});

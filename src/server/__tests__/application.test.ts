import {describe, expect, it, vi} from 'vitest';

// application.ts pulls in the Prisma client and the auth/Logto chain at import
// time; neither is needed to exercise the pure jobsConflict predicate (same
// isolation approach as chat.test.ts).
vi.mock('@/lib/prisma', () => ({prisma: {}}));
vi.mock('@/server/auth', () => ({requireRole: vi.fn()}));

import {jobsConflict} from '@/server/application';

// #164: a seeker may not take two shifts that clash. Same nursery only clashes
// on an actual time overlap; a different nursery clashes on the same day
// regardless of time (business rule specified as-is in #164).
describe('jobsConflict', () => {
  const nurseryA = {nurseryId: 'nursery-a', workDate: new Date('2026-08-01')};
  const nurseryB = {nurseryId: 'nursery-b', workDate: new Date('2026-08-01')};

  it('does not clash on different days, same nursery', () => {
    const a = {...nurseryA, workTimeStart: '09:00', workTimeEnd: '12:00'};
    const b = {
      ...nurseryA,
      workDate: new Date('2026-08-02'),
      workTimeStart: '09:00',
      workTimeEnd: '12:00',
    };
    expect(jobsConflict(a, b)).toBe(false);
  });

  it('does not clash on different days, different nursery', () => {
    const a = {...nurseryA, workTimeStart: '09:00', workTimeEnd: '12:00'};
    const b = {
      ...nurseryB,
      workDate: new Date('2026-08-02'),
      workTimeStart: '09:00',
      workTimeEnd: '12:00',
    };
    expect(jobsConflict(a, b)).toBe(false);
  });

  it('same nursery, same day, non-overlapping times: no clash', () => {
    const a = {...nurseryA, workTimeStart: '09:00', workTimeEnd: '12:00'};
    const b = {...nurseryA, workTimeStart: '13:00', workTimeEnd: '16:00'};
    expect(jobsConflict(a, b)).toBe(false);
  });

  it('same nursery, same day, back-to-back times: no clash', () => {
    const a = {...nurseryA, workTimeStart: '09:00', workTimeEnd: '12:00'};
    const b = {...nurseryA, workTimeStart: '12:00', workTimeEnd: '15:00'};
    expect(jobsConflict(a, b)).toBe(false);
  });

  it('same nursery, same day, overlapping times: clash', () => {
    const a = {...nurseryA, workTimeStart: '09:00', workTimeEnd: '13:00'};
    const b = {...nurseryA, workTimeStart: '12:00', workTimeEnd: '16:00'};
    expect(jobsConflict(a, b)).toBe(true);
  });

  it('different nursery, same day, non-overlapping times: clash anyway', () => {
    const a = {...nurseryA, workTimeStart: '09:00', workTimeEnd: '12:00'};
    const b = {...nurseryB, workTimeStart: '13:00', workTimeEnd: '16:00'};
    expect(jobsConflict(a, b)).toBe(true);
  });

  it('different nursery, same day, identical times: clash', () => {
    const a = {...nurseryA, workTimeStart: '09:00', workTimeEnd: '12:00'};
    const b = {...nurseryB, workTimeStart: '09:00', workTimeEnd: '12:00'};
    expect(jobsConflict(a, b)).toBe(true);
  });
});

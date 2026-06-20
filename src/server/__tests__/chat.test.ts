import {describe, expect, it, vi} from 'vitest';

// chat.ts pulls in the Prisma client and the auth/Logto chain at import time;
// neither is needed to exercise the pure window predicate, and Logto's ESM entry
// does not resolve under vitest. Replace them with bare stubs (factory form, so
// the real modules are never loaded) and test isChatOpen in isolation.
vi.mock('@/lib/prisma', () => ({prisma: {}}));
vi.mock('@/server/auth', () => ({requireRole: vi.fn()}));

import {isChatOpen} from '@/server/chat';
import {EngagementStatus} from '@/types/Engagement';

// The chat window: open from when the engagement forms until 24h after
// completion. Since an Engagement is born at MATCHED, only the upper bound can
// close it.
describe('isChatOpen', () => {
  const now = new Date('2026-06-19T12:00:00Z');
  const HOUR_MS = 60 * 60 * 1000;
  // completedAt expressed as an offset before `now` so each case reads as its
  // distance from the boundary and stays correct if `now` changes.
  const hoursBeforeNow = (hours: number) =>
    new Date(now.getTime() - hours * HOUR_MS);

  it('is open while MATCHED', () => {
    expect(isChatOpen(EngagementStatus.MATCHED, null, now)).toBe(true);
  });

  it('is open while WORKING', () => {
    expect(isChatOpen(EngagementStatus.WORKING, null, now)).toBe(true);
  });

  it('is open within 24h of completion', () => {
    expect(
      isChatOpen(EngagementStatus.COMPLETED, hoursBeforeNow(12), now),
    ).toBe(true);
  });

  it('is open right up to the 24h boundary', () => {
    const completedAt = new Date(now.getTime() - (24 * HOUR_MS - 1));
    expect(isChatOpen(EngagementStatus.COMPLETED, completedAt, now)).toBe(true);
  });

  it('is closed at exactly 24h after completion', () => {
    expect(
      isChatOpen(EngagementStatus.COMPLETED, hoursBeforeNow(24), now),
    ).toBe(false);
  });

  it('is closed more than 24h after completion', () => {
    expect(
      isChatOpen(EngagementStatus.COMPLETED, hoursBeforeNow(48), now),
    ).toBe(false);
  });

  it('stays open if COMPLETED but completedAt is missing (data inconsistency)', () => {
    expect(isChatOpen(EngagementStatus.COMPLETED, null, now)).toBe(true);
  });
});

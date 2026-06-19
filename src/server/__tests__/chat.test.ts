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

  it('is open while MATCHED', () => {
    expect(isChatOpen(EngagementStatus.MATCHED, null, now)).toBe(true);
  });

  it('is open while WORKING', () => {
    expect(isChatOpen(EngagementStatus.WORKING, null, now)).toBe(true);
  });

  it('is open within 24h of completion', () => {
    const completedAt = new Date('2026-06-19T00:00:00Z'); // 12h ago
    expect(isChatOpen(EngagementStatus.COMPLETED, completedAt, now)).toBe(true);
  });

  it('is open right up to the 24h boundary', () => {
    const completedAt = new Date(now.getTime() - (24 * 60 * 60 * 1000 - 1));
    expect(isChatOpen(EngagementStatus.COMPLETED, completedAt, now)).toBe(true);
  });

  it('is closed at exactly 24h after completion', () => {
    const completedAt = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    expect(isChatOpen(EngagementStatus.COMPLETED, completedAt, now)).toBe(
      false,
    );
  });

  it('is closed more than 24h after completion', () => {
    const completedAt = new Date('2026-06-17T12:00:00Z'); // 48h ago
    expect(isChatOpen(EngagementStatus.COMPLETED, completedAt, now)).toBe(
      false,
    );
  });

  it('stays open if COMPLETED but completedAt is missing (data inconsistency)', () => {
    expect(isChatOpen(EngagementStatus.COMPLETED, null, now)).toBe(true);
  });
});

import {describe, expect, it} from 'vitest';

import type {AdminNurseryProfile} from '@/types/Nursery';
import type {AdminSeekerProfile} from '@/types/Seeker';
import {
  deriveProfileState,
  DORMANT_DAYS,
  dormantCutoff,
  ProfileState,
} from '@/types/User';

const seeker = (isPublished: boolean): AdminSeekerProfile => ({
  id: 'seeker-1',
  displayName: 'はなこ',
  realName: '山田花子',
  isPublished,
});

const nursery = (isPublished: boolean): AdminNurseryProfile => ({
  id: 'nursery-1',
  nurseryName: 'ひまわり保育園',
  contactName: '佐藤太郎',
  isPublished,
});

// The admin user list reads a profile's progress off two facts only: does the
// profile exist, and is it published (#223). Same rule for either role.
describe('deriveProfileState', () => {
  it('is NONE when no profile exists', () => {
    expect(deriveProfileState(null)).toBe(ProfileState.NONE);
  });

  it('is DRAFT for an unpublished profile of either role', () => {
    expect(deriveProfileState(seeker(false))).toBe(ProfileState.DRAFT);
    expect(deriveProfileState(nursery(false))).toBe(ProfileState.DRAFT);
  });

  it('is PUBLISHED for a published profile of either role', () => {
    expect(deriveProfileState(seeker(true))).toBe(ProfileState.PUBLISHED);
    expect(deriveProfileState(nursery(true))).toBe(ProfileState.PUBLISHED);
  });
});

describe('dormantCutoff', () => {
  const now = new Date('2026-09-01T00:00:00.000Z');

  it('is DORMANT_DAYS before now', () => {
    const expected = new Date(
      now.getTime() - DORMANT_DAYS * 24 * 60 * 60 * 1000,
    );
    expect(dormantCutoff(now).toISOString()).toBe(expected.toISOString());
  });

  it('does not shift the reference time itself', () => {
    dormantCutoff(now);
    expect(now.toISOString()).toBe('2026-09-01T00:00:00.000Z');
  });
});

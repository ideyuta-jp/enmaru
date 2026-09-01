import {describe, expect, it} from 'vitest';

import {
  deriveProfileState,
  DORMANT_DAYS,
  dormantCutoff,
  ProfileState,
} from '@/types/User';

// The admin user list reads a profile's progress off two facts only: does the
// row exist, and is it published (#223).
describe('deriveProfileState', () => {
  it('is NONE when no profile row exists', () => {
    expect(deriveProfileState(null)).toBe(ProfileState.NONE);
  });

  it('is DRAFT for an unpublished profile', () => {
    expect(deriveProfileState({isPublished: false})).toBe(ProfileState.DRAFT);
  });

  it('is PUBLISHED for a published profile', () => {
    expect(deriveProfileState({isPublished: true})).toBe(
      ProfileState.PUBLISHED,
    );
  });
});

describe('dormantCutoff', () => {
  const now = new Date('2026-09-01T00:00:00.000Z');

  it('defaults to DORMANT_DAYS before now', () => {
    const expected = new Date(
      now.getTime() - DORMANT_DAYS * 24 * 60 * 60 * 1000,
    );
    expect(dormantCutoff(now).toISOString()).toBe(expected.toISOString());
  });

  it('honours an explicit window', () => {
    expect(dormantCutoff(now, 1).toISOString()).toBe(
      '2026-08-31T00:00:00.000Z',
    );
  });

  it('does not shift the reference time itself', () => {
    dormantCutoff(now);
    expect(now.toISOString()).toBe('2026-09-01T00:00:00.000Z');
  });
});

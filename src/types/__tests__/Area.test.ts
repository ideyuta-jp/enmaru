import {describe, expect, it} from 'vitest';

import {resolveCity} from '@/types/Area';

// The raw strings here are what server/address.ts produces (city + town
// joined), not what zipcloud returns field by field.
describe('resolveCity', () => {
  it('strips the town appended by the postal-code lookup', () => {
    expect(resolveCity('長崎県', '長崎市西山')).toBe('長崎市');
  });

  it('strips the ward of a designated city', () => {
    expect(resolveCity('静岡県', '静岡市葵区追手町')).toBe('静岡市');
  });

  it('resolves a city whose town is written in kana', () => {
    expect(resolveCity('沖縄県', '那覇市おもろまち')).toBe('那覇市');
  });

  it('returns empty for a city the curated list omits', () => {
    expect(resolveCity('東京都', '小平市学園西町')).toBe('');
  });

  it('returns empty for a town or village, which the list never carries', () => {
    expect(resolveCity('長崎県', '西彼杵郡長与町')).toBe('');
  });

  it('returns empty for an unknown prefecture', () => {
    expect(resolveCity('', '長崎市西山')).toBe('');
  });
});

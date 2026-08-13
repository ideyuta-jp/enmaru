import {describe, expect, it} from 'vitest';

import {isKatakanaOnly} from '@/utils/string';

describe('isKatakanaOnly', () => {
  it('accepts an empty string (optional field)', () => {
    expect(isKatakanaOnly('')).toBe(true);
  });

  it('accepts full-width katakana', () => {
    expect(isKatakanaOnly('ヤマダタロウ')).toBe(true);
  });

  it('accepts katakana with a middle dot and prolonged sound mark', () => {
    expect(isKatakanaOnly('ジョン・スミスー')).toBe(true);
  });

  it('accepts katakana separated by a space', () => {
    expect(isKatakanaOnly('ヤマダ タロウ')).toBe(true);
    expect(isKatakanaOnly('ヤマダ　タロウ')).toBe(true);
  });

  it('rejects hiragana', () => {
    expect(isKatakanaOnly('やまだたろう')).toBe(false);
  });

  it('rejects kanji', () => {
    expect(isKatakanaOnly('山田太郎')).toBe(false);
  });

  it('rejects half-width katakana', () => {
    expect(isKatakanaOnly('ﾔﾏﾀﾞﾀﾛｳ')).toBe(false);
  });

  it('rejects mixed katakana and kanji', () => {
    expect(isKatakanaOnly('ヤマダ太郎')).toBe(false);
  });

  it('rejects whitespace other than a plain or full-width space', () => {
    expect(isKatakanaOnly('ヤマダ\tタロウ')).toBe(false);
    expect(isKatakanaOnly('ヤマダ\nタロウ')).toBe(false);
  });
});

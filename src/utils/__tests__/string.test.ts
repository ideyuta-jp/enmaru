import {describe, expect, it} from 'vitest';

import {
  isKatakanaOnly,
  isValidAddressFurigana,
  isValidEmail,
} from '@/utils/string';

describe('isValidEmail', () => {
  it('accepts an empty string (unset, not a format error)', () => {
    expect(isValidEmail('')).toBe(true);
  });

  it('accepts a well-formed address', () => {
    expect(isValidEmail('yamada@example.com')).toBe(true);
  });

  it('rejects a missing @', () => {
    expect(isValidEmail('yamada.example.com')).toBe(false);
  });

  it('rejects a missing domain dot', () => {
    expect(isValidEmail('yamada@example')).toBe(false);
  });

  it('rejects a missing local part', () => {
    expect(isValidEmail('@example.com')).toBe(false);
  });

  it('rejects embedded whitespace', () => {
    expect(isValidEmail('yamada @example.com')).toBe(false);
  });
});

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

describe('isValidAddressFurigana', () => {
  it('accepts an empty string (optional field)', () => {
    expect(isValidAddressFurigana('')).toBe(true);
  });

  it('accepts a katakana place name', () => {
    expect(isValidAddressFurigana('ナガサキケン ナガサキシ サクラマチ')).toBe(
      true,
    );
  });

  it('accepts a street number, half-width and full-width', () => {
    expect(isValidAddressFurigana('サクラマチ1-2-3')).toBe(true);
    expect(isValidAddressFurigana('サクラマチ１－２－３')).toBe(true);
  });

  // どのダッシュが入力されるかは IME と OS で決まる (macOS の全角「-」は
  // U+2212、MS-IME は U+FF0D)。利用者が選べないので全て通す。
  it('accepts every dash variant an IME can produce', () => {
    for (const dash of [
      '\u002D',
      '\u2010',
      '\u2011',
      '\u2013',
      '\u2014',
      '\u2015',
      '\u2212',
      '\uFF0D',
    ]) {
      expect(isValidAddressFurigana(`サクラマチ２${dash}５`)).toBe(true);
    }
  });

  it('rejects half-width katakana, including its prolonged sound mark', () => {
    expect(isValidAddressFurigana('ｻｸﾗﾏﾁ')).toBe(false);
    expect(isValidAddressFurigana('サクラマチ\uFF70')).toBe(false);
  });

  it('accepts a building name with a room number', () => {
    expect(isValidAddressFurigana('サンプルマンション101')).toBe(true);
  });

  it('rejects hiragana and kanji', () => {
    expect(isValidAddressFurigana('さくらまち')).toBe(false);
    expect(isValidAddressFurigana('桜町')).toBe(false);
  });

  it('rejects latin letters (not expected in a reading)', () => {
    expect(isValidAddressFurigana('サクラマチA101')).toBe(false);
  });

  it('rejects whitespace other than a plain or full-width space', () => {
    expect(isValidAddressFurigana('サクラ\tマチ')).toBe(false);
    expect(isValidAddressFurigana('サクラ\nマチ')).toBe(false);
  });
});

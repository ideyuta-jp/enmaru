import {describe, expect, it} from 'vitest';

import {isHttpUrl} from '@/utils/url';

describe('isHttpUrl', () => {
  it('accepts http and https URLs', () => {
    expect(isHttpUrl('https://example.com')).toBe(true);
    expect(isHttpUrl('http://example.com/path?q=1')).toBe(true);
  });

  it('rejects non-web schemes that would execute in an href', () => {
    expect(isHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isHttpUrl('JavaScript:alert(1)')).toBe(false);
    expect(isHttpUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
    expect(isHttpUrl('vbscript:msgbox(1)')).toBe(false);
  });

  it('rejects non-URL strings', () => {
    expect(isHttpUrl('example.com')).toBe(false);
    expect(isHttpUrl('not a url')).toBe(false);
    expect(isHttpUrl('')).toBe(false);
  });
});

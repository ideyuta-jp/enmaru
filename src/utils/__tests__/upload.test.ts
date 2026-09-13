import {describe, expect, it} from 'vitest';

import {isBodySizeLimitError} from '@/utils/upload';

describe('isBodySizeLimitError', () => {
  it('recognizes the exact error Next.js throws when serverActions.bodySizeLimit is exceeded', () => {
    const error = new Error(
      'Body exceeded 5mb limit.\nTo configure the body size limit for Server Actions, see: https://nextjs.org/docs/app/api-reference/next-config-js/serverActions#bodysizelimit',
    );
    expect(isBodySizeLimitError(error)).toBe(true);
  });

  it('rejects an unrelated Error', () => {
    expect(isBodySizeLimitError(new Error('Network request failed'))).toBe(
      false,
    );
  });

  it('rejects a non-Error thrown value', () => {
    expect(isBodySizeLimitError('Body exceeded 5mb limit.')).toBe(false);
    expect(isBodySizeLimitError(undefined)).toBe(false);
  });
});

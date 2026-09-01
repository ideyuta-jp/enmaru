import {beforeEach, describe, expect, it, vi} from 'vitest';

// user.ts pulls in the Prisma client and the auth/Logto chain at import time.
// Only the user.update path is exercised here, so stub both (factory form, so
// the real modules never load — same isolation as chat.test.ts).
const update = vi.fn();
vi.mock('@/lib/prisma', () => ({
  prisma: {user: {update: (...args: never[]) => update(...args)}},
}));
vi.mock('@/server/auth', () => ({requireRole: vi.fn()}));

import {recordSignIn} from '@/server/user';

// The sign-in stamp runs inside the Logto callback, after the session already
// exists. It must never be able to break that sign-in (#223).
describe('recordSignIn', () => {
  beforeEach(() => {
    update.mockReset();
  });

  it('stamps lastSignInAt for the user', async () => {
    update.mockResolvedValue({});
    await recordSignIn('user-1');

    expect(update).toHaveBeenCalledTimes(1);
    const arg = update.mock.calls[0][0];
    expect(arg.where).toEqual({id: 'user-1'});
    expect(arg.data.lastSignInAt).toBeInstanceOf(Date);
  });

  it('swallows a write failure so the sign-in still completes', async () => {
    update.mockRejectedValue(new Error('db down'));
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(recordSignIn('user-1')).resolves.toBeUndefined();
    expect(logged).toHaveBeenCalled();

    logged.mockRestore();
  });
});

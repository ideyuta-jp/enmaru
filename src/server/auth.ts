import {cache} from 'react';
import {redirect} from 'next/navigation';

import {getAuthContext} from '@/lib/logto';
import {prisma} from '@/lib/prisma';
import type {User} from '@/generated/prisma/client';
import {UserRole} from '@/types/User';

// Server-only auth/session helpers. The sign-in / sign-out Server Actions live in
// auth-actions.ts (a 'use server' file) because client components import them;
// the reads/guards here are called only from server code, never the client.

// The signed-in user's app record, or null when not signed in OR signed in to
// Logto but not yet registered (no User row). This is the single place that maps
// a Logto session to our User; everything else reads the result.
//
// Wrapped in React cache() so it is memoized per request: a group-layout guard
// and the page it wraps can both call it (directly or via requireRole) without a
// duplicate session lookup + query.
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const {isAuthenticated, claims} = await getAuthContext();
  if (!isAuthenticated || !claims?.sub) return null;
  return prisma.user.findUnique({where: {authId: claims.sub}});
});

// Guard for role-scoped pages: require a signed-in, registered user whose role is
// allowed. Redirects to sign-in when absent, home when forbidden. Returns the
// user so callers can use it directly.
export async function requireRole(allowed: UserRole[]): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!allowed.includes(user.role)) redirect('/');
  return user;
}

import {redirect} from 'next/navigation';

import {getAuthContext} from '@/lib/logto';
import {prisma} from '@/lib/prisma';
import type {Role, User} from '@/generated/prisma/client';

// Server-only auth/session helpers. The sign-in / sign-out Server Actions live in
// auth-actions.ts (a 'use server' file) because client components import them;
// the reads/guards here are called only from server code, never the client.

// The signed-in user's app record, or null when not signed in OR signed in to
// Logto but not yet registered (no User row). This is the single place that maps
// a Logto session to our User; everything else reads the result.
export async function getCurrentUser(): Promise<User | null> {
  const {isAuthenticated, claims} = await getAuthContext();
  if (!isAuthenticated || !claims?.sub) return null;
  return prisma.user.findUnique({where: {authId: claims.sub}});
}

// Guard for role-scoped pages: require a signed-in, registered user whose role is
// allowed. Redirects to sign-in when absent, home when forbidden. Returns the
// user so callers can use it directly.
export async function requireRole(allowed: Role[]): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!allowed.includes(user.role)) redirect('/');
  return user;
}

// The home page a freshly signed-in user of each role should land on.
export function landingPathForRole(role: Role): string {
  if (role === 'NURSERY') return '/nursery/mypage';
  if (role === 'ADMIN') return '/admin/matches';
  return '/mypage';
}

// Account role. Mirrors the `Role` enum in the Prisma schema; kept as a
// hand-written union so the UI layer does not depend on generated server code.
export type UserRole = 'SEEKER' | 'NURSERY' | 'ADMIN';

// Role values, so call sites reference these constants instead of bare string
// literals (e.g. requireRole([UserRole.ADMIN])). Same name as the type — TS
// keeps type and value in separate namespaces, so both import together.
export const UserRole = {
  SEEKER: 'SEEKER',
  NURSERY: 'NURSERY',
  ADMIN: 'ADMIN',
} as const;

// Roles a user can self-register as. ADMIN is provisioned by the operator, never
// chosen at sign-up.
export type RegisterRole = Exclude<UserRole, 'ADMIN'>;

// The home page a freshly signed-in user of each role should land on. A pure
// role → path mapping, kept in types/ (client-safe) so server-side redirects
// and client-side router.push share one source of truth.
export function landingPathForRole(role: UserRole): string {
  if (role === UserRole.NURSERY) return '/nursery/mypage';
  if (role === UserRole.ADMIN) return '/admin/matches';
  return '/mypage';
}

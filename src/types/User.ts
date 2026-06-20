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

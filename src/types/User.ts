// Account role. Mirrors the `Role` enum in the Prisma schema; kept as a
// hand-written union so the UI layer does not depend on generated server code.
export type UserRole = 'SEEKER' | 'NURSERY' | 'ADMIN';

// Roles a user can self-register as. ADMIN is provisioned by the operator, never
// chosen at sign-up.
export type RegisterRole = Exclude<UserRole, 'ADMIN'>;

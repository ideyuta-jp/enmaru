// Account role. Mirrors the `role` enum in the (yet-to-be-built) Prisma schema;
// kept as a hand-written union so the UI layer does not depend on generated code.
export type UserRole = 'SEEKER' | 'NURSERY' | 'ADMIN';

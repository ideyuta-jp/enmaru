// Whether a caught error is Prisma's unique-constraint violation (P2002).
// Structural check so callers don't depend on importing the Prisma error class.
export function isUniqueViolation(e: unknown): boolean {
  return (
    typeof e === 'object' &&
    e !== null &&
    'code' in e &&
    (e as {code: unknown}).code === 'P2002'
  );
}

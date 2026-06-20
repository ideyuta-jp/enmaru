import {requireRole} from '@/server/auth';
import {UserRole} from '@/types/User';

// Auth guard for every seeker page in this route group: requireRole redirects a
// signed-out visitor to sign-in and a wrong-role user to home. Putting it in the
// group layout means new pages added here are guarded automatically. Reading the
// session makes the whole group render per-request.
export const dynamic = 'force-dynamic';

export default async function SeekerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole([UserRole.SEEKER]);
  return <>{children}</>;
}

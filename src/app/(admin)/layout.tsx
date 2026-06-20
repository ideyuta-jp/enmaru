import {requireRole} from '@/server/auth';
import {UserRole} from '@/types/User';

// Auth guard for every admin page in this route group. Admin is provisioned by
// the operator (never self-registered), so with no admin accounts yet this
// effectively locks the admin console until one exists.
export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole([UserRole.ADMIN]);
  return <>{children}</>;
}

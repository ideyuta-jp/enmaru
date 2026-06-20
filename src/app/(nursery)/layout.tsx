import {requireRole} from '@/server/auth';
import {UserRole} from '@/types/User';

// Auth guard for every nursery page in this route group. See the seeker layout
// for the rationale; new pages added here are guarded automatically.
export const dynamic = 'force-dynamic';

export default async function NurseryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole([UserRole.NURSERY]);
  return <>{children}</>;
}

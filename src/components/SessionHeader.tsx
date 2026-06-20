import Header from '@/components/Header';
import {getCurrentUser} from '@/server/auth';

// Session-aware header. Header takes `role` as a prop; SessionHeader derives it
// from getCurrentUser() so the nav and sign-out reflect the session (a signed-in
// visitor no longer sees the logged-out sign-in / register actions). Role-scoped
// pages already have the user from requireRole and pass the role to Header
// directly. Any page rendering SessionHeader reads the session and must set
// `export const dynamic = 'force-dynamic'`.
export default async function SessionHeader() {
  const user = await getCurrentUser();
  return <Header role={user?.role ?? null} />;
}

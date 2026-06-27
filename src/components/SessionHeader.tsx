import Header from '@/components/Header';
import {getCurrentUser} from '@/server/auth';

// Session-aware header. Header takes `role` and `email` as props; SessionHeader
// derives them from getCurrentUser() so the nav, the signed-in email, and
// sign-out all reflect the session (a signed-in visitor no longer sees the
// logged-out sign-in / register actions). This is the single header used across
// the app — both public and role-scoped pages render it, so the signed-in email
// display lives in one place. getCurrentUser() is request-cached, so rendering
// this on a role-scoped page whose layout already called requireRole costs no
// extra query. SessionHeader reads the session, so every page that renders it
// must be dynamic: role-scoped pages in (admin)/(nursery)/(seeker) inherit
// `dynamic = 'force-dynamic'` from their group layout, while public pages (which
// have no such layout) must set it on the page itself.
export default async function SessionHeader() {
  const user = await getCurrentUser();
  return <Header role={user?.role ?? null} email={user?.email ?? null} />;
}

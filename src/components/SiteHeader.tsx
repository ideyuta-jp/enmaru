import Header from '@/components/Header';
import {getCurrentUser} from '@/server/auth';

// Server wrapper around Header for public pages: resolves the current user's
// role so the nav and sign-out reflect the session (a signed-in visitor no
// longer sees the logged-out sign-in / register actions). Role-scoped pages
// already have the user from requireRole and pass the role to Header directly,
// so they do not use this. Any page rendering SiteHeader reads the session and
// must therefore set `export const dynamic = 'force-dynamic'`.
export default async function SiteHeader() {
  const user = await getCurrentUser();
  return <Header role={user?.role ?? null} />;
}

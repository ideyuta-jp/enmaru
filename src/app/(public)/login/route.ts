import {redirect} from 'next/navigation';

import {getCurrentUser, landingPathForRole} from '@/server/auth';
import {signIn} from '@/server/auth-actions';

// GET /login hands off straight to Logto's hosted sign-in — no intermediate
// "proceed to sign in" screen. Sign-in must write PKCE/state cookies, which is
// allowed in a Route Handler but not during a Server Component render; that
// constraint is exactly why this is a route, not a page. Already-registered
// users skip to their dashboard.
//
// Reached by the auth guards' redirect('/login') for unauthenticated access to
// protected pages; the header's sign-in button invokes signIn directly and does
// not pass through here.
export async function GET() {
  const user = await getCurrentUser();
  if (user) redirect(landingPathForRole(user.role));

  // signIn() writes the PKCE/state cookies and redirects to Logto, so control
  // never returns past here (same shape as callback/route.ts).
  await signIn();
}

import {redirect} from 'next/navigation';

import {getCurrentUser} from '@/server/auth';
import {landingPathForRole} from '@/types/User';
import {signIn} from '@/server/auth-actions';

// GET /signup hands off straight to Logto's hosted sign-up (create-account)
// screen — the sign-up counterpart of /login. Same route-handler shape as
// /login (sign-in must write PKCE/state cookies, which a page render cannot do),
// only the firstScreen differs. Reached by the header / landing "新規登録" CTAs
// and by /register forwarding its unauthenticated visitors here.
// Already-registered users skip straight to their dashboard.
export async function GET() {
  const user = await getCurrentUser();
  if (user) redirect(landingPathForRole(user.role));

  // signIn() writes the PKCE/state cookies and redirects to Logto, so control
  // never returns past here (same shape as login/route.ts).
  await signIn('register');
}
